import React, { useRef, useState } from 'react';
import { X, FileText, Image, Volume2, ExternalLink, Play, Pause } from 'lucide-react';
import { Waypoint } from '@/types/Waypoint';
import { Button } from '@/components/ui/button';

interface WaypointPopupProps {
  waypoint: Waypoint | null;
  isOpen: boolean;
  onClose: () => void;
}

const WaypointPopup: React.FC<WaypointPopupProps> = ({ waypoint, isOpen, onClose }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);

  if (!isOpen || !waypoint) return null;

  const getTypeIcon = () => {
    switch (waypoint.waypoint_type) {
      case 'text': return <FileText className="h-5 w-5 text-amber-500" />;
      case 'image': return <Image className="h-5 w-5 text-amber-500" />;
      case 'audio': return <Volume2 className="h-5 w-5 text-amber-500" />;
      case 'link': return <ExternalLink className="h-5 w-5 text-amber-500" />;
    }
  };

  const getTypeLabel = () => {
    switch (waypoint.waypoint_type) {
      case 'text': return 'Définition';
      case 'image': return 'Illustration';
      case 'audio': return 'Audio';
      case 'link': return 'Lien';
    }
  };

  const handlePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const progress = (audioRef.current.currentTime / audioRef.current.duration) * 100;
      setAudioProgress(progress);
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
    setAudioProgress(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60"
      onClick={onClose}
    >
      <div 
        className="bg-card border border-border rounded-xl shadow-2xl max-w-md w-full max-h-[80vh] overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-muted/50">
          <div className="flex items-center gap-2">
            {getTypeIcon()}
            <span className="text-xs text-muted-foreground uppercase tracking-wide">
              {getTypeLabel()}
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="h-8 w-8 rounded-full hover:bg-destructive/10 hover:text-destructive"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[60vh]">
          {/* Word title */}
          <h3 className="text-lg font-semibold text-foreground mb-3 capitalize">
            {waypoint.word_text}
          </h3>

          {/* Text content */}
          {waypoint.waypoint_type === 'text' && waypoint.content_text && (
            <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
              {waypoint.content_text}
            </p>
          )}

          {/* Image content */}
          {waypoint.waypoint_type === 'image' && (
            <div className="space-y-3">
              {waypoint.content_image_url && (
                <div className="rounded-lg overflow-hidden border border-border">
                  <img 
                    src={waypoint.content_image_url} 
                    alt={waypoint.word_text}
                    className="w-full h-auto object-contain max-h-64"
                  />
                </div>
              )}
              {waypoint.content_text && (
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {waypoint.content_text}
                </p>
              )}
            </div>
          )}

          {/* Audio content */}
          {waypoint.waypoint_type === 'audio' && waypoint.content_audio_url && (
            <div className="space-y-3">
              <audio 
                ref={audioRef}
                src={waypoint.content_audio_url}
                onTimeUpdate={handleTimeUpdate}
                onEnded={handleAudioEnded}
                className="hidden"
              />
              <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handlePlayPause}
                  className="h-12 w-12 rounded-full bg-amber-500 hover:bg-amber-600 text-white border-0"
                >
                  {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
                </Button>
                <div className="flex-1">
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-amber-500 transition-all duration-100"
                      style={{ width: `${audioProgress}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>{audioRef.current ? formatTime(audioRef.current.currentTime) : '0:00'}</span>
                    <span>{audioRef.current && audioRef.current.duration ? formatTime(audioRef.current.duration) : '--:--'}</span>
                  </div>
                </div>
              </div>
              {waypoint.content_text && (
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {waypoint.content_text}
                </p>
              )}
            </div>
          )}

          {/* Link content */}
          {waypoint.waypoint_type === 'link' && waypoint.content_link_url && (
            <div className="space-y-3">
              {waypoint.content_text && (
                <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                  {waypoint.content_text}
                </p>
              )}
              <Button
                variant="default"
                className="w-full bg-amber-500 hover:bg-amber-600 text-white"
                onClick={() => window.open(waypoint.content_link_url!, '_blank', 'noopener,noreferrer')}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                {waypoint.content_link_label || 'Ouvrir le lien'}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WaypointPopup;
