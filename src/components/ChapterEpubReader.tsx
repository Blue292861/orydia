import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ePub from 'epubjs';
import { ChapterEpub } from '@/types/ChapterEpub';
import { chapterEpubService } from '@/services/chapterEpubService';
import { startReadingEpubChapter, markEpubChapterCompleted } from '@/services/chapterService';
import { Button } from '@/components/ui/button';
import { ChapterReadingControls } from '@/components/ChapterReadingControls';
import { ChapterBannerAd } from '@/components/ChapterBannerAd';
import { RewardAd } from '@/components/RewardAd';
import { ChestOpeningDialog } from '@/components/ChestOpeningDialog';
import { TranslationProgress } from '@/components/TranslationProgress';
import { useAuth } from '@/contexts/AuthContext';
import { useUserStats } from '@/contexts/UserStatsContext';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, ArrowRight, Gift, ChevronLeft, ChevronRight, RotateCcw, Type, ShieldAlert, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Book } from '@/types/Book';

type Theme = 'light' | 'dark' | 'sepia';
type ColorblindMode = 'none' | 'deuteranopia' | 'protanopia' | 'tritanopia';
type Language = 'fr' | 'en' | 'es' | 'de' | 'ru' | 'zh' | 'ja' | 'ar' | 'it' | 'pt' | 'nl' | 'pl' | 'tr' | 'ko';

