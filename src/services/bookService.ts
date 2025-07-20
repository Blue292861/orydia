
import { supabase } from '@/integrations/supabase/client';
import { Book } from '@/types/Book';

export const fetchBooksFromDB = async (): Promise<Book[]> => {
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
    summary: book.summary,
    points: book.points,
    tags: book.tags || [],
    isPremium: book.is_premium,
    isMonthSuccess: book.is_month_success,
    isPacoFavourite: book.is_paco_favourite,
    hasChapters: book.has_chapters || false,
    isInteractive: book.is_interactive || false,
  }));

  return mappedBooks;
};

export const addBookToDB = async (book: Book): Promise<void> => {
  const { error } = await supabase
    .from('books')
    .insert({
      title: book.title,
      author: book.author,
      cover_url: book.coverUrl,
      content: book.content,
      summary: book.summary,
      points: book.points,
      tags: book.tags,
      is_premium: book.isPremium,
      is_month_success: book.isMonthSuccess,
      is_paco_favourite: book.isPacoFavourite,
      has_chapters: book.hasChapters,
      is_interactive: book.isInteractive,
    });

  if (error) {
    console.error('Database error:', error.code);
    throw new Error('Erreur de base de données');
  }
};

export const updateBookInDB = async (book: Book): Promise<void> => {
  const { error } = await supabase
    .from('books')
    .update({
      title: book.title,
      author: book.author,
      cover_url: book.coverUrl,
      content: book.content,
      summary: book.summary,
      points: book.points,
      tags: book.tags,
      is_premium: book.isPremium,
      is_month_success: book.isMonthSuccess,
      is_paco_favourite: book.isPacoFavourite,
      has_chapters: book.hasChapters,
      is_interactive: book.isInteractive,
    })
    .eq('id', book.id);

  if (error) {
    console.error('Database error:', error.code);
    throw new Error('Erreur de base de données');
  }
};

export const deleteBookFromDB = async (id: string): Promise<void> => {
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
};
