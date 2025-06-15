import React from 'react';
import { Book } from '@/types/Book';
import { Info } from 'lucide-react';
import { BookCarousel } from './BookCarousel';

interface BookLibraryProps {
  books: Book[];
  onBookSelect: (book: Book) => void;
}

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
        emptyMessage="Aucun livre dans cette catégorie pour le moment."
      />

      <BookCarousel
        title="Les conseils de Paco"
        books={pacoBooks}
        onBookSelect={onBookSelect}
        emptyMessage="Aucun livre dans cette catégorie pour le moment."
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
