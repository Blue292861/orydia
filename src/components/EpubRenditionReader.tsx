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
  const { userStats } = useUserStats();
  const viewerRef = useRef<HTMLDivElement>(null);
  const touchStart = useRef<number>(0);

  // Initialize EPUB book
  useEffect(() => {
    if (!epubUrl || !viewerRef.current) return;

    const initBook = async () => {
      setIsLoading(true);
      try {
        const newBook = ePub(epubUrl);
        setBook(newBook);

        // Ensure book is ready
        await (newBook as any).ready;
        // Generate locations for global pagination
        await (newBook as any).locations.generate(1000);

        // Compute viewer size
        const viewerHeight = Math.max(400, Math.round(window.innerHeight * 0.75));

        // Create rendition with paginated flow
        const newRendition = newBook.renderTo(viewerRef.current!, {
          width: '100%',
          height: viewerHeight,
          flow: 'paginated',
          spread: 'auto',
          manager: 'default',
          allowScriptedContent: false
        });

        setRendition(newRendition);

        // Base styles that don't override original fonts
        newRendition.themes.default({
          'p': {
            'margin': '1em 0 !important',
            'text-align': 'justify !important'
          },
          'img': {
            'max-width': '100% !important',
            'width': 'auto !important',
            'height': 'auto !important',
            'display': 'block !important',
            'margin': '1em auto !important',
            'object-fit': 'contain !important'
          },
          'h1, h2, h3, h4, h5, h6': {
            'font-weight': 'bold !important',
            'margin': '1.5em 0 1em 0 !important'
          }
        });

        // Theme variants for light/dark
        newRendition.themes.register('light', {
          'body': { 'background': '#ffffff !important', 'color': '#000000 !important' }
        });
        newRendition.themes.register('dark', {
          'body': { 'background': '#000000 !important', 'color': '#ffffff !important' }
        });
        newRendition.themes.select(darkMode ? 'dark' : 'light');
        newRendition.themes.fontSize(`${fontSize}px`);

        // Display first page
        await newRendition.display();

        // Hook into rendition events
        newRendition.on('relocated', (location: any) => {
          const displayed = location?.start?.displayed;
          const startCfi = location?.start?.cfi;

          // Global pagination using generated locations
          if ((newBook as any).locations && startCfi) {
            const idx = (newBook as any).locations.locationFromCfi(startCfi);
            const total = (newBook as any).locations.length();
            if (typeof idx === 'number' && typeof total === 'number' && total > 0) {
              setCurrentPage(idx + 1);
              setTotalPages(total);
            }
          } else if (displayed) {
            // Fallback to section-based pagination
            setCurrentPage(displayed.page);
            setTotalPages(displayed.total);
          }

          setIsAtStart(Boolean((location as any).atStart));
          setIsAtEnd(Boolean((location as any).atEnd));
        });

        // Clean up &nbsp; and other HTML entities
        newRendition.hooks.content.register((contents: any) => {
          const body = contents.document.body;
          if (body) {
            body.innerHTML = body.innerHTML
              .replace(/&nbsp;/g, ' ')
              .replace(/&#160;/g, ' ')
              .replace(/\u00A0/g, ' ');
          }
        });

        setIsLoading(false);
      } catch (error) {
        console.error('Error loading EPUB:', error);
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
      if (rendition) {
        rendition.destroy();
      }
    };
  }, [epubUrl]);

  // Update theme when darkMode changes
  useEffect(() => {
    if (rendition) {
      rendition.themes.select(darkMode ? 'dark' : 'light');
    }
  }, [darkMode, rendition]);

  // Update font size without reinitializing
  useEffect(() => {
    if (rendition) {
      rendition.themes.fontSize(`${fontSize}px`);
    }
  }, [fontSize, rendition]);

  const goToPrevious = () => {
    if (rendition && currentPage > 1) {
      rendition.prev();
    }
  };

  const goToNext = () => {
    if (rendition && currentPage < totalPages) {
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

  const handleFinishReading = () => {
    if (!isPremium && userStats.totalPoints < pointsToWin) {
      setShowTensensDialog(true);
    } else {
      onFinishReading();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Loading indicator */}
      {isLoading && (
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-2">Chargement du livre...</span>
        </div>
      )}

      {/* Page info and controls */}
      <div className="flex items-center justify-between p-2 border-b bg-background/95 backdrop-blur">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground">
            Page {currentPage} sur {totalPages}
          </span>
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