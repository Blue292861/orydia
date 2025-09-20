import React, { useEffect, useRef, useState } from 'react';
import ePub from 'epubjs';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Book } from '@/types/Book';
import { Loader } from 'lucide-react';

interface EpubViewerProps {
  bookUrl: string;
}

export const EpubViewer: React.FC<EpubViewerProps> = ({ bookUrl }) => {
  const viewerRef = useRef<HTMLDivElement>(null);
  const [book, setBook] = useState<any>(null);
  const [rendition, setRendition] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    const loadBook = async () => {
      try {
        const newBook = ePub(bookUrl);
        setBook(newBook);
        await newBook.ready;
        
        const newRendition = newBook.renderTo(viewerRef.current!, {
          width: '100%',
          height: '100%',
          flow: 'paginated',
          manager: 'continuous', // or 'default' for single-page scrolling
          snap: true,
          stylesheet: '/path/to/your/custom.css', // Optional: for custom styling
        });

        // Appliquer des styles CSS pour éviter les overrides de l'application
        newRendition.themes.override('font-family', 'inherit !important');
        
        // Afficher la page de couverture si elle existe
        newRendition.display();

        newRendition.on("displayed", () => {
          setIsLoading(false);
          setHasStarted(true);
        });

        newRendition.on("relocated", (location: any) => {
          // Vous pouvez enregistrer la progression ici
          console.log("Progression de la lecture:", location.start.cfi);
        });

        setRendition(newRendition);

        return () => {
          newRendition?.destroy();
        };
      } catch (error) {
        console.error("Erreur lors du chargement de l'EPUB:", error);
        setIsLoading(false);
      }
    };

    loadBook();
  }, [bookUrl]);

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
    <div className="flex flex-col items-center">
      {isLoading && (
        <div className="flex items-center justify-center p-8">
          <Loader className="h-8 w-8 animate-spin text-gray-500" />
          <span className="ml-2 text-gray-500">Chargement de l'eBook...</span>
        </div>
      )}
      <div 
        ref={viewerRef} 
        className="w-full flex-1 min-h-[60vh]"
        style={{ visibility: isLoading ? 'hidden' : 'visible' }}
      ></div>
      {hasStarted && (
        <div className="flex justify-between w-full mt-4">
          <Button onClick={handlePrevPage}>
            <ChevronLeft />
            Précédent
          </Button>
          <Button onClick={handleNextPage}>
            Suivant
            <ChevronRight />
          </Button>
        </div>
      )}
    </div>
  );
};
