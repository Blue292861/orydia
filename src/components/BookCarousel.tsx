
import React from 'react';
import { Book } from '@/types/Book';
import { BookCard } from './BookCard';

interface BookCarouselProps {
  title: string;
  books: Book[];
  onBookSelect: (book: Book) => void;
  large?: boolean;
  emptyMessage?: string;
}

export const BookCarousel: React.FC<BookCarouselProps> = ({ title, books, onBookSelect, large = false, emptyMessage }) => {
  if (books.length === 0) {
    if (emptyMessage) {
        return (
          <div className="space-y-2 xs:space-y-3 sm:space-y-4">
            <h2 className="text-lg xs:text-xl sm:text-2xl md:text-4xl font-cursive text-wood-300 capitalize px-1 xs:px-2 sm:px-0">{title}</h2>
            <div className="text-xs xs:text-sm text-wood-300 px-1 xs:px-2 sm:px-0">{emptyMessage}</div>
          </div>
        )
    }
    return null;
  }

  return (
    <div className="space-y-2 xs:space-y-3 sm:space-y-4">
      <h2 className="text-lg xs:text-xl sm:text-2xl md:text-4xl font-cursive text-wood-300 capitalize px-1 xs:px-2 sm:px-0">{title}</h2>
      <div className="flex space-x-2 xs:space-x-3 sm:space-x-4 overflow-x-auto -mb-4 py-2 xs:py-3 sm:py-4 px-1 xs:px-2 sm:px-0">
        {books.map((book) => (
          <BookCard key={book.id} book={book} onBookSelect={onBookSelect} large={large} />
        ))}
        <div className="flex-shrink-0 w-1"></div> {/* padding at the end */}
      </div>
    </div>
  );
};
