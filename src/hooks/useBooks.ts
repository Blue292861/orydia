
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Book } from '@/types/Book';
import { sanitizeText, validateTextLength, validateUrl, validatePoints } from '@/utils/security';

export const useBooks = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const validateBook = (book: Book): string[] => {
    const errors: string[] = [];

    if (!book.title || !validateTextLength(book.title, 200)) {
      errors.push('Le titre est requis et doit faire moins de 200 caractères');
    }

    if (!book.author || !validateTextLength(book.author, 100)) {
      errors.push('L\'auteur est requis et doit faire moins de 100 caractères');
    }

    if (!book.coverUrl || !validateUrl(book.coverUrl)) {
      errors.push('URL de couverture invalide');
    }

    if (!book.content || !validateTextLength(book.content, 500000)) {
      errors.push('Le contenu est requis et doit faire moins de 500 000 caractères');
    }

    if (!validatePoints(book.points)) {
      errors.push('Les points doivent être un nombre entier entre 0 et 100 000');
    }

    return errors;
  };

  const sanitizeBook = (book: Book): Book => ({
    ...book,
    title: sanitizeText(book.title),
    author: sanitizeText(book.author),
    content: sanitizeText(book.content),
    tags: book.tags.map(tag => sanitizeText(tag)).filter(tag => tag.length > 0),
  });

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Database error:', error.code);
        throw new Error('Erreur de base de données');
      }

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
      const sanitizedBook = sanitizeBook(book);
      const validationErrors = validateBook(sanitizedBook);

      if (validationErrors.length > 0) {
        toast({
          title: "Erreur de validation",
          description: validationErrors.join(', '),
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('books')
        .insert({
          title: sanitizedBook.title,
          author: sanitizedBook.author,
          cover_url: sanitizedBook.coverUrl,
          content: sanitizedBook.content,
          points: sanitizedBook.points,
          tags: sanitizedBook.tags,
          is_premium: sanitizedBook.isPremium,
          is_month_success: sanitizedBook.isMonthSuccess,
          is_paco_favourite: sanitizedBook.isPacoFavourite,
        });

      if (error) {
        console.error('Database error:', error.code);
        throw new Error('Erreur de base de données');
      }
      
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
      const sanitizedBook = sanitizeBook(book);
      const validationErrors = validateBook(sanitizedBook);

      if (validationErrors.length > 0) {
        toast({
          title: "Erreur de validation",
          description: validationErrors.join(', '),
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('books')
        .update({
          title: sanitizedBook.title,
          author: sanitizedBook.author,
          cover_url: sanitizedBook.coverUrl,
          content: sanitizedBook.content,
          points: sanitizedBook.points,
          tags: sanitizedBook.tags,
          is_premium: sanitizedBook.isPremium,
          is_month_success: sanitizedBook.isMonthSuccess,
          is_paco_favourite: sanitizedBook.isPacoFavourite,
        })
        .eq('id', sanitizedBook.id);

      if (error) {
        console.error('Database error:', error.code);
        throw new Error('Erreur de base de données');
      }
      
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
      if (!id || typeof id !== 'string') {
        throw new Error('ID invalide');
      }

      const { error } = await supabase
        .from('books')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Database error:', error.code);
        throw new Error('Erreur de base de données');
      }
      
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
