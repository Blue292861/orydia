import React, { useEffect, useRef, useState } from 'react';
import ePub from 'epubjs';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Loader, AlertTriangle } from 'lucide-react';
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
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!viewerRef.current) {
      console.error("Le conteneur du lecteur n'existe pas.");
      return;
    }
    if (!epubUrl) {
      setError("Le lien vers l'eBook est manquant.");
      setIsLoading(false);
      console.error("L'URL de l'EPUB est manquante.");
      return;
    }

    const loadBook = async () => {
      try {
        const book = ePub(epubUrl);
        const newRendition = book.renderTo(viewerRef.current, {
          width: '100%',
          height: '100%',
          flow: 'paginated',
        });

        newRendition.on("relocated", (location: any) => {
          setAtStart(location.atStart);
          setAtEnd(location.atEnd);
          
          if (book.locations) {
            const currentProgress = book.locations.percentageFromCfi(location.start.cfi);
            setProgress(Math.floor(currentProgress * 100));
          }
        });

        newRendition.on("rendered", () => {
          setIsLoading(false);
        });

        newRendition.display();

        setRendition(newRendition);
      } catch (err) {
        console.error("Erreur lors du chargement de l'EPUB:", err);
        setError("Impossible de charger le fichier EPUB. Veuillez vérifier le lien.");
        setIsLoading(false);
      }
    };

    loadBook();

    return () => {
      if (rendition) {
        rendition.destroy();
      }
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

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-red-500">
        <AlertTriangle className="h-12 w-12 mb-4" />
        <p className="text-lg text-center">{error}</p>
      </div>
    );
  }

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

      <div className="mt-4 flex justify-between items-center w-full">
        <Button onClick={handlePrevPage} disabled={atStart || isLoading}>
          <ChevronLeft className="h-4 w-4 mr-2" />
          Précédent
        </Button>
        <div className="text-sm text-gray-500">
          <span>{Math.round(progress)}% de lecture</span>
        </div>
        <Button onClick={handleNextPage} disabled={atEnd || isLoading}>
          Suivant
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </div>

      <div className="w-full mt-4 bg-gray-200 rounded-full h-2.5">
        <div 
          className="bg-purple-600 h-2.5 rounded-full transition-all duration-500" 
          style={{ width: `${progress}%` }}
        ></div>
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
