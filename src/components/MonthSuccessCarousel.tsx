import React, { useState, useEffect, useCallback } from 'react';
import { Book } from '@/types/Book';
import { BookCard } from './BookCard';
import { 
  Carousel, 
  CarouselContent, 
  CarouselItem, 
  CarouselNext, 
  CarouselPrevious,
  type CarouselApi
} from '@/components/ui/carousel';
import { useResponsive } from '@/hooks/useResponsive';

interface MonthSuccessCarouselProps {
  books: Book[];
  onBookSelect: (book: Book) => void;
}

export const MonthSuccessCarousel: React.FC<MonthSuccessCarouselProps> = ({ 
  books, 
  onBookSelect 
}) => {
  const { isMobile, isTablet } = useResponsive();
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!api) return;

    setCurrent(api.selectedScrollSnap());

    api.on('select', () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  const handleBookClick = useCallback((book: Book, index: number) => {
    if (index === current) {
      // Si c'est le livre central, ouvrir la prévisualisation
      onBookSelect(book);
    } else {
      // Si c'est un livre latéral, naviguer vers ce livre
      api?.scrollTo(index);
    }
  }, [current, onBookSelect, api]);

  // Cas limites
  if (books.length === 0) {
    return (
      <div className="px-2 mb-8">
        <h2 className={`font-cursive text-foreground mb-4 ${
          isMobile ? 'text-lg' : isTablet ? 'text-xl' : 'text-2xl sm:text-3xl lg:text-4xl'
        }`}>
          Succès du mois
        </h2>
        <div className="text-center py-8 text-muted-foreground">
          Aucun succès du mois pour le moment.
        </div>
      </div>
    );
  }

  if (books.length === 1) {
    return (
      <div className="px-2 mb-8">
        <h2 className={`font-cursive text-foreground mb-4 ${
          isMobile ? 'text-lg' : isTablet ? 'text-xl' : 'text-2xl sm:text-3xl lg:text-4xl'
        }`}>
          Succès du mois
        </h2>
        <div className="flex justify-center">
          <div className="w-full max-w-[280px]">
            <BookCard
              book={books[0]}
              onBookSelect={onBookSelect}
              large={true}
            />
          </div>
        </div>
      </div>
    );
  }

  const getTitleSize = () => {
    if (isMobile) return 'text-lg';
    if (isTablet) return 'text-xl';
    return 'text-2xl sm:text-3xl lg:text-4xl';
  };

  return (
    <div className="px-2 mb-8">
      <h2 className={`font-cursive text-foreground mb-6 ${getTitleSize()}`}>
        Succès du mois
      </h2>
      
      <Carousel
        opts={{
          align: 'center',
          loop: true,
        }}
        setApi={setApi}
        className="w-full"
      >
        <CarouselContent className="-ml-2 md:-ml-4 gap-4">
          {books.map((book, index) => {
            const isCenter = index === current;
            const isPrev = index === (current - 1 + books.length) % books.length;
            const isNext = index === (current + 1) % books.length;
            const isVisible = isCenter || isPrev || isNext;

            // Styles conditionnels selon la position
            let itemClasses = 'transition-all duration-500 ease-in-out pl-2 md:pl-4';
            let contentClasses = '';
            let cardClasses = '';

            if (isCenter) {
              // Livre central : pleine opacité, pleine taille, z-index élevé
              contentClasses = 'opacity-100 scale-100 z-10';
              cardClasses = 'cursor-pointer';
            } else if (isVisible) {
              // Livres latéraux : opacité réduite, taille réduite
              if (isMobile) {
                contentClasses = 'opacity-30 scale-60 blur-[1px] z-0';
              } else {
                contentClasses = 'opacity-50 scale-75 z-0 hover:opacity-70 transition-all';
              }
              cardClasses = 'cursor-pointer';
            } else {
              // Livres non visibles : masqués
              contentClasses = 'opacity-0 scale-75 z-0';
            }

            return (
              <CarouselItem 
                key={book.id} 
                className={`${itemClasses} basis-2/3 sm:basis-1/2 md:basis-1/3 lg:basis-1/4`}
              >
                <div 
                  className={`flex justify-center items-center ${contentClasses}`}
                  onClick={() => handleBookClick(book, index)}
                >
                  <div className={`w-full max-w-[200px] sm:max-w-[220px] md:max-w-[240px] ${cardClasses}`}>
                    <BookCard
                      book={book}
                      onBookSelect={() => {}}
                      large={true}
                    />
                  </div>
                </div>
              </CarouselItem>
            );
          })}
        </CarouselContent>
        
        <div className="hidden md:block">
          <CarouselPrevious className="-left-12 bg-card/80 hover:bg-card border-border" />
          <CarouselNext className="-right-12 bg-card/80 hover:bg-card border-border" />
        </div>
        
        {/* Navigation mobile : afficher les flèches à l'intérieur */}
        {isMobile && (
          <>
            <CarouselPrevious className="left-2 bg-card/80 hover:bg-card border-border" />
            <CarouselNext className="right-2 bg-card/80 hover:bg-card border-border" />
          </>
        )}
      </Carousel>
    </div>
  );
};
