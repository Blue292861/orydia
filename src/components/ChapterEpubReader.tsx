import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ePub from 'epubjs';
import { ChapterEpub } from '@/types/ChapterEpub';
import { Waypoint } from '@/types/Waypoint';
import { chapterEpubService } from '@/services/chapterEpubService';
import { epubPreloadService } from '@/services/epubPreloadService';
import { getWaypointsByChapterId } from '@/services/waypointService';
import { startReadingEpubChapter, markEpubChapterCompleted } from '@/services/chapterService';
import { updateProgressOnBookCompletion, updateProgressOnChapterCompletion } from '@/services/challengeService';
import { Button } from '@/components/ui/button';
import { ChapterReadingControls } from '@/components/ChapterReadingControls';
import { ChestOpeningDialog } from '@/components/ChestOpeningDialog';
import { ChapterCompletionAnimation } from '@/components/ChapterCompletionAnimation';
import WaypointPopup from '@/components/WaypointPopup';
import { useAuth } from '@/contexts/AuthContext';
import { useUserStats } from '@/contexts/UserStatsContext';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, ArrowRight, Gift, ChevronLeft, ChevronRight, RotateCcw, Type, ShieldAlert, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Book } from '@/types/Book';
import { useIsMobile } from '@/hooks/use-mobile';

type Theme = 'light' | 'dark' | 'sepia';
type ColorblindMode = 'none' | 'deuteranopia' | 'protanopia' | 'tritanopia';

