// src/pages/WorkPage.tsx

import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchBookFromDB } from '@/services/bookService';
import { Book } from '@/types/Book';
import { BookReader } from '@/components/BookReader';
import { TextReader } from '@/components/TextReader'; // Composant de lecture de texte existant
import { EpubReader } from '@/components/EpubReader'; // Nouveau composant
import { Separator } from '@/components/ui/separator';
import { WorkMeta } from '@/components/WorkMeta';
import { Loader2 } from 'lucide-react';

export const WorkPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getBook = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const fetchedBook = await fetchBookFromDB(id);
        setBook(fetchedBook);
      } catch (err) {
        setError("Erreur lors du chargement de l'oeuvre.");
      } finally {
        setLoading(false);
      }
    };

    getBook();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return <div className="p-4 text-center text-red-500">{error}</div>;
  }

  if (!book) {
    return <div className="p-4 text-center">L'oeuvre n'a pas été trouvée.</div>;
  }
  
  // Fonction utilitaire pour vérifier si la chaîne est une URL
  const isUrl = (str: string) => {
    try {
      new URL(str);
      return true;
    } catch (_) {
      return false;
    }
  };
  
  // Condition pour déterminer quel lecteur utiliser
  const isEpub = book.content && isUrl(book.content) && book.content.endsWith('.epub');

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <WorkMeta book={book} />
      <Separator className="my-6" />
      <div className="reader-container">
        {isEpub ? (
          <EpubReader url={book.content} />
        ) : (
          <TextReader content={book.content} />
        )}
      </div>
    </div>
  );
};
