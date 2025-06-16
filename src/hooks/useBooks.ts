
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Book } from '@/types/Book';

export const useBooks = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchBooks = async () => {
    try {
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const mappedBooks: Book[] = (data || []).map(book => ({
        id: book.id,
        title: book.title,
        author: book.author,
        coverUrl: book.cover_url,
        content: book.content,
        points: book.points,
        tags: book.tags || [],
        isPremium: book.is_premium,
        isMonthSuccess: book.is_month_success,
        isPacoFavourite: book.is_paco_favourite,
      }));

      setBooks(mappedBooks);
    } catch (error) {
      console.error('Error fetching books:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les livres",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addBook = async (book: Book) => {
    try {
      const { error } = await supabase
        .from('books')
        .insert({
          title: book.title,
          author: book.author,
          cover_url: book.coverUrl,
          content: book.content,
          points: book.points,
          tags: book.tags,
          is_premium: book.isPremium,
          is_month_success: book.isMonthSuccess,
          is_paco_favourite: book.isPacoFavourite,
        });

      if (error) throw error;
      
      toast({
        title: "Succès",
        description: "Livre ajouté avec succès",
      });
      
      fetchBooks();
    } catch (error) {
      console.error('Error adding book:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter le livre",
        variant: "destructive",
      });
    }
  };

  const updateBook = async (book: Book) => {
    try {
      const { error } = await supabase
        .from('books')
        .update({
          title: book.title,
          author: book.author,
          cover_url: book.coverUrl,
          content: book.content,
          points: book.points,
          tags: book.tags,
          is_premium: book.isPremium,
          is_month_success: book.isMonthSuccess,
          is_paco_favourite: book.isPacoFavourite,
        })
        .eq('id', book.id);

      if (error) throw error;
      
      toast({
        title: "Succès",
        description: "Livre mis à jour avec succès",
      });
      
      fetchBooks();
    } catch (error) {
      console.error('Error updating book:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le livre",
        variant: "destructive",
      });
    }
  };

  const deleteBook = async (id: string) => {
    try {
      const { error } = await supabase
        .from('books')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast({
        title: "Succès",
        description: "Livre supprimé avec succès",
      });
      
      fetchBooks();
    } catch (error) {
      console.error('Error deleting book:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le livre",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  return {
    books,
    loading,
    addBook,
    updateBook,
    deleteBook,
    refetch: fetchBooks,
  };
};
