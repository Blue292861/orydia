
import React, { useState } from 'react';
import { Book } from '@/types/Book';
import { Button } from '@/components/ui/button';
import { ChevronLeft, X, Star } from 'lucide-react';
import { useUserStats } from '@/contexts/UserStatsContext';
import { useToast } from '@/components/ui/use-toast';
import { TextSizeControls } from '@/components/TextSizeControls';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface BookReaderProps {
  book: Book;
  onBack: () => void;
}

export const BookReader: React.FC<BookReaderProps> = ({ book, onBack }) => {
  const { userStats, addPointsForBook } = useUserStats();
  const { session, subscription } = useAuth();
  const { toast } = useToast();
  const [hasFinished, setHasFinished] = useState(false);
  const [fontSize, setFontSize] = useState(16);
  const [highContrast, setHighContrast] = useState(false);
  
  const isAlreadyRead = userStats.booksRead.includes(book.id);
  const isPremium = subscription.isPremium;
  const pointsToWin = isPremium ? book.points * 2 : book.points;
  
  const handleFinishReading = async () => {
    if (!session) {
       toast({ title: "Erreur", description: "Vous devez être connecté.", variant: "destructive" });
       return;
    }
    if (!isAlreadyRead && !hasFinished) {
      addPointsForBook(book.id, pointsToWin);

      const { error } = await supabase.from('book_completions').insert({
        user_id: session.user.id,
        book_id: book.id,
      });
      
      if (error) {
        console.error("Erreur lors de l'enregistrement de la lecture:", error);
        // Logique de compensation si nécessaire
      }

      setHasFinished(true);
      toast({
        title: "Livre terminé !",
        description: `Vous avez gagné ${pointsToWin} Tensens pour avoir lu "${book.title}"`,
      });
    }
  };
  
  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <Button variant="ghost" onClick={onBack} className="flex items-center gap-1">
          <ChevronLeft className="h-4 w-4" />
          Retour à la Bibliothèque
        </Button>
        
        <div className="text-center">
          <h2 className="font-bold">{book.title}</h2>
          <p className="text-sm text-muted-foreground">{book.author}</p>
          <div className="flex items-center justify-center gap-1 mt-1">
            <img src="/lovable-uploads/4a891ef6-ff72-4b5a-b33c-0dc33dd3aa26.png" alt="Tensens Icon" className="h-4 w-4" />
            <span className="text-sm font-medium">{book.points} Tensens</span>
            {isPremium && (
              <div className="flex items-center gap-1 text-yellow-500 ml-2 px-2 py-1 rounded-full bg-yellow-500/10 text-xs font-semibold">
                <Star className="h-3 w-3 fill-current" />
                <span>x2 BONUS</span>
              </div>
            )}
          </div>
        </div>
        
        <Button variant="ghost" size="icon" onClick={onBack}>
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
      
      <div className={`rounded-lg p-8 shadow-md ${
        highContrast 
          ? 'bg-black text-white border border-gray-600' 
          : 'bg-card text-card-foreground'
      }`}>
        <div className="prose prose-lg max-w-none">
          {book.content.split('\n\n').map((paragraph, index) => (
            <p 
              key={index} 
              className={`mb-4 leading-relaxed ${
                highContrast ? 'text-white' : 'text-foreground'
              }`}
              style={{ fontSize: `${fontSize}px` }}
            >
              {paragraph}
            </p>
          ))}
        </div>
        
        <div className="mt-8 pt-6 border-t flex justify-center">
          {isAlreadyRead ? (
            <div className={`text-center ${highContrast ? 'text-gray-300' : 'text-muted-foreground'}`}>
              <img src="/lovable-uploads/4a891ef6-ff72-4b5a-b33c-0dc33dd3aa26.png" alt="Tensens Icon" className="h-6 w-6 mx-auto mb-2" />
              <p>Vous avez déjà gagné des Tensens pour ce livre</p>
            </div>
          ) : hasFinished ? (
            <div className="text-center text-green-600">
              <img src="/lovable-uploads/4a891ef6-ff72-4b5a-b33c-0dc33dd3aa26.png" alt="Tensens Icon" className="h-6 w-6 mx-auto mb-2" />
              <p>Tensens accordés ! Bien joué !</p>
            </div>
          ) : (
            <Button onClick={handleFinishReading} className="flex items-center gap-2">
              <img src="/lovable-uploads/4a891ef6-ff72-4b5a-b33c-0dc33dd3aa26.png" alt="Tensens Icon" className="h-4 w-4" />
              Terminer la lecture & Gagner {pointsToWin} Tensens
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
