import { supabase } from "@/integrations/supabase/client";
import { AudiobookChapter, AudiobookProgress, AudiobookWithProgress } from "@/types/AudiobookChapter";

export const audiobookChapterService = {
  async getChaptersByAudiobookId(audiobookId: string): Promise<AudiobookChapter[]> {
    const { data, error } = await supabase
      .from('audiobook_chapters')
      .select('*')
      .eq('audiobook_id', audiobookId)
      .order('chapter_number', { ascending: true });
    
    if (error) throw error;
    return data || [];
  },

  async getChaptersWithProgress(audiobookId: string, userId?: string): Promise<AudiobookWithProgress[]> {
    if (!userId) {
      // Si pas d'utilisateur connecté, retourner juste les chapitres
      const chapters = await this.getChaptersByAudiobookId(audiobookId);
      return chapters.map(chapter => ({ ...chapter, progress: undefined }));
    }

    const { data, error } = await supabase
      .from('audiobook_chapters')
      .select(`
        *,
        audiobook_progress!left(
          id,
          current_time_seconds,
          is_completed,
          last_played_at
        )
      `)
      .eq('audiobook_id', audiobookId)
      .eq('audiobook_progress.user_id', userId)
      .order('chapter_number', { ascending: true });
    
    if (error) throw error;
    return data || [];
  },

  async createChapter(chapter: Omit<AudiobookChapter, 'id' | 'created_at' | 'updated_at'>): Promise<AudiobookChapter> {
    const { data, error } = await supabase
      .from('audiobook_chapters')
      .insert(chapter)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateChapter(id: string, updates: Partial<AudiobookChapter>): Promise<void> {
    const { error } = await supabase
      .from('audiobook_chapters')
      .update(updates)
      .eq('id', id);
    
    if (error) throw error;
  },

  async deleteChapter(id: string): Promise<void> {
    const { error } = await supabase
      .from('audiobook_chapters')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  async saveProgress(progress: Omit<AudiobookProgress, 'id' | 'created_at' | 'updated_at'>): Promise<void> {
    const { error } = await supabase
      .from('audiobook_progress')
      .upsert({
        user_id: progress.user_id,
        audiobook_id: progress.audiobook_id,
        chapter_id: progress.chapter_id,
        current_time_seconds: progress.current_time_seconds,
        is_completed: progress.is_completed,
        last_played_at: progress.last_played_at
      }, {
        onConflict: 'user_id,audiobook_id,chapter_id'
      });
    
    if (error) throw error;
  },

  async getRecentProgress(userId: string, limit: number = 10): Promise<AudiobookWithProgress[]> {
    const { data, error } = await supabase
      .from('audiobook_progress')
      .select(`
        *,
        audiobook_chapters!inner(*),
        audiobooks!inner(*)
      `)
      .eq('user_id', userId)
      .eq('is_completed', false)
      .order('last_played_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data?.map(item => ({
      ...item.audiobook_chapters,
      progress: {
        id: item.id,
        user_id: item.user_id,
        audiobook_id: item.audiobook_id,
        chapter_id: item.chapter_id,
        current_time_seconds: item.current_time_seconds,
        is_completed: item.is_completed,
        last_played_at: item.last_played_at,
        created_at: item.created_at,
        updated_at: item.updated_at
      }
    })) || [];
  }
};