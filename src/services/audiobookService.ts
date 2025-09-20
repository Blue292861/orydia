import { supabase } from "@/integrations/supabase/client";
import { Audiobook } from "@/types/Audiobook";

export const audiobookService = {
  async getAllAudiobooks(): Promise<Audiobook[]> {
    const { data, error } = await supabase
      .from('audiobooks')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    // Map data to include genres field
    const mappedAudiobooks = (data || []).map(audiobook => ({
      ...audiobook,
      genres: (audiobook as any).genres || []
    }));
    
    return mappedAudiobooks;
  },

  async getFeaturedAudiobooks(): Promise<Audiobook[]> {
    const { data, error } = await supabase
      .from('audiobooks')
      .select('*')
      .eq('is_featured', true)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    const mappedAudiobooks = (data || []).map(audiobook => ({
      ...audiobook,
      genres: (audiobook as any).genres || []
    }));
    
    return mappedAudiobooks;
  },

  async getPacoChronicleAudiobooks(): Promise<Audiobook[]> {
    const { data, error } = await supabase
      .from('audiobooks')
      .select('*')
      .eq('is_paco_chronicle', true)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    const mappedAudiobooks = (data || []).map(audiobook => ({
      ...audiobook,
      genres: (audiobook as any).genres || []
    }));
    
    return mappedAudiobooks;
  },

  async getPremiumAudiobooks(): Promise<Audiobook[]> {
    const { data, error } = await supabase
      .from('audiobooks')
      .select('*')
      .eq('is_premium', true)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    const mappedAudiobooks = (data || []).map(audiobook => ({
      ...audiobook,
      genres: (audiobook as any).genres || []
    }));
    
    return mappedAudiobooks;
  },

  async getFreeAudiobooks(): Promise<Audiobook[]> {
    const { data, error } = await supabase
      .from('audiobooks')
      .select('*')
      .eq('is_premium', false)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    const mappedAudiobooks = (data || []).map(audiobook => ({
      ...audiobook,
      genres: (audiobook as any).genres || []
    }));
    
    return mappedAudiobooks;
  },

  async getAudiobooksByGenre(genre: string): Promise<Audiobook[]> {
    const { data, error } = await supabase
      .from('audiobooks')
      .select('*')
      .eq('genre', genre)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    const mappedAudiobooks = (data || []).map(audiobook => ({
      ...audiobook,
      genres: (audiobook as any).genres || []
    }));
    
    return mappedAudiobooks;
  },

  async searchAudiobooks(query: string): Promise<Audiobook[]> {
    const { data, error } = await supabase
      .from('audiobooks')
      .select('*')
      .or(`name.ilike.%${query}%,author.ilike.%${query}%,genre.ilike.%${query}%`)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    const mappedAudiobooks = (data || []).map(audiobook => ({
      ...audiobook,
      genres: (audiobook as any).genres || []
    }));
    
    return mappedAudiobooks;
  }
};