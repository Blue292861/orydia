
import React from 'react';
import { Book } from '@/types/Book';
import { Info } from 'lucide-react';
import { BookCarousel } from './BookCarousel';
import { useResponsive } from '@/hooks/useResponsive';

interface BookLibraryProps {
  books: Book[];
  onBookSelect: (book: Book) => void;
}

export const BookLibrary: React.FC<BookLibraryProps> = ({ books, onBookSelect }) => {
  const { isMobile } = useResponsive();
  const successBooks = books.filter(b => b.isMonthSuccess);
  const pacoBooks = books.filter(b => b.isPacoFavourite);

  return (
    <div className={`max-w-full overflow-hidden ${isMobile ? 'space-y-4' : 'space-y-6 sm:space-y-8'}`}>
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
      
      <div className={`${isMobile ? 'space-y-2' : 'space-y-4'}`}>
        <h2 className={`font-cursive text-wood-300 px-2 ${
          isMobile ? 'text-lg' : 'text-2xl sm:text-3xl lg:text-4xl'
        }`}>
          En cours de lecture
        </h2>
        <div className={`bg-wood-800/60 border border-wood-700 rounded-lg flex items-center justify-center text-center text-wood-200 mx-2 ${
          isMobile ? 'p-3' : 'p-4 sm:p-6'
        }`}>
          <Info className={`mr-2 text-primary shrink-0 ${isMobile ? 'h-4 w-4' : 'h-5 w-5 sm:h-6 sm:w-6'}`} />
          <div>
            <p className={`font-semibold ${isMobile ? 'text-sm' : 'text-base'}`}>
              Bientôt disponible !
            </p>
            <p className={`text-wood-400 ${isMobile ? 'text-xs' : 'text-sm'}`}>
              La fonctionnalité de suivi des lectures en cours est en préparation.
            </p>
          </div>
        </div>
      </div>

      {books.length === 0 && (
        <div className="text-center py-12 px-4">
          <p className={`text-forest-200 ${isMobile ? 'text-sm' : 'text-base'}`}>
            Aucun livre dans votre bibliothèque pour le moment. Allez dans le panneau d'administration pour en ajouter.
          </p>
        </div>
      )}
    </div>
  );
};
