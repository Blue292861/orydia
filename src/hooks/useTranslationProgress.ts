import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface TranslationProgress {
  bookId: string;
  language: string;
  totalChapters: number;
  completedChapters: number;
  failedChapters: number;
  inProgressChapters: number;
  percentage: number;
  estimatedTimeMinutes: number | null;
  isTranslating: boolean;
}

export const useTranslationProgress = (bookId: string | undefined, language: string) => {
  const [progress, setProgress] = useState<TranslationProgress | null>(null);
  const [startTime, setStartTime] = useState<Date | null>(null);

  useEffect(() => {
    if (!bookId || language === 'fr') {
      setProgress(null);
      return;
    }

    const fetchProgress = async () => {
      // Obtenir le nombre total de chapitres
      const { data: chapters, error: chaptersError } = await supabase
        .from('book_chapter_epubs')
        .select('id')
        .eq('book_id', bookId);

      if (chaptersError || !chapters) {
        console.error('Error fetching chapters:', chaptersError);
        return;
      }

      const totalChapters = chapters.length;

      // Obtenir le statut des traductions
      const { data: translations, error: translationsError } = await supabase
        .from('chapter_translations')
        .select('chapter_id, status')
        .eq('language', language)
        .in('chapter_id', chapters.map(c => c.id));

      if (translationsError) {
        console.error('Error fetching translations:', translationsError);
        return;
      }

      const completedChapters = translations?.filter(t => t.status === 'completed').length || 0;
      const failedChapters = translations?.filter(t => t.status === 'failed').length || 0;
      const inProgressChapters = translations?.filter(t => t.status === 'translating').length || 0;

      const percentage = totalChapters > 0 ? Math.round((completedChapters / totalChapters) * 100) : 0;
      const isTranslating = inProgressChapters > 0 || (completedChapters > 0 && completedChapters < totalChapters);

      // Calculer l'estimation du temps restant
      let estimatedTimeMinutes: number | null = null;
      if (isTranslating && startTime && completedChapters > 0) {
        const elapsedMinutes = (Date.now() - startTime.getTime()) / 1000 / 60;
        const averageTimePerChapter = elapsedMinutes / completedChapters;
        const remainingChapters = totalChapters - completedChapters;
        estimatedTimeMinutes = Math.ceil(averageTimePerChapter * remainingChapters);
      } else if (isTranslating && !startTime) {
        // Première détection d'une traduction en cours
        setStartTime(new Date());
        // Estimation initiale: ~1 minute par chapitre
        estimatedTimeMinutes = totalChapters - completedChapters;
      }

      setProgress({
        bookId,
        language,
        totalChapters,
        completedChapters,
        failedChapters,
        inProgressChapters,
        percentage,
        estimatedTimeMinutes,
        isTranslating,
      });
    };

    // Fetch initial progress
    fetchProgress();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('translation-progress')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chapter_translations',
          filter: `language=eq.${language}`,
        },
        () => {
          fetchProgress();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [bookId, language, startTime]);

  return progress;
};
