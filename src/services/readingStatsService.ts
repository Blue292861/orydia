
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
