
import React from 'react';
import { Book } from '@/types/Book';
import { Card, CardContent } from '@/components/ui/card';
import { useUserStats } from '@/contexts/UserStatsContext';
import { CheckCircle } from 'lucide-react';
import { useResponsive } from '@/hooks/useResponsive';

interface BookCardProps {
  book: Book;
  onBookSelect: (book: Book) => void;
  large?: boolean;
}

export const BookCard: React.FC<BookCardProps> = ({ book, onBookSelect, large = false }) => {
  const { userStats } = useUserStats();
  const { isMobile, isTablet } = useResponsive();
  const isRead = userStats.booksRead.includes(book.id);

  const getCardWidth = () => {
    if (isMobile) {
      return large ? 'w-20' : 'w-16';
    }
    if (isTablet) {
      return large ? 'w-32' : 'w-24';
    }
    return large ? 'w-48 lg:w-60' : 'w-32 lg:w-40';
  };

  return (
    <Card
      className={`relative cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 hover:z-10 bg-wood-800/60 border-wood-700 flex-shrink-0 ${getCardWidth()} ${isRead ? 'ring-2 ring-primary/50' : ''}`}
      onClick={() => onBookSelect(book)}
    >
      <div className="relative aspect-[2/3] rounded-t-lg overflow-hidden">
        <img
          src={book.coverUrl}
          alt={book.title}
          className="w-full h-full object-cover"
        />
        {isRead && (
          <div className={`absolute top-1 right-1 bg-primary text-primary-foreground rounded-full ${isMobile ? 'p-0.5' : 'p-1'}`}>
            <CheckCircle className={`${isMobile ? 'h-2 w-2' : 'h-3 w-3'}`} />
          </div>
        )}
      </div>
      <CardContent className={`text-wood-100 ${isMobile ? 'p-1' : 'p-2'}`}>
        <h3 className={`font-bold truncate ${isMobile ? 'text-[8px]' : 'text-[10px] sm:text-xs'}`}>
          {book.title}
        </h3>
        <p className={`text-wood-300 mb-1 truncate ${isMobile ? 'text-[7px]' : 'text-[8px] sm:text-[10px]'}`}>
          {book.author}
        </p>
        <div className={`flex items-center gap-0.5 ${isMobile ? 'text-[6px]' : 'text-[8px] sm:text-[10px]'}`}>
          <img 
            src="/lovable-uploads/4a891ef6-ff72-4b5a-b33c-0dc33dd3aa26.png" 
            alt="Tensens Icon" 
            className={`${isMobile ? 'h-2 w-2' : 'h-3 w-3'}`} 
          />
          <span className="font-medium">{book.points} Tensens</span>
        </div>
      </CardContent>
    </Card>
  );
};
