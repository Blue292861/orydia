
import React, { useState } from 'react';
import { Book } from '@/types/Book';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, X, Coins } from 'lucide-react';
import { useUserStats } from '@/contexts/UserStatsContext';
import { useToast } from '@/hooks/use-toast';
import { TextSizeControls } from '@/components/TextSizeControls';

interface BookReaderProps {
  book: Book;
  onClose: () => void;
}

export const BookReader: React.FC<BookReaderProps> = ({ book, onClose }) => {
  const { userStats, addPointsForBook } = useUserStats();
  const { toast } = useToast();
  const [hasFinished, setHasFinished] = useState(false);
  const [fontSize, setFontSize] = useState(16);
  const [highContrast, setHighContrast] = useState(false);
  
  const isAlreadyRead = userStats.booksRead.includes(book.id);
  
  const handleFinishReading = () => {
    if (!isAlreadyRead && !hasFinished) {
      addPointsForBook(book.id, book.points);
      setHasFinished(true);
      toast({
        title: "Book Completed!",
        description: `You earned ${book.points} points for reading "${book.title}"`,
      });
    }
  };
  
  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <Button variant="ghost" onClick={onClose} className="flex items-center gap-1">
          <ChevronLeft className="h-4 w-4" />
          Back to Library
        </Button>
        
        <div className="text-center">
          <h2 className="font-bold">{book.title}</h2>
          <p className="text-sm text-muted-foreground">{book.author}</p>
          <div className="flex items-center justify-center gap-1 mt-1">
            <Coins className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">{book.points} points</span>
          </div>
        </div>
        
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="mb-4">
        <TextSizeControls 
          fontSize={fontSize} 
          onFontSizeChange={setFontSize}
          highContrast={highContrast}
          onHighContrastChange={setHighContrast}
        />
      </div>
      
      <div className={`bg-card rounded-lg p-8 shadow-md ${highContrast ? 'bg-black text-white' : ''}`}>
        <div className="prose prose-lg max-w-none">
          {book.content.split('\n\n').map((paragraph, index) => (
            <p 
              key={index} 
              className={`mb-4 leading-relaxed ${highContrast ? 'text-white' : 'text-foreground'}`}
              style={{ fontSize: `${fontSize}px` }}
            >
              {paragraph}
            </p>
          ))}
        </div>
        
        <div className="mt-8 pt-6 border-t flex justify-center">
          {isAlreadyRead ? (
            <div className="text-center text-muted-foreground">
              <Coins className="h-6 w-6 mx-auto mb-2" />
              <p>You've already earned points for this book</p>
            </div>
          ) : hasFinished ? (
            <div className="text-center text-green-600">
              <Coins className="h-6 w-6 mx-auto mb-2" />
              <p>Points awarded! Well done!</p>
            </div>
          ) : (
            <Button onClick={handleFinishReading} className="flex items-center gap-2">
              <Coins className="h-4 w-4" />
              Finish Reading & Earn {book.points} Points
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
