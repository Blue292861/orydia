import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChevronLeft, ChevronRight, Trophy } from 'lucide-react';
import { BuyTensensDialog } from './BuyTensensDialog';
import { useUserStats } from '@/contexts/UserStatsContext';
import { toast } from '@/hooks/use-toast';
import { ReactReader } from 'react-reader';
import { EPUBFallbackService } from '@/services/epubFallbackService';
import DOMPurify from 'dompurify';
interface EpubReaderEngineProps {
  epubUrl: string;
  fontSize: number;
  highContrast: boolean;
  isPremium: boolean;
  isAlreadyRead: boolean;
  hasFinished: boolean;
  pointsToWin: number;
  onFinishReading: () => void;
  onFontSizeChange: (size: number) => void;
  onHighContrastChange: (enabled: boolean) => void;
}

export const EpubReaderEngine: React.FC<EpubReaderEngineProps> = ({
  epubUrl,
  fontSize,
  highContrast,
  isPremium,
  isAlreadyRead,
  hasFinished,
  pointsToWin,
  onFinishReading,
  onFontSizeChange,
  onHighContrastChange
}) => {
  const [location, setLocation] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showTensensDialog, setShowTensensDialog] = useState(false);
  const [darkMode, setDarkMode] = useState(highContrast);
  const [bookLoaded, setBookLoaded] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [renditionRef, setRenditionRef] = useState<any>(null);
  const [loadingError, setLoadingError] = useState<string | null>(null);

  // Fallback (fast) reader states
  const [useFallback, setUseFallback] = useState(false);
  const [fallbackPages, setFallbackPages] = useState<string[]>([]);
  const [fallbackIndex, setFallbackIndex] = useState(0);
  const [fallbackProgress, setFallbackProgress] = useState(0);
  const [fallbackStatus, setFallbackStatus] = useState('Initialisation...');
  const [isLastPage, setIsLastPage] = useState(false);

  const touchStartX = useRef<number>(0);
  const loadingTimeoutRef = useRef<NodeJS.Timeout>();
  
  const { userStats } = useUserStats();

  // Storage key for saving reading position
  const getStorageKey = () => `epub-location-${epubUrl.split('/').pop()}`;

  // Fallback helpers
  const getFallbackKey = () => `epub-fallback-page-${epubUrl.split('/').pop()}`;

  const startFallback = useCallback(async () => {
    try {
      setUseFallback(true);
      setLoadingError(null);
      setIsLoading(true);

      const savedIndexRaw = localStorage.getItem(getFallbackKey());
      const savedIndex = savedIndexRaw ? parseInt(savedIndexRaw, 10) : 0;

      const result = await EPUBFallbackService.extractFromUrl(
        epubUrl,
        (progress, status) => {
          setFallbackProgress(progress);
          setFallbackStatus(status);
        }
      );

      if (result.success && Array.isArray(result.pages) && result.pages.length > 0) {
        setFallbackPages(result.pages);
        const idx = Math.min(result.pages.length - 1, Math.max(0, savedIndex));
        setFallbackIndex(idx);
        setIsLoading(false);
      } else {
        setLoadingError(result.error || "Échec du chargement en mode rapide.");
        setIsLoading(false);
      }
    } catch (e) {
      setLoadingError("Erreur de chargement en mode rapide.");
      setIsLoading(false);
    }
  }, [epubUrl]);

  // Load saved position and set timeouts (auto-fallback)
  useEffect(() => {
    const savedLocation = localStorage.getItem(getStorageKey());
    if (savedLocation && !location) {
      setLocation(savedLocation);
    }

    // Auto-switch to fast mode if initial load is slow
    const autoFallbackTimeout = setTimeout(() => {
      if (isLoading && !useFallback) {
        startFallback();
      }
    }, 6000);

    // Final timeout to stop spinner if nothing worked
    loadingTimeoutRef.current = setTimeout(() => {
      if (isLoading && !useFallback) {
        setLoadingError("Le chargement prend trop de temps. Veuillez réessayer.");
        setIsLoading(false);
      }
    }, 15000); // 15 seconds timeout

    return () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }
      clearTimeout(autoFallbackTimeout);
    };
  }, [epubUrl, isLoading, bookLoaded, useFallback, startFallback]);

  // Save reading position
  const savePosition = useCallback((cfi: string) => {
    if (cfi && bookLoaded) {
      localStorage.setItem(getStorageKey(), cfi);
      setLocation(cfi);
    }
  }, [bookLoaded, getStorageKey]);

  // Persist fallback position and check if last page
  useEffect(() => {
    if (useFallback) {
      localStorage.setItem(getFallbackKey(), String(fallbackIndex));
      // Check if we're on the last page in fallback mode
      setIsLastPage(fallbackPages.length > 0 && fallbackIndex >= fallbackPages.length - 1);
    }
  }, [useFallback, fallbackIndex, fallbackPages.length]);

  // Update theme when highContrast changes
  useEffect(() => {
    setDarkMode(highContrast);
  }, [highContrast]);

  // Apply font size and theme to rendition
  useEffect(() => {
    if (renditionRef && bookLoaded) {
      try {
        // Register themes and apply based on dark mode
        renditionRef.themes.register('light', {
          body: {
            background: '#ffffff !important',
            color: '#000000 !important',
          },
          img: {
            maxWidth: '100% !important',
            height: 'auto !important',
            display: 'block',
            margin: '1em auto'
          },
          p: { color: '#000000 !important' },
          'h1, h2, h3, h4, h5, h6': { color: '#000000 !important' },
          a: { color: '#2563eb !important' },
        });
        renditionRef.themes.register('dark', {
          body: {
            background: '#1a1a1a !important',
            color: '#ffffff !important',
          },
          img: {
            maxWidth: '100% !important',
            height: 'auto !important',
            display: 'block',
            margin: '1em auto'
          },
          p: { color: '#ffffff !important' },
          'h1, h2, h3, h4, h5, h6': { color: '#ffffff !important' },
          a: { color: '#60a5fa !important' },
        });

        renditionRef.themes.select(darkMode ? 'dark' : 'light');
        renditionRef.themes.fontSize(`${fontSize}px`);
        } catch (error) {
          // Erreur d'application du thème ignorée silencieusement
      }
    }
  }, [renditionRef, fontSize, darkMode, bookLoaded]);

  const handleLocationChanged = useCallback((epubcifi: string) => {
    savePosition(epubcifi);
    
    // Update page counter if we have locations
    try {
      const bookLocations = renditionRef?.book?.locations;
      if (bookLocations) {
        const percent = bookLocations.percentageFromCfi(epubcifi) || 0; // 0..1
        const total = bookLocations.length?.() || totalPages || 0;
        const page = total > 0 ? Math.max(1, Math.round(percent * total)) : currentPage;
        setCurrentPage(page);
        if (total > 0) setTotalPages(total);
        // Consider last page when at >=99% or page >= total
        setIsLastPage(percent >= 0.99 || (total > 0 && page >= total));
      }
    } catch (error) {
      // Fallback page calculation
      console.warn('Page calculation error:', error);
    }
  }, [renditionRef, savePosition, totalPages, currentPage]);

  const handleBookReady = useCallback((rendition: any) => {
    setRenditionRef(rendition);
    setIsLoading(false);
    setBookLoaded(true);
    setLoadingError(null);
    
    // Clear loading timeout
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
    }
    
    // Generate locations for pagination (optional, async)
    if (rendition.book) {
      // Don't block the UI for location generation
      setTimeout(() => {
        rendition.book.locations.generate(1024).then(() => {
          const total = rendition.book.locations.length();
          setTotalPages(total);
          console.log('EPUB locations generated:', total);
        }).catch((error: any) => {
          console.warn('Could not generate locations:', error);
          // Don't show error to user, locations are optional
          setTotalPages(0);
        });
      }, 100); // Small delay to let UI render first
    }

    // Add touch event listeners for swipe navigation
    const addSwipeListeners = () => {
      const viewer = document.querySelector('[class*="epub-view"]') as HTMLElement | null;
      if (viewer) {
        viewer.addEventListener('touchstart', handleTouchStart as any, { passive: true });
        viewer.addEventListener('touchend', handleTouchEnd as any, { passive: true });
      }

      // Stabilize layout to avoid ResizeObserver loops
      try {
        const container = document.querySelector('.epub-reader-container') as HTMLElement | null;
        if (container) {
          container.style.contain = 'layout paint size';
        }
        if (viewer) {
          viewer.style.height = '100%';
          viewer.style.overflow = 'auto';
        }
      } catch {}
    };

    // Reduced delay for faster initialization
    setTimeout(addSwipeListeners, 100);
  }, []);

  const handleTouchStart = (e: TouchEvent) => {
    touchStartX.current = e.touches[0]?.clientX || 0;
  };

  const handleTouchEnd = (e: TouchEvent) => {
    if (!touchStartX.current || !renditionRef) return;
    
    const touchEndX = e.changedTouches[0]?.clientX || 0;
    const diff = touchStartX.current - touchEndX;
    
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        // Swipe left - next page
        renditionRef.next();
      } else {
        // Swipe right - previous page
        renditionRef.prev();
      }
    }
    touchStartX.current = 0;
  };

  const goToPrevious = () => {
    if (useFallback) {
      setFallbackIndex((i) => Math.max(0, i - 1));
    } else if (renditionRef) {
      renditionRef.prev();
    }
  };

  const goToNext = () => {
    if (useFallback) {
      setFallbackIndex((i) => Math.min(fallbackPages.length - 1, i + 1));
    } else if (renditionRef) {
      renditionRef.next();
    }
  };


  const handleFinishReading = () => {
    if (!isPremium && userStats.totalPoints < pointsToWin) {
      setShowTensensDialog(true);
    } else {
      onFinishReading();
    }
  };

  if ((isLoading && !useFallback) || loadingError) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          {loadingError ? (
            <>
              <div className="text-red-500 mb-4">⚠️</div>
              <p className="text-muted-foreground mb-4">{loadingError}</p>
              <Button onClick={() => window.location.reload()} variant="outline">
                Réessayer
              </Button>
            </>
          ) : (
            <>
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
              <p className="text-muted-foreground">Chargement de l'EPUB...</p>
              <p className="text-xs text-muted-foreground mt-1">Cela peut prendre quelques secondes</p>
              <div className="mt-3">
                <Button onClick={startFallback} variant="outline" size="sm">Mode rapide</Button>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="epub-reader-container flex flex-col">
      {/* Header Controls */}
      <div className="space-y-4 p-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={goToPrevious}
              disabled={!bookLoaded && !useFallback}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={goToNext}
              disabled={!bookLoaded && !useFallback}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center gap-2">
            {useFallback ? (
              fallbackPages.length > 0 && (
                <span className="text-sm text-muted-foreground">
                  Page {fallbackIndex + 1} / {fallbackPages.length}
                </span>
              )
            ) : (
              totalPages > 0 && (
                <span className="text-sm text-muted-foreground">
                  Page {currentPage} / {totalPages}
                </span>
              )
            )}
          </div>
        </div>

      </div>

      {/* Progress Bar */}
      {useFallback ? (
        fallbackPages.length > 0 && (
          <div className="px-4 py-2">
            <Progress value={((fallbackIndex + 1) / fallbackPages.length) * 100} className="h-2" />
          </div>
        )
      ) : (
        totalPages > 0 && (
          <div className="px-4 py-2">
            <Progress value={(currentPage / totalPages) * 100} className="h-2" />
          </div>
        )
      )}

      {/* EPUB Reader */}
      <div className="relative max-h-[85vh] overflow-auto">
        {useFallback ? (
          <ScrollArea className="h-full w-full">
            <div className="p-4 min-h-full">
              {fallbackPages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-center">
                  <div>
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                    <p className="text-muted-foreground">Mode rapide: {fallbackStatus} ({Math.round(fallbackProgress)}%)</p>
                  </div>
                </div>
              ) : (
                <article 
                  className={`prose prose-sm sm:prose max-w-none ${
                    highContrast ? 'prose-invert' : ''
                  }`}
                  style={{ 
                    fontSize: `${fontSize}px`,
                    lineHeight: 1.6,
                    wordWrap: 'break-word',
                    overflowWrap: 'break-word',
                    hyphens: 'auto',
                    ...(highContrast && {
                      backgroundColor: '#1a1a1a',
                      color: '#ffffff',
                      padding: '1rem',
                      borderRadius: '0.5rem'
                    })
                  }}
                >
                  <div
                    className="whitespace-pre-wrap break-words"
                    style={{ maxWidth: '100%', overflow: 'hidden' }}
                    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(fallbackPages[fallbackIndex] || '') }}
                  />
                </article>
              )}
            </div>
          </ScrollArea>
        ) : (
          <ScrollArea className="h-full w-full">
            <div className="h-full overflow-hidden">
              <ReactReader
                url={epubUrl}
                location={location}
                locationChanged={handleLocationChanged}
                getRendition={handleBookReady}
                loadingView={
                  <div className="flex items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                }
              />
            </div>
          </ScrollArea>
        )}
      </div>

      {/* Footer Controls */}
      <div className="p-4 border-t space-y-3">
        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            onClick={goToPrevious}
            disabled={!bookLoaded && !useFallback}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Précédent
          </Button>
          
          <Button
            variant="outline"
            onClick={goToNext}
            disabled={!bookLoaded && !useFallback}
          >
            Suivant
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>

        {/* Finish Reading Button - visible but activable seulement à la dernière page */}
        {!hasFinished && (
          <Button
            onClick={handleFinishReading}
            className="w-full"
            variant="default"
            disabled={!isLastPage}
          >
            <Trophy className="h-4 w-4 mr-2" />
            Terminer la lecture (+{pointsToWin} Tensens)
          </Button>
        )}

        {hasFinished && (
          <div className="text-center py-2 text-muted-foreground">
            <Trophy className="h-5 w-5 mx-auto mb-1 text-yellow-500" />
            Livre terminé !
          </div>
        )}

        {/* Ad Banner - Only for non-premium users */}
        {!isPremium && (
          <div className="w-full bg-gradient-to-r from-primary/10 to-secondary/10 p-4 rounded-lg border border-border/50">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">Publicité</p>
              <div className="bg-background/80 backdrop-blur-sm p-6 rounded-md border">
                {/* Google AdSense placeholder */}
                <div id="adsense-banner" className="min-h-[100px] flex items-center justify-center">
                  <p className="text-lg font-semibold mb-2">Espace publicitaire</p>
                  <p className="text-sm text-muted-foreground">Google AdSense sera intégré ici</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Tensens Dialog */}
      <BuyTensensDialog open={showTensensDialog} onOpenChange={setShowTensensDialog} showTrigger={false} />
    </div>
  );
};