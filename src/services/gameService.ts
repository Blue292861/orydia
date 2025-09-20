import { supabase } from "@/integrations/supabase/client";
import { Game, GameChapter, GameChoice } from "@/types/Game";

export const gameService = {
  // Games
  async getAllGames(): Promise<Game[]> {
    const { data, error } = await supabase
      .from('games')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    // Map data to include genres field
    const mappedGames = (data || []).map(game => ({
      ...game,
      genres: (game as any).genres || []
    }));
    
    return mappedGames;
  },

  async getFeaturedGames(): Promise<Game[]> {
    const { data, error } = await supabase
      .from('games')
      .select('*')
      .eq('is_featured', true)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    const mappedGames = (data || []).map(game => ({
      ...game,
      genres: (game as any).genres || []
    }));
    
    return mappedGames;
  },

  async getGameById(id: string): Promise<Game | null> {
    const { data, error } = await supabase
      .from('games')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    
    if (error) throw error;
    return data ? { ...data, genres: (data as any).genres || [] } : null;
  },

  async createGame(game: Omit<Game, 'id' | 'created_at' | 'updated_at'>): Promise<Game> {
    const { data, error } = await supabase
      .from('games')
      .insert({
        ...game,
        genres: game.genres || []
      })
      .select()
      .single();
    
    if (error) throw error;
    return { ...data, genres: (data as any).genres || [] };
  },

  async updateGame(id: string, updates: Partial<Game>): Promise<Game> {
    const { data, error } = await supabase
      .from('games')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return { ...data, genres: (data as any).genres || [] };
  },

  async deleteGame(id: string): Promise<void> {
    const { error } = await supabase
      .from('games')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // Game Chapters
  async getGameChapters(gameId: string): Promise<GameChapter[]> {
    const { data, error } = await supabase
      .from('game_chapters')
      .select('*')
      .eq('game_id', gameId)
      .order('chapter_number');
    
    if (error) throw error;
    return data || [];
  },

  async getChapterById(id: string): Promise<GameChapter | null> {
    const { data, error } = await supabase
      .from('game_chapters')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    
    if (error) throw error;
    return data;
  },

  async createChapter(chapter: Omit<GameChapter, 'id' | 'created_at' | 'updated_at'>): Promise<GameChapter> {
    const { data, error } = await supabase
      .from('game_chapters')
      .insert(chapter)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateChapter(id: string, updates: Partial<GameChapter>): Promise<GameChapter> {
    const { data, error } = await supabase
      .from('game_chapters')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async deleteChapter(id: string): Promise<void> {
    const { error } = await supabase
      .from('game_chapters')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  // Game Choices
  async getChapterChoices(chapterId: string): Promise<GameChoice[]> {
    const { data, error } = await supabase
      .from('game_choices')
      .select('*')
      .eq('chapter_id', chapterId)
      .order('created_at');
    
    if (error) throw error;
    return data || [];
  },

  async createChoice(choice: Omit<GameChoice, 'id' | 'created_at'>): Promise<GameChoice> {
    const { data, error } = await supabase
      .from('game_choices')
      .insert(choice)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateChoice(id: string, updates: Partial<GameChoice>): Promise<GameChoice> {
    const { data, error } = await supabase
      .from('game_choices')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async deleteChoice(id: string): Promise<void> {
    const { error } = await supabase
      .from('game_choices')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
};