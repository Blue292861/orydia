import React, { useState, useCallback } from 'react';
import { ReactReader } from 'react-reader';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Trophy } from 'lucide-react';
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
  const [location, setLocation] = useState<string | number>(0);
  const [rendition, setRendition] = useState<any>(null);
  const [isAtEnd, setIsAtEnd] = useState(false);
  const [showTensensDialog, setShowTensensDialog] = useState(false);
  const { userStats } = useUserStats();

  const onLocationChanged = useCallback((epubcfi: string) => {
    setLocation(epubcfi);
    
    // Check if we're at the end of the book
    if (rendition) {
      const currentLocation = rendition.currentLocation();
      if (currentLocation?.atEnd) {
        setIsAtEnd(true);
      }
    }
  }, [rendition]);

  const onRenditionReady = useCallback((renditionInstance: any) => {
    setRendition(renditionInstance);
    
    // Apply theme based on highContrast
    if (highContrast) {
      renditionInstance.themes.default({
        'body': {
          'background': 'hsl(var(--background)) !important',
          'color': 'hsl(var(--foreground)) !important'
        },
        'p': {
          'color': 'hsl(var(--foreground)) !important'
        }
      });
    }
    
    // Apply font size
    renditionInstance.themes.fontSize(`${fontSize}px`);
  }, [fontSize, highContrast]);

  const goToPrevious = () => {
    if (rendition) {
      rendition.prev();
    }
  };

  const goToNext = () => {
    if (rendition) {
      rendition.next();
    }
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
      {/* Reader */}
      <div className="flex-1 min-h-0">
        <ReactReader
          url={epubUrl}
          location={location}
          locationChanged={onLocationChanged}
          getRendition={onRenditionReady}
          readerStyles={undefined}
        />
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between p-4 border-t bg-background/95 backdrop-blur">
        <Button
          variant="outline"
          size="sm"
          onClick={goToPrevious}
          disabled={!rendition}
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Précédent
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
          disabled={!rendition}
        >
          Suivant
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