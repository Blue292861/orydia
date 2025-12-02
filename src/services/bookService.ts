// src/services/bookService.ts
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
      genres: book.genres,
      is_premium: book.isPremium,
      is_month_success: book.isMonthSuccess,
      is_paco_favourite: book.isPacoFavourite,
      has_chapters: book.hasChapters,
      is_interactive: book.isInteractive,
      is_adult_content: book.isAdultContent,
      is_rare: book.isRare,
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
      genres: book.genres,
      is_premium: book.isPremium,
      is_month_success: book.isMonthSuccess,
      is_paco_favourite: book.isPacoFavourite,
      has_chapters: book.hasChapters,
      is_interactive: book.isInteractive,
      is_adult_content: book.isAdultContent,
      is_rare: book.isRare,
    })
    .eq('id', book.id);

  if (error) {
    console.error('Database error:', error.code);
    throw new Error('Erreur de base de données');
  }
};

const extractFilePathFromUrl = (url: string): string | null => {
  if (!url) return null;
  // Extract file path from Supabase Storage URL
  const match = url.match(/\/storage\/v1\/object\/public\/[^\/]+\/(.+)$/);
  return match ? match[1] : null;
};

export const deleteBookFromDB = async (id: string): Promise<void> => {
  if (!id || typeof id !== 'string') {
    throw new Error('ID invalide');
  }

  // Récupérer les données du livre avant suppression pour nettoyer les fichiers
  const { data: book, error: fetchError } = await supabase
    .from('books')
    .select('cover_url, content')
    .eq('id', id)
    .single();

  if (fetchError) {
    console.error('Error fetching book:', fetchError.code);
    throw new Error('Erreur lors de la récupération du livre');
  }

  // Supprimer les fichiers associés dans Storage
  const filesToDelete: Array<{ bucket: string; path: string }> = [];

  if (book?.cover_url) {
    const coverPath = extractFilePathFromUrl(book.cover_url);
    if (coverPath) {
      filesToDelete.push({ bucket: 'book-covers', path: coverPath });
    }
  }

  if (book?.content && book.content.includes('/storage/v1/object/public/epubs/')) {
    const epubPath = extractFilePathFromUrl(book.content);
    if (epubPath) {
      filesToDelete.push({ bucket: 'epubs', path: epubPath });
    }
  }

  // Supprimer les fichiers de Storage
  for (const file of filesToDelete) {
    try {
      const { error: storageError } = await supabase.storage
        .from(file.bucket)
        .remove([file.path]);
      
      if (storageError) {
        console.warn(`Failed to delete file ${file.path} from ${file.bucket}:`, storageError);
      }
    } catch (error) {
      console.warn(`Error deleting file ${file.path}:`, error);
    }
  }

  // Supprimer l'entrée de la base de données
  const { error } = await supabase
    .from('books')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Database error:', error.code);
    throw new Error('Erreur de base de données');
  }
};
