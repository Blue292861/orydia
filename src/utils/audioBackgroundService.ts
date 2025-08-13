// Service pour gérer la lecture audio en arrière-plan
class AudioBackgroundService {
  private static instance: AudioBackgroundService;
  private currentAudio: HTMLAudioElement | null = null;
  private isPlaying = false;
  private currentTime = 0;
  private duration = 0;
  private callbacks: {
    onTimeUpdate?: (time: number) => void;
    onPlay?: () => void;
    onPause?: () => void;
    onEnded?: () => void;
  } = {};

  private constructor() {
    // Singleton pattern
    this.setupMediaSessionAPI();
  }

  static getInstance(): AudioBackgroundService {
    if (!AudioBackgroundService.instance) {
      AudioBackgroundService.instance = new AudioBackgroundService();
    }
    return AudioBackgroundService.instance;
  }

  private setupMediaSessionAPI() {
    if ('mediaSession' in navigator) {
      // Configurer les contrôles media
      navigator.mediaSession.setActionHandler('play', () => {
        this.play();
      });

      navigator.mediaSession.setActionHandler('pause', () => {
        this.pause();
      });

      navigator.mediaSession.setActionHandler('seekbackward', (details) => {
        const skipTime = details.seekOffset || 10;
        this.seekRelative(-skipTime);
      });

      navigator.mediaSession.setActionHandler('seekforward', (details) => {
        const skipTime = details.seekOffset || 10;
        this.seekRelative(skipTime);
      });

      navigator.mediaSession.setActionHandler('seekto', (details) => {
        if (details.seekTime !== null) {
          this.seekTo(details.seekTime);
        }
      });
    }
  }

  loadAudio(audioUrl: string, metadata: {
    title: string;
    artist: string;
    album: string;
    artwork?: { src: string; sizes: string; type: string; }[];
  }) {
    // Nettoyer l'audio précédent
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.removeEventListener('timeupdate', this.handleTimeUpdate);
      this.currentAudio.removeEventListener('play', this.handlePlay);
      this.currentAudio.removeEventListener('pause', this.handlePause);
      this.currentAudio.removeEventListener('ended', this.handleEnded);
      this.currentAudio.removeEventListener('loadedmetadata', this.handleLoadedMetadata);
    }

    // Créer un nouveau élément audio
    this.currentAudio = new Audio(audioUrl);
    this.currentAudio.preload = 'metadata';

    // Ajouter les event listeners
    this.currentAudio.addEventListener('timeupdate', this.handleTimeUpdate);
    this.currentAudio.addEventListener('play', this.handlePlay);
    this.currentAudio.addEventListener('pause', this.handlePause);
    this.currentAudio.addEventListener('ended', this.handleEnded);
    this.currentAudio.addEventListener('loadedmetadata', this.handleLoadedMetadata);

    // Configurer les métadonnées pour les contrôles système
    if ('mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: metadata.title,
        artist: metadata.artist,
        album: metadata.album,
        artwork: metadata.artwork || []
      });
    }
  }

  private handleTimeUpdate = () => {
    if (this.currentAudio) {
      this.currentTime = this.currentAudio.currentTime;
      this.callbacks.onTimeUpdate?.(this.currentTime);

      // Mettre à jour la position pour les contrôles système
      if ('mediaSession' in navigator) {
        navigator.mediaSession.setPositionState({
          duration: this.duration,
          playbackRate: this.currentAudio.playbackRate,
          position: this.currentTime
        });
      }
    }
  };

  private handlePlay = () => {
    this.isPlaying = true;
    this.callbacks.onPlay?.();
  };

  private handlePause = () => {
    this.isPlaying = false;
    this.callbacks.onPause?.();
  };

  private handleEnded = () => {
    this.isPlaying = false;
    this.callbacks.onEnded?.();
  };

  private handleLoadedMetadata = () => {
    if (this.currentAudio) {
      this.duration = this.currentAudio.duration;
    }
  };

  play() {
    this.currentAudio?.play().catch(error => {
      console.error('Error playing audio:', error);
    });
  }

  pause() {
    this.currentAudio?.pause();
  }

  seekTo(time: number) {
    if (this.currentAudio) {
      this.currentAudio.currentTime = Math.max(0, Math.min(time, this.duration));
    }
  }

  seekRelative(offset: number) {
    if (this.currentAudio) {
      const newTime = this.currentTime + offset;
      this.seekTo(newTime);
    }
  }

  setPlaybackRate(rate: number) {
    if (this.currentAudio) {
      this.currentAudio.playbackRate = rate;
    }
  }

  setVolume(volume: number) {
    if (this.currentAudio) {
      this.currentAudio.volume = Math.max(0, Math.min(1, volume));
    }
  }

  setCallbacks(callbacks: typeof this.callbacks) {
    this.callbacks = { ...this.callbacks, ...callbacks };
  }

  getCurrentTime(): number {
    return this.currentTime;
  }

  getDuration(): number {
    return this.duration;
  }

  isCurrentlyPlaying(): boolean {
    return this.isPlaying;
  }

  destroy() {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.removeEventListener('timeupdate', this.handleTimeUpdate);
      this.currentAudio.removeEventListener('play', this.handlePlay);
      this.currentAudio.removeEventListener('pause', this.handlePause);
      this.currentAudio.removeEventListener('ended', this.handleEnded);
      this.currentAudio.removeEventListener('loadedmetadata', this.handleLoadedMetadata);
      this.currentAudio = null;
    }
  }
}

export default AudioBackgroundService;