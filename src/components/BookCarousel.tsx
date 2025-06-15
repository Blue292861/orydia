
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
          <div className="space-y-4">
            <h2 className="text-3xl font-cursive text-wood-100 capitalize">{title}</h2>
            <div className="text-sm text-wood-300">{emptyMessage}</div>
          </div>
        )
    }
    return null;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-3xl font-cursive text-wood-100 capitalize">{title}</h2>
      <div className="flex space-x-4 overflow-x-auto pb-4 -mb-4">
        {books.map((book) => (
          <BookCard key={book.id} book={book} onBookSelect={onBookSelect} large={large} />
        ))}
        <div className="flex-shrink-0 w-1"></div> {/* padding at the end */}
      </div>
    </div>
  );
};
