
import React from 'react';
import { Book } from '@/types/Book';
import { Card, CardContent } from '@/components/ui/card';
import { useUserStats } from '@/contexts/UserStatsContext';
import { useAuth } from '@/contexts/AuthContext';
import { CheckCircle, Crown } from 'lucide-react';
import { useResponsive } from '@/hooks/useResponsive';

interface BookCardProps {
  book: Book;
  onBookSelect: (book: Book) => void;
  large?: boolean;
  showPreview?: boolean;
}

export const BookCard: React.FC<BookCardProps> = ({ book, onBookSelect, large = false, showPreview = false }) => {
  const { userStats } = useUserStats();
  const { subscription } = useAuth();
  const { isMobile, isTablet } = useResponsive();
  const isRead = userStats.booksRead.includes(book.id);
  const isPremiumBook = book.isPremium;
  const isUserPremium = subscription.isPremium;

  const getCardWidth = () => {
    if (isMobile) {
      return large ? 'w-20' : 'w-16';
    }
    if (isTablet) {
      return large ? 'w-28' : 'w-20';
    }
    return large ? 'min-w-[180px] max-w-[220px]' : 'w-28 lg:w-32';
  };

  const getCheckIconSize = () => {
    if (isMobile) return 'h-2 w-2';
    if (isTablet) return 'h-3 w-3';
    return 'h-3 w-3';
  };

  const getPadding = () => {
    if (isMobile) return 'p-0.5';
    if (isTablet) return 'p-1';
    return 'p-1';
  };

  return (
    <Card
      className={`relative cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 hover:z-10 bg-wood-800/60 border-wood-700 flex-shrink-0 ${getCardWidth()} ${isRead ? 'ring-2 ring-primary/50' : ''}`}
      onClick={() => onBookSelect(book)}
    >
      <div className="relative aspect-[3/4] rounded-t-lg overflow-hidden">
        <img
          src={book.coverUrl}
          alt={book.title}
          className="w-full h-full object-cover"
        />
        {isRead && (
          <div className={`absolute top-1 right-1 bg-primary text-primary-foreground rounded-full ${getPadding()}`}>
            <CheckCircle className={getCheckIconSize()} />
          </div>
        )}
        {isPremiumBook && !isUserPremium && (
          <div className={`absolute top-1 left-1 bg-gradient-to-br from-yellow-400 to-yellow-600 text-yellow-900 rounded-full ${getPadding()} shadow-lg`}>
            <Crown className={`${getCheckIconSize()} fill-current`} />
          </div>
        )}
        <div className="absolute bottom-1 left-1 bg-black/60 backdrop-blur-sm rounded-lg px-2 py-1 flex items-center gap-1">
          <img 
            src="/lovable-uploads/4a891ef6-ff72-4b5a-b33c-0dc33dd3aa26.png" 
            alt="Tensens Icon" 
            className={`${
              isMobile ? 'h-2 w-2' : isTablet ? 'h-2.5 w-2.5' : 'h-3 w-3'
            }`} 
          />
          <span className={`font-medium text-white ${
            isMobile ? 'text-[6px]' : isTablet ? 'text-[7px]' : 'text-[8px] sm:text-[10px]'
          }`}>{book.points}</span>
        </div>
      </div>
      <CardContent className={`text-wood-100 ${
        isMobile ? 'p-1.5' : isTablet ? 'p-2' : 'p-3'
      }`}>
        <h3 className={`font-bold line-clamp-2 ${
          isMobile ? 'text-[9px]' : isTablet ? 'text-[10px]' : 'text-xs sm:text-sm'
        }`}>
          {book.title}
        </h3>
        <p className={`text-wood-300 truncate ${
          isMobile ? 'text-[8px]' : isTablet ? 'text-[9px]' : 'text-[10px] sm:text-xs'
        }`}>
          {book.author}
        </p>
      </CardContent>
    </Card>
  );
};
