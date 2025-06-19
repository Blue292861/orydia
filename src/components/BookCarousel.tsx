
import React from 'react';
import { Book } from '@/types/Book';
import { BookCard } from './BookCard';
import { useResponsive } from '@/hooks/useResponsive';

interface BookCarouselProps {
  title: string;
  books: Book[];
  onBookSelect: (book: Book) => void;
  large?: boolean;
  emptyMessage?: string;
}

export const BookCarousel: React.FC<BookCarouselProps> = ({ title, books, onBookSelect, large = false, emptyMessage }) => {
  const { isMobile, isTablet } = useResponsive();
  
  if (books.length === 0) {
    if (emptyMessage) {
        return (
          <div className="space-y-2 max-w-full overflow-hidden">
            <h2 className={`font-cursive text-wood-300 capitalize px-2 ${
              isMobile ? 'text-lg' : isTablet ? 'text-xl' : 'text-xl sm:text-2xl lg:text-3xl'
            }`}>
              {title}
            </h2>
            <div className={`text-wood-300 px-2 ${
              isMobile ? 'text-xs' : isTablet ? 'text-sm' : 'text-sm'
            }`}>
              {emptyMessage}
            </div>
          </div>
        )
    }
    return null;
  }

  return (
    <div className="space-y-2 max-w-full overflow-hidden">
      <h2 className={`font-cursive text-wood-300 capitalize px-2 ${
        isMobile ? 'text-lg' : isTablet ? 'text-xl' : 'text-xl sm:text-2xl lg:text-3xl'
      }`}>
        {title}
      </h2>
      <div className={`flex overflow-x-auto -mb-4 py-2 px-2 ${
        isMobile ? 'space-x-2' : isTablet ? 'space-x-3' : 'space-x-3 sm:space-x-4'
      }`}>
        {books.map((book) => (
          <BookCard key={book.id} book={book} onBookSelect={onBookSelect} large={large} />
        ))}
        <div className="flex-shrink-0 w-1"></div>
      </div>
    </div>
  );
};
