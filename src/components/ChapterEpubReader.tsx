import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ePub from 'epubjs';
import { ChapterEpub } from '@/types/ChapterEpub';
import { chapterEpubService } from '@/services/chapterEpubService';
import { Button } from '@/components/ui/button';
import { ChapterReadingControls } from '@/components/ChapterReadingControls';
import { ChapterBannerAd } from '@/components/ChapterBannerAd';
import { ArrowLeft, ArrowRight, Gift, ChevronLeft, ChevronRight } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

type Theme = 'light' | 'dark' | 'sepia';
type ColorblindMode = 'none' | 'deuteranopia' | 'protanopia' | 'tritanopia';

export const ChapterEpubReader: React.FC = () => {
  const { bookId, chapterId } = useParams<{ bookId: string; chapterId: string }>();
  const navigate = useNavigate();
  const [chapter, setChapter] = useState<ChapterEpub | null>(null);
  const [allChapters, setAllChapters] = useState<ChapterEpub[]>([]);
  const [location, setLocation] = useState<string | number>(0);
  const [fontSize, setFontSize] = useState(16);
  const [theme, setTheme] = useState<Theme>('light');
  const [colorblindMode, setColorblindMode] = useState<ColorblindMode>('none');
  const [loading, setLoading] = useState(true);
  const [epubReady, setEpubReady] = useState(false);
  const [epubError, setEpubError] = useState<string | null>(null);
  const [rendition, setRendition] = useState<any>(null);
  const [book, setBook] = useState<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const epubRootRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [currentLocation, setCurrentLocation] = useState<any>(null);
  const [totalLocations, setTotalLocations] = useState(0);
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

        // Diagnostic HEAD check for EPUB accessibility
        try {
          await fetch(chapterData.epub_url, { method: 'HEAD' });
          console.log('EPUB accessible:', chapterData.epub_url);
        } catch (headError) {
          console.error('EPUB not accessible:', headError);
          setEpubError("Impossible de charger l'EPUB. Vérifiez l'URL et les permissions.");
        }

        // Load saved settings
        const savedFontSize = localStorage.getItem(`chapter_fontSize_${chapterId}`);
        const savedTheme = localStorage.getItem(`chapter_theme_${chapterId}`);
        const savedLocation = localStorage.getItem(`chapter_location_${chapterId}`);

        if (savedFontSize) setFontSize(parseInt(savedFontSize));
        if (savedTheme) setTheme(savedTheme as Theme);
        if (savedLocation) setLocation(savedLocation);
      } catch (error) {
        console.error('Error loading chapter:', error);
        toast.error('Erreur lors du chargement');
      } finally {
        setLoading(false);
      }
    };

    loadChapter();
  }, [bookId, chapterId, navigate]);

  // Initialize EPUB reader
  useEffect(() => {
    if (!chapter || !epubRootRef.current) return;

    const initEpub = async () => {
      try {
        const epubBook = ePub(chapter.epub_url);
        setBook(epubBook);

        // Wait for book to be ready
        await epubBook.ready;
        console.log('📚 EPUB Book ready');

        // Create rendition
        const epubRendition = epubBook.renderTo(epubRootRef.current!, {
          width: '100%',
          height: '100%',
          flow: 'paginated',
          spread: 'none',
        });

        // Register themes
        epubRendition.themes.register('light', {
          body: { 
            background: `${themeColors.light.background} !important`,
            color: `${themeColors.light.color} !important`,
            padding: '20px !important',
          },
          p: { color: `${themeColors.light.color} !important`, 'line-height': '1.6' },
          h1: { color: `${themeColors.light.color} !important` },
          h2: { color: `${themeColors.light.color} !important` },
          h3: { color: `${themeColors.light.color} !important` },
          img: { 'max-width': '100% !important', height: 'auto !important' },
        });
        
        epubRendition.themes.register('dark', {
          body: { 
            background: `${themeColors.dark.background} !important`,
            color: `${themeColors.dark.color} !important`,
            padding: '20px !important',
          },
          p: { color: `${themeColors.dark.color} !important`, 'line-height': '1.6' },
          h1: { color: `${themeColors.dark.color} !important` },
          h2: { color: `${themeColors.dark.color} !important` },
          h3: { color: `${themeColors.dark.color} !important` },
          img: { 'max-width': '100% !important', height: 'auto !important' },
        });
        
        epubRendition.themes.register('sepia', {
          body: { 
            background: `${themeColors.sepia.background} !important`,
            color: `${themeColors.sepia.color} !important`,
            padding: '20px !important',
          },
          p: { color: `${themeColors.sepia.color} !important`, 'line-height': '1.6' },
          h1: { color: `${themeColors.sepia.color} !important` },
          h2: { color: `${themeColors.sepia.color} !important` },
          h3: { color: `${themeColors.sepia.color} !important` },
          img: { 'max-width': '100% !important', height: 'auto !important' },
        });
        
        epubRendition.themes.select(theme);
        epubRendition.themes.fontSize(`${fontSize}px`);

        setRendition(epubRendition);

        // Listen for first render to mark ready
        epubRendition.on('rendered', () => {
          try { setEpubReady(true); } catch {}
        });

        // Display saved location or start with fallback
        const savedLocation = typeof location === 'string' ? location : undefined;
        try {
          await epubRendition.display(savedLocation);
        } catch (err) {
          console.warn('CFI display failed, fallback to start', err);
          await epubRendition.display();
        }
        
        console.log('✅ EPUB displayed successfully');
        toast.success('Chapitre chargé avec succès');

        // Generate locations for progress tracking
        await epubBook.locations.generate(1600);
        const locationsTotal = (epubBook.locations as any).total || 0;
        setTotalLocations(locationsTotal);

        // Track location changes
        epubRendition.on('relocated', (loc: any) => {
          setCurrentLocation(loc);
          const newLocation = loc.start.cfi;
          handleLocationChange(newLocation);
          
          // Calculate progress
          const locTotal = (epubBook.locations as any).total || 0;
          if (locTotal > 0) {
            const percentage = epubBook.locations.percentageFromCfi(newLocation);
            setProgress(Math.round(percentage * 100));
          }
        });

        // Keyboard navigation
        epubRendition.on('keyup', (e: KeyboardEvent) => {
          if (e.key === 'ArrowRight') {
            epubRendition.next();
          } else if (e.key === 'ArrowLeft') {
            epubRendition.prev();
          }
        });

      } catch (error) {
        console.error('❌ EPUB initialization failed:', error);
        setEpubError('Erreur lors du chargement du chapitre');
        toast.error('Impossible de charger le chapitre');
      }
    };

    initEpub();

    // Cleanup
    return () => {
      if (rendition) {
        rendition.destroy();
      }
    };
  }, [chapter?.id]);

  const handleLocationChange = (newLocation: string) => {
    setLocation(newLocation);
    if (chapterId) {
      localStorage.setItem(`chapter_location_${chapterId}`, newLocation);
    }
  };

  const handleFontSizeChange = (size: number) => {
    setFontSize(size);
    if (chapterId) {
      localStorage.setItem(`chapter_fontSize_${chapterId}`, size.toString());
    }
    // Force re-render to apply new font size
    setLocation((prev) => prev);
  };

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme);
    if (chapterId) {
      localStorage.setItem(`chapter_theme_${chapterId}`, newTheme);
    }
  };

  // Apply theme changes dynamically
  useEffect(() => {
    if (rendition) {
      rendition.themes?.select(theme);
    }
  }, [theme, rendition]);

  // Apply font size changes dynamically
  useEffect(() => {
    if (rendition) {
      rendition.themes?.fontSize(`${fontSize}px`);
    }
  }, [fontSize, rendition]);

  const handleNextPage = () => {
    if (rendition) {
      rendition.next();
    }
  };

  const handlePrevPage = () => {
    if (rendition) {
      rendition.prev();
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
    // Logic to claim Tensens reward
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
      <div className="border-b bg-card p-4 sticky top-0 z-40">
        <div className="container mx-auto flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(`/book/${bookId}/chapters`)}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold line-clamp-1 flex-1">{chapter.title}</h1>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(chapter.epub_url, '_blank')}
            aria-label="Ouvrir l’EPUB dans un nouvel onglet"
          >
            Ouvrir l’EPUB
          </Button>
        </div>
      </div>

      {/* EPUB Reader with Navigation */}
      <div className="flex-1 flex flex-col" style={{ height: 'calc(100vh - 200px)' }}>
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
              <div className="px-4 py-2 bg-card border-b">
                <div className="container mx-auto space-y-1">
                  <Progress value={progress} className="h-2" />
                  <p className="text-xs text-muted-foreground text-center">
                    {progress}% du chapitre
                  </p>
                </div>
              </div>
            )}

            {/* Reader Container with Navigation Buttons */}
            <div className="flex-1 relative" ref={containerRef}>
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
                className="w-full h-full"
                style={{ 
                  background: themeColors[theme].background,
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
              <div className="md:hidden border-t bg-card p-2">
                <div className="flex gap-2 justify-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePrevPage}
                    className="flex-1"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Précédent
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
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

      {/* Footer Navigation - Fixed at bottom */}
      {(isLastChapter() || getNextChapter()) && (
        <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-4 z-30">
          <div className="container mx-auto">
            {isLastChapter() ? (
              <Button onClick={handleClaimReward} size="lg" className="w-full">
                <Gift className="mr-2 h-5 w-5" />
                Réclamer vos Tensens
              </Button>
            ) : nextChapter ? (
              <Button
                onClick={() => navigate(`/book/${bookId}/chapter/${nextChapter.id}`)}
                size="lg"
                className="w-full"
              >
                Chapitre suivant
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            ) : null}
          </div>
        </div>
      )}

      {/* Reading Controls */}
      <ChapterReadingControls
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
