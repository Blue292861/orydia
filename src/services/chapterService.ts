import { supabase } from '@/integrations/supabase/client';
import { Chapter, InteractiveChoice, UserChapterProgress, UserStoryChoice } from '@/types/Book';

export const fetchChaptersByBookId = async (bookId: string): Promise<Chapter[]> => {
  const { data, error } = await supabase
    .from('book_chapters')
    .select(`
      *,
      interactive_choices!interactive_choices_chapter_id_fkey (*)
    `)
    .eq('book_id', bookId)
    .order('chapter_number', { ascending: true });

  if (error) throw error;

  return data.map((chapter: any) => ({
    id: chapter.id,
    bookId: chapter.book_id,
    chapterNumber: chapter.chapter_number,
    title: chapter.title,
    content: chapter.content,
    isInteractive: chapter.is_interactive,
    createdAt: chapter.created_at,
    updatedAt: chapter.updated_at,
    choices: chapter.interactive_choices?.map((choice: any) => ({
      id: choice.id,
      chapterId: choice.chapter_id,
      choiceText: choice.choice_text,
      consequenceText: choice.consequence_text,
      nextChapterId: choice.next_chapter_id,
      pointsModifier: choice.points_modifier,
      createdAt: choice.created_at,
    })) || [],
  }));
};

export const extractChaptersFromContent = async (
  bookId: string, 
  content: string, 
  autoSplit: boolean = false
): Promise<{ success: boolean; chapters: Chapter[]; totalChapters: number; interactiveChapters: number }> => {
  const { data, error } = await supabase.functions.invoke('extract-chapters', {
    body: { bookId, content, autoSplit }
  });

  if (error) throw error;
  return data;
};

export const addInteractiveChoice = async (choice: Omit<InteractiveChoice, 'id' | 'createdAt'>): Promise<InteractiveChoice> => {
  const { data, error } = await supabase
    .from('interactive_choices')
    .insert({
      chapter_id: choice.chapterId,
      choice_text: choice.choiceText,
      consequence_text: choice.consequenceText,
      next_chapter_id: choice.nextChapterId,
      points_modifier: choice.pointsModifier,
    })
    .select()
    .single();

  if (error) throw error;

  return {
    id: data.id,
    chapterId: data.chapter_id,
    choiceText: data.choice_text,
    consequenceText: data.consequence_text,
    nextChapterId: data.next_chapter_id,
    pointsModifier: data.points_modifier,
    createdAt: data.created_at,
  };
};

export const getUserChapterProgress = async (bookId: string): Promise<UserChapterProgress[]> => {
  const { data, error } = await supabase
    .from('user_chapter_progress')
    .select('*')
    .eq('book_id', bookId);

  if (error) throw error;

  return data.map((progress: any) => ({
    id: progress.id,
    userId: progress.user_id,
    bookId: progress.book_id,
    chapterId: progress.chapter_id,
    isCompleted: progress.is_completed,
    completedAt: progress.completed_at,
    createdAt: progress.created_at,
  }));
};

export const markChapterCompleted = async (chapterId: string, bookId: string): Promise<void> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { error } = await supabase
    .from('user_chapter_progress')
    .upsert({
      user_id: user.id,
      book_id: bookId,
      chapter_id: chapterId,
      is_completed: true,
      completed_at: new Date().toISOString(),
    }, {
      onConflict: 'user_id,chapter_id'
    });

  if (error) throw error;
};

export const saveUserChoice = async (choice: Omit<UserStoryChoice, 'id' | 'chosenAt'>): Promise<void> => {
  const { error } = await supabase
    .from('user_story_choices')
    .upsert({
      user_id: choice.userId,
      book_id: choice.bookId,
      chapter_id: choice.chapterId,
      choice_id: choice.choiceId,
    }, {
      onConflict: 'user_id,chapter_id'
    });

  if (error) throw error;
};

export const getUserChoicesForBook = async (bookId: string): Promise<UserStoryChoice[]> => {
  const { data, error } = await supabase
    .from('user_story_choices')
    .select('*')
    .eq('book_id', bookId);

  if (error) throw error;

  return data.map((choice: any) => ({
    id: choice.id,
    userId: choice.user_id,
    bookId: choice.book_id,
    chapterId: choice.chapter_id,
    choiceId: choice.choice_id,
    chosenAt: choice.chosen_at,
  }));
};

export const startReadingBook = async (bookId: string, firstChapterId: string): Promise<void> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { error } = await supabase
    .from('user_chapter_progress')
    .upsert({
      user_id: user.id,
      book_id: bookId,
      chapter_id: firstChapterId,
      is_completed: false,
    }, {
      onConflict: 'user_id,chapter_id'
    });

  if (error) throw error;
};

export const removeBookFromProgress = async (bookId: string): Promise<void> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  const { error } = await supabase
    .from('user_chapter_progress')
    .delete()
    .eq('user_id', user.id)
    .eq('book_id', bookId)
    .eq('is_completed', false);

  if (error) throw error;
};