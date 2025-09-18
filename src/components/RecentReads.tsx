import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, BookOpen, Clock } from 'lucide-react';
import { getRecentReadingProgress } from '@/services/readingStatsService';
import { useAuth } from '@/contexts/AuthContext';

interface RecentReadsProps {
  onSelectBook?: (book: any) => void;
  onSelectAudiobook?: (audiobook: any, chapter: any) => void;
}

export const RecentReads: React.FC<RecentReadsProps> = ({ 
  onSelectBook, 
  onSelectAudiobook 
}) => {
  const { user } = useAuth();
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
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Reprise de lecture
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex gap-3">
                <div className="w-12 h-16 bg-muted rounded" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const hasContent = recentProgress.books.length > 0 || recentProgress.audiobooks.length > 0;

  if (!user || !hasContent) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Reprise de lecture
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-6">
            {!user ? 'Connectez-vous pour voir vos lectures en cours' : 'Aucune lecture en cours'}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Reprise de lecture
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {recentProgress.books.map((progress) => (
          <div key={progress.id} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
            <img 
              src={progress.book_chapters.books.cover_url} 
              alt={progress.book_chapters.books.title}
              className="w-12 h-16 object-cover rounded"
            />
            <div className="flex-1 min-w-0">
              <h4 className="font-medium truncate">{progress.book_chapters.books.title}</h4>
              <p className="text-sm text-muted-foreground">{progress.book_chapters.books.author}</p>
              <p className="text-xs text-muted-foreground">
                Chapitre {progress.book_chapters.chapter_number}: {progress.book_chapters.title}
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onSelectBook?.(progress.book_chapters.books)}
              className="shrink-0"
            >
              <BookOpen className="h-4 w-4 mr-1" />
              Lire
            </Button>
          </div>
        ))}
        
        {recentProgress.audiobooks.map((progress) => (
          <div key={progress.id} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
            <img 
              src={progress.audiobook_chapters.audiobooks.cover_url} 
              alt={progress.audiobook_chapters.audiobooks.name}
              className="w-12 h-16 object-cover rounded"
            />
            <div className="flex-1 min-w-0">
              <h4 className="font-medium truncate">{progress.audiobook_chapters.audiobooks.name}</h4>
              <p className="text-sm text-muted-foreground">{progress.audiobook_chapters.audiobooks.author}</p>
              <p className="text-xs text-muted-foreground">
                Chapitre {progress.audiobook_chapters.chapter_number}: {progress.audiobook_chapters.title}
              </p>
              <div className="text-xs text-muted-foreground">
                {Math.floor(progress.current_time_seconds / 60)}:{String(progress.current_time_seconds % 60).padStart(2, '0')}
              </div>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onSelectAudiobook?.(progress.audiobook_chapters.audiobooks, progress.audiobook_chapters)}
              className="shrink-0"
            >
              <Play className="h-4 w-4 mr-1" />
              Écouter
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};