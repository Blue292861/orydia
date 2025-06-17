
import React from 'react';
import { Book } from '@/types/Book';
import { Card, CardContent } from '@/components/ui/card';
import { useUserStats } from '@/contexts/UserStatsContext';
import { CheckCircle } from 'lucide-react';

interface BookCardProps {
  book: Book;
  onBookSelect: (book: Book) => void;
  large?: boolean;
}

export const BookCard: React.FC<BookCardProps> = ({ book, onBookSelect, large = false }) => {
  const { userStats } = useUserStats();
  const isRead = userStats.booksRead.includes(book.id);

  return (
    <Card
      className={`relative cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 hover:z-10 bg-wood-800/60 border-wood-700 flex-shrink-0 ${large ? 'w-32 xs:w-36 sm:w-48 md:w-60 lg:w-72' : 'w-24 xs:w-28 sm:w-32 md:w-40 lg:w-48'} ${isRead ? 'ring-2 ring-primary/50' : ''}`}
      onClick={() => onBookSelect(book)}
    >
      <div className={`relative aspect-[2/3] rounded-t-lg overflow-hidden`}>
        <img
          src={book.coverUrl}
          alt={book.title}
          className="w-full h-full object-cover"
        />
        {isRead && (
          <div className="absolute top-1 xs:top-2 right-1 xs:right-2 bg-primary text-primary-foreground rounded-full p-0.5 xs:p-1">
            <CheckCircle className="h-2 w-2 xs:h-3 xs:w-3 sm:h-4 sm:w-4" />
          </div>
        )}
      </div>
      <CardContent className="p-1.5 xs:p-2 sm:p-3 text-wood-100">
        <h3 className="font-bold truncate text-[10px] xs:text-xs sm:text-sm">{book.title}</h3>
        <p className="text-[8px] xs:text-[10px] sm:text-sm text-wood-300 mb-1 xs:mb-2 truncate">{book.author}</p>
        <div className="flex items-center gap-0.5 xs:gap-1 text-[8px] xs:text-[10px] sm:text-xs">
          <img src="/lovable-uploads/4a891ef6-ff72-4b5a-b33c-0dc33dd3aa26.png" alt="Tensens Icon" className="h-2 w-2 xs:h-3 xs:w-3 sm:h-4 sm:w-4" />
          <span className="font-medium">{book.points} Tensens</span>
        </div>
      </CardContent>
    </Card>
  );
};
