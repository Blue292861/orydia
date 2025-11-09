
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
  variant?: 'grid' | 'carousel';
}

export const BookCard: React.FC<BookCardProps> = ({ book, onBookSelect, large = false, showPreview = false, variant = 'carousel' }) => {
  const { userStats } = useUserStats();
  const { subscription } = useAuth();
  const { isMobile, isTablet } = useResponsive();
  const isRead = userStats.booksRead.includes(book.id);
  const isPremiumBook = book.isPremium;
  const isUserPremium = subscription.isPremium;

  const getCardWidth = () => {
    // Pour les grilles CSS, utiliser w-full
    if (variant === 'grid') {
      if (large) {
        return 'w-full max-w-[220px]';
      }
      return 'w-full';
    }
    
    // Pour les carousels, utiliser des largeurs fixes
    if (large) {
      if (isMobile) return 'w-32';
      if (isTablet) return 'w-40';
      return 'w-48 lg:w-56';
    }
    
    // Cartes normales dans carousel
    if (isMobile) return 'w-24';
    if (isTablet) return 'w-28';
    return 'w-32 lg:w-36';
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
      className={`group relative cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-[1.02] hover:z-10 bg-wood-50/95 border border-wood-300/50 hover:border-gold-400/70 backdrop-blur-sm flex-shrink-0 overflow-hidden ${getCardWidth()} ${isRead ? 'ring-1 ring-primary/40' : ''}`}
      onClick={() => onBookSelect(book)}
    >
      
      <div className="relative aspect-[3/4] rounded-t-lg overflow-hidden">
        <img
          src={book.coverUrl}
          alt={book.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        
        {/* Overlay gradient for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-forest-900/40 via-transparent to-transparent"></div>
        
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
        <div className="absolute bottom-2 left-2 bg-forest-800/85 backdrop-blur-sm rounded-lg px-2 py-1 flex items-center gap-1 border border-gold-400/20">
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
      </div>
      
      <CardContent className={`relative bg-wood-50/98 text-forest-900 ${
        isMobile ? 'p-1.5' : isTablet ? 'p-2' : 'p-2 sm:p-3'
      }`}>
        <h3 className={`font-display font-semibold line-clamp-2 text-forest-900 group-hover:text-forest-950 transition-colors duration-300 ${
          isMobile ? 'text-[9px]' : isTablet ? 'text-[10px]' : 'text-xs sm:text-sm'
        }`}>
          {book.title}
        </h3>
        <p className={`text-forest-600/80 truncate ${
          isMobile ? 'text-[8px]' : isTablet ? 'text-[9px]' : 'text-[10px] sm:text-xs'
        }`}>
          {book.author}
        </p>
      </CardContent>
    </Card>
  );
};
