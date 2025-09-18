import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Play, BookOpen, Clock } from 'lucide-react';
import { getRecentReadingProgress } from '@/services/readingStatsService';
import { useAuth } from '@/contexts/AuthContext';
import { useResponsive } from '@/hooks/useResponsive';

interface RecentReadsProps {
  onSelectBook?: (book: any) => void;
  onSelectAudiobook?: (audiobook: any, chapter: any) => void;
}

export const RecentReads: React.FC<RecentReadsProps> = ({ 
  onSelectBook, 
  onSelectAudiobook 
}) => {
  const { user } = useAuth();
  const { isMobile, isTablet } = useResponsive();
  const [recentProgress, setRecentProgress] = useState<{
    books: any[];
    audiobooks: any[];
  }>({ books: [], audiobooks: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchRecentProgress();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchRecentProgress = async () => {
    if (!user) return;
    
    try {
      const progress = await getRecentReadingProgress(user.id);
      setRecentProgress(progress);
    } catch (error) {
      console.error('Error fetching recent progress:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={`animate-pulse space-y-3 ${
        isMobile ? 'p-3' : isTablet ? 'p-4' : 'p-4 sm:p-6'
      }`}>
        {[1, 2, 3].map(i => (
          <div key={i} className="flex gap-3">
            <div className="w-12 h-16 bg-wood-300/50 rounded-lg" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-wood-300/50 rounded w-3/4" />
              <div className="h-3 bg-wood-300/50 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  const hasContent = recentProgress.books.length > 0 || recentProgress.audiobooks.length > 0;

  if (!user || !hasContent) {
    return (
      <div className={`text-center py-12 px-4 ${
        isMobile ? 'text-sm' : isTablet ? 'text-base' : 'text-base'
      }`}>
        <p className="text-forest-600 font-nature">
          {!user ? 'Connectez-vous pour voir vos lectures en cours' : 'Aucune lecture en cours'}
        </p>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${
      isMobile ? 'gap-3' : isTablet ? 'gap-4' : 'gap-4'
    }`}>
      {recentProgress.books.map((progress) => (
        <div key={progress.id} className="group flex items-center gap-3 p-4 bg-gradient-to-r from-wood-100/80 via-stone-50/80 to-wood-100/80 border border-wood-300 rounded-lg hover:shadow-lg hover:border-gold-400 transition-all duration-300 relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-forest-500 to-forest-700 opacity-60"></div>
          
          <div className="relative">
            <img 
              src={progress.book_chapters.books.cover_url} 
              alt={progress.book_chapters.books.title}
              className="w-12 h-16 object-cover rounded-lg shadow-md border border-wood-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-forest-900/20 to-transparent rounded-lg"></div>
          </div>
          
          <div className="flex-1 min-w-0">
            <h4 className="font-display font-semibold text-forest-800 truncate group-hover:text-forest-900 transition-colors">
              {progress.book_chapters.books.title}
            </h4>
            <p className="text-sm text-forest-600 font-nature italic">{progress.book_chapters.books.author}</p>
            <p className="text-xs text-forest-500 font-medium">
              Chapitre {progress.book_chapters.chapter_number}: {progress.book_chapters.title}
            </p>
          </div>
          
          <Button
            size="sm"
            variant="outline"
            onClick={() => onSelectBook?.(progress.book_chapters.books)}
            className="shrink-0 bg-gradient-to-r from-forest-600 to-forest-700 hover:from-forest-700 hover:to-forest-800 text-white border-forest-600 hover:border-forest-800 shadow-md"
          >
            <BookOpen className="h-4 w-4 mr-1" />
            Lire
          </Button>
        </div>
      ))}
      
      {recentProgress.audiobooks.map((progress) => (
        <div key={progress.id} className="group flex items-center gap-3 p-4 bg-gradient-to-r from-wood-100/80 via-stone-50/80 to-wood-100/80 border border-wood-300 rounded-lg hover:shadow-lg hover:border-gold-400 transition-all duration-300 relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-gold-500 to-gold-700 opacity-60"></div>
          
          <div className="relative">
            <img 
              src={progress.audiobook_chapters.audiobooks.cover_url} 
              alt={progress.audiobook_chapters.audiobooks.name}
              className="w-12 h-16 object-cover rounded-lg shadow-md border border-wood-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gold-900/20 to-transparent rounded-lg"></div>
          </div>
          
          <div className="flex-1 min-w-0">
            <h4 className="font-display font-semibold text-forest-800 truncate group-hover:text-forest-900 transition-colors">
              {progress.audiobook_chapters.audiobooks.name}
            </h4>
            <p className="text-sm text-forest-600 font-nature italic">{progress.audiobook_chapters.audiobooks.author}</p>
            <p className="text-xs text-forest-500 font-medium">
              Chapitre {progress.audiobook_chapters.chapter_number}: {progress.audiobook_chapters.title}
            </p>
            <div className="text-xs text-gold-600 font-semibold">
              {Math.floor(progress.current_time_seconds / 60)}:{String(progress.current_time_seconds % 60).padStart(2, '0')}
            </div>
          </div>
          
          <Button
            size="sm"
            variant="outline"
            onClick={() => onSelectAudiobook?.(progress.audiobook_chapters.audiobooks, progress.audiobook_chapters)}
            className="shrink-0 bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-gold-900 border-gold-500 hover:border-gold-700 shadow-md"
          >
            <Play className="h-4 w-4 mr-1" />
            Écouter
          </Button>
        </div>
      ))}
    </div>
  );
};