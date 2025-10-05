// src/components/EpubReaderSimple.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ReactReader } from 'react-reader';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card } from '@/components/ui/card';
import { Loader2, BookOpen, Settings, Sun, Moon, FileText, ChevronLeft, ChevronRight, List } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

interface EpubReaderSimpleProps {
  url: string;
  bookId?: string;
}

export const EpubReaderSimple: React.FC<EpubReaderSimpleProps> = ({ url, bookId }) => {
  const [location, setLocation] = useState<string | number>(0);
  const [isReady, setIsReady] = useState(false);
  const [rendition, setRendition] = useState<any>(null);
  const [readingProgress, setReadingProgress] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [fontSize, setFontSize] = useState(18);
  const [theme, setTheme] = useState<'light' | 'dark' | 'sepia'>('light');
  const [showControls, setShowControls] = useState(true);
  const [isLoadingContent, setIsLoadingContent] = useState(false);
  const [flowMode, setFlowMode] = useState<'scrolled-continuous' | 'paginated'>('scrolled-continuous');
  const [tocItems, setTocItems] = useState<any[]>([]);
  const [showToc, setShowToc] = useState(false);
  const lastProgressUpdateRef = useRef<number>(0);
  const initialLocationRef = useRef<string | number>(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const progressKey = `epub_progress_${bookId || 'default'}`;

  // CORRECTION: Déplacement de la clause de garde en haut du composant
  if (!url) {
    return <div className="p-4 text-center text-red-500">URL manquante.</div>;
  }
  // Fin de la correction
  
  // Chargement de la progression depuis localStorage

  useEffect(() => {
    if (bookId) {
      const savedProgress = localStorage.getItem(progressKey);
      if (savedProgress) {
        try {
          const progress = JSON.parse(savedProgress);
          initialLocationRef.current = progress.location || 0;
          setLocation(progress.location || 0);
          setReadingProgress(progress.progress || 0);
          setCurrentPage(progress.currentPage || 1);
          setTotalPages(progress.totalPages || 1);
        } catch (error) {
          console.error('Error loading saved progress:', error);
        }
      }
    }
  }, [bookId, progressKey]);

  const saveProgress = useCallback((progressData: any) => {
    if (!bookId) return;
    const progressToSave = {
      location: progressData.location,
      progress: progressData.progress,
      currentPage: progressData.currentPage,
      totalPages: progressData.totalPages,
      lastRead: new Date().toISOString()
    };
    localStorage.setItem(progressKey, JSON.stringify(progressToSave));
  }, [bookId, progressKey]);

  const handleRenditionReady = useCallback((rendition: any) => {
    setRendition(rendition);
    console.log('[EPUB] Rendition ready, spine length:', rendition.book?.spine?.length);

    if (rendition.book?.navigation?.toc) {
      setTocItems(rendition.book.navigation.toc);
      console.log('[EPUB] TOC items:', rendition.book.navigation.toc.length);
    }

    const configureScroller = () => {
      try {
        const scroller = (rendition as any)?.manager?.container as HTMLElement | undefined;
        const container = containerRef.current;
        
        if (scroller && container) {
          const containerHeight = container.clientHeight;
          scroller.style.overflowY = 'auto';
          scroller.style.height = `${containerHeight}px`;
          scroller.style.maxHeight = `${containerHeight}px`;
          
          setTimeout(() => {
            const isScrollable = scroller.scrollHeight > scroller.clientHeight + 10;
            if (!isScrollable && flowMode === 'scrolled-continuous') {
              console.warn('[EPUB] Scroll not working, switching to paginated mode');
              setFlowMode('paginated');
            }
          }, 1500);
        }
      } catch (e) {
        console.warn('Cannot configure internal scroller:', e);
      }
    };

    configureScroller();

    const handleResize = () => configureScroller();
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    // Configuration des styles de base
    if (rendition.themes) {
      rendition.themes.default({
        'html, body': {
          'height': 'auto !important',
          'min-height': 'auto !important',
          'overflow': 'visible !important',
          'margin': '0 !important',
          'padding': '0 !important',
          '-webkit-text-size-adjust': '100% !important'
        },
        body: {
          'font-family': 'Georgia, serif !important',
          'line-height': '1.6 !important',
          'text-align': 'justify',
          'hyphens': 'auto',
          'word-wrap': 'break-word',
          '-webkit-column-width': 'auto !important',
          '-moz-column-width': 'auto !important',
          'column-width': 'auto !important',
          'columns': 'auto !important',
          'overflow-x': 'hidden !important'
        },
        '*': {
          'box-sizing': 'border-box'
        },
        'p': {
          'margin': '0 0 1em 0 !important',
          'text-indent': '1.5em !important'
        },
        'h1, h2, h3, h4, h5, h6': {
          'margin': '1.5em 0 0.5em 0 !important',
          'text-indent': '0 !important'
        },
        'img, svg, video': {
          'max-width': '100% !important',
          'height': 'auto !important',
          'display': 'block !important',
          'margin': '1em auto !important'
        }
      });

      // Appliquer le thème initial
      applyTheme(rendition, theme);
      
      // Configurer la taille de police
      rendition.themes.fontSize(`${fontSize}px`);

      // Gestion des événements de progression (relocated)
      rendition.on('relocated', (location: any) => {
        setIsLoadingContent(false);
        try {
          if (!location || !rendition?.book?.locations) return;
          const book = rendition.book;
          const startCfi = location.start?.cfi || location?.cfi;
          if (!startCfi) return;

          const currentLocation = book.locations.locationFromCfi(startCfi);
          const totalLocations = book.locations.total;

          // Mise à jour de l'état UNIQUEMENT si la position a réellement changé
          if (currentLocation && totalLocations && currentLocation !== lastProgressUpdateRef.current) {
            const progress = Math.round((currentLocation / totalLocations) * 100);

            setLocation(startCfi);
            setReadingProgress(progress);
            setCurrentPage(currentLocation);
            setTotalPages(totalLocations);
            lastProgressUpdateRef.current = currentLocation;

            // Déclenche la sauvegarde de la progression
            saveProgress({
              location: startCfi,
              progress,
              currentPage: currentLocation,
              totalPages: totalLocations
            });
          }
        } catch (error) {
          console.error('Error updating progress on relocation:', error);
        }
      });
      
      // La logique qui ajoutait des écouteurs de scroll et keydown aux iframes internes a été supprimée
      // pour éviter les interférences avec le défilement continu.
      rendition.on('rendered', (section: any) => {
        setIsLoadingContent(false);
        console.log('[EPUB] Section rendered:', section?.index, section?.href);
        try {
          const doc = section?.document;
          if (doc) {
            const html = doc.documentElement as HTMLElement;
            const body = doc.body as HTMLElement;
            if (html) {
              html.style.height = 'auto';
              html.style.overflow = 'visible';
            }
            if (body) {
              body.style.height = 'auto';
              body.style.overflow = 'visible';
              // Neutraliser toute mise en colonnes éventuelle
              // @ts-ignore
              body.style.webkitColumnWidth = 'auto';
              // @ts-ignore
              body.style.columnWidth = 'auto';
            }
          }
        } catch (e) {
          console.warn('Impossible d\'appliquer les correctifs de hauteur sur l\'iframe:', e);
        }
      });
    }

    // Générer les locations pour le calcul de progression
    if (rendition.book) {
      rendition.book.ready
        .then(() => {
          return rendition.book.locations.generate(2048);
        })
        .then(() => {
          setIsReady(true);
          if (initialLocationRef.current) {
            try {
              rendition.display(initialLocationRef.current);
            } catch (e) {
              console.warn('Erreur lors de l\'affichage de la position initiale:', e);
            }
          }
          toast({
            title: "EPUB chargé",
            description: "Le contenu est prêt à être lu avec suivi de progression."
          });
        })
        .catch((error: any) => {
          console.error('Error generating locations:', error);
          setIsReady(true); 
          if (initialLocationRef.current) {
            try {
              rendition.display(initialLocationRef.current);
            } catch (e) {
              console.warn('Erreur lors de l\'affichage de la position initiale (fallback):', e);
            }
          }
          toast({
            title: "EPUB chargé",
            description: "Le contenu est prêt (progression approximative)."
          });
        });
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, [bookId, flowMode, toast]);

  const applyTheme = (rendition: any, selectedTheme: string) => {
    if (!rendition.themes) return;

    const themes = {
      light: {
        body: {
          'background-color': '#ffffff !important',
          'color': '#333333 !important'
        }
      },
      dark: {
        body: {
          'background-color': '#1a1a1a !important',
          'color': '#e0e0e0 !important'
        }
      },
      sepia: {
        body: {
          'background-color': '#f7f3e9 !important',
          'color': '#5c4b37 !important'
        }
      }
    };

    rendition.themes.default(themes[selectedTheme as keyof typeof themes]);
  };

  const changeFontSize = (newSize: number) => {
    setFontSize(newSize);
    if (rendition && rendition.themes) {
      rendition.themes.fontSize(`${newSize}px`);
    }
  };

  const changeTheme = (newTheme: 'light' | 'dark' | 'sepia') => {
    setTheme(newTheme);
    if (rendition) {
      applyTheme(rendition, newTheme);
    }
  };

  // Suppression de l'écouteur d'événements keydown global (l. 209-219 de l'original)


  const navigateToProgress = (progressPercent: number) => {
    if (rendition && rendition.book && rendition.book.locations) {
      const targetLocation = Math.floor((progressPercent / 100) * rendition.book.locations.total);
      const cfi = rendition.book.locations.cfiFromLocation(targetLocation);
      if (cfi) {
        rendition.display(cfi);
      }
    }
  };

  const goToPrevPage = () => {
    if (rendition) {
      rendition.prev();
    }
  };

  const goToNextPage = () => {
    if (rendition) {
      rendition.next();
    }
  };

  const goToTocItem = (href: string) => {
    if (rendition) {
      rendition.display(href);
      setShowToc(false);
    }
  };


  // Styles pour masquer la navigation interne et activer le scroll interne
  const readerStyles: any = {
    container: { width: '100%', height: '100%' },
    readerArea: { left: 0, right: 0, width: '100%', height: '100%' },
    arrow: { display: 'none' },
    prev: { display: 'none' },
    next: { display: 'none' },
  };

  // L'ancienne clause de garde (if (!url) return <...>) a été déplacée plus haut.

  return (
    <div className="relative w-full h-[85vh] flex flex-col">
      {showControls && (
        <Card className="sticky top-0 z-20 mb-2 p-3">
          {/* Contrôles supérieurs */}
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              <span className="text-sm font-medium">
                {readingProgress > 0 && `${readingProgress}% lu`}
              </span>
              <span className="text-xs px-2 py-0.5 rounded bg-primary/10 text-primary">
                {flowMode === 'paginated' ? 'Pages' : 'Scroll'}
              </span>
            </div>
            
            <div className="flex-1 max-w-md min-w-32">
              <Progress value={readingProgress} className="h-2" />
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowControls(false)}
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>

          {/* Contrôles de lecture */}
          <div className="flex items-center justify-between mt-4 gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => changeFontSize(Math.max(12, fontSize - 2))}
              >
                A-
              </Button>
              <span className="text-xs px-2">{fontSize}px</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => changeFontSize(Math.min(28, fontSize + 2))}
              >
                A+
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant={theme === 'light' ? 'default' : 'outline'}
                size="sm"
                onClick={() => changeTheme('light')}
              >
                <Sun className="h-4 w-4" />
              </Button>
              <Button
                variant={theme === 'sepia' ? 'default' : 'outline'}
                size="sm"
                onClick={() => changeTheme('sepia')}
              >
                <FileText className="h-4 w-4" />
              </Button>
              <Button
                variant={theme === 'dark' ? 'default' : 'outline'}
                size="sm"
                onClick={() => changeTheme('dark')}
              >
                <Moon className="h-4 w-4" />
              </Button>
            </div>

            {/* TOC Button */}
            <Dialog open={showToc} onOpenChange={setShowToc}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm"><List className="h-4 w-4" />TOC</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Table des matières</DialogTitle></DialogHeader>
                <ScrollArea className="h-[60vh]">
                  {tocItems.map((item: any, i: number) => (
                    <Button key={i} variant="ghost" className="w-full justify-start" onClick={() => goToTocItem(item.href)}>
                      {item.label}
                    </Button>
                  ))}
                </ScrollArea>
              </DialogContent>
            </Dialog>
          </div>
        </Card>
      )}

      <div ref={containerRef} className="flex-1 epub-reader-container relative overflow-hidden">
        {!isReady && <div className="absolute inset-0 flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>}
        <ReactReader
          url={url}
          location={location}
          locationChanged={() => {}}
          getRendition={handleRenditionReady}
          epubOptions={{ flow: flowMode, manager: flowMode === 'paginated' ? 'default' : 'continuous', spread: "none" }}
          showToc={false}
          readerStyles={readerStyles}
          swipeable={false}
        />
        {flowMode === 'paginated' && isReady && (
          <>
            <Button variant="outline" size="icon" className="absolute left-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full shadow-lg z-10" onClick={goToPrevPage}>
              <ChevronLeft className="h-6 w-6" />
            </Button>
            <Button variant="outline" size="icon" className="absolute right-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full shadow-lg z-10" onClick={goToNextPage}>
              <ChevronRight className="h-6 w-6" />
            </Button>
          </>
        )}
      </div>
    </div>
  );
};
