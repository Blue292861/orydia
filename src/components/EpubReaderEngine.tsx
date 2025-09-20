import React, { useEffect, useRef, useState } from 'react';
import ePub from 'epubjs';
import { Book } from '@/types/Book';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Loader } from 'lucide-react';
import { useUserStats } from '@/contexts/UserStatsContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

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
  onHighContrastChange: (contrast: boolean) => void;
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
  onHighContrastChange,
}) => {
  const viewerRef = useRef<HTMLDivElement>(null);
  const [rendition, setRendition] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  useEffect(() => {
    if (!viewerRef.current) return;

    // Crée une nouvelle instance de l'eBook et rendition
    const book = ePub(epubUrl);
    const newRendition = book.renderTo(viewerRef.current, {
      width: '100%',
      height: '100%',
      flow: 'paginated', // or 'scrolled' for continuous flow
    });

    // Événements et logique
    newRendition.on("relocated", (location: any) => {
      setAtStart(location.atStart);
      setAtEnd(location.atEnd);
    });

    newRendition.on("rendered", () => {
      setIsLoading(false);
    });

    newRendition.display();

    setRendition(newRendition);

    // Nettoyage
    return () => {
      newRendition?.destroy();
    };
  }, [epubUrl]);

  useEffect(() => {
    if (rendition) {
      rendition.themes.fontSize(`${fontSize}px`);
    }
  }, [fontSize, rendition]);

  useEffect(() => {
    if (rendition) {
      if (highContrast) {
        rendition.themes.override('color', '#fff');
        rendition.themes.override('background-color', '#000');
        rendition.themes.override('filter', 'invert(1)');
      } else {
        rendition.themes.override('color', '');
        rendition.themes.override('background-color', '');
        rendition.themes.override('filter', '');
      }
    }
  }, [highContrast, rendition]);

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

  return (
    <div className="flex flex-col h-full">
      {isLoading && (
        <div className="flex items-center justify-center p-8">
          <Loader className="h-8 w-8 animate-spin text-gray-500" />
          <span className="ml-2 text-gray-500">Chargement de l'eBook...</span>
        </div>
      )}
      <div 
        ref={viewerRef} 
        className="epub-viewer flex-1" 
        style={{ visibility: isLoading ? 'hidden' : 'visible' }}
      ></div>

      <div className="mt-4 flex justify-between">
        <Button onClick={handlePrevPage} disabled={atStart || isLoading}>
          <ChevronLeft className="h-4 w-4 mr-2" />
          Précédent
        </Button>
        <Button onClick={handleNextPage} disabled={atEnd || isLoading}>
          Suivant
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </div>

      {atEnd && !isAlreadyRead && !hasFinished && (
        <div className="mt-8 pt-6 border-t flex justify-center">
          <Button onClick={onFinishReading} className="flex items-center gap-2">
            <img src="/lovable-uploads/4a891ef6-ff72-4b5a-b33c-0dc33dd3aa26.png" alt="Icône Tensens" className="h-4 w-4" />
            {isPremium ? 
              `Terminer la lecture & Gagner ${pointsToWin} Tensens` :
              `Regarder une publicité & Gagner ${pointsToWin} Tensens`
            }
          </Button>
        </div>
      )}
    </div>
  );
};
