import React, { useState, useEffect } from 'react';
import { Audiobook } from '@/types/Audiobook';
import { AudiobookWithProgress } from '@/types/AudiobookChapter';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

import { ArrowLeft, Play, Pause, Clock, CheckCircle } from 'lucide-react';
import { audiobookChapterService } from '@/services/audiobookChapterService';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface AudiobookChapterListProps {
  audiobook: Audiobook;
  onBack: () => void;
  onPlayChapter: (audiobook: Audiobook, chapter: AudiobookWithProgress) => void;
}

export const AudiobookChapterList: React.FC<AudiobookChapterListProps> = ({
  audiobook,
  onBack,
  onPlayChapter
}) => {
  const [chapters, setChapters] = useState<AudiobookWithProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, subscription } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const fetchChapters = async () => {
      try {
        const chaptersData = await audiobookChapterService.getChaptersWithProgress(
          audiobook.id, 
          user?.id
        );
        setChapters(chaptersData);
      } catch (error) {
        console.error('Error fetching chapters:', error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les chapitres",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchChapters();
  }, [audiobook.id, user?.id]);

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = (chapter: AudiobookWithProgress): number => {
    if (!chapter.progress || !chapter.duration_seconds) return 0;
    return Math.round((chapter.progress.current_time_seconds / chapter.duration_seconds) * 100);
  };

  const handlePlayChapter = (chapter: AudiobookWithProgress) => {
    onPlayChapter(audiobook, chapter);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center py-12">Chargement des chapitres...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Publicité pour les utilisateurs freemium */}
      {!subscription.isPremium && (
        <div className="bg-muted py-4">
          <div className="max-w-4xl mx-auto px-4">
            <BannerAd />
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto p-4 space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
          <div className="flex items-center gap-4">
            <img 
              src={audiobook.cover_url} 
              alt={audiobook.name}
              className="w-16 h-20 object-cover rounded-lg" 
            />
            <div>
              <h1 className="text-2xl font-bold">{audiobook.name}</h1>
              <p className="text-muted-foreground">{audiobook.author}</p>
              <div className="flex items-center gap-2 text-sm mt-1">
                <img src="/lovable-uploads/4a891ef6-ff72-4b5a-b33c-0dc33dd3aa26.png" alt="Tensens Icon" className="h-4 w-4" />
                <span>{audiobook.points} Tensens</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Chapitres ({chapters.length})</h2>
          
          {chapters.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">Aucun chapitre disponible pour cet audiobook.</p>
              </CardContent>
            </Card>
          ) : (
            chapters.map((chapter, index) => (
              <Card 
                key={chapter.id} 
                className="cursor-pointer hover:shadow-md transition-all"
                onClick={() => handlePlayChapter(chapter)}
              >
                <CardContent className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full">
                      {chapter.progress?.is_completed ? (
                        <CheckCircle className="h-6 w-6 text-green-500" />
                      ) : (
                        <Play className="h-6 w-6 text-primary" />
                      )}
                    </div>
                    
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-lg">{chapter.title}</h3>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {formatDuration(chapter.duration_seconds)}
                            </span>
                            {chapter.progress && !chapter.progress.is_completed && (
                              <span>
                                Temps de lecture: {formatDuration(chapter.progress.current_time_seconds)}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {chapter.progress?.is_completed && (
                            <Badge className="bg-green-500">
                              Terminé
                            </Badge>
                          )}
                          {chapter.progress && !chapter.progress.is_completed && chapter.progress.current_time_seconds > 0 && (
                            <Badge variant="secondary">
                              En cours
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      {chapter.progress && chapter.duration_seconds > 0 && (
                        <div className="space-y-1">
                          <Progress value={getProgressPercentage(chapter)} className="h-2" />
                          <p className="text-xs text-muted-foreground">
                            {getProgressPercentage(chapter)}% écouté
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};