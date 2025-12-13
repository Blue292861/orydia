import React, { useState, useRef, useEffect } from 'react';
import { Audiobook } from '@/types/Audiobook';
import { AudiobookWithProgress } from '@/types/AudiobookChapter';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';

import { CopyrightWarning } from '@/components/CopyrightWarning';
import { 
  ArrowLeft, 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward,
  Volume2,
  Settings
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { audiobookChapterService } from '@/services/audiobookChapterService';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface AudiobookPlayerProps {
  audiobook: Audiobook;
  chapter: AudiobookWithProgress;
  onBack: () => void;
}

export const AudiobookPlayer: React.FC<AudiobookPlayerProps> = ({
  audiobook,
  chapter,
  onBack
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(chapter.progress?.current_time_seconds || 0);
  const [duration, setDuration] = useState(chapter.duration_seconds || 0);
  const [volume, setVolume] = useState(1);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showControls, setShowControls] = useState(true);
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const progressSaveInterval = useRef<NodeJS.Timeout>();
  const { user, subscription } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // Configurer l'audio
    audio.volume = volume;
    audio.playbackRate = playbackRate;
    
    // Démarrer au bon moment si on reprend
    if (chapter.progress?.current_time_seconds) {
      audio.currentTime = chapter.progress.current_time_seconds;
    }

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      markChapterCompleted();
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  // Sauvegarder la progression toutes les 5 secondes
  useEffect(() => {
    if (isPlaying && user) {
      progressSaveInterval.current = setInterval(() => {
        saveProgress();
      }, 5000);
    } else {
      if (progressSaveInterval.current) {
        clearInterval(progressSaveInterval.current);
      }
    }

    return () => {
      if (progressSaveInterval.current) {
        clearInterval(progressSaveInterval.current);
      }
    };
  }, [isPlaying, currentTime, user]);

  // Sauvegarder la progression quand on quitte
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (user && currentTime > 0) {
        saveProgress();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      if (user && currentTime > 0) {
        saveProgress();
      }
    };
  }, [currentTime, user]);

  const saveProgress = async () => {
    if (!user || !audioRef.current) return;

    try {
      await audiobookChapterService.saveProgress({
        user_id: user.id,
        audiobook_id: audiobook.id,
        chapter_id: chapter.id,
        current_time_seconds: Math.floor(currentTime),
        is_completed: currentTime >= duration * 0.95, // Considéré comme terminé à 95%
        last_played_at: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  };

  const markChapterCompleted = async () => {
    if (!user) return;

    try {
      await audiobookChapterService.saveProgress({
        user_id: user.id,
        audiobook_id: audiobook.id,
        chapter_id: chapter.id,
        current_time_seconds: Math.floor(duration),
        is_completed: true,
        last_played_at: new Date().toISOString()
      });

      toast({
        title: "Chapitre terminé !",
        description: `Vous avez terminé "${chapter.title}"`,
      });
    } catch (error) {
      console.error('Error marking chapter completed:', error);
    }
  };

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (newTime: number[]) => {
    const audio = audioRef.current;
    if (!audio) return;

    const time = newTime[0];
    audio.currentTime = time;
    setCurrentTime(time);
  };

  const skipTime = (seconds: number) => {
    const audio = audioRef.current;
    if (!audio) return;

    const newTime = Math.max(0, Math.min(duration, currentTime + seconds));
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (newVolume: number[]) => {
    const vol = newVolume[0];
    setVolume(vol);
    if (audioRef.current) {
      audioRef.current.volume = vol;
    }
  };

  const handlePlaybackRateChange = (rate: string) => {
    const newRate = parseFloat(rate);
    setPlaybackRate(newRate);
    if (audioRef.current) {
      audioRef.current.playbackRate = newRate;
    }
  };

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="min-h-screen bg-background">
      <CopyrightWarning />
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
            Retour aux chapitres
          </Button>
        </div>

        <Card>
          <CardContent className="p-8">
            <div className="text-center space-y-6">
              {/* Informations du chapitre */}
              <div className="space-y-4">
                <img 
                  src={audiobook.cover_url} 
                  alt={audiobook.name}
                  className="w-48 h-60 object-cover rounded-lg mx-auto shadow-lg" 
                />
                <div>
                  <h1 className="text-2xl font-bold">{chapter.title}</h1>
                  <p className="text-lg text-muted-foreground">{audiobook.name}</p>
                  <p className="text-sm text-muted-foreground">{audiobook.author}</p>
                </div>
              </div>

              {/* Barre de progression */}
              <div className="space-y-2">
                <Slider
                  value={[currentTime]}
                  max={duration}
                  step={1}
                  onValueChange={handleSeek}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
                <Progress value={progressPercentage} className="h-1" />
              </div>

              {/* Contrôles de lecture */}
              <div className="flex items-center justify-center gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => skipTime(-30)}
                >
                  <SkipBack className="h-4 w-4" />
                </Button>

                <Button
                  onClick={togglePlayPause}
                  size="lg"
                  className="w-16 h-16 rounded-full"
                >
                  {isPlaying ? (
                    <Pause className="h-8 w-8" />
                  ) : (
                    <Play className="h-8 w-8 ml-1" />
                  )}
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => skipTime(30)}
                >
                  <SkipForward className="h-4 w-4" />
                </Button>
              </div>

              {/* Contrôles avancés */}
              <div className="flex items-center justify-center gap-8">
                <div className="flex items-center gap-2">
                  <Volume2 className="h-4 w-4" />
                  <Slider
                    value={[volume]}
                    max={1}
                    step={0.1}
                    onValueChange={handleVolumeChange}
                    className="w-20"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  <Select value={playbackRate.toString()} onValueChange={handlePlaybackRateChange}>
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0.5">0.5x</SelectItem>
                      <SelectItem value="0.75">0.75x</SelectItem>
                      <SelectItem value="1">1x</SelectItem>
                      <SelectItem value="1.25">1.25x</SelectItem>
                      <SelectItem value="1.5">1.5x</SelectItem>
                      <SelectItem value="2">2x</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Audio element (caché) */}
        <audio
          ref={audioRef}
          src={chapter.audio_url}
          preload="metadata"
          style={{ display: 'none' }}
        />
      </div>
    </div>
  );
};