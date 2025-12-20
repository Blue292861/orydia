import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { getLevelTitle } from '@/utils/levelCalculations';
import { useConfetti } from '@/hooks/useConfetti';
import { PendingLevelReward } from '@/types/LevelReward';
import { cn } from '@/lib/utils';
import { Crown, Gift, Star, Trophy, Sparkles } from 'lucide-react';
import coffreOr from '@/assets/coffre-or.png';

interface LevelUpCelebrationProps {
  newLevel: number;
  pendingReward?: PendingLevelReward | null;
  onContinue: () => void;
  onClaimReward?: () => void;
}

export function LevelUpCelebration({
  newLevel,
  pendingReward,
  onContinue,
  onClaimReward,
}: LevelUpCelebrationProps) {
  const [showContent, setShowContent] = useState(false);
  const [showChest, setShowChest] = useState(false);
  const { triggerConfetti, cleanup } = useConfetti();
  const levelTitle = getLevelTitle(newLevel);

  useEffect(() => {
    // Trigger confetti on mount
    triggerConfetti({
      count: 150,
      duration: 4000,
      colors: ['#fbbf24', '#f59e0b', '#22c55e', '#3b82f6', '#a855f7'],
    });

    // Show content with delay
    const contentTimer = setTimeout(() => setShowContent(true), 300);
    const chestTimer = setTimeout(() => setShowChest(true), 1000);

    return () => {
      clearTimeout(contentTimer);
      clearTimeout(chestTimer);
      cleanup();
    };
  }, [triggerConfetti, cleanup]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm">
      {/* Radial gradient background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,hsl(var(--gold-500)/0.2)_0%,transparent_70%)]" />
      
      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 rounded-full bg-gold-400/60 animate-gentle-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${3 + Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 flex flex-col items-center space-y-8 p-8 max-w-md text-center">
        {/* Level badge with burst animation */}
        <div className={cn(
          "relative transition-all duration-700 ease-out",
          showContent ? "scale-100 opacity-100" : "scale-0 opacity-0"
        )}>
          {/* Glow rings */}
          <div className="absolute inset-0 -m-8 rounded-full bg-gold-400/20 animate-ping" />
          <div className="absolute inset-0 -m-4 rounded-full bg-gold-500/30 animate-pulse" />
          
          {/* Main badge */}
          <div className="relative flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-br from-gold-400 via-gold-500 to-amber-600 shadow-2xl border-4 border-gold-300">
            <div className="absolute inset-2 rounded-full bg-gradient-to-br from-gold-300 to-gold-500 animate-pulse" />
            <div className="relative flex flex-col items-center text-primary-foreground">
              <Crown className="w-8 h-8 mb-1" />
              <span className="text-4xl font-bold">{newLevel}</span>
            </div>
          </div>

          {/* Stars around badge */}
          {[0, 72, 144, 216, 288].map((angle, i) => (
            <Star
              key={i}
              className={cn(
                "absolute w-6 h-6 text-gold-400 fill-gold-400 transition-all duration-500",
                showContent ? "opacity-100 scale-100" : "opacity-0 scale-0"
              )}
              style={{
                left: '50%',
                top: '50%',
                transform: `translate(-50%, -50%) rotate(${angle}deg) translateX(80px) rotate(-${angle}deg)`,
                transitionDelay: `${i * 100 + 500}ms`,
              }}
            />
          ))}
        </div>

        {/* Level up text */}
        <div className={cn(
          "space-y-2 transition-all duration-500 delay-300",
          showContent ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        )}>
          <h2 className="text-3xl font-bold text-gold-500 flex items-center justify-center gap-2">
            <Sparkles className="w-6 h-6" />
            Niveau supérieur !
            <Sparkles className="w-6 h-6" />
          </h2>
          <p className="text-xl text-foreground font-medium">{levelTitle}</p>
        </div>

        {/* Level reward chest (if available) */}
        {pendingReward && (
          <div className={cn(
            "space-y-4 transition-all duration-700",
            showChest ? "opacity-100 scale-100" : "opacity-0 scale-50"
          )}>
            <div className="relative">
              {/* Chest glow */}
              <div className="absolute inset-0 -m-4 bg-gradient-to-r from-gold-400 via-amber-500 to-gold-400 rounded-full blur-2xl opacity-50 animate-pulse" />
              
              {/* Chest image */}
              <div className="relative animate-gentle-float">
                <img
                  src={coffreOr}
                  alt="Coffre de niveau"
                  className="w-24 h-24 object-contain drop-shadow-2xl"
                />
                {/* Badge */}
                <div className="absolute -top-2 -right-2 flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold shadow-lg">
                  <Gift className="w-4 h-4" />
                </div>
              </div>
            </div>
            
            <p className="text-sm text-muted-foreground">
              Un coffre de niveau vous attend !
            </p>
          </div>
        )}

        {/* Action buttons */}
        <div className={cn(
          "flex flex-col gap-3 w-full max-w-xs transition-all duration-500 delay-700",
          showContent ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        )}>
          {pendingReward && onClaimReward ? (
            <>
              <Button
                onClick={onClaimReward}
                size="lg"
                className="w-full bg-gradient-to-r from-gold-500 to-amber-600 hover:from-gold-600 hover:to-amber-700 text-primary-foreground shadow-lg"
              >
                <Trophy className="w-5 h-5 mr-2" />
                Réclamer les récompenses
              </Button>
              <Button
                onClick={onContinue}
                variant="ghost"
                size="sm"
                className="text-muted-foreground"
              >
                Plus tard
              </Button>
            </>
          ) : (
            <Button
              onClick={onContinue}
              size="lg"
              className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
            >
              Continuer
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
