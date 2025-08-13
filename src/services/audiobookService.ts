import { supabase } from "@/integrations/supabase/client";
import { Audiobook } from "@/types/Audiobook";

export const audiobookService = {
  async getAllAudiobooks(): Promise<Audiobook[]> {
    const { data, error } = await supabase
      .from('audiobooks')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async getFeaturedAudiobooks(): Promise<Audiobook[]> {
    const { data, error } = await supabase
      .from('audiobooks')
      .select('*')
      .eq('is_featured', true)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async getPacoChronicleAudiobooks(): Promise<Audiobook[]> {
    const { data, error } = await supabase
      .from('audiobooks')
      .select('*')
      .eq('is_paco_chronicle', true)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async getPremiumAudiobooks(): Promise<Audiobook[]> {
    const { data, error } = await supabase
      .from('audiobooks')
      .select('*')
      .eq('is_premium', true)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async getFreeAudiobooks(): Promise<Audiobook[]> {
    const { data, error } = await supabase
      .from('audiobooks')
      .select('*')
      .eq('is_premium', false)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async getAudiobooksByGenre(genre: string): Promise<Audiobook[]> {
    const { data, error } = await supabase
      .from('audiobooks')
      .select('*')
      .eq('genre', genre)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async searchAudiobooks(query: string): Promise<Audiobook[]> {
    const { data, error } = await supabase
      .from('audiobooks')
      .select('*')
      .or(`name.ilike.%${query}%,author.ilike.%${query}%,genre.ilike.%${query}%`)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }
};