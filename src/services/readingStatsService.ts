
import { supabase } from '@/integrations/supabase/client';
import { BookCompletion } from '@/types/ReadingStats';

export const fetchBookCompletions = async (): Promise<BookCompletion[]> => {
  const { data, error } = await supabase
    .from('book_completions')
    .select('*')
    .order('completed_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

export const getRecentReadingProgress = async (userId: string, limit: number = 5) => {
  // Récupérer les progressions de chapitres en cours
  const { data: chapterProgress, error: chapterError } = await supabase
    .from('user_chapter_progress')
    .select(`
      *,
      book_chapters!inner(
        book_id,
        title,
        chapter_number,
        books!inner(
          id,
          title,
          author,
          cover_url
        )
      )
    `)
    .eq('user_id', userId)
    .eq('is_completed', false)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (chapterError) throw chapterError;

  // Récupérer les progressions d'audiobooks
  const { data: audiobookProgress, error: audiobookError } = await supabase
    .from('audiobook_progress')
    .select(`
      *,
      audiobook_chapters!inner(
        audiobook_id,
        title,
        chapter_number,
        audiobooks!inner(
          id,
          name,
          author,
          cover_url
        )
      )
    `)
    .eq('user_id', userId)
    .eq('is_completed', false)
    .order('last_played_at', { ascending: false })
    .limit(limit);

  if (audiobookError) throw audiobookError;

  return {
    books: chapterProgress || [],
    audiobooks: audiobookProgress || []
  };
};
