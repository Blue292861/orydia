import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, ChevronRight, Palette, Trophy } from 'lucide-react';
import { BuyTensensDialog } from './BuyTensensDialog';
import { useUserStats } from '@/contexts/UserStatsContext';
import { toast } from '@/hooks/use-toast';
import { ReactReader } from 'react-reader';

interface EpubReaderEngineProps {
  epubUrl: string;
  fontSize: number;
  highContrast: boolean;
  isPremium: boolean;
  isAlreadyRead: boolean;
  hasFinished: boolean;
  pointsToWin: number;
  onFinishReading: () => void;
}

export const EpubReaderEngine: React.FC<EpubReaderEngineProps> = ({
  epubUrl,
  fontSize,
  highContrast,
  isPremium,
  isAlreadyRead,
  hasFinished,
  pointsToWin,
  onFinishReading
}) => {
  const [location, setLocation] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showTensensDialog, setShowTensensDialog] = useState(false);
  const [darkMode, setDarkMode] = useState(highContrast);
  const [bookLoaded, setBookLoaded] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [renditionRef, setRenditionRef] = useState<any>(null);
  const touchStartX = useRef<number>(0);
  const { userStats } = useUserStats();

  // Storage key for saving reading position
  const getStorageKey = () => `epub-location-${epubUrl.split('/').pop()}`;

  // Load saved position
  useEffect(() => {
    const savedLocation = localStorage.getItem(getStorageKey());
    if (savedLocation && !location) {
      setLocation(savedLocation);
    }
  }, [epubUrl]);

  // Save reading position
  const savePosition = useCallback((cfi: string) => {
    if (cfi && bookLoaded) {
      localStorage.setItem(getStorageKey(), cfi);
      setLocation(cfi);
    }
  }, [bookLoaded, getStorageKey]);

  // Update theme when highContrast changes
  useEffect(() => {
    setDarkMode(highContrast);
  }, [highContrast]);

  // Apply font size and theme to rendition
  useEffect(() => {
    if (renditionRef && bookLoaded) {
      try {
        // Set font size
        renditionRef.themes.fontSize(`${fontSize}px`);
        
        // Apply theme based on dark mode
        if (darkMode) {
          renditionRef.themes.default({
            'body': {
              'background-color': '#1a1a1a !important',
              'color': '#ffffff !important'
            },
            'p': {
              'color': '#ffffff !important'
            },
            'h1, h2, h3, h4, h5, h6': {
              'color': '#ffffff !important'
            },
            'a': {
              'color': '#60a5fa !important'
            }
          });
        } else {
          renditionRef.themes.default({
            'body': {
              'background-color': '#ffffff !important',
              'color': '#000000 !important'
            },
            'p': {
              'color': '#000000 !important'
            },
            'h1, h2, h3, h4, h5, h6': {
              'color': '#000000 !important'
            },
            'a': {
              'color': '#2563eb !important'
            }
          });
        }
      } catch (error) {
        console.warn('Error applying theme:', error);
      }
    }
  }, [renditionRef, fontSize, darkMode, bookLoaded]);

  const handleLocationChanged = useCallback((epubcifi: string) => {
    savePosition(epubcifi);
    
    // Update page counter if we have locations
    if (renditionRef?.locations?.length) {
      try {
        const currentLocation = renditionRef.locations.percentageFromCfi(epubcifi);
        const page = Math.floor(currentLocation * renditionRef.locations.length / 100);
        setCurrentPage(Math.max(1, page + 1));
        setTotalPages(renditionRef.locations.length);
      } catch (error) {
        // Fallback page calculation
        console.warn('Page calculation error:', error);
      }
    }
  }, [renditionRef, savePosition]);

  const handleBookReady = useCallback((rendition: any) => {
    setRenditionRef(rendition);
    setIsLoading(false);
    setBookLoaded(true);
    
    // Generate locations for pagination
    if (rendition.book) {
      rendition.book.locations.generate(1024).then(() => {
        const total = rendition.book.locations.length();
        setTotalPages(total);
        console.log('EPUB locations generated:', total);
      }).catch((error: any) => {
        console.warn('Could not generate locations:', error);
        setTotalPages(0);
      });
    }

    // Add touch event listeners for swipe navigation
    const addSwipeListeners = () => {
      const viewer = document.querySelector('[class*="epub-view"]');
      if (viewer) {
        viewer.addEventListener('touchstart', handleTouchStart, { passive: true });
        viewer.addEventListener('touchend', handleTouchEnd, { passive: true });
      }
    };

    // Try to add listeners after a short delay
    setTimeout(addSwipeListeners, 500);
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
    if (renditionRef) {
      renditionRef.prev();
    }
  };

  const goToNext = () => {
    if (renditionRef) {
      renditionRef.next();
    }
  };

  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };

  const handleFinishReading = () => {
    if (!isPremium && userStats.totalPoints < pointsToWin) {
      setShowTensensDialog(true);
    } else {
      onFinishReading();
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
          <p className="text-muted-foreground">Chargement de l'EPUB...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="epub-reader-container h-full flex flex-col">
      {/* Header Controls */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={goToPrevious}
            disabled={!bookLoaded}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={goToNext}
            disabled={!bookLoaded}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          {totalPages > 0 && (
            <span className="text-sm text-muted-foreground">
              Page {currentPage} / {totalPages}
            </span>
          )}
          
          <Button
            variant="outline"
            size="sm"
            onClick={toggleTheme}
          >
            <Palette className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Progress Bar */}
      {totalPages > 0 && (
        <div className="px-4 py-2">
          <Progress value={(currentPage / totalPages) * 100} className="h-2" />
        </div>
      )}

      {/* EPUB Reader */}
      <div className="flex-1 relative">
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

      {/* Footer Controls */}
      <div className="p-4 border-t space-y-3">
        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            onClick={goToPrevious}
            disabled={!bookLoaded}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Précédent
          </Button>
          
          <Button
            variant="outline"
            onClick={goToNext}
            disabled={!bookLoaded}
          >
            Suivant
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>

        {/* Finish Reading Button */}
        {!hasFinished && bookLoaded && (
          <Button
            onClick={handleFinishReading}
            className="w-full"
            variant="default"
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
      </div>

      {/* Tensens Dialog */}
      <BuyTensensDialog />
    </div>
  );
};