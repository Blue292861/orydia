
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
      className={`relative cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 hover:z-10 bg-wood-800/60 border-wood-700 flex-shrink-0 ${large ? 'w-60 md:w-72' : 'w-40 md:w-48'} ${isRead ? 'ring-2 ring-primary/50' : ''}`}
      onClick={() => onBookSelect(book)}
    >
      <div className={`relative aspect-[2/3] rounded-t-lg overflow-hidden`}>
        <img
          src={book.coverUrl}
          alt={book.title}
          className="w-full h-full object-cover"
        />
        {isRead && (
          <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1">
            <CheckCircle className="h-4 w-4" />
          </div>
        )}
      </div>
      <CardContent className="p-3 text-wood-100">
        <h3 className="font-bold truncate">{book.title}</h3>
        <p className="text-sm text-wood-300 mb-2 truncate">{book.author}</p>
        <div className="flex items-center gap-1 text-xs">
          <img src="/lovable-uploads/4a891ef6-ff72-4b5a-b33c-0dc33dd3aa26.png" alt="Tensens Icon" className="h-4 w-4" />
          <span className="font-medium">{book.points} Tensens</span>
        </div>
      </CardContent>
    </Card>
  );
};
