import React, { useState, useEffect, useCallback } from 'react';
import { Book } from '@/types/Book';
import { MonthSuccessCarouselItem } from './MonthSuccessCarouselItem';
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

  const handleBookClick = useCallback((book: Book) => {
    onBookSelect(book);
  }, [onBookSelect]);

  const getTitleSize = () => {
    if (isMobile) return 'text-lg';
    if (isTablet) return 'text-xl';
    return 'text-2xl sm:text-3xl lg:text-4xl';
  };

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
        <h2 className={`font-cursive text-foreground mb-6 ${getTitleSize()}`}>
          Succès du mois
        </h2>
        <div className="w-full min-h-[400px] md:min-h-[350px] lg:min-h-[400px]">
          <MonthSuccessCarouselItem
            book={books[0]}
            isActive={true}
            onBookSelect={onBookSelect}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="px-2 mb-8">
      <h2 className={`font-cursive text-foreground mb-6 ${getTitleSize()}`}>
        Succès du mois
      </h2>
      
      <div className="relative">
        <Carousel
          opts={{
            align: 'start',
            loop: true,
            skipSnaps: false,
            dragFree: false,
          }}
          setApi={setApi}
          className="w-full"
        >
          <CarouselContent className="min-h-[400px] md:min-h-[350px] lg:min-h-[400px]">
            {books.map((book, index) => {
              const isActive = index === current;

              return (
                <CarouselItem 
                  key={book.id} 
                  className="basis-full"
                >
                  <MonthSuccessCarouselItem
                    book={book}
                    isActive={isActive}
                    onBookSelect={handleBookClick}
                  />
                </CarouselItem>
              );
            })}
          </CarouselContent>
          
          {/* Navigation Arrows */}
          <div className="hidden md:block">
            <CarouselPrevious className="-left-12 lg:-left-16 bg-card/90 hover:bg-card border-border shadow-lg" />
            <CarouselNext className="-right-12 lg:-right-16 bg-card/90 hover:bg-card border-border shadow-lg" />
          </div>
          
          {/* Navigation mobile : flèches à l'intérieur */}
          {isMobile && (
            <>
              <CarouselPrevious className="left-2 bg-card/90 hover:bg-card border-border shadow-lg" />
              <CarouselNext className="right-2 bg-card/90 hover:bg-card border-border shadow-lg" />
            </>
          )}
        </Carousel>

        {/* Pagination Dots */}
        {books.length > 1 && (
          <div className="flex justify-center gap-2 mt-6">
            {books.map((_, index) => (
              <button
                key={index}
                onClick={() => api?.scrollTo(index)}
                className={`transition-all duration-300 rounded-full ${
                  index === current
                    ? 'w-8 h-2 bg-primary'
                    : 'w-2 h-2 bg-muted-foreground/30 hover:bg-muted-foreground/50'
                }`}
                aria-label={`Aller au livre ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
