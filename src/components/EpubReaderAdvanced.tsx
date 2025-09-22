// src/components/EpubReaderAdvanced.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ReactReader } from 'react-reader';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card } from '@/components/ui/card';
import { Loader2, BookOpen, ChevronLeft, ChevronRight, Settings } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface EpubReaderAdvancedProps {
  url: string;
  bookId?: string;
}

interface ReadingProgress {
  location: string;
  progress: number;
  totalLocations: number;
  currentPage: number;
  totalPages: number;
}

export const EpubReaderAdvanced: React.FC<EpubReaderAdvancedProps> = ({ url, bookId }) => {
  const [location, setLocation] = useState<string | number>(0);
  const [isReady, setIsReady] = useState(false);
  const [rendition, setRendition] = useState<any>(null);
  const [readingProgress, setReadingProgress] = useState<ReadingProgress>({
    location: '',
    progress: 0,
    totalLocations: 0,
    currentPage: 1,
    totalPages: 1
  });
  const [fontSize, setFontSize] = useState(16);
  const [theme, setTheme] = useState<'light' | 'dark' | 'sepia'>('light');
  const [showControls, setShowControls] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();
  const progressSaveTimeout = useRef<NodeJS.Timeout>();

  // Chargement de la progression sauvegardée
  useEffect(() => {
    const loadProgress = async () => {
      if (!user || !bookId) return;
      
      try {
        const { data, error } = await supabase
          .from('epub_reading_progress')
          .select('*')
          .eq('user_id', user.id)
          .eq('book_id', bookId)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error loading reading progress:', error);
          return;
        }

        if (data) {
          setLocation(data.location || 0);
          setReadingProgress(prev => ({
            ...prev,
            progress: data.progress || 0
          }));
        }
      } catch (error) {
        console.error('Error loading reading progress:', error);
      }
    };

    loadProgress();
  }, [user, bookId]);

  // Sauvegarde de la progression avec debounce
  const saveProgress = useCallback(async (progressData: ReadingProgress) => {
    if (!user || !bookId) return;

    // Clear existing timeout
    if (progressSaveTimeout.current) {
      clearTimeout(progressSaveTimeout.current);
    }

    // Set new timeout
    progressSaveTimeout.current = setTimeout(async () => {
      try {
        const { error } = await supabase
          .from('epub_reading_progress')
          .upsert({
            user_id: user.id,
            book_id: bookId,
            location: progressData.location,
            progress: progressData.progress,
            current_page: progressData.currentPage,
            total_pages: progressData.totalPages,
            updated_at: new Date().toISOString()
          });

        if (error) {
          console.error('Error saving reading progress:', error);
        }
      } catch (error) {
        console.error('Error saving reading progress:', error);
      }
    }, 2000); // Sauvegarde après 2 secondes d'inactivité
  }, [user, bookId]);

  const handleLocationChanged = (cfi: string) => {
    setLocation(cfi);
    
    if (rendition && rendition.book) {
      const book = rendition.book;
      const currentLocation = book.locations.locationFromCfi(cfi);
      const totalLocations = book.locations.total;
      const progress = Math.round((currentLocation / totalLocations) * 100);
      
      const newProgress: ReadingProgress = {
        location: cfi,
        progress,
        totalLocations,
        currentPage: currentLocation,
        totalPages: totalLocations
      };
      
      setReadingProgress(newProgress);
      saveProgress(newProgress);
    }
  };

  const handleRenditionReady = (rendition: any) => {
    setRendition(rendition);
    setIsReady(true);
    
    // Configurer le thème
    rendition.themes.default({
      body: {
        'font-family': 'Georgia, serif !important',
        'line-height': '1.6 !important',
      }
    });

    // Appliquer les styles selon le thème
    applyTheme(rendition, theme);
    
    // Configurer la taille de police
    rendition.themes.fontSize(`${fontSize}px`);
    
    // Générer les locations pour le calcul de progression
    rendition.book.ready.then(() => {
      return rendition.book.locations.generate(1024);
    }).then(() => {
      // Les locations sont prêtes
      toast({
        title: "EPUB chargé",
        description: "Le contenu est prêt à être lu avec suivi de progression."
      });
    });
  };

  const applyTheme = (rendition: any, selectedTheme: string) => {
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
    if (rendition) {
      rendition.themes.fontSize(`${newSize}px`);
    }
  };

  const changeTheme = (newTheme: 'light' | 'dark' | 'sepia') => {
    setTheme(newTheme);
    if (rendition) {
      applyTheme(rendition, newTheme);
    }
  };

  const navigateToProgress = (progressPercent: number) => {
    if (rendition && rendition.book && rendition.book.locations) {
      const targetLocation = Math.floor((progressPercent / 100) * rendition.book.locations.total);
      const cfi = rendition.book.locations.cfiFromLocation(targetLocation);
      if (cfi) {
        rendition.display(cfi);
      }
    }
  };

  const nextPage = () => {
    if (rendition) {
      rendition.next();
    }
  };

  const prevPage = () => {
    if (rendition) {
      rendition.prev();
    }
  };

  if (!url) {
    return <div className="p-4 text-center text-red-500">URL du fichier EPUB manquante.</div>;
  }

  return (
    <div className="relative w-full h-full min-h-[80vh]">
      {/* Contrôles supérieurs */}
      {showControls && (
        <Card className="absolute top-4 left-4 right-4 z-20 p-4 bg-background/95 backdrop-blur">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              <span className="text-sm font-medium">
                Page {readingProgress.currentPage} sur {readingProgress.totalPages}
              </span>
            </div>
            
            <div className="flex-1 max-w-md">
              <Progress value={readingProgress.progress} className="h-2" />
              <div className="text-xs text-center mt-1">
                {readingProgress.progress}% lu
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowControls(false)}
              >
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Contrôles de lecture */}
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => changeFontSize(Math.max(12, fontSize - 2))}
              >
                A-
              </Button>
              <span className="text-xs">{fontSize}px</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => changeFontSize(Math.min(24, fontSize + 2))}
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
                ☀️
              </Button>
              <Button
                variant={theme === 'sepia' ? 'default' : 'outline'}
                size="sm"
                onClick={() => changeTheme('sepia')}
              >
                📜
              </Button>
              <Button
                variant={theme === 'dark' ? 'default' : 'outline'}
                size="sm"
                onClick={() => changeTheme('dark')}
              >
                🌙
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={prevPage}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={nextPage}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Bouton pour réafficher les contrôles */}
      {!showControls && (
        <Button
          className="absolute top-4 right-4 z-20"
          variant="outline"
          size="sm"
          onClick={() => setShowControls(true)}
        >
          <Settings className="h-4 w-4" />
        </Button>
      )}

      {/* Indicateur de chargement */}
      {!isReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Chargement de l'EPUB...</p>
          </div>
        </div>
      )}

      {/* Lecteur EPUB */}
      <div className={`w-full h-full ${showControls ? 'pt-32' : 'pt-16'}`}>
        <ReactReader
          url={url}
          location={location}
          locationChanged={handleLocationChanged}
          getRendition={handleRenditionReady}
          readerStyles={{
            ...ReactReader.defaultProps.readerStyles,
            arrow: {
              ...ReactReader.defaultProps.readerStyles.arrow,
              color: 'hsl(var(--primary))'
            }
          }}
        />
      </div>
    </div>
  );
};