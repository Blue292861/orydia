
import React from 'react';
import { Book } from '@/types/Book';
import { Card, CardContent } from '@/components/ui/card';
import { useUserStats } from '@/contexts/UserStatsContext';
import { Coins, CheckCircle, Info } from 'lucide-react';

interface BookLibraryProps {
  books: Book[];
  onBookSelect: (book: Book) => void;
}

const BookCard = ({ book, onBookSelect, large = false }: { book: Book; onBookSelect: (book: Book) => void; large?: boolean }) => {
  const { userStats } = useUserStats();
  const isRead = userStats.booksRead.includes(book.id);

  return (
    <Card
      className={`overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 bg-wood-800/60 border-wood-700 flex-shrink-0 ${large ? 'w-60 md:w-72' : 'w-40 md:w-48'} ${isRead ? 'ring-2 ring-primary/50' : ''}`}
      onClick={() => onBookSelect(book)}
    >
      <div className={`relative aspect-[2/3]`}>
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
          <Coins className="h-4 w-4 text-amber-400" />
          <span className="font-medium">{book.points} points</span>
        </div>
      </CardContent>
    </Card>
  );
};

const BookCarousel = ({ title, books, onBookSelect, large = false }: { title: string; books: Book[]; onBookSelect: (book: Book) => void; large?: boolean }) => {
  if (books.length === 0) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-wood-100">{title}</h2>
        <div className="text-sm text-wood-300">Aucun livre dans cette catégorie pour le moment.</div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-wood-100">{title}</h2>
      <div className="flex space-x-4 overflow-x-auto pb-4 -mb-4">
        {books.map((book) => (
          <BookCard key={book.id} book={book} onBookSelect={onBookSelect} large={large} />
        ))}
        <div className="flex-shrink-0 w-1"></div> {/* padding at the end */}
      </div>
    </div>
  );
};

export const BookLibrary: React.FC<BookLibraryProps> = ({ books, onBookSelect }) => {
  const successBooks = books.filter(b => b.isMonthSuccess);
  const pacoBooks = books.filter(b => b.isPacoFavourite);

  return (
    <div className="space-y-8">
      <BookCarousel
        title="Succès du mois"
        books={successBooks}
        onBookSelect={onBookSelect}
        large={true}
      />

      <BookCarousel
        title="Les conseils de Paco"
        books={pacoBooks}
        onBookSelect={onBookSelect}
      />
      
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-wood-100">En cours de lecture</h2>
        <div className="bg-wood-800/60 border border-wood-700 rounded-lg p-6 flex items-center justify-center text-center text-wood-200">
          <Info className="h-6 w-6 mr-4 text-primary shrink-0" />
          <div>
            <p className="font-semibold">Bientôt disponible !</p>
            <p className="text-sm text-wood-400">La fonctionnalité de suivi des lectures en cours est en préparation.</p>
          </div>
        </div>
      </div>

      {books.length === 0 && (
        <div className="text-center py-12">
          <p className="text-forest-200">Aucun livre dans votre bibliothèque pour le moment. Allez dans le panneau d'administration pour en ajouter.</p>
        </div>
      )}
    </div>
  );
};
