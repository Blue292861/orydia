
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Book } from '@/types/Book';
import { validateBook, sanitizeBook } from '@/utils/bookValidation';
import { fetchBooksFromDB, addBookToDB, updateBookInDB, deleteBookFromDB } from '@/services/bookService';

export const useBooks = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const mappedBooks = await fetchBooksFromDB();
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

      await addBookToDB(sanitizedBook);
      
      toast({
        title: "Succès",
        description: "Livre ajouté avec succès",
      });
      
      fetchBooks();
    } catch (error: any) {
      console.error('Error adding book:', error);
      
      // Handle authentication errors specifically
      if (error?.message?.includes('refresh_token_not_found') || 
          error?.message?.includes('Invalid Refresh Token') ||
          error?.message?.includes('JWT expired')) {
        toast({
          title: "Session expirée",
          description: "Veuillez vous reconnecter pour ajouter un livre",
          variant: "destructive",
        });
        return;
      }
      
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter le livre. Vérifiez votre connexion.",
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

      await updateBookInDB(sanitizedBook);
      
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
      await deleteBookFromDB(id);
      
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