export const ChapterEpubReader: React.FC = () => {
  const { bookId, chapterId } = useParams<{ bookId: string; chapterId: string }>();
  const navigate = useNavigate();
  const { user, subscription } = useAuth();
  const { openChestForBook } = useUserStats();
  
  // Chapter data
  const [chapter, setChapter] = useState<ChapterEpub | null>(null);
  const [allChapters, setAllChapters] = useState<ChapterEpub[]>([]);
  const [loading, setLoading] = useState(true);
  const [book, setBook] = useState<Book | null>(null);
  
  // Reading settings
  const [fontSize, setFontSize] = useState(16);
  const [theme, setTheme] = useState<Theme>('light');
  const [colorblindMode, setColorblindMode] = useState<ColorblindMode>('none');
  const [language, setLanguage] = useState<Language>('fr');
  const [isTranslating, setIsTranslating] = useState(false);
  
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
  
  // Chest dialog state
  const [showChestDialog, setShowChestDialog] = useState(false);
  const [chestRewards, setChestRewards] = useState<any>(null);
  
  // Copyright warning state
  const [showCopyrightWarning, setShowCopyrightWarning] = useState(true);
  
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
  const translationCacheRef = useRef<Map<string, string>>(new Map());
  const originalContentRef = useRef<string>('');
  const preloadCacheRef = useRef<Map<string, Blob>>(new Map());

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
        const savedLanguage = localStorage.getItem(`chapter_language_${chapterId}`);

        if (savedFontSize) setFontSize(parseInt(savedFontSize));
        if (savedTheme) setTheme(savedTheme as Theme);
        if (savedLanguage) setLanguage(savedLanguage as Language);
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
            isAdultContent: bookData.is_adult_content
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
      
      // Check both book_completions AND chest_openings to be consistent with edge function
      const [completionCheck, chestCheck] = await Promise.all([
        supabase
          .from('book_completions')
          .select('id')
          .eq('user_id', user.id)
          .eq('book_id', bookId)
          .maybeSingle(),
        supabase
          .from('chest_openings')
          .select('id')
          .eq('user_id', user.id)
          .eq('book_id', bookId)
          .maybeSingle()
      ]);
      
      if (completionCheck.data || chestCheck.data) {
        setHasClaimedReward(true);
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
    if (!chapter || !epubRootRef.current) return;

    let cancelled = false;
    setEpubReady(false);
    setEpubError(null);

    const initEpub = async () => {
      try {
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
        if (epubRootRef.current) {
          epubRootRef.current.innerHTML = '';
        }

        // If custom OPF exists, try merging quickly but don't block initial render
        let epubUrl = chapter.epub_url;
        
        // Use pre-merged EPUB if available (instant load)
        if (chapter.merged_epub_url) {
          console.log('✅ Using pre-merged EPUB (instant load)');
          epubUrl = chapter.merged_epub_url;
        } else if (preloadCacheRef.current.has(chapter.id)) {
          console.log('Using preloaded EPUB from cache');
          const cachedBlob = preloadCacheRef.current.get(chapter.id);
          if (cachedBlob) {
            epubUrl = URL.createObjectURL(cachedBlob);
          }
        } else if (chapter.opf_url) {
          console.log('⚠️ No pre-merged EPUB, merging on-demand (slower)...');
          try {
            const SUPABASE_URL = "https://aotzivwzoxmnnawcxioo.supabase.co";
            const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFvdHppdnd6b3htbm5hd2N4aW9vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5OTEwODYsImV4cCI6MjA2NTU2NzA4Nn0.n-S4MY36dvh2C8f8hRV3AH98VI5gtu3TN_Szb9G_ZQA";
            
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
              if (!response.ok) {
                throw new Error(`Merge failed: ${response.statusText}`);
              }
              const blob = await response.blob();
              console.log('Received blob from merge function:', blob.size, 'bytes');
              return blob;
            });
            
            const timeout = new Promise<never>((_, reject) =>
              setTimeout(() => reject(new Error('OPF merge timeout')), 5000)
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
            console.warn('⚠️ OPF merge failed, falling back to original EPUB:', error);
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
        const rendition = book.renderTo(epubRootRef.current!, {
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

        // Register hook to apply pre-translated content
        rendition.hooks.content.register((contents: any) => {
          const doc = contents.document;
          if (!doc || language === 'fr') return;

          // Get section ID
          const section = contents.section;
          const sectionId = section?.idref;
          
          if (sectionId && translationCacheRef.current.has(sectionId)) {
            const translatedHTML = translationCacheRef.current.get(sectionId);
            if (doc.body && translatedHTML) {
              doc.body.innerHTML = translatedHTML;
            }
          }
        });

        // Display with saved location or fallback, robustly skipping cover pages
        const cfiKey = chapterId ? `chapter_location_${chapterId}` : '';
        const savedCFI = cfiKey ? localStorage.getItem(cfiKey) : null;
        const savedLocation = typeof savedCFI === 'string' ? savedCFI : undefined;

        const spineItems: any[] = ((book.spine as any).items || []) as any[];
        const isCoverLike = (item: any) => {
          const href = String(item?.href || '').toLowerCase();
          const idref = String(item?.idref || '').toLowerCase();
          const props = String(item?.properties || '').toLowerCase();
          const looksLike = /cover|title|front|copyright|nav|toc/.test(href) ||
            /cover|title|front|copyright|nav|toc/.test(idref) ||
            props.includes('cover') || props.includes('nav');
          const nonLinear = String(item?.linear || '').toLowerCase() === 'no';
          return looksLike || nonLinear;
        };
        const firstReadable = spineItems.find((it) => !isCoverLike(it)) || spineItems[1] || spineItems[0];
        const readingHref = firstReadable?.href;
        
        const tryDisplay = async (target?: any) => {
          try {
            await rendition.display(target);
          } catch (err) {
            console.warn('Display failed, retrying with first readable if possible:', err);
            if (cfiKey) localStorage.removeItem(cfiKey);
            if (readingHref) {
              await rendition.display(readingHref);
            } else {
              await rendition.display();
            }
          }
        };

        const initialTarget = savedLocation || readingHref;
        const displayPromise = tryDisplay(initialTarget).then(() => {
          if (!cancelled && !epubReady) setEpubReady(true);
        });

        // Fallback readiness check if 'rendered' event is slow
        if (readinessTimerRef.current) window.clearTimeout(readinessTimerRef.current);
        readinessTimerRef.current = window.setTimeout(() => {
          if (!cancelled && !epubReady && epubRootRef.current?.querySelector('iframe')) {
            setEpubReady(true);
          }
        }, 1500);

        // Fatal timeout: after 5s, show error if nothing displayed
        if (fatalLoadTimerRef.current) window.clearTimeout(fatalLoadTimerRef.current);
        fatalLoadTimerRef.current = window.setTimeout(() => {
          if (!cancelled && !epubReady && !epubRootRef.current?.querySelector('iframe')) {
            setEpubError('Erreur lors du chargement du chapitre');
          }
        }, 5000);

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
            }
          } catch (e) {
            console.warn('locations.generate failed', e);
          }
        })();

        // Fallback readiness check (in case rendered event doesn't fire)
        readinessTimerRef.current = window.setTimeout(() => {
          if (!cancelled && !epubReady && epubRootRef.current?.querySelector('iframe')) {
            setEpubReady(true);
          }
        }, 800);

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
  }, [chapter?.id]);

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

  const handleLanguageChange = (newLanguage: Language) => {
    setLanguage(newLanguage);
    if (chapterId) {
      localStorage.setItem(`chapter_language_${chapterId}`, newLanguage);
    }
  };

  // Load translations from database
  const loadTranslationsFromDatabase = async (targetLang: Language) => {
    if (!chapterId) return;

    try {
      setIsTranslating(true);

      const { data, error } = await supabase
        .from('chapter_translations')
        .select('translated_content, status')
        .eq('chapter_id', chapterId)
        .eq('language', targetLang)
        .single();

      if (error || !data) {
        toast.error('Traduction non disponible pour cette langue');
        setLanguage('fr');
        return;
      }

      if (data.status === 'processing') {
        toast.info('Traduction en cours de génération... Réessayez dans quelques minutes.');
        setLanguage('fr');
        return;
      }

      if (data.status === 'failed') {
        toast.error('La traduction a échoué. Contactez l\'administrateur.');
        setLanguage('fr');
        return;
      }

      if (data.status === 'completed') {
        const translatedData = data.translated_content as any;
        const sections = translatedData?.sections || [];
        translationCacheRef.current.clear();
        sections.forEach((s: any) => {
          translationCacheRef.current.set(s.id, s.html);
        });

        // Reload current page to apply translations
        if (renditionRef.current) {
          const currentCfi = renditionRef.current.currentLocation()?.start?.cfi;
          if (currentCfi) {
            renditionRef.current.display(currentCfi);
          }
        }

        toast.success('Traduction chargée !');
      }
    } catch (error) {
      console.error('Error loading translation:', error);
      toast.error('Erreur lors du chargement de la traduction');
      setLanguage('fr');
    } finally {
      setIsTranslating(false);
    }
  };

  // Load translations from database when language changes
  useEffect(() => {
    if (!epubReady || !renditionRef.current || !chapterId) return;

    if (language === 'fr') {
      // Clear translations and reload original content
      translationCacheRef.current.clear();
      const currentCfi = renditionRef.current.currentLocation()?.start?.cfi;
      if (currentCfi) {
        renditionRef.current.display(currentCfi);
      }
    } else {
      // Load pre-translated content from database
      loadTranslationsFromDatabase(language);
    }
  }, [language, epubReady, chapterId]);

  // Clear translation cache and reset when chapter changes
  useEffect(() => {
    translationCacheRef.current.clear();
    originalContentRef.current = '';
  }, [chapterId]);

  const handleResetPosition = () => {
    if (chapterId) {
      localStorage.removeItem(`chapter_location_${chapterId}`);
    }
    if (renditionRef.current) {
      renditionRef.current.display?.().catch(() => {});
    }
    toast.success('Position réinitialisée');
  };

  const handleNextPage = async () => {
    if (renditionRef.current) {
      renditionRef.current.next();
    }
  };

  const handlePrevPage = async () => {
    if (renditionRef.current) {
      renditionRef.current.prev();
    }
  };

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

  // Preload next chapter for instant transitions
  const preloadNextChapter = async () => {
    const nextChapter = getNextChapter();
    if (!nextChapter || preloadCacheRef.current.has(nextChapter.id)) return;

    try {
      console.time(`preload-chapter-${nextChapter.id}`);
      const response = await fetch(nextChapter.epub_url);
      if (response.ok) {
        const blob = await response.blob();
        preloadCacheRef.current.set(nextChapter.id, blob);
        console.timeEnd(`preload-chapter-${nextChapter.id}`);
      }
    } catch (error) {
      console.warn('Failed to preload next chapter:', error);
    }
  };

  // Trigger preloading when epub is ready
  useEffect(() => {
    if (epubReady) {
      void preloadNextChapter();
    }
  }, [epubReady]);

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
            {language !== 'fr' && (
              <span className="ml-2 text-xs font-normal text-muted-foreground">
                (traduit)
              </span>
            )}
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

      {/* Translation Progress */}
      <TranslationProgress 
        bookId={bookId} 
        language={language} 
        className="mx-auto max-w-4xl px-4 mt-2"
      />

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
              {(!epubReady || isTranslating) && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/60 z-10 pointer-events-none">
                  <div className="text-center space-y-2">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="text-muted-foreground">
                      {isTranslating ? 'Traduction en cours...' : 'Chargement du chapitre...'}
                    </p>
                  </div>
                </div>
              )}

              {/* Navigation Button - Previous */}
              {epubReady && !isTranslating && (
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
          className="absolute inset-0 overflow-hidden"
          style={{
            background: themeColors[theme].background,
            filter: colorblindMode !== 'none' ? `url(#${colorblindMode}-filter)` : undefined,
          }}
        />

              {/* Navigation Button - Next */}
              {epubReady && !isTranslating && (
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
                <Button disabled className="w-full h-9">
                  <Gift className="mr-2 h-4 w-4" />
                  <span className="text-sm">Orydors déjà réclamés ✓</span>
                </Button>
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
                      void markEpubChapterCompleted(chapter.id, bookId).catch(console.error);
                    } catch (error) {
                      console.error('Error marking chapter completed:', error);
                    }
                  }
                  navigate(`/book/${bookId}/chapter/${nextChapter.id}`);
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
        language={language}
        onFontSizeChange={handleFontSizeChange}
        onThemeChange={handleThemeChange}
        onColorblindModeChange={setColorblindMode}
        onLanguageChange={handleLanguageChange}
      />

      {/* Ad Banner for non-premium users */}
      <ChapterBannerAd />

      {/* Reward Ad for claiming orydors */}
      {showRewardAd && book && (
        <RewardAd
          book={book}
          pointsToWin={book.points || 50}
          onAdCompleted={async () => {
            setShowRewardAd(false);
            await awardPointsAndComplete();
          }}
          onAdClosed={() => {
            setShowRewardAd(false);
            toast.info("Publicité fermée. Recommencez pour réclamer vos Orydors.");
          }}
        />
      )}

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
    </div>
  );
};
