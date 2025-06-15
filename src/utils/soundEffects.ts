
export class SoundEffects {
  private static sounds: { [key: string]: HTMLAudioElement } = {};

  static init() {
    // Create sound effects using Web Audio API or simple audio elements
    this.sounds.purchase = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmAaBDWH0fPTgjMGHG7A7+OZRAE=');
    this.sounds.achievement = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmAaBDWH0fPTgjMGHG7A7+OZRAE=');
    this.sounds.points = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmAaBDWH0fPTgjMGHG7A7+OZRAE=');
    
    // Set volumes
    Object.values(this.sounds).forEach(sound => {
      sound.volume = 0.3;
    });
  }

  static play(soundName: string) {
    try {
      if (this.sounds[soundName]) {
        this.sounds[soundName].currentTime = 0;
        this.sounds[soundName].play().catch(() => {
          // Ignore autoplay policy errors
        });
      }
    } catch (error) {
      // Ignore sound errors in development
    }
  }

  static playPurchase() {
    this.play('purchase');
  }

  static playAchievement() {
    this.play('achievement');
  }

  static playPoints() {
    this.play('points');
  }
}

// Initialize sounds when module loads
if (typeof window !== 'undefined') {
  SoundEffects.init();
}
