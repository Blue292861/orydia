import React, { useState, useCallback, useEffect, useRef } from 'react';
import ePub from 'epubjs';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Trophy, Palette } from 'lucide-react';
import { BuyTensensDialog } from './BuyTensensDialog';
import { useUserStats } from '@/contexts/UserStatsContext';
import { toast } from '@/hooks/use-toast';

interface EpubRenditionReaderProps {
  epubUrl: string;
  fontSize: number;
  highContrast: boolean;
  isPremium: boolean;
  isAlreadyRead: boolean;
  hasFinished: boolean;
  pointsToWin: number;
  onFinishReading: () => void;
}

export const EpubRenditionReader: React.FC<EpubRenditionReaderProps> = ({
  epubUrl,
  fontSize,
  highContrast,
  isPremium,
  isAlreadyRead,
  hasFinished,
  pointsToWin,
  onFinishReading
}) => {
  const [book, setBook] = useState<any>(null);
  const [rendition, setRendition] = useState<any>(null);
  const [isAtEnd, setIsAtEnd] = useState(false);
  const [isAtStart, setIsAtStart] = useState(true);
  const [showTensensDialog, setShowTensensDialog] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(highContrast);
  const [currentSection, setCurrentSection] = useState(0);
  const [totalSections, setTotalSections] = useState(0);
  const [locationsReady, setLocationsReady] = useState(false);
  const [pageCache, setPageCache] = useState<Map<string, any>>(new Map());
  const { userStats } = useUserStats();
  const viewerRef = useRef<HTMLDivElement>(null);
  const touchStart = useRef<number>(0);

  // Initialize EPUB book - OPTIMIZED FOR INSTANT LOADING
  useEffect(() => {
    if (!epubUrl || !viewerRef.current) return;

    let createdRendition: any | null = null;
    let createdBook: any | null = null;
    let canceled = false;

    const initBook = async () => {
      setIsLoading(true);
      try {
        const cacheKey = `epub_${epubUrl}`;
        const cachedData = localStorage.getItem(cacheKey);

        // Try to fetch EPUB as ArrayBuffer to bypass CORS/iframe issues, fallback to URL
        let bookInstance: any;
        try {
          const resp = await fetch(epubUrl, { mode: 'cors', credentials: 'omit', cache: 'no-store' });
          if (resp.ok) {
            const ab = await resp.arrayBuffer();
            if (ab && ab.byteLength > 512) {
              bookInstance = ePub(ab, { openAs: 'binary' });
            }
          }
        } catch (fetchErr) {
          // Fallback to direct URL
        }

        if (!bookInstance) {
          bookInstance = ePub(epubUrl);
        }

        createdBook = bookInstance;
        setBook(bookInstance);

        // Log low-level errors
        try {
          // Error handlers removed for production
        } catch {}

        // Ensure book is ready
        await (bookInstance as any).ready;

        // Get initial book info - conservative approach
        const spineLength = (bookInstance as any).spine?.items?.length || (bookInstance as any).spine?.length || 0;
        setTotalSections(spineLength > 0 ? spineLength : 1);
        setTotalPages(1); // Initial placeholder

        // Try to load cached precise locations immediately
        if (cachedData) {
          try {
            const cached = JSON.parse(cachedData);
            if (cached?.locations) {
              (bookInstance as any).locations.load(cached.locations);
              const len = Number((bookInstance as any).locations.length?.());
              if (Number.isFinite(len) && len > 0) {
                setTotalPages(len);
              }
              setLocationsReady(true);
            }
          } catch (e) {
            // Failed to load cached locations, continue
          }
        }

        // INSTANT DISPLAY - Show first page immediately
        const viewerHeight = Math.max(400, Math.round(window.innerHeight * 0.85));
        const renditionInstance = bookInstance.renderTo(viewerRef.current!, {
          width: '100%',
          height: viewerHeight,
          flow: 'paginated',
          spread: 'auto',
          manager: 'default',
          allowScriptedContent: false
        });

        createdRendition = renditionInstance;
        setRendition(renditionInstance);

        // Log rendition errors
        try {
          // Error handlers removed for production
        } catch {}

        // Apply minimal styles - preserve original EPUB layout and images (do not override fonts)
        renditionInstance.themes.default({
          'img': {
            'max-width': '100% !important',
            'height': 'auto !important',
            'display': 'block !important',
            'margin': '1em auto !important',
            'object-fit': 'contain !important'
          }
        });

        renditionInstance.themes.register('light', {
          'body': { 'background': '#ffffff !important', 'color': '#000000 !important' }
        });
        renditionInstance.themes.register('dark', {
          'body': { 'background': '#000000 !important', 'color': '#ffffff !important' }
        });
        renditionInstance.themes.select(darkMode ? 'dark' : 'light');
        renditionInstance.themes.fontSize(`${fontSize}px`);

        // Setup navigation tracking
        renditionInstance.on('relocated', (location: any) => {
          const displayed = location?.start?.displayed;
          const startCfi = location?.start?.cfi;

          let updated = false;

          // Use precise locations if ready (avoid stale closure by checking length directly)
          const locationsLen = Number((bookInstance as any).locations?.length?.());
          if (Number.isFinite(locationsLen) && locationsLen > 0 && startCfi) {
            const idx = (bookInstance as any).locations.locationFromCfi(startCfi);
            const total = locationsLen;
            if (Number.isFinite(idx) && Number.isFinite(total) && total > 0) {
              setCurrentPage(idx + 1);
              setTotalPages(total);
              updated = true;
            }
          }

          // Fallback to section-based pagination
          if (!updated && displayed) {
            const dPage = Number(displayed.page);
            const dTotal = Number(displayed.total);
            if (Number.isFinite(dPage)) setCurrentPage(dPage);
            if (Number.isFinite(dTotal) && dTotal > 0) setTotalPages(dTotal);
          }

          // Update section tracking
          if ((location as any).start?.index !== undefined) {
            setCurrentSection((location as any).start.index);
          }

          setIsAtStart(Boolean((location as any).atStart));
          setIsAtEnd(Boolean((location as any).atEnd));
        });

        // Ensure loading indicator stops when something is drawn and verify visibility
        const ensureVisible = async () => {
          try {
            const iframe = viewerRef.current?.querySelector('iframe') as HTMLIFrameElement | null;
            const doc = iframe?.contentDocument;
            const hasText = !!doc?.body?.innerText?.trim();
            const hasImages = (doc?.images?.length ?? 0) > 0;
            if (!hasText && !hasImages) {
              // EPUB appears empty, applying fallbacks
              const firstHref = (bookInstance as any).spine?.get?.(0)?.href || (bookInstance as any).spine?.items?.[0]?.href;
              if (firstHref) {
                await renditionInstance.display(firstHref);
              }
              setTimeout(async () => {
                const iframe2 = viewerRef.current?.querySelector('iframe') as HTMLIFrameElement | null;
                const doc2 = iframe2?.contentDocument;
                const stillEmpty = !(doc2 && (doc2.body?.innerText?.trim() || (doc2?.images?.length ?? 0) > 0));
                if (stillEmpty) {
                  try {
                    renditionInstance.flow('scrolled-doc');
                    if (firstHref) await renditionInstance.display(firstHref);
                  } catch (err) {
                    // Fallback failed, continue
                  }
                }
              }, 200);
            }
          } catch (err) {
            // ensureVisible failed, continue
          }
        };

        const attachIframeSwipe = () => {
          try {
            const iframe = viewerRef.current?.querySelector('iframe') as HTMLIFrameElement | null;
            const doc = iframe?.contentDocument;
            if (!doc) return;
            // Nettoyage puis ajout des listeners pour les gestes dans l'iframe
            doc.removeEventListener('touchstart', iframeTouchStart as any);
            doc.removeEventListener('touchend', iframeTouchEnd as any);
            doc.addEventListener('touchstart', iframeTouchStart as any, { passive: true });
            doc.addEventListener('touchend', iframeTouchEnd as any, { passive: true });
          } catch {}
        };

        renditionInstance.on('displayed', () => { if (!canceled) { setIsLoading(false); ensureVisible(); attachIframeSwipe(); } });
        renditionInstance.on('rendered', () => { if (!canceled) { setIsLoading(false); ensureVisible(); attachIframeSwipe(); } });

        // Clean up HTML entities
        renditionInstance.hooks.content.register((contents: any) => {
          const body = contents.document.body;
          if (body) {
            body.innerHTML = body.innerHTML
              .replace(/&nbsp;/g, ' ')
              .replace(/&#160;/g, ' ')
              .replace(/\u00A0/g, ' ');
          }
        });

        // Display first page IMMEDIATELY
        try {
          await renditionInstance.display();
        } catch (e) {
          // rendition.display() failed, trying fallback
          const firstHref = (bookInstance as any).spine?.get?.(0)?.href || (bookInstance as any).spine?.items?.[0]?.href;
          await renditionInstance.display(firstHref);
        }
        if (!canceled) {
          setIsLoading(false);
          // Double-check visibility and apply fallbacks if needed
          ensureVisible();
        }

        // BACKGROUND TASK: Generate precise locations (non-blocking)
        setTimeout(async () => {
          try {
            if (!(bookInstance as any).locations || (bookInstance as any).locations.length() === 0) {
              // Starting background location generation
              await (bookInstance as any).locations.generate(1000);
            }
            if (!canceled) {
              setLocationsReady(true);
              // Locations ready! Precise pagination available
              const newLen = Number((bookInstance as any).locations.length?.());
              if (Number.isFinite(newLen) && newLen > 0) {
                setTotalPages(newLen);
              }
              // Cache the locations for next time
              localStorage.setItem(cacheKey, JSON.stringify({
                locations: (bookInstance as any).locations.save(),
                timestamp: Date.now()
              }));
            }
          } catch (error) {
            // Background location generation failed, fallback to section-based navigation
          }
        }, 100); // Start after UI is ready

      } catch (error) {
        // Error loading EPUB
        toast({
          title: "Erreur de chargement",
          description: "Impossible de charger le livre EPUB",
          variant: "destructive"
        });
        setIsLoading(false);
      }
    };

    initBook();

    return () => {
      canceled = true;
      try { createdRendition?.destroy(); } catch {}
      try { createdBook?.destroy?.(); } catch {}
    };
  }, [epubUrl]);

  // Update theme when darkMode changes
  useEffect(() => {
    if (rendition) {
      rendition.themes.select(darkMode ? 'dark' : 'light');
    }
  }, [darkMode, rendition]);

  useEffect(() => {
    if (rendition) {
      rendition.themes.fontSize(`${fontSize}px`);
    }
  }, [fontSize, rendition]);

  // Synchronise le contraste externe (UI) avec le thème du lecteur
  useEffect(() => {
    setDarkMode(highContrast);
  }, [highContrast]);

  const goToPrevious = () => {
    if (rendition && !isAtStart) {
      rendition.prev();
    }
  };

  const goToNext = () => {
    if (rendition && !isAtEnd) {
      rendition.next();
    }
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  // Touch handlers for swipe navigation
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStart.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart.current) return;
    
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart.current - touchEnd;
    
    if (Math.abs(diff) > 50) { // Minimum swipe distance
      if (diff > 0) {
        // Swipe left - next page
        goToNext();
      } else {
        // Swipe right - previous page
        goToPrevious();
      }
    }
    
    touchStart.current = 0;
  };

  // Gestes à l'intérieur de l'iframe générée par epub.js
  const iframeTouchStart = (e: TouchEvent) => {
    try {
      touchStart.current = e.touches[0]?.clientX || 0;
    } catch {}
  };

  const iframeTouchEnd = (e: TouchEvent) => {
    try {
      if (!touchStart.current) return;
      const touchEnd = e.changedTouches[0]?.clientX || 0;
      const diff = touchStart.current - touchEnd;
      if (Math.abs(diff) > 50) {
        if (diff > 0) {
          goToNext();
        } else {
          goToPrevious();
        }
      }
      touchStart.current = 0;
    } catch {}
  };
  const handleFinishReading = () => {
    if (!isPremium && userStats.totalPoints < pointsToWin) {
      setShowTensensDialog(true);
    } else {
      onFinishReading();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Loading indicator - minimal for instant display */}
      {isLoading && (
        <div className="flex items-center justify-center p-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          <span className="ml-2 text-sm">Initialisation rapide...</span>
        </div>
      )}

      {/* Page info and controls */}
      <div className="flex items-center justify-between p-1 border-b bg-background/95 backdrop-blur">
        <div className="flex items-center space-x-2">
          <span className="text-xs text-muted-foreground">
            {locationsReady && Number.isFinite(totalPages) && totalPages > 0 ? (
              `Page ${currentPage} sur ${totalPages}`
            ) : (
              `Section ${Math.max(1, currentSection + 1)} sur ~${Math.max(1, totalSections)} • Calcul en cours...`
            )}
          </span>
          {!(locationsReady && Number.isFinite(totalPages) && totalPages > 0) && (
            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary opacity-50"></div>
          )}
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={toggleDarkMode}
          className="flex items-center space-x-1"
        >
          <Palette className="w-4 h-4" />
          <span>{darkMode ? 'Clair' : 'Sombre'}</span>
        </Button>
      </div>

      {/* EPUB Viewer */}
      <div 
        ref={viewerRef}
        className={`flex-1 min-h-[60vh] max-w-screen-md mx-auto ${darkMode ? 'bg-black' : 'bg-white'}`}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        style={{ 
          cursor: 'pointer',
          userSelect: 'none'
        }}
      />
      
      {!isLoading && (
        <div className="text-xs text-center text-muted-foreground p-2">
          💡 Glissez vers la gauche/droite ou utilisez les boutons pour naviguer
        </div>
      )}

      {/* Navigation Controls */}
      <div className="flex items-center justify-between p-4 border-t bg-background/95 backdrop-blur">
        <Button
          variant="outline"
          size="sm"
          onClick={goToPrevious}
          disabled={!rendition || isAtStart}
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Page précédente
        </Button>

        <div className="flex items-center space-x-4">
          {isAtEnd && !hasFinished && (
            <Button 
              onClick={handleFinishReading}
              className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white"
            >
              <Trophy className="w-4 h-4 mr-2" />
              Terminer la lecture ({pointsToWin} Tensens)
            </Button>
          )}
          
          {hasFinished && (
            <div className="text-sm text-muted-foreground">
              ✅ Livre terminé
            </div>
          )}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={goToNext}
          disabled={!rendition || isAtEnd}
        >
          Page suivante
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>

      {showTensensDialog && (
        <BuyTensensDialog
          trigger={<div />}
        />
      )}
    </div>
  );
};