export const ChapterEpubReader: React.FC = () => {
  const { bookId, chapterId } = useParams<{ bookId: string; chapterId: string }>();
  const navigate = useNavigate();
  const { user, subscription } = useAuth();
  const { openChestForBook } = useUserStats();
  const isMobile = useIsMobile();
  
  // Chapter data
  const [chapter, setChapter] = useState<ChapterEpub | null>(null);
  const [allChapters, setAllChapters] = useState<ChapterEpub[]>([]);
  const [loading, setLoading] = useState(true);
  const [book, setBook] = useState<Book | null>(null);
  
  // Reading settings
  const [fontSize, setFontSize] = useState(16);
  const [theme, setTheme] = useState<Theme>('light');
  const [colorblindMode, setColorblindMode] = useState<ColorblindMode>('none');
  
  // EPUB state
  const [epubReady, setEpubReady] = useState(false);
  const [epubError, setEpubError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [totalLocations, setTotalLocations] = useState(0);
  const [controlsOpen, setControlsOpen] = useState(false);
  
  // Reward state
  const [showRewardAd, setShowRewardAd] = useState(false);
  const [hasClaimedReward, setHasClaimedReward] = useState(false);
  const [allChaptersCompleted, setAllChaptersCompleted] = useState(false);
  const [markingComplete, setMarkingComplete] = useState(false);
  const [hasChestKey, setHasChestKey] = useState(false);
  const [chestKeyCount, setChestKeyCount] = useState(0);
  
  // Chest dialog state
  const [showChestDialog, setShowChestDialog] = useState(false);
  const [chestRewards, setChestRewards] = useState<any>(null);
  
  // Copyright warning state
  const [showCopyrightWarning, setShowCopyrightWarning] = useState(true);
  
  // Chapter completion animation state
  const [showCompletionAnimation, setShowCompletionAnimation] = useState(false);
  const [pendingNextChapterId, setPendingNextChapterId] = useState<string | null>(null);
  
  // Waypoint state
  const [waypoints, setWaypoints] = useState<Waypoint[]>([]);
  const [activeWaypoint, setActiveWaypoint] = useState<Waypoint | null>(null);
  const [showWaypointPopup, setShowWaypointPopup] = useState(false);
  
  // EPUB refs (not states!)
  const bookRef = useRef<any>(null);
  const renditionRef = useRef<any>(null);
  const epubRootRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const saveTimerRef = useRef<number | null>(null);
  const readinessTimerRef = useRef<number | null>(null);
  const fatalLoadTimerRef = useRef<number | null>(null);
  const lastSizeRef = useRef({ width: 0, height: 0 });
  const viewportResizeHandlerRef = useRef<(() => void) | null>(null);
  const navigationLockRef = useRef<boolean>(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Helper function to highlight waypoint words in EPUB content
  const highlightWaypointInDocument = (
    doc: Document, 
    waypoint: Waypoint, 
    colors: { color: string; bg: string }
  ) => {
    const walker = doc.createTreeWalker(
      doc.body,
      NodeFilter.SHOW_TEXT,
      null
    );

    let node: Text | null;
    let found = false;
    while ((node = walker.nextNode() as Text | null) && !found) {
      const text = node.textContent || '';
      const wordRegex = new RegExp(`\\b${waypoint.word_text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
      const match = wordRegex.exec(text);
      
      if (match) {
        const index = match.index;
        try {
          const range = doc.createRange();
          range.setStart(node, index);
          range.setEnd(node, index + waypoint.word_text.length);

          const span = doc.createElement('span');
          span.className = 'orydia-waypoint';
          span.dataset.waypointId = waypoint.id;
          span.style.cssText = `
            font-weight: bold;
            color: ${colors.color};
            cursor: pointer;
            text-decoration: underline dotted;
            text-underline-offset: 3px;
            background-color: ${colors.bg};
            padding: 1px 2px;
            border-radius: 2px;
          `;

          range.surroundContents(span);
          found = true;
        } catch (e) {
          console.warn('Could not highlight waypoint:', waypoint.word_text, e);
        }
      }
    }
  };

  // Load chapter data and settings
  useEffect(() => {
    const loadChapter = async () => {
      if (!bookId || !chapterId) return;

      try {
        const [chapterData, chaptersData] = await Promise.all([
          chapterEpubService.getChapterById(chapterId),
          chapterEpubService.getChaptersByBookId(bookId),
        ]);

        if (!chapterData) {
          toast.error('Chapitre introuvable');
          navigate(`/book/${bookId}/chapters`);
          return;
        }

        setChapter(chapterData);
        setAllChapters(chaptersData);
        
        // Load waypoints for this chapter
        try {
          const waypointsData = await getWaypointsByChapterId(chapterData.id);
          setWaypoints(waypointsData);
        } catch (error) {
          console.error('Error loading waypoints:', error);
        }

        // Mark book as started when user opens first chapter
      if (user && bookId && chapterData) {
        try {
          void startReadingEpubChapter(bookId, chapterData.id).catch(console.error);
        } catch (error) {
          console.error('Error starting reading:', error);
          // Don't block the UI if progress tracking fails
        }
      }

        // Load saved settings
        const savedFontSize = localStorage.getItem(`chapter_fontSize_${chapterId}`);
        const savedTheme = localStorage.getItem(`chapter_theme_${chapterId}`);

        if (savedFontSize) setFontSize(parseInt(savedFontSize));
        if (savedTheme) setTheme(savedTheme as Theme);
      } catch (error) {
        console.error('Error loading chapter:', error);
        toast.error('Erreur lors du chargement');
      } finally {
        setLoading(false);
      }
    };

    loadChapter();
  }, [bookId, chapterId, navigate]);

  // Load book data separately for rewards
  useEffect(() => {
    const loadBook = async () => {
      if (!bookId) return;
      
      try {
        const { data: bookData, error } = await supabase
          .from('books')
          .select('*')
          .eq('id', bookId)
          .single();
        
        if (error) throw error;
        
        if (bookData) {
          setBook({
            id: bookData.id,
            title: bookData.title,
            author: bookData.author,
            coverUrl: bookData.cover_url,
            content: bookData.content,
            summary: bookData.summary,
            points: bookData.points,
            tags: bookData.tags,
            genres: bookData.genres,
            isPremium: bookData.is_premium,
            isMonthSuccess: bookData.is_month_success,
            isPacoFavourite: bookData.is_paco_favourite,
            hasChapters: bookData.has_chapters,
            isInteractive: bookData.is_interactive,
            isAdultContent: bookData.is_adult_content,
            isRare: bookData.is_rare || false
          });
        }
      } catch (error) {
        console.error('Error loading book data:', error);
      }
    };

    loadBook();
  }, [bookId]);

  // Check if book completion reward was already claimed
  useEffect(() => {
    const checkBookCompletion = async () => {
      if (!user || !bookId) return;
      
      const currentMonthYear = new Date().toISOString().slice(0, 7);
      
      // Check if chest was opened this month
      const { data: chestCheck } = await supabase
        .from('chest_openings')
        .select('id')
        .eq('user_id', user.id)
        .eq('book_id', bookId)
        .eq('month_year', currentMonthYear)
        .maybeSingle();
      
      if (chestCheck) {
        setHasClaimedReward(true);
      } else {
        setHasClaimedReward(false);
      }
      
      // Check if user has Chest Keys
      const CHEST_KEY_ID = '550e8400-e29b-41d4-a716-446655440000';
      const { data: keyData } = await supabase
        .from('user_inventory')
        .select('quantity')
        .eq('user_id', user.id)
        .eq('reward_type_id', CHEST_KEY_ID)
        .maybeSingle();
      
      if (keyData && keyData.quantity > 0) {
        setHasChestKey(true);
        setChestKeyCount(keyData.quantity);
      } else {
        setHasChestKey(false);
        setChestKeyCount(0);
      }
    };
    
    checkBookCompletion();
  }, [user, bookId]);

  // Check if all chapters are completed
  useEffect(() => {
    const checkAllChaptersCompleted = async () => {
      if (!user || !bookId || allChapters.length === 0) return;

      const { data } = await supabase
        .from('user_epub_chapter_progress')
        .select('chapter_id, is_completed')
        .eq('user_id', user.id)
        .eq('book_id', bookId);

      if (!data) return;

      const completedChapters = data.filter((p) => p.is_completed).length;
      setAllChaptersCompleted(completedChapters === allChapters.length);
    };

    checkAllChaptersCompleted();
  }, [user, bookId, allChapters]);

  // Auto-hide copyright warning after 10 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowCopyrightWarning(false);
    }, 10000);

    return () => clearTimeout(timer);
  }, []);

  // Throttled CFI save
  const scheduleSaveCFI = (cfi: string) => {
    if (saveTimerRef.current) window.clearTimeout(saveTimerRef.current);
    saveTimerRef.current = window.setTimeout(() => {
      if (chapterId) {
        localStorage.setItem(`chapter_location_${chapterId}`, cfi);
      }
    }, 300);
  };

  // Initialize EPUB reader with refs
  useEffect(() => {
    console.log('📋 EPUB useEffect triggered:', { loading, chapterId: chapter?.id, hasRef: !!epubRootRef.current });
    
    // Don't initialize while data is still loading (container not rendered yet)
    if (loading) {
      console.log('⏳ Skipping EPUB init - still loading data');
      return;
    }
    
    if (!chapter || !epubRootRef.current) return;

    let cancelled = false;
    setEpubReady(false);
    setEpubError(null);

    const initEpub = async () => {
      // Capture stable DOM reference at the beginning to avoid ref changes during async operations
      const container = epubRootRef.current;
      if (!container) {
        console.log('❌ No container ref available');
        return;
      }
      
      try {
        // Initial CSS stabilization delay (especially important for mobile)
        await new Promise(resolve => setTimeout(resolve, isMobile ? 150 : 50));
        
        if (cancelled) return;
        
        // Wait for container to have valid dimensions using getBoundingClientRect for accuracy
        const checkDimensions = (): Promise<boolean> => {
          return new Promise((resolve) => {
            let attempts = 0;
            const maxAttempts = isMobile ? 80 : 50; // More attempts on mobile (4s vs 2.5s)
            
            const check = () => {
              if (cancelled) {
                resolve(false);
                return;
              }
              
              // Use getBoundingClientRect for more accurate measurements on mobile
              const rect = container.getBoundingClientRect();
              const width = Math.floor(rect.width);
              const height = Math.floor(rect.height);
              
              console.log(`📐 Container dimensions check #${attempts + 1}:`, width, 'x', height);
              
              // Minimum dimensions - lower threshold for mobile
              const minDim = isMobile ? 100 : 50;
              if (width > minDim && height > minDim) {
                console.log('✅ Container has valid dimensions, proceeding with EPUB init');
                resolve(true);
                return;
              }
              
              attempts++;
              if (attempts >= maxAttempts) {
                console.error('❌ Container dimensions timeout after', attempts, 'attempts');
                resolve(false);
                return;
              }
              
              // Use requestAnimationFrame for better sync with layout
              requestAnimationFrame(check);
            };
            
            requestAnimationFrame(check);
          });
        };

        const hasValidDimensions = await checkDimensions();
        if (!hasValidDimensions || cancelled) {
          if (!cancelled) {
            setEpubError('Le conteneur de lecture n\'a pas pu s\'initialiser. Veuillez recharger la page.');
          }
          return;
        }

        // Defensive cleanup before init
        if (renditionRef.current) {
          try {
            renditionRef.current.destroy();
          } catch (e) {
            console.warn('Rendition cleanup warning:', e);
          }
          renditionRef.current = null;
        }
        if (bookRef.current) {
          try {
            bookRef.current.destroy?.();
          } catch (e) {
            console.warn('Book cleanup warning:', e);
          }
          bookRef.current = null;
        }
        container.innerHTML = '';

        console.log('🚀 Starting EPUB initialization for chapter:', chapter.id);
        console.log('📐 Final container dimensions:', container.clientWidth, 'x', container.clientHeight);

        // If custom OPF exists, try merging quickly but don't block initial render
        let epubUrl = chapter.epub_url;
        let objectUrlToRevoke: string | null = null;
        
        // PRIORITY 1: Check cache first (instant load from preloaded blob)
        if (epubPreloadService.isCached(chapter.id)) {
          console.log('✅ Using preloaded EPUB from global cache (instant)');
          const cachedBlob = epubPreloadService.getCachedBlob(chapter.id);
          if (cachedBlob) {
            epubUrl = URL.createObjectURL(cachedBlob);
            objectUrlToRevoke = epubUrl;
          }
        } 
        // PRIORITY 2: If preload is in progress, wait for it (up to 5s)
        else if (epubPreloadService.isPreloading(chapter.id)) {
          console.log('⏳ Waiting for preload in progress...');
          const urlToPreload = chapter.merged_epub_url || chapter.epub_url;
          try {
            const preloadPromise = epubPreloadService.preloadChapter(chapter.id, urlToPreload);
            const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 5000));
            const blob = await Promise.race([preloadPromise, timeoutPromise]);
            if (blob && !cancelled) {
              console.log('✅ Preload completed, using cached blob');
              epubUrl = URL.createObjectURL(blob);
              objectUrlToRevoke = epubUrl;
            } else {
              console.log('⚠️ Preload timeout, falling back to URL');
              epubUrl = chapter.merged_epub_url || chapter.epub_url;
            }
          } catch (e) {
            console.warn('Preload wait failed, using URL fallback:', e);
            epubUrl = chapter.merged_epub_url || chapter.epub_url;
          }
        }
        // PRIORITY 3: Use pre-merged EPUB URL if available
        else if (chapter.merged_epub_url) {
          console.log('✅ Using pre-merged EPUB URL');
          epubUrl = chapter.merged_epub_url;
        } 
        // PRIORITY 4: Merge on-demand if OPF exists
        else if (chapter.opf_url) {
          console.log('⚠️ No pre-merged EPUB, merging on-demand...');
          console.log('📋 EPUB URL:', chapter.epub_url);
          console.log('📋 OPF URL:', chapter.opf_url);
          try {
            const SUPABASE_URL = "https://aotzivwzoxmnnawcxioo.supabase.co";
            const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFvdHppdnd6b3htbm5hd2N4aW9vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5OTEwODYsImV4cCI6MjA2NTU2NzA4Nn0.n-S4MY36dvh2C8f8hRV3AH98VI5gtu3TN_Szb9G_ZQA";
            
            console.log('🔄 Calling merge-epub-opf edge function...');
            const mergePromise = fetch(`${SUPABASE_URL}/functions/v1/merge-epub-opf`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                'apikey': SUPABASE_ANON_KEY,
              },
              body: JSON.stringify({
                epubUrl: chapter.epub_url,
                opfUrl: chapter.opf_url,
              }),
            }).then(async (response) => {
              console.log('📡 Merge response status:', response.status, response.statusText);
              if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ Merge response error:', errorText);
                throw new Error(`Merge failed: ${response.status} ${response.statusText}`);
              }
              const blob = await response.blob();
              console.log('✅ Received merged blob:', blob.size, 'bytes, type:', blob.type);
              return blob;
            });
            
            // Reduced timeout from 5s to 3s for better UX
            const timeout = new Promise<never>((_, reject) =>
              setTimeout(() => reject(new Error('OPF merge timeout (3s)')), 3000)
            );
            
            const blob = await Promise.race([mergePromise, timeout]);
            console.log('📦 Merged EPUB size:', blob.size, 'bytes');
            
            // Auto-upload merged EPUB for future instant loading
            try {
              console.log('📤 Auto-uploading merged EPUB to storage...');
              const mergedUrl = await chapterEpubService.uploadMergedEpub(blob, chapter.book_id, chapter.chapter_number);
              await chapterEpubService.updateChapter(chapter.id, { merged_epub_url: mergedUrl });
              epubUrl = mergedUrl;
              console.log('✅ Merged EPUB saved, future loads will be instant');
            } catch (uploadError) {
              console.warn('⚠️ Could not save merged EPUB, using blob URL:', uploadError);
              epubUrl = URL.createObjectURL(blob);
            }
          } catch (error) {
            console.error('❌ OPF merge error:', error);
            console.log('🔄 Falling back to original EPUB:', chapter.epub_url);
            epubUrl = chapter.epub_url;
          }
        }

        // Create book with potentially merged EPUB
        const book = ePub(epubUrl);
        bookRef.current = book;
        
        // Wait for book to be fully opened (not just ready)
        await book.ready;

        if (cancelled) return;

        // Create rendition with percentage dimensions for stable layout
        const rendition = book.renderTo(container, {
          width: '100%',
          height: '100%',
          flow: 'paginated',
          spread: 'none',
          minSpreadWidth: 0,
          allowScriptedContent: false,
        });
        renditionRef.current = rendition;

        // Register themes with minimal styles (let epub.js handle layout)
        const themeConfigs = {
          light: {
            body: { 
              background: '#ffffff !important', 
              color: '#1a1a1a !important',
              margin: '0 !important',
              padding: '16px !important',
            },
            p: { 
              'line-height': '1.6',
              margin: '0 0 0.8em 0'
            },
          },
          dark: {
            body: { 
              background: '#1a1a1a !important', 
              color: '#ffffff !important',
              margin: '0 !important',
              padding: '16px !important',
            },
            p: { 
              'line-height': '1.6',
              margin: '0 0 0.8em 0'
            },
          },
          sepia: {
            body: { 
              background: '#f4ecd8 !important', 
              color: '#5c4a3a !important',
              margin: '0 !important',
              padding: '16px !important',
            },
            p: { 
              'line-height': '1.6',
              margin: '0 0 0.8em 0'
            },
          },
        };

        rendition.themes.register('light', themeConfigs.light);
        rendition.themes.register('dark', themeConfigs.dark);
        rendition.themes.register('sepia', themeConfigs.sepia);
        
        rendition.themes.select(theme);
        rendition.themes.fontSize(`${fontSize}px`);

        // Listener for readiness backup
        const onRendered = () => {
          if (!cancelled && !epubReady) {
            setEpubReady(true);
          }
        };

        // Listener for location tracking
        const onRelocated = (loc: any) => {
          if (cancelled) return;
          const cfi = loc.start.cfi;
          
          // Throttle CFI save
          scheduleSaveCFI(cfi);
          
          // Calculate progress
          if ((bookRef.current?.locations as any)?.total) {
            const percentage = bookRef.current.locations.percentageFromCfi(cfi);
            setProgress(Math.round(percentage * 100));
          }
        };

        rendition.on('rendered', onRendered);
        rendition.on('relocated', onRelocated);

        // Register hook to apply pre-translated content and waypoints
        rendition.hooks.content.register((contents: any) => {
          const doc = contents.document;
          if (!doc) return;
          
          // Apply waypoint highlighting
          if (waypoints.length > 0) {
            const themeColors = {
              light: { color: '#d97706', bg: 'rgba(251, 191, 36, 0.2)' },
              dark: { color: '#fbbf24', bg: 'rgba(251, 191, 36, 0.2)' },
              sepia: { color: '#b45309', bg: 'rgba(251, 191, 36, 0.2)' },
            };
            const colors = themeColors[theme] || themeColors.light;
            
            waypoints.forEach(waypoint => {
              highlightWaypointInDocument(doc, waypoint, colors);
            });
          }
        });
        
        // Handle clicks on waypoints
        rendition.on('click', (event: MouseEvent) => {
          const target = event.target as HTMLElement;
          if (target.classList.contains('orydia-waypoint')) {
            event.preventDefault();
            event.stopPropagation();
            const waypointId = target.dataset.waypointId;
            const wp = waypoints.find(w => w.id === waypointId);
            if (wp) {
              setActiveWaypoint(wp);
              setShowWaypointPopup(true);
            }
          }
        });

        // Display with saved location or fallback, robustly skipping cover pages
        const cfiKey = chapterId ? `chapter_location_${chapterId}` : '';
        const savedCFI = cfiKey ? localStorage.getItem(cfiKey) : null;
        const savedLocation = typeof savedCFI === 'string' ? savedCFI : undefined;

        const spineItems: any[] = ((book.spine as any).items || []) as any[];
        
        // More precise cover detection - avoid false positives
        const isCoverLike = (item: any) => {
          const href = String(item?.href || '').toLowerCase();
          const idref = String(item?.idref || '').toLowerCase();
          const props = String(item?.properties || '').toLowerCase();
          
          // More specific patterns to avoid blocking real content
          const coverPatterns = /^cover\.|_cover\.|cover-image|cover\.x?html|titlepage|frontmatter|copyright-page|nav\.x?html$|toc\.x?html$/;
          const looksLike = coverPatterns.test(href) || coverPatterns.test(idref) ||
            props.includes('cover-image') || props === 'nav';
          const nonLinear = String(item?.linear || '').toLowerCase() === 'no';
          return looksLike || nonLinear;
        };
        
        // Debug logging
        console.log('🔍 EPUB spine items:', spineItems.map(it => ({
          href: it.href,
          idref: it.idref,
          isCoverLike: isCoverLike(it)
        })));
        
        // Find first readable, fallback to first item if all are flagged
        const firstReadable = spineItems.find((it) => !isCoverLike(it));
        const targetItem = firstReadable || spineItems[0];
        const readingHref = targetItem?.href;
        
        console.log('📖 Target item for display:', readingHref);
        
        // Check if we had a loading failure before for this chapter
        const failureKey = `chapter_load_failed_${chapterId}`;
        const hadPreviousFailure = localStorage.getItem(failureKey);
        
        // If we had a failure before, clear saved location to start fresh
        if (hadPreviousFailure && cfiKey) {
          console.log('🔄 Previous load failure detected, clearing saved location');
          localStorage.removeItem(cfiKey);
          localStorage.removeItem(failureKey);
        }
        
        // Re-check saved location after potential clear
        const effectiveSavedLocation = hadPreviousFailure ? undefined : (typeof savedCFI === 'string' ? savedCFI : undefined);
        
        const tryDisplay = async (target?: any, attemptNumber: number = 1) => {
          console.log(`🎯 Display attempt ${attemptNumber}:`, target);
          try {
            await rendition.display(target);
            console.log(`✅ Display attempt ${attemptNumber} succeeded`);
          } catch (err) {
            console.warn(`Display failed (attempt ${attemptNumber}):`, err);
            
            // Mark failure and clear saved location
            if (cfiKey) {
              localStorage.setItem(failureKey, 'true');
              localStorage.removeItem(cfiKey);
            }
            
            if (attemptNumber === 1) {
              // Attempt 2: try with readingHref (no saved location)
              return tryDisplay(readingHref, 2);
            } else if (attemptNumber === 2) {
              // Attempt 3: let epub.js decide
              return tryDisplay(undefined, 3);
            } else if (attemptNumber === 3 && spineItems[0]?.href) {
              // Last resort: force first spine item
              console.log('🔧 Last resort: forcing first spine item');
              await rendition.display(spineItems[0].href);
            }
          }
        };

        // Prefer readingHref over saved location if saved location looks like a CFI
        const isCFI = effectiveSavedLocation && effectiveSavedLocation.startsWith('epubcfi(');
        const initialTarget = isCFI ? readingHref : (effectiveSavedLocation || readingHref);
        console.log('🚀 Initial display target:', initialTarget, '(savedCFI bypassed:', isCFI, ')');
        
        const displayPromise = tryDisplay(initialTarget, 1).then(async () => {
          // Wait a short delay to let epub.js create the iframe
          await new Promise(r => setTimeout(r, 150));
          
          // Verify iframe actually exists after display
          const iframe = container.querySelector('iframe');
          if (!iframe && !cancelled) {
            console.warn('⚠️ Display succeeded but no iframe found, forcing resize...');
            if (renditionRef.current) {
              renditionRef.current.resize(container.clientWidth, container.clientHeight);
            }
          }
          
          if (!cancelled && !epubReady) setEpubReady(true);
        });

        // Single fallback readiness check if 'rendered' event is slow (consolidated timer)
        if (readinessTimerRef.current) window.clearTimeout(readinessTimerRef.current);
        readinessTimerRef.current = window.setTimeout(() => {
          if (!cancelled && !epubReady) {
            const iframe = container.querySelector('iframe');
            if (iframe) {
              const iframeRect = iframe.getBoundingClientRect();
              console.log('⏱️ Readiness fallback check - iframe found:', iframeRect.width, 'x', iframeRect.height);
              if (iframeRect.width > 0 && iframeRect.height > 0) {
                console.log('✅ Readiness fallback triggered - iframe has valid dimensions');
                setEpubReady(true);
              }
            } else if (renditionRef.current) {
              // No iframe at 2s, force a resize to re-trigger rendering
              console.log('⚠️ No iframe at 2s fallback, forcing resize...');
              renditionRef.current.resize(container.clientWidth, container.clientHeight);
            }
          }
        }, 2000);

        // Fatal timeout: longer on mobile (15s vs 10s) due to slower connections
        const fatalTimeoutMs = isMobile ? 15000 : 10000;
        if (fatalLoadTimerRef.current) window.clearTimeout(fatalLoadTimerRef.current);
        fatalLoadTimerRef.current = window.setTimeout(() => {
          if (!cancelled && !epubReady) {
            const iframe = container.querySelector('iframe');
            const hasIframe = !!iframe;
            const iframeDims = iframe ? `${iframe.clientWidth}x${iframe.clientHeight}` : 'N/A';
            const containerDims = `${container.clientWidth}x${container.clientHeight}`;
            
            console.error(`❌ Fatal timeout: EPUB failed to load after ${fatalTimeoutMs / 1000}s`, {
              hasIframe,
              iframeDims,
              containerDims,
              chapterId: chapter?.id,
              epubUrl,
              isMobile
            });
            
            setEpubError(isMobile 
              ? 'Connexion lente détectée. Le chapitre n\'a pas pu charger. Vérifiez votre connexion et réessayez.'
              : 'Le chapitre met trop de temps à charger. Veuillez réessayer.'
            );
          }
        }, fatalTimeoutMs);

        // Setup window resize listeners to handle viewport changes
        const onViewportResize = () => {
          if (!containerRef.current || !renditionRef.current) return;
          
          const rect = containerRef.current.getBoundingClientRect();
          const width = Math.floor(rect.width);
          const height = Math.floor(rect.height);
          
          // Only resize if dimensions actually changed (> 1px difference)
          if (Math.abs(width - lastSizeRef.current.width) > 1 || 
              Math.abs(height - lastSizeRef.current.height) > 1) {
            lastSizeRef.current = { width, height };
            renditionRef.current.resize(width, height);
          }
        };
        
        viewportResizeHandlerRef.current = onViewportResize;
        window.addEventListener('resize', onViewportResize);
        window.addEventListener('orientationchange', onViewportResize);

        // Generate locations for progress (non-blocking)
        (async () => {
          try {
            await book.locations.generate(1600);
            const locTotal = (book.locations as any)?.total || 0;
            if (!cancelled) {
              setTotalLocations(locTotal);
              console.log('📊 Locations generated:', locTotal, 'total');
            }
          } catch (e) {
            console.warn('locations.generate failed', e);
          }
        })();

        // NOTE: Duplicate readiness timer removed - consolidated above at line 649

      } catch (error) {
        if (!cancelled) {
          console.error('EPUB initialization failed:', error);
          setEpubError('Erreur lors du chargement du chapitre');
        }
      }
    };

    initEpub();

    // Guaranteed cleanup on unmount or chapter change
    return () => {
      cancelled = true;
      
      // Remove window listeners
      if (viewportResizeHandlerRef.current) {
        window.removeEventListener('resize', viewportResizeHandlerRef.current);
        window.removeEventListener('orientationchange', viewportResizeHandlerRef.current);
        viewportResizeHandlerRef.current = null;
      }
      
      if (saveTimerRef.current) {
        window.clearTimeout(saveTimerRef.current);
        saveTimerRef.current = null;
      }
      
      if (readinessTimerRef.current) {
        window.clearTimeout(readinessTimerRef.current);
        readinessTimerRef.current = null;
      }
      if (fatalLoadTimerRef.current) {
        window.clearTimeout(fatalLoadTimerRef.current);
        fatalLoadTimerRef.current = null;
      }

      try {
        if (renditionRef.current) {
          renditionRef.current.off?.('rendered');
          renditionRef.current.off?.('relocated');
          renditionRef.current.destroy?.();
          renditionRef.current = null;
        }
      } catch (e) {
        console.warn('Rendition cleanup error:', e);
      }

      try {
        if (bookRef.current) {
          bookRef.current.destroy?.();
          bookRef.current = null;
        }
      } catch (e) {
        console.warn('Book cleanup error:', e);
      }

      if (epubRootRef.current) {
        epubRootRef.current.innerHTML = '';
      }
    };
  }, [chapter?.id, loading]);

  // Apply theme changes without re-initializing
  useEffect(() => {
    if (renditionRef.current && epubReady) {
      renditionRef.current.themes?.select(theme);
      if (chapterId) {
        localStorage.setItem(`chapter_theme_${chapterId}`, theme);
      }
    }
  }, [theme, epubReady, chapterId]);

  // Apply font size changes without re-initializing
  useEffect(() => {
    if (renditionRef.current && epubReady && containerRef.current) {
      renditionRef.current.themes?.fontSize(`${fontSize}px`);
      // Re-measure after font size change
      const rect = containerRef.current.getBoundingClientRect();
      const width = Math.floor(rect.width);
      const height = Math.floor(rect.height);
      
      // Only resize if dimensions changed
      if (Math.abs(width - lastSizeRef.current.width) > 1 || 
          Math.abs(height - lastSizeRef.current.height) > 1) {
        lastSizeRef.current = { width, height };
        renditionRef.current.resize(width, height);
      }
    }
  }, [fontSize, epubReady]);

  const handleFontSizeChange = (size: number) => {
    setFontSize(size);
    if (chapterId) {
      localStorage.setItem(`chapter_fontSize_${chapterId}`, size.toString());
    }
  };

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme);
  };

  const handleResetPosition = () => {
    if (chapterId) {
      localStorage.removeItem(`chapter_location_${chapterId}`);
    }
    if (renditionRef.current) {
      renditionRef.current.display?.().catch(() => {});
    }
    toast.success('Position réinitialisée');
  };

  // Debounced navigation handlers to prevent rapid clicks causing issues
  const handleNextPage = useCallback(() => {
    if (navigationLockRef.current || !renditionRef.current) return;
    navigationLockRef.current = true;
    renditionRef.current.next();
    setTimeout(() => { navigationLockRef.current = false; }, 200);
  }, []);

  const handlePrevPage = useCallback(() => {
    if (navigationLockRef.current || !renditionRef.current) return;
    navigationLockRef.current = true;
    renditionRef.current.prev();
    setTimeout(() => { navigationLockRef.current = false; }, 200);
  }, []);

  const getNextChapter = () => {
    if (!chapter) return null;
    const currentIndex = allChapters.findIndex((ch) => ch.id === chapter.id);
    return currentIndex < allChapters.length - 1 ? allChapters[currentIndex + 1] : null;
  };

  const isLastChapter = () => {
    if (!chapter) return false;
    const currentIndex = allChapters.findIndex((ch) => ch.id === chapter.id);
    return currentIndex === allChapters.length - 1;
  };

  // Preload next chapter for instant transitions using global service
  const preloadNextChapter = useCallback(async () => {
    const nextChapter = getNextChapter();
    if (!nextChapter) return;
    
    // Use merged URL if available, otherwise regular epub_url
    const urlToPreload = nextChapter.merged_epub_url || nextChapter.epub_url;
    await epubPreloadService.preloadChapter(nextChapter.id, urlToPreload);
  }, [allChapters, chapter]);

  // Trigger preloading when epub is ready
  useEffect(() => {
    if (epubReady) {
      void preloadNextChapter();
    }
  }, [epubReady, preloadNextChapter]);

  const awardPointsAndComplete = async () => {
    if (!user || !book || !bookId) return;
    
    const basePoints = book.points || 50;
    const pointsToAward = subscription.isPremium ? basePoints * 2 : basePoints;
    
    try {
      // Open chest for rewards
      const rewards = await openChestForBook(bookId, book.title);
      
      if (rewards) {
        setChestRewards(rewards);
        setShowChestDialog(true);
      }
      
      // Record book completion
      const { error } = await supabase.from('book_completions').insert({
        user_id: user.id,
        book_id: bookId,
      });
      
      if (error) throw error;
      
      setHasClaimedReward(true);
      
      // Update challenge progress for book completion
      await updateProgressOnBookCompletion(user.id, bookId, book.genres || []);
      
    } catch (error) {
      console.error('Error awarding points:', error);
      toast.error('Erreur lors de l\'attribution des récompenses');
    }
  };

  const handleClaimReward = async () => {
    if (!user) {
      toast.error("Vous devez être connecté pour réclamer vos Orydors");
      return;
    }
    
    // Check if already claimed
    const { data: existingCompletion } = await supabase
      .from('book_completions')
      .select('id')
      .eq('user_id', user.id)
      .eq('book_id', bookId)
      .maybeSingle();
    
    if (existingCompletion) {
      toast.error("Vous avez déjà réclamé vos Orydors pour ce livre");
      return;
    }
    
    // If freemium: show ad
    if (!subscription.isPremium) {
      setShowRewardAd(true);
    } else {
      // If premium: award points directly
      await awardPointsAndComplete();
    }
  };

  const handleMarkLastChapterComplete = async () => {
    if (!user || !chapter || !bookId) return;
    
    setMarkingComplete(true);
    
    try {
      // 1. Check if reward already claimed (double-check before proceeding)
      const { data: chestCheck } = await supabase
        .from('chest_openings')
        .select('id')
        .eq('user_id', user.id)
        .eq('book_id', bookId)
        .maybeSingle();
      
      if (chestCheck) {
        toast.error('Vous avez déjà réclamé vos Orydors pour ce livre');
        setHasClaimedReward(true);
        return;
      }
      
      // 2. Mark current chapter as completed
      await markEpubChapterCompleted(chapter.id, bookId);
      
      // 2b. Update challenge progress for chapter-based objectives
      if (book?.genres) {
        await updateProgressOnChapterCompletion(user.id, bookId, chapter.id, book.genres);
      }
      
      // 3. Reload progression data
      const { data } = await supabase
        .from('user_epub_chapter_progress')
        .select('chapter_id, is_completed')
        .eq('user_id', user.id)
        .eq('book_id', bookId);
      
      // 4. Check if all chapters are now completed
      const completedCount = data?.filter(p => p.is_completed).length || 0;
      const allCompleted = completedCount >= allChapters.length;
      
      if (allCompleted) {
        setAllChaptersCompleted(true);
        toast.success('Tous les chapitres terminés !');
        
        // 5. Automatically trigger reward claiming (chest opening)
        await handleClaimReward();
      } else {
        toast.info(`${completedCount}/${allChapters.length} chapitres terminés`);
      }
    } catch (error) {
      console.error('Error marking chapter complete:', error);
      toast.error('Erreur lors du marquage');
    } finally {
      setMarkingComplete(false);
    }
  };

  // Handle using a chest key to re-open an already claimed chest
  const handleUseChestKey = async () => {
    if (!user || !bookId || !book || !hasChestKey) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Non authentifié');

      const { data, error } = await supabase.functions.invoke('open-chest', {
        body: { bookId, useChestKey: true },
        headers: { Authorization: `Bearer ${session.access_token}` }
      });

      if (error) throw error;

      setChestRewards(data);
      setShowChestDialog(true);
      setHasClaimedReward(true);
      
      // Refresh chest key count
      const CHEST_KEY_ID = '550e8400-e29b-41d4-a716-446655440000';
      const { data: keyData } = await supabase
        .from('user_inventory')
        .select('quantity')
        .eq('user_id', user.id)
        .eq('reward_type_id', CHEST_KEY_ID)
        .maybeSingle();
      
      if (keyData && keyData.quantity > 0) {
        setChestKeyCount(keyData.quantity);
      } else {
        setHasChestKey(false);
        setChestKeyCount(0);
      }

      toast.success('Clé d\'Aildor utilisée ! Coffre ouvert à nouveau.');
    } catch (error: any) {
      console.error('Error using chest key:', error);
      toast.error(error.message || 'Erreur lors de l\'utilisation de la clé');
    }
  };

  const themeColors = {
    light: { background: '#ffffff', color: '#000000' },
    dark: { background: '#1a1a1a', color: '#ffffff' },
    sepia: { background: '#f4ecd8', color: '#5c4a2f' },
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!chapter) return null;

  const nextChapter = getNextChapter();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="border-b bg-card p-2 md:p-3 sticky top-0 z-40">
        <div className="container mx-auto flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(`/book/${bookId}/chapters`)}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-base md:text-lg font-semibold line-clamp-1 flex-1">
            {chapter.title}
          </h1>
          <Button
            variant="outline"
            size="sm"
            onClick={handleResetPosition}
            title="Revenir au début du chapitre"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* EPUB Reader with Navigation */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden pb-16 md:pb-14">
        {epubError ? (
          <div className="flex flex-col items-center justify-center h-full gap-4">
            <p className="text-destructive">{epubError}</p>
            <div className="flex flex-col gap-3 items-center">
              <Button onClick={() => window.location.reload()}>Recharger la page</Button>
              <p className="text-xs text-muted-foreground">
                Si le problème persiste, contactez le support.
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Copyright Warning Banner - Auto-disappears after 10 seconds */}
            {showCopyrightWarning && (
              <div className="px-2 md:px-4 py-2 md:py-3 bg-amber-50 dark:bg-amber-950 border-b border-amber-200 dark:border-amber-800 transition-opacity duration-500 ease-out">
                <div className="flex items-start gap-2">
                  <ShieldAlert className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <p className="text-xs md:text-sm text-amber-900 dark:text-amber-100 leading-relaxed flex-1">
                    <span className="font-semibold">Protection légale du contenu :</span> Tout le contenu (littéraire et audio) diffusé ici est protégé par le droit d'auteur, et son usage est strictement limité à l'écoute/lecture privée en streaming au sein de cette application. Toute reproduction, téléchargement ou diffusion non autorisé constitue un délit de contrefaçon, formellement interdit par l'article L335-2 du Code de la propriété intellectuelle.
                  </p>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 shrink-0 hover:bg-amber-100 dark:hover:bg-amber-900"
                    onClick={() => setShowCopyrightWarning(false)}
                  >
                    <span className="text-amber-600 dark:text-amber-400">×</span>
                  </Button>
                </div>
              </div>
            )}

            {/* Reader Container with Navigation Buttons */}
            <div className="flex-1 relative overflow-hidden pb-2" ref={containerRef} style={{ minHeight: '0' }}>
              {!epubReady && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/60 z-10 pointer-events-none">
                  <div className="text-center space-y-2">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="text-muted-foreground">
                      Chargement du chapitre...
                    </p>
                  </div>
                </div>
              )}

              {/* Navigation Button - Previous */}
              {epubReady && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 z-20 h-10 w-10 md:h-12 md:w-12 rounded-full bg-background/80 hover:bg-background shadow-lg transition-all hover:scale-110 touch-manipulation"
                  onClick={handlePrevPage}
                  aria-label="Page précédente"
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>
              )}

              {/* EPUB Container */}
              <div
                ref={epubRootRef}
                className={`absolute inset-0 overflow-hidden ${isMobile ? 'epub-container-mobile' : ''}`}
                style={{
                  background: themeColors[theme].background,
                  filter: colorblindMode !== 'none' ? `url(#${colorblindMode}-filter)` : undefined,
                }}
              />

              {/* Navigation Button - Next */}
              {epubReady && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-4 md:right-6 top-1/2 -translate-y-1/2 z-20 h-10 w-10 md:h-12 md:w-12 rounded-full bg-background/80 hover:bg-background shadow-lg transition-all hover:scale-110 touch-manipulation"
                  onClick={handleNextPage}
                  aria-label="Page suivante"
                >
                  <ChevronRight className="h-6 w-6" />
                </Button>
              )}
            </div>

          </>
        )}
      </div>

      {/* Footer - Fixed at bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-1.5 md:p-2 z-30 safe-area-bottom">
        <div className="px-2 md:px-3 flex gap-2 items-center">
          {/* Settings button on the left */}
          <Button
            variant="outline"
            size="icon"
            onClick={() => setControlsOpen(true)}
            className="h-9 w-9 shrink-0 z-40"
          >
            <Type className="h-5 w-5" />
          </Button>
          
          {/* Main action button (full width) */}
          <div className="flex-1">
            {isLastChapter() ? (
              hasClaimedReward ? (
                hasChestKey ? (
                  <Button
                    onClick={handleUseChestKey}
                    className="w-full h-9 bg-amber-600 hover:bg-amber-700"
                    variant="default"
                  >
                    <Gift className="mr-2 h-4 w-4" />
                    <span className="text-sm">Utiliser une Clé ({chestKeyCount})</span>
                  </Button>
                ) : (
                  <Button disabled className="w-full h-9">
                    <Gift className="mr-2 h-4 w-4" />
                    <span className="text-sm">Orydors déjà réclamés ✓</span>
                  </Button>
                )
              ) : allChaptersCompleted ? (
                <Button
                  onClick={handleClaimReward}
                  className="w-full h-9"
                  variant="default"
                >
                  <Gift className="mr-2 h-4 w-4" />
                  <span className="text-sm">Réclamer vos Orydors</span>
                </Button>
              ) : (
                <Button 
                  onClick={handleMarkLastChapterComplete}
                  disabled={markingComplete}
                  className="w-full h-9"
                  variant="default"
                >
                  {markingComplete ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      <span className="text-sm">Vérification...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      <span className="text-sm">Terminer et réclamer mes Orydors</span>
                    </>
                  )}
                </Button>
              )
            ) : nextChapter ? (
              <Button
                onClick={async () => {
                  if (user && chapter && bookId) {
                    try {
                      await markEpubChapterCompleted(chapter.id, bookId);
                      // Update challenge progress for chapter-based objectives
                      if (book?.genres) {
                        await updateProgressOnChapterCompletion(user.id, bookId, chapter.id, book.genres);
                      }
                    } catch (error) {
                      console.error('Error marking chapter completed:', error);
                    }
                  }
                  // Show completion animation instead of navigating directly
                  setPendingNextChapterId(nextChapter.id);
                  setShowCompletionAnimation(true);
                }}
                className="w-full h-9"
              >
                <span className="text-sm">Chapitre suivant</span>
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <div className="text-center text-xs text-muted-foreground py-2">
                Bonne lecture ! 📖
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reading Controls */}
      <ChapterReadingControls
        open={controlsOpen}
        onOpenChange={setControlsOpen}
        fontSize={fontSize}
        theme={theme}
        colorblindMode={colorblindMode}
        onFontSizeChange={handleFontSizeChange}
        onThemeChange={handleThemeChange}
        onColorblindModeChange={setColorblindMode}
      />


      {/* SVG Filters for colorblind modes */}
      <svg style={{ position: 'absolute', width: 0, height: 0 }}>
        <defs>
          <filter id="deuteranopia-filter">
            <feColorMatrix
              type="matrix"
              values="0.625 0.375 0 0 0
                      0.7 0.3 0 0 0
                      0 0.3 0.7 0 0
                      0 0 0 1 0"
            />
          </filter>
          <filter id="protanopia-filter">
            <feColorMatrix
              type="matrix"
              values="0.567 0.433 0 0 0
                      0.558 0.442 0 0 0
                      0 0.242 0.758 0 0
                      0 0 0 1 0"
            />
          </filter>
          <filter id="tritanopia-filter">
            <feColorMatrix
              type="matrix"
              values="0.95 0.05 0 0 0
                      0 0.433 0.567 0 0
                      0 0.475 0.525 0 0
                      0 0 0 1 0"
            />
          </filter>
        </defs>
      </svg>

      {chestRewards && (
        <ChestOpeningDialog
          isOpen={showChestDialog}
          onClose={() => {
            setShowChestDialog(false);
            setHasClaimedReward(true);
          }}
          chestType={chestRewards.chestType}
          orydors={chestRewards.orydors}
          orydorsVariation={chestRewards.orydorsVariation}
          additionalRewards={chestRewards.additionalRewards}
          bookTitle={book?.title || 'Livre'}
        />
      )}

      {/* Waypoint Popup */}
      <WaypointPopup
        waypoint={activeWaypoint}
        isOpen={showWaypointPopup}
        onClose={() => {
          setShowWaypointPopup(false);
          setActiveWaypoint(null);
        }}
      />

      {/* Chapter Completion Animation */}
      <ChapterCompletionAnimation
        isOpen={showCompletionAnimation}
        currentChapter={allChapters.findIndex(ch => ch.id === chapter?.id) + 1}
        totalChapters={allChapters.length}
        bookTitle={book?.title || ''}
        onContinue={() => {
          setShowCompletionAnimation(false);
          if (pendingNextChapterId && bookId) {
            navigate(`/book/${bookId}/chapter/${pendingNextChapterId}`);
            setPendingNextChapterId(null);
          }
        }}
      />
    </div>
  );
};
