// src/services/rareBookService.ts
import { supabase } from '@/integrations/supabase/client';
import { Book } from '@/types/Book';

export interface UserRareBook {
  id: string;
  user_id: string;
  book_id: string;
  discovered_at: string;
  book?: Book;
}

/**
 * Vérifie si un utilisateur a déjà découvert un livre rare
 */
export const hasUserDiscoveredRareBook = async (
  userId: string,
  bookId: string
): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('user_rare_books')
      .select('id')
      .eq('user_id', userId)
      .eq('book_id', bookId)
      .maybeSingle();

    if (error) throw error;
    return !!data;
  } catch (error) {
    console.error('Error checking rare book discovery:', error);
    return false;
  }
};

/**
 * Ajoute un livre rare à la collection d'un utilisateur
 */
export const addRareBookToCollection = async (
  userId: string,
  bookId: string
): Promise<void> => {
  try {
    const { error } = await supabase
      .from('user_rare_books')
      .insert({
        user_id: userId,
        book_id: bookId,
      });

    if (error) throw error;
  } catch (error) {
    console.error('Error adding rare book to collection:', error);
    throw error;
  }
};

/**
 * Récupère tous les livres rares découverts par un utilisateur
 */
export const getUserRareBooks = async (userId: string): Promise<Book[]> => {
  try {
    const { data, error } = await supabase
      .from('user_rare_books')
      .select('book_id')
      .eq('user_id', userId)
      .order('discovered_at', { ascending: false });

    if (error) throw error;

    if (!data || data.length === 0) return [];

    // Récupérer les détails complets des livres
    const bookIds = data.map(item => item.book_id);
    const { data: books, error: booksError } = await supabase
      .from('books')
      .select('*')
      .in('id', bookIds);

    if (booksError) throw booksError;

    // Mapper les livres au format Book
    const mappedBooks: Book[] = (books || []).map(book => ({
      id: book.id,
      title: book.title,
      author: book.author,
      coverUrl: book.cover_url,
      content: book.content,
      summary: book.summary,
      points: book.points,
      tags: book.tags || [],
      genres: (book as any).genres || [],
      isPremium: book.is_premium,
      isMonthSuccess: book.is_month_success,
      isPacoFavourite: book.is_paco_favourite,
      hasChapters: book.has_chapters || false,
      isInteractive: book.is_interactive || false,
      isAdultContent: book.is_adult_content || false,
      isRare: book.is_rare || false,
    }));

    return mappedBooks;
  } catch (error) {
    console.error('Error fetching user rare books:', error);
    return [];
  }
};
