import React from 'react';
import { Book } from '@/types/Book';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Sparkles } from 'lucide-react';
import { GENRE_STYLES } from '@/constants/genreStyles';
import { LiteraryGenre } from '@/constants/genres';

interface MonthSuccessCarouselItemProps {
  book: Book;
  isActive: boolean;
  onBookSelect: (book: Book) => void;
}

export const MonthSuccessCarouselItem: React.FC<MonthSuccessCarouselItemProps> = ({
  book,
  isActive,
  onBookSelect,
}) => {
  const truncateText = (text: string | undefined, maxLength: number) => {
    if (!text) return '';
    return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
  };

  const getSummary = () => {
    if (!book.summary) return 'Découvrez cette œuvre exceptionnelle parmi les succès du mois.';
    return book.summary;
  };

  return (
    <div
      className={`relative w-full h-full transition-all duration-600 ${
        isActive ? 'month-success-item-active opacity-100' : 'opacity-0'
      }`}
    >
      {/* Desktop/Tablet: Horizontal Layout */}
      <div className="hidden md:flex w-full min-h-[260px] lg:min-h-[300px] gap-6 lg:gap-8 items-center px-4 lg:px-8 py-3">
        {/* Cover - Left Side */}
        <div className="w-[30%] lg:w-[25%] flex-shrink-0">
          <div
            className={`relative aspect-[2/3] rounded-lg overflow-hidden shadow-2xl border-2 border-border ${
              isActive ? 'month-success-cover-active' : ''
            }`}
          >
            <img
              src={book.coverUrl}
              alt={book.title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
            {book.isPremium && (
              <div className="absolute top-3 right-3 bg-gradient-to-br from-amber-400 to-amber-600 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Premium
              </div>
            )}
          </div>
        </div>

        {/* Description - Right Side */}
        <div className="flex-1 flex flex-col justify-center space-y-2 lg:space-y-3 pr-6">
          <div>
            <h3 className="font-cursive text-xl lg:text-2xl xl:text-3xl text-wood-300 mb-1 leading-tight">
              {book.title}
            </h3>
            <p className="font-display text-sm lg:text-base text-wood-300">
              par {book.author}
            </p>
          </div>

          <p className="font-sans text-xs lg:text-sm text-wood-300 leading-relaxed line-clamp-3 lg:line-clamp-4">
            {getSummary()}
          </p>

          {/* Genres */}
          {book.genres && book.genres.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {book.genres.slice(0, 3).map((genre) => {
                const genreStyle = GENRE_STYLES[genre as LiteraryGenre];
                return (
                  <Badge
                    key={genre}
                    variant="outline"
                    className={`${genreStyle?.borderColor || 'border-border'} bg-background/50 text-wood-300`}
                  >
                    {genreStyle?.ornament} {genre}
                  </Badge>
                );
              })}
            </div>
          )}

          {/* Points */}
          <div className="flex items-center gap-2 text-xs text-wood-300">
            <BookOpen className="w-3.5 h-3.5" />
            <span className="font-semibold">{book.points} Orydors</span>
          </div>

          {/* CTA Button */}
          <div>
            <Button
              onClick={() => onBookSelect(book)}
              size="default"
              className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              Lire maintenant
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile: Vertical Layout */}
      <div className="flex md:hidden flex-col items-center w-full min-h-[280px] px-4 py-4 space-y-3">
        {/* Cover - Top */}
        <div className="w-[50%] max-w-[180px]">
          <div
            className={`relative aspect-[2/3] rounded-lg overflow-hidden shadow-xl border-2 border-border ${
              isActive ? 'month-success-cover-active' : ''
            }`}
          >
            <img
              src={book.coverUrl}
              alt={book.title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
            {book.isPremium && (
              <div className="absolute top-2 right-2 bg-gradient-to-br from-amber-400 to-amber-600 text-white px-2 py-1 rounded-full text-xs font-semibold shadow-lg flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Premium
              </div>
            )}
          </div>
        </div>

        {/* Description - Bottom */}
        <div className="flex flex-col items-center text-center space-y-2 w-full">
          <div>
            <h3 className="font-cursive text-base text-wood-300 mb-0.5 leading-tight">
              {book.title}
            </h3>
            <p className="font-display text-xs text-wood-300">
              par {book.author}
            </p>
          </div>

          <p className="font-sans text-xs text-wood-300 leading-relaxed line-clamp-2">
            {truncateText(getSummary(), 150)}
          </p>

          {/* Genres */}
          {book.genres && book.genres.length > 0 && (
            <div className="flex flex-wrap gap-1 justify-center">
              {book.genres.slice(0, 2).map((genre) => {
                const genreStyle = GENRE_STYLES[genre as LiteraryGenre];
                return (
                  <Badge
                    key={genre}
                    variant="outline"
                    className={`text-[10px] py-0 ${genreStyle?.borderColor || 'border-border'} bg-background/50 text-wood-300`}
                  >
                    {genreStyle?.ornament} {genre}
                  </Badge>
                );
              })}
            </div>
          )}

          {/* Points & CTA in row */}
          <div className="flex items-center gap-3 justify-center">
            <div className="flex items-center gap-1 text-[10px] text-wood-300">
              <BookOpen className="w-3 h-3" />
              <span className="font-semibold">{book.points} Orydors</span>
            </div>
            <Button
              onClick={() => onBookSelect(book)}
              size="sm"
              className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground font-semibold shadow-lg text-xs py-1 h-7"
            >
              Lire
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
