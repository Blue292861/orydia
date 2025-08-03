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
  }
};