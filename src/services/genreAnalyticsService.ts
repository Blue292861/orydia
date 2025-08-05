import { supabase } from '@/integrations/supabase/client';
import { UserGenrePreference, GenreAnalytics } from '@/types/Theme';

export const genreAnalyticsService = {
  async getUserGenrePreferences(userId: string): Promise<UserGenrePreference[]> {
    const { data, error } = await supabase
      .from('user_genre_preferences')
      .select('*')
      .eq('user_id', userId)
      .order('preference_score', { ascending: false });
    
    if (error) throw error;
    return data || [];
  },

  async updateGenrePreference(userId: string, genre: string, readingTimeMinutes: number = 30): Promise<void> {
    const { error } = await supabase
      .rpc('update_genre_preference', {
        p_user_id: userId,
        p_genre: genre,
        p_reading_time_minutes: readingTimeMinutes
      });
    
    if (error) throw error;
  },

  async getGenreAnalytics(userId: string): Promise<GenreAnalytics[]> {
    const preferences = await this.getUserGenrePreferences(userId);
    
    return preferences.map(pref => ({
      genre: pref.genre,
      read_count: pref.read_count,
      total_time_minutes: pref.total_time_minutes,
      preference_score: pref.preference_score,
      last_read_at: pref.last_read_at
    }));
  },

  async getTopGenre(userId: string): Promise<string | null> {
    const preferences = await this.getUserGenrePreferences(userId);
    return preferences.length > 0 ? preferences[0].genre : null;
  },

  // Extract genres from book tags
  extractGenresFromTags(tags: string[]): string[] {
    const genreKeywords = {
      'Fantasy': ['fantasy', 'fantaisie', 'magic', 'medieval', 'dragon', 'wizard', 'sorcier'],
      'Science Fiction': ['sci-fi', 'science fiction', 'space', 'future', 'robot', 'technology', 'cyberpunk'],
      'Romance': ['romance', 'love', 'amour', 'romantic', 'relationship'],
      'Western': ['western', 'cowboy', 'far west', 'ranch', 'desert'],
      'Slice of Life': ['slice of life', 'daily life', 'contemporary', 'realistic', 'quotidien'],
      'Mystery': ['mystery', 'detective', 'thriller', 'crime', 'investigation'],
      'Horror': ['horror', 'scary', 'ghost', 'vampire', 'zombie'],
      'Adventure': ['adventure', 'quest', 'journey', 'exploration'],
      'Comedy': ['comedy', 'humor', 'funny', 'comic'],
      'Drama': ['drama', 'emotional', 'family', 'tragic']
    };

    const detectedGenres: string[] = [];
    
    for (const [genre, keywords] of Object.entries(genreKeywords)) {
      const hasGenre = tags.some(tag => 
        keywords.some(keyword => 
          tag.toLowerCase().includes(keyword.toLowerCase())
        )
      );
      if (hasGenre) {
        detectedGenres.push(genre);
      }
    }
    
    return detectedGenres.length > 0 ? detectedGenres : ['General'];
  }
};