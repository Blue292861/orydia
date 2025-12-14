import React, { useState, useRef, useEffect } from 'react';
import { Audiobook } from '@/types/Audiobook';
import { AudiobookChapter, AudiobookWithProgress } from '@/types/AudiobookChapter';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

import { CopyrightWarning } from '@/components/CopyrightWarning';
import { 
  ArrowLeft, 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward,
  Volume2,
  Settings,
  CheckCircle
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { audiobookChapterService } from '@/services/audiobookChapterService';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import AudioBackgroundService from '@/utils/audioBackgroundService';

interface AudiobookPlayerWithAutoPlayProps {
  audiobook: Audiobook;
  chapters: AudiobookWithProgress[];
  initialChapter: AudiobookWithProgress;
  onBack: () => void;
}

export const AudiobookPlayerWithAutoPlay: React.FC<AudiobookPlayerWithAutoPlayProps> = ({
  audiobook,
  chapters,
  initialChapter,
  onBack
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [volume, setVolume] = useState(1);
  const [currentChapter, setCurrentChapter] = useState<AudiobookWithProgress>(initialChapter);
  const [autoPlayNext, setAutoPlayNext] = useState(false);
  const [showControls, setShowControls] = useState(true);

  const audioService = useRef(AudioBackgroundService.getInstance());
  const { user, subscription } = useAuth();
  const { toast } = useToast();

  // Save progress to database
  const saveProgress = async () => {
    if (!currentChapter || !user) return;
    
    try {
      await audiobookChapterService.saveProgress({
        user_id: user.id,
        audiobook_id: audiobook.id,
        chapter_id: currentChapter.id,
        current_time_seconds: Math.floor(currentTime),
        is_completed: currentTime >= duration * 0.95, // Consider 95% as completed
        last_played_at: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  };

  // Load chapter
  const loadChapter = (chapter: AudiobookWithProgress) => {
    const audioMetadata = {
      title: chapter.title,
      artist: audiobook.author,
      album: audiobook.name,
      artwork: audiobook.cover_url ? [{ 
        src: audiobook.cover_url, 
        sizes: '512x512', 
        type: 'image/jpeg' 
      }] : undefined
    };

    audioService.current.loadAudio(chapter.audio_url, audioMetadata);
    
    // Set initial time from progress
    if (chapter.progress?.current_time_seconds) {
      setCurrentTime(chapter.progress.current_time_seconds);
      audioService.current.seekTo(chapter.progress.current_time_seconds);
    } else {
      setCurrentTime(0);
    }

    setCurrentChapter(chapter);
  };

  // Setup callbacks
  useEffect(() => {
    audioService.current.setCallbacks({
      onTimeUpdate: (time: number) => {
        setCurrentTime(time);
        // Auto-save every 10 seconds
        if (Math.floor(time) % 10 === 0) {
          saveProgress();
        }
      },
      onPlay: () => setIsPlaying(true),
      onPause: () => setIsPlaying(false),
      onEnded: () => {
        setIsPlaying(false);
        
        // Mark current chapter as completed
        if (currentChapter && user) {
          audiobookChapterService.saveProgress({
            user_id: user.id,
            audiobook_id: audiobook.id,
            chapter_id: currentChapter.id,
            current_time_seconds: 0,
            is_completed: true,
            last_played_at: new Date().toISOString()
          });
        }

        // Auto-play next chapter if enabled
        if (autoPlayNext) {
          const currentIndex = chapters.findIndex(ch => ch.id === currentChapter?.id);
          if (currentIndex >= 0 && currentIndex < chapters.length - 1) {
            const nextChapter = chapters[currentIndex + 1];
            loadChapter(nextChapter);
            // Start playing after a brief delay
            setTimeout(() => {
              audioService.current.play();
            }, 1000);
          }
        }
      }
    });

    return () => {
      saveProgress();
    };
  }, [currentChapter, user, autoPlayNext]);

  // Load initial chapter
  useEffect(() => {
    loadChapter(initialChapter);
    setDuration(audioService.current.getDuration());
  }, []);

  // Update duration when it changes
  useEffect(() => {
    const interval = setInterval(() => {
      const newDuration = audioService.current.getDuration();
      if (newDuration !== duration) {
        setDuration(newDuration);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [duration]);

  const formatTime = (timeInSeconds: number): string => {
    const hours = Math.floor(timeInSeconds / 3600);
    const minutes = Math.floor((timeInSeconds % 3600) / 60);
    const seconds = Math.floor(timeInSeconds % 60);

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const togglePlayPause = () => {
    if (isPlaying) {
      audioService.current.pause();
    } else {
      audioService.current.play();
    }
  };

  const skipForward = () => {
    audioService.current.seekRelative(15);
  };

  const skipBackward = () => {
    audioService.current.seekRelative(-15);
  };

  const handleSeek = (newTime: number) => {
    audioService.current.seekTo(newTime);
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (newVolume: number[]) => {
    const vol = newVolume[0] / 100;
    setVolume(vol);
    audioService.current.setVolume(vol);
  };

  const handlePlaybackRateChange = (rate: string) => {
    const newRate = parseFloat(rate);
    setPlaybackRate(newRate);
    audioService.current.setPlaybackRate(newRate);
  };

  const selectChapter = (chapter: AudiobookWithProgress) => {
    saveProgress();
    loadChapter(chapter);
    if (isPlaying) {
      setTimeout(() => {
        audioService.current.play();
      }, 500);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <CopyrightWarning />
      {/* Header */}
      <div className="flex items-center p-4 border-b">
        <Button variant="ghost" size="sm" onClick={onBack} className="mr-3">
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex-1">
          <h1 className="font-semibold">{audiobook.name}</h1>
          <p className="text-sm text-muted-foreground">Par {audiobook.author}</p>
        </div>
      </div>


      <div className="p-4 space-y-6">
        {/* Auto-play toggle */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="autoplay"
                checked={autoPlayNext}
                onCheckedChange={setAutoPlayNext}
              />
              <Label htmlFor="autoplay" className="text-sm">
                Lecture automatique des pistes suivantes
              </Label>
            </div>
          </CardContent>
        </Card>

        {/* Current chapter info */}
        <Card>
          <CardContent className="p-4">
            <h2 className="font-semibold mb-2">{currentChapter.title}</h2>
            <div className="text-sm text-muted-foreground mb-4">
              Chapitre {currentChapter.chapter_number} • {formatTime(duration)}
            </div>

            {/* Progress bar */}
            <div className="space-y-2">
              <Slider
                value={[currentTime]}
                max={duration}
                step={1}
                onValueChange={([value]) => handleSeek(value)}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Playback controls */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-center space-x-4 mb-4">
              <Button variant="outline" size="icon" onClick={skipBackward}>
                <SkipBack className="w-4 h-4" />
              </Button>
              <Button size="lg" onClick={togglePlayPause}>
                {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
              </Button>
              <Button variant="outline" size="icon" onClick={skipForward}>
                <SkipForward className="w-4 h-4" />
              </Button>
            </div>

            {/* Advanced controls */}
            <div className="grid grid-cols-2 gap-4">
              {/* Volume */}
              <div className="space-y-2">
                <Label className="text-sm flex items-center">
                  <Volume2 className="w-4 h-4 mr-2" />
                  Volume
                </Label>
                <Slider
                  value={[volume * 100]}
                  max={100}
                  step={1}
                  onValueChange={handleVolumeChange}
                />
              </div>

              {/* Playback speed */}
              <div className="space-y-2">
                <Label className="text-sm flex items-center">
                  <Settings className="w-4 h-4 mr-2" />
                  Vitesse
                </Label>
                <Select value={playbackRate.toString()} onValueChange={handlePlaybackRateChange}>
                  <SelectTrigger>
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
          </CardContent>
        </Card>

        {/* Chapters list */}
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold mb-3">Chapitres</h3>
            <div className="space-y-2">
              {chapters.map((chapter) => {
                const isCurrentChapter = chapter.id === currentChapter.id;
                const progress = chapter.progress?.current_time_seconds || 0;
                const isCompleted = chapter.progress?.is_completed || false;
                
                return (
                  <div
                    key={chapter.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      isCurrentChapter ? 'bg-primary/10 border-primary' : 'hover:bg-muted'
                    }`}
                    onClick={() => selectChapter(chapter)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{chapter.title}</h4>
                        <p className="text-xs text-muted-foreground">
                          Chapitre {chapter.chapter_number}
                          {chapter.duration_seconds && ` • ${formatTime(chapter.duration_seconds)}`}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {isCompleted && (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        )}
                        {isCurrentChapter && isPlaying && (
                          <Pause className="w-4 h-4 text-primary" />
                        )}
                        {isCurrentChapter && !isPlaying && (
                          <Play className="w-4 h-4 text-primary" />
                        )}
                      </div>
                    </div>
                    {progress > 0 && !isCompleted && (
                      <Progress 
                        value={(progress / (chapter.duration_seconds || 1)) * 100} 
                        className="mt-2 h-1"
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};