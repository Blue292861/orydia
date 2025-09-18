import { useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { genreAnalyticsService } from '@/services/genreAnalyticsService';

export const useGenreTracking = () => {
  const { session } = useAuth();

  const trackBookRead = useCallback(async (bookTags: string[], readingTimeMinutes: number = 30) => {
    if (!session?.user) return;

    try {
      // Extract genres from book tags
      const genres = genreAnalyticsService.extractGenresFromTags(bookTags);
      
      // Update genre preferences for each detected genre
      for (const genre of genres) {
        await genreAnalyticsService.updateGenrePreference(
          session.user.id,
          genre,
          readingTimeMinutes
        );
      }

      console.log('Genre preferences updated successfully');
    } catch (error) {
      console.error('Error tracking genre preferences:', error);
    }
  }, [session?.user]);

  return { trackBookRead };
};