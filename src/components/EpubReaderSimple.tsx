// src/components/EpubReaderSimple.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ReactReader } from 'react-reader';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card } from '@/components/ui/card';
import { Loader2, BookOpen, Settings, Sun, Moon, FileText } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

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
  const lastProgressUpdateRef = useRef<number>(0);
  const initialLocationRef = useRef<string | number>(0);
  const { toast } = useToast();
  const { user } = useAuth();
  const progressKey = `epub_progress_${bookId || 'default'}`;

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

  // Sauvegarde de la progression avec debounce
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


  const handleRenditionReady = (rendition: any) => {
    setRendition(rendition);
    
    // Configuration des styles de base
    if (rendition.themes) {
      rendition.themes.default({
        body: {
          'font-family': 'Georgia, serif !important',
          'line-height': '1.6 !important',
          'text-align': 'justify',
          'hyphens': 'auto',
          'word-wrap': 'break-word'
        },
        'p': {
          'margin': '0 0 1em 0 !important',
          'text-indent': '1.5em !important'
        },
        'h1, h2, h3, h4, h5, h6': {
          'margin': '1.5em 0 0.5em 0 !important',
          'text-indent': '0 !important'
        },
        'img': {
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
      rendition.on('rendered', () => {
        setIsLoadingContent(false);
      });
    }
    
    // Générer les locations pour le calcul de progression
    if (rendition.book) {
      rendition.book.ready
        .then(() => {
          return rendition.book.locations.generate(2048); // Plus de précision
        })
        .then(() => {
          setIsReady(true);
          // Aller à la position sauvegardée si disponible
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
  };

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


  // Styles pour masquer totalement la navigation interne et garantir la pleine largeur
  const readerStyles: any = {
    container: { width: '100%', height: '100%' },
    containerExpanded: { width: '100%', height: '100%' },
    readerArea: { left: 0, right: 0, width: '100%', height: '100%' },
    titleArea: { display: 'none' },
    title: { display: 'none' },
    tocArea: { display: 'none' },
    tocButton: { display: 'none' },
    arrow: { display: 'none' },
    prev: { display: 'none', pointerEvents: 'none', width: 0 },
    next: { display: 'none', pointerEvents: 'none', width: 0 },
  };

  // Styles internes d'EpubView pour le scroll continu
  const epubViewStyles: any = {
    viewHolder: {
      width: '100%',
      height: '100%',
      overflow: 'auto' // C'est ici que le défilement est activé
    },
    view: { 
      width: '100%',
      height: 'auto'
    },
    iframe: { 
      width: '100%', 
      border: 'none'
    }
  };
  if (!url) {
    return <div className="p-4 text-center text-red-500">URL du fichier EPUB manquante.</div>;
  }

  return (
    <div className="relative w-full min-h-[80vh] react-reader-wrapper">
      {/* Contrôles supérieurs */}
      {showControls && (
        <Card className="sticky top-0 z-20 mb-4 p-4 bg-background/95 backdrop-blur border">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              <span className="text-sm font-medium">
                {readingProgress > 0 && `${readingProgress}% lu`}
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

          </div>
        </Card>
      )}

      {/* Bouton pour réafficher les contrôles */}
      {!showControls && (
        <Button
          className="sticky top-4 right-4 z-20 mb-4 ml-auto block"
          variant="outline"
          size="sm"
          onClick={() => setShowControls(true)}
        >
          <Settings className="h-4 w-4" />
        </Button>
      )}

      {/* Indicateur de chargement */}
      {!isReady && (
        <div className="flex items-center justify-center bg-background/80 rounded-lg p-8 mb-4">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Chargement de l'EPUB...</p>
          </div>
        </div>
      )}

      {/* Zone de lecture EPUB */}
      <div className="relative w-full epub-reader-container" style={{ height: "80vh", minHeight: "600px" }}>
        {/* Indicateur de chargement de contenu pendant le scroll */}
        {isLoadingContent && (
          <div className="absolute top-4 right-4 z-30 bg-background/90 backdrop-blur-sm rounded-lg p-2 border shadow-sm">
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              <span className="text-xs text-muted-foreground">Chargement...</span>
            </div>
          </div>
        )}
        
        <ReactReader
          url={url}
          location={location}
          locationChanged={(cfi: string) => setLocation(cfi)}
          getRendition={handleRenditionReady}
          epubOptions={{
            flow: "scrolled-continuous",
            manager: "continuous",
            allowScriptedContent: true,
            spread: "none"
          }}
          showToc={false}
          readerStyles={readerStyles}
          swipeable={false}
          epubViewStyles={epubViewStyles}
        />
      </div>
    </div>
  );
};
