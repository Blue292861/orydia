import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ePub from 'epubjs';
import { ChapterEpub } from '@/types/ChapterEpub';
import { chapterEpubService } from '@/services/chapterEpubService';
import { Button } from '@/components/ui/button';
import { ChapterReadingControls } from '@/components/ChapterReadingControls';
import { ChapterBannerAd } from '@/components/ChapterBannerAd';
import { ArrowLeft, ArrowRight, Gift, ChevronLeft, ChevronRight, RotateCcw, Type } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';

type Theme = 'light' | 'dark' | 'sepia';
type ColorblindMode = 'none' | 'deuteranopia' | 'protanopia' | 'tritanopia';

export const ChapterEpubReader: React.FC = () => {
  const { bookId, chapterId } = useParams<{ bookId: string; chapterId: string }>();
  const navigate = useNavigate();
  
  // Chapter data
  const [chapter, setChapter] = useState<ChapterEpub | null>(null);
  const [allChapters, setAllChapters] = useState<ChapterEpub[]>([]);
  const [loading, setLoading] = useState(true);
  
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
  
  // EPUB refs (not states!)
  const bookRef = useRef<any>(null);
  const renditionRef = useRef<any>(null);
  const epubRootRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const saveTimerRef = useRef<number | null>(null);
  const readinessTimerRef = useRef<number | null>(null);

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

        // Create book
        const book = ePub(chapter.epub_url);
        bookRef.current = book;
        await book.ready;

        if (cancelled) return;

        // Create rendition
        const rendition = book.renderTo(epubRootRef.current!, {
          width: '100%',
          height: '100%',
          flow: 'paginated',
          spread: 'none',
        });
        renditionRef.current = rendition;

        // Register themes with html + body for proper backgrounds
        const themeConfigs = {
          light: {
            html: { background: '#ffffff !important', color: '#000000 !important' },
            body: { 
              background: '#ffffff !important', 
              color: '#000000 !important',
              padding: '20px !important',
              margin: '0 !important',
            },
            p: { color: '#000000 !important', 'line-height': '1.6' },
            h1: { color: '#000000 !important' },
            h2: { color: '#000000 !important' },
            h3: { color: '#000000 !important' },
            img: { 'max-width': '100% !important', height: 'auto !important' },
          },
          dark: {
            html: { background: '#1a1a1a !important', color: '#ffffff !important' },
            body: { 
              background: '#1a1a1a !important', 
              color: '#ffffff !important',
              padding: '20px !important',
              margin: '0 !important',
            },
            p: { color: '#ffffff !important', 'line-height': '1.6' },
            h1: { color: '#ffffff !important' },
            h2: { color: '#ffffff !important' },
            h3: { color: '#ffffff !important' },
            img: { 'max-width': '100% !important', height: 'auto !important' },
          },
          sepia: {
            html: { background: '#f4ecd8 !important', color: '#5c4a2f !important' },
            body: { 
              background: '#f4ecd8 !important', 
              color: '#5c4a2f !important',
              padding: '20px !important',
              margin: '0 !important',
            },
            p: { color: '#5c4a2f !important', 'line-height': '1.6' },
            h1: { color: '#5c4a2f !important' },
            h2: { color: '#5c4a2f !important' },
            h3: { color: '#5c4a2f !important' },
            img: { 'max-width': '100% !important', height: 'auto !important' },
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
        
        try {
          if (savedLocation) {
            await rendition.display(savedLocation);
            // If saved CFI lands on a cover-like first item, jump to first readable
            const loc = (rendition.currentLocation?.() as any) || null;
            const atFirst = !!(loc && typeof loc.start?.index === 'number' && loc.start.index === 0);
            if (atFirst && spineItems[0] && isCoverLike(spineItems[0]) && readingHref) {
              if (cfiKey) localStorage.removeItem(cfiKey);
              await rendition.display(readingHref);
            }
          } else if (readingHref) {
            await rendition.display(readingHref);
          } else {
            await rendition.display();
          }
          if (!cancelled) setEpubReady(true);
        } catch (err) {
          console.warn('Display failed, fallback while skipping cover if possible:', err);
          if (cfiKey) localStorage.removeItem(cfiKey);
          if (readingHref) {
            await rendition.display(readingHref);
          } else {
            await rendition.display();
          }
          if (!cancelled) setEpubReady(true);
        }

        // Generate locations for progress
        await book.locations.generate(1600);
        const locTotal = (book.locations as any)?.total || 0;
        if (!cancelled) {
          setTotalLocations(locTotal);
        }

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
      
      if (saveTimerRef.current) {
        window.clearTimeout(saveTimerRef.current);
        saveTimerRef.current = null;
      }
      
      if (readinessTimerRef.current) {
        window.clearTimeout(readinessTimerRef.current);
        readinessTimerRef.current = null;
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
    if (renditionRef.current && epubReady) {
      renditionRef.current.themes?.fontSize(`${fontSize}px`);
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

  const handleNextPage = () => {
    if (renditionRef.current) {
      renditionRef.current.next();
    }
  };

  const handlePrevPage = () => {
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

  const handleClaimReward = async () => {
    toast.success('Récompense réclamée !');
    navigate(`/book/${bookId}/chapters`);
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
          <h1 className="text-base md:text-lg font-semibold line-clamp-1 flex-1">{chapter.title}</h1>
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
      <div className="flex-1 flex flex-col min-h-0" style={{ 
        height: 'calc(100dvh - 180px)',
        maxHeight: 'calc(100dvh - 180px)'
      }}>
        {epubError ? (
          <div className="flex flex-col items-center justify-center h-full gap-4">
            <p className="text-destructive">{epubError}</p>
            <div className="flex gap-2">
              <Button onClick={() => window.location.reload()}>Recharger</Button>
              <Button
                variant="outline"
                onClick={() => window.open(chapter?.epub_url, '_blank')}
              >
                Ouvrir dans un nouvel onglet
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/* Progress Bar */}
            {epubReady && totalLocations > 0 && (
              <div className="px-4 py-1.5 bg-card border-b">
                <div className="container mx-auto space-y-1">
                  <Progress value={progress} className="h-2" />
                  <p className="text-xs text-muted-foreground text-center">
                    {progress}% du chapitre
                  </p>
                </div>
              </div>
            )}

            {/* Reader Container with Navigation Buttons */}
            <div className="flex-1 relative overflow-hidden" ref={containerRef}>
              {!epubReady && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
                  <div className="text-center space-y-2">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="text-muted-foreground">Chargement du chapitre...</p>
                  </div>
                </div>
              )}

              {/* Navigation Button - Previous */}
              {epubReady && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-20 h-12 w-12 rounded-full bg-background/80 hover:bg-background shadow-lg transition-all hover:scale-110"
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
              {epubReady && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-20 h-12 w-12 rounded-full bg-background/80 hover:bg-background shadow-lg transition-all hover:scale-110"
                  onClick={handleNextPage}
                  aria-label="Page suivante"
                >
                  <ChevronRight className="h-6 w-6" />
                </Button>
              )}
            </div>

            {/* Mobile Navigation Bar */}
            {epubReady && (
              <div className="md:hidden border-t bg-card p-3 safe-area-bottom">
                <div className="flex gap-2 justify-center">
                  <Button
                    variant="outline"
                    size="default"
                    onClick={handlePrevPage}
                    className="flex-1"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Précédent
                  </Button>
                  <Button
                    variant="outline"
                    size="default"
                    onClick={handleNextPage}
                    className="flex-1"
                  >
                    Suivant
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer - Fixed at bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-2 md:p-3 z-30 safe-area-bottom">
        <div className="container mx-auto flex gap-2 items-center">
          {/* Settings button on the left */}
          <Button
            variant="outline"
            size="icon"
            onClick={() => setControlsOpen(true)}
            className="h-10 w-10 shrink-0"
          >
            <Type className="h-5 w-5" />
          </Button>
          
          {/* Main action button (full width) */}
          <div className="flex-1">
            {isLastChapter() ? (
              <Button onClick={handleClaimReward} className="w-full h-10">
                <Gift className="mr-2 h-4 w-4" />
                <span className="text-sm">Réclamer vos Tensens</span>
              </Button>
            ) : nextChapter ? (
              <Button
                onClick={() => navigate(`/book/${bookId}/chapter/${nextChapter.id}`)}
                className="w-full h-10"
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

      {/* Ad Banner for non-premium users */}
      <ChapterBannerAd />

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
    </div>
  );
};
