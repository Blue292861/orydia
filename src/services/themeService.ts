import { supabase } from '@/integrations/supabase/client';
import { ThemeConfig, UserThemePreference, UITheme } from '@/types/Theme';

export const themeService = {
  async getAllThemes(): Promise<ThemeConfig[]> {
    const { data, error } = await supabase
      .from('ui_themes')
      .select('*')
      .order('theme_key');
    
    if (error) throw error;
    return (data || []).map(theme => ({
      ...theme,
      vocabulary: theme.vocabulary as ThemeConfig['vocabulary']
    }));
  },

  async getUserThemePreference(userId: string): Promise<UserThemePreference | null> {
    const { data, error } = await supabase
      .from('user_theme_preferences')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  },

  async createUserThemePreference(userId: string, theme: UITheme): Promise<UserThemePreference> {
    const { data, error } = await supabase
      .from('user_theme_preferences')
      .insert({
        user_id: userId,
        current_theme: theme,
        auto_theme_enabled: true
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async updateUserTheme(userId: string, theme: UITheme, autoEnabled: boolean = true): Promise<UserThemePreference> {
    const { data, error } = await supabase
      .from('user_theme_preferences')
      .upsert({
        user_id: userId,
        current_theme: theme,
        auto_theme_enabled: autoEnabled,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async setAdminOverride(userId: string, theme: UITheme | null): Promise<UserThemePreference> {
    const { data, error } = await supabase
      .from('user_theme_preferences')
      .update({
        admin_override_theme: theme,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async getRecommendedTheme(userId: string): Promise<UITheme> {
    const { data, error } = await supabase
      .rpc('get_recommended_theme', { p_user_id: userId });
    
    if (error) throw error;
    return data || 'default';
  }
};