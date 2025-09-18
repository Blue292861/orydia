
import React from 'react';
import { Book } from '@/types/Book';
import { Card, CardContent } from '@/components/ui/card';
import { useUserStats } from '@/contexts/UserStatsContext';
import { useAuth } from '@/contexts/AuthContext';
import { CheckCircle, Crown } from 'lucide-react';
import { useResponsive } from '@/hooks/useResponsive';
import { ShareButton } from '@/components/ShareButton';

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
      className={`group relative cursor-pointer transition-all duration-500 hover:shadow-2xl hover:scale-105 hover:z-20 bg-gradient-to-br from-wood-100 via-stone-50 to-wood-50 border-2 border-wood-300 hover:border-gold-400 flex-shrink-0 overflow-hidden ${getCardWidth()} ${isRead ? 'ring-2 ring-primary/60' : ''}`}
      onClick={() => onBookSelect(book)}
    >
      {/* Decorative corner elements */}
      <div className="absolute top-0 left-0 w-4 h-4 bg-gradient-to-br from-gold-400 to-transparent opacity-30 rounded-br-full"></div>
      <div className="absolute top-0 right-0 w-4 h-4 bg-gradient-to-bl from-gold-400 to-transparent opacity-30 rounded-bl-full"></div>
      
      <div className="relative aspect-[3/4] rounded-t-lg overflow-hidden">
        <img
          src={book.coverUrl}
          alt={book.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        
        {/* Overlay gradient for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-forest-900/60 via-transparent to-transparent"></div>
        
        {isRead && (
          <div className={`absolute top-2 right-2 bg-gradient-to-br from-primary to-forest-600 text-white rounded-full shadow-lg ${getPadding()}`}>
            <CheckCircle className={`${getCheckIconSize()} drop-shadow-sm`} />
          </div>
        )}
        
        {isPremiumBook && !isUserPremium && (
          <div className={`absolute top-2 left-2 bg-gradient-to-br from-gold-400 via-gold-500 to-gold-600 text-gold-900 rounded-full shadow-lg ${getPadding()}`}>
            <Crown className={`${getCheckIconSize()} fill-current drop-shadow-sm`} />
          </div>
        )}
        
        {/* Enhanced Tensens display */}
        <div className="absolute bottom-2 left-2 bg-gradient-to-r from-forest-800/90 to-forest-700/90 backdrop-blur-sm rounded-lg px-2 py-1 flex items-center gap-1 border border-gold-400/30">
          <img 
            src="/lovable-uploads/4a891ef6-ff72-4b5a-b33c-0dc33dd3aa26.png" 
            alt="Tensens Icon" 
            className={`${
              isMobile ? 'h-2 w-2' : isTablet ? 'h-2.5 w-2.5' : 'h-3 w-3'
            } drop-shadow-sm`} 
          />
          <span className={`font-bold text-gold-200 drop-shadow-sm ${
            isMobile ? 'text-[6px]' : isTablet ? 'text-[7px]' : 'text-[8px] sm:text-[10px]'
          }`}>{book.points}</span>
        </div>
        
        {/* Hover effect overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-gold-500/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      </div>
      
      <CardContent className={`relative bg-gradient-to-br from-wood-50 to-stone-100 text-forest-800 ${
        isMobile ? 'p-1.5' : isTablet ? 'p-2' : 'p-3'
      }`}>
        {/* Decorative border */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold-300 to-transparent"></div>
        
        <h3 className={`font-display font-bold line-clamp-2 text-forest-800 group-hover:text-forest-900 transition-colors duration-300 ${
          isMobile ? 'text-[9px]' : isTablet ? 'text-[10px]' : 'text-xs sm:text-sm'
        }`}>
          {book.title}
        </h3>
        <p className={`text-forest-600 truncate font-nature italic ${
          isMobile ? 'text-[8px]' : isTablet ? 'text-[9px]' : 'text-[10px] sm:text-xs'
        }`}>
          {book.author}
        </p>
      </CardContent>
    </Card>
  );
};
