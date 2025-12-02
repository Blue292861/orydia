import React, { useState, useEffect } from 'react';
import { Book } from '@/types/Book';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookCard } from '@/components/BookCard';
import { getUserRareBooks } from '@/services/rareBookService';
import { Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createBookPath } from '@/utils/slugUtils';

interface RareBooksCollectionProps {
  userId: string;
}

export const RareBooksCollection: React.FC<RareBooksCollectionProps> = ({ userId }) => {
  const [rareBooks, setRareBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadRareBooks = async () => {
      setLoading(true);
      try {
        const books = await getUserRareBooks(userId);
        setRareBooks(books);
      } catch (error) {
        console.error('Error loading rare books:', error);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      loadRareBooks();
    }
  }, [userId]);

  if (loading) {
    return (
      <Card className="bg-wood-800/60 border-wood-700">
        <CardContent className="pt-6 flex justify-center items-center min-h-[200px]">
          <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-wood-800/60 border-wood-700">
      <CardHeader>
        <CardTitle className="text-wood-100 flex items-center gap-2">
          <span className="text-2xl">💎</span>
          Mes livres rares ({rareBooks.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {rareBooks.length === 0 ? (
          <div className="text-center py-12 space-y-2">
            <p className="text-wood-300 text-lg">Aucun livre rare découvert pour le moment</p>
            <p className="text-wood-400 text-sm">
              Les livres rares sont accessibles via des liens spéciaux.
              <br />
              Restez à l'affût des annonces pour découvrir ces œuvres exclusives !
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {rareBooks.map((book) => (
              <BookCard
                key={book.id}
                book={book}
                onBookSelect={(b) => navigate(createBookPath(b.author, b.title))}
                variant="grid"
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
