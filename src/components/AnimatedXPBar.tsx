import { useState, useEffect, useCallback, useRef } from 'react';
import { calculateLevelInfo, getXpRequiredForLevel } from '@/utils/levelCalculations';
import { cn } from '@/lib/utils';
import { Sparkles, Star } from 'lucide-react';

interface AnimatedXPBarProps {
  xpBefore: number;
  xpAfter: number;
  levelBefore: number;
  levelAfter: number;
  onComplete: () => void;
  onLevelUp: (level: number) => void;
}

export function AnimatedXPBar({
  xpBefore,
  xpAfter,
  levelBefore,
  levelAfter,
  onComplete,
  onLevelUp,
}: AnimatedXPBarProps) {
  const [currentXP, setCurrentXP] = useState(xpBefore);
  const [currentLevel, setCurrentLevel] = useState(levelBefore);
  const [showLevelUpFlash, setShowLevelUpFlash] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const animationRef = useRef<number | null>(null);
  const levelUpTriggeredRef = useRef<Set<number>>(new Set());

  const levelInfo = calculateLevelInfo(currentXP);
  const xpForCurrentLevel = getXpRequiredForLevel(currentLevel);
  const xpForNextLevel = getXpRequiredForLevel(currentLevel + 1);
  const xpInCurrentLevel = currentXP - xpForCurrentLevel;
  const xpNeededForLevel = xpForNextLevel - xpForCurrentLevel;
  const progressPercentage = Math.min(100, (xpInCurrentLevel / xpNeededForLevel) * 100);

  const animateXP = useCallback(() => {
    const duration = 2000; // 2 seconds total
    const startTime = performance.now();
    const xpDiff = xpAfter - xpBefore;

    const step = (timestamp: number) => {
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const newXP = Math.floor(xpBefore + xpDiff * easeOutQuart);
      
      setCurrentXP(newXP);
      
      // Check for level ups
      const newLevelInfo = calculateLevelInfo(newXP);
      if (newLevelInfo.level > currentLevel && !levelUpTriggeredRef.current.has(newLevelInfo.level)) {
        levelUpTriggeredRef.current.add(newLevelInfo.level);
        setCurrentLevel(newLevelInfo.level);
        setShowLevelUpFlash(true);
        setTimeout(() => setShowLevelUpFlash(false), 500);
        onLevelUp(newLevelInfo.level);
      }

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(step);
      } else {
        setCurrentXP(xpAfter);
        setIsAnimating(false);
        setTimeout(onComplete, 500);
      }
    };

    setIsAnimating(true);
    animationRef.current = requestAnimationFrame(step);
  }, [xpBefore, xpAfter, currentLevel, onComplete, onLevelUp]);

  useEffect(() => {
    // Start animation after a brief delay
    const timeout = setTimeout(animateXP, 500);
    
    return () => {
      clearTimeout(timeout);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [animateXP]);

  return (
    <div className="flex flex-col items-center justify-center py-8 space-y-6 w-full max-w-md mx-auto">
      {/* Level display */}
      <div className="flex items-center gap-3">
        <div className={cn(
          "relative flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary/80 text-primary-foreground font-bold text-xl shadow-lg transition-transform duration-300",
          showLevelUpFlash && "scale-125"
        )}>
          {showLevelUpFlash && (
            <div className="absolute inset-0 rounded-full bg-gold-400 animate-ping opacity-75" />
          )}
          <span className="relative z-10">{currentLevel}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-lg font-semibold text-foreground">{levelInfo.levelTitle}</span>
          <span className="text-sm text-muted-foreground">Niveau {currentLevel}</span>
        </div>
      </div>

      {/* XP Bar container */}
      <div className="w-full space-y-2">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>XP Progression</span>
          <span className="font-medium text-foreground">
            {Math.floor(xpInCurrentLevel)} / {xpNeededForLevel}
          </span>
        </div>
        
        {/* The XP bar */}
        <div className="relative w-full h-6 bg-muted rounded-full overflow-hidden border-2 border-primary/20">
          {/* Background shimmer */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent animate-shimmer" />
          
          {/* Progress fill */}
          <div 
            className={cn(
              "absolute top-0 left-0 h-full bg-gradient-to-r from-primary via-primary/90 to-gold-500 rounded-full transition-all duration-100",
              isAnimating && "xp-bar-glow"
            )}
            style={{ width: `${progressPercentage}%` }}
          >
            {/* Glow trail effect */}
            {isAnimating && (
              <div className="absolute right-0 top-0 h-full w-8 bg-gradient-to-r from-transparent to-white/50 animate-pulse" />
            )}
          </div>

          {/* Sparkle effects */}
          {isAnimating && (
            <>
              <Sparkles 
                className="absolute text-gold-400 w-4 h-4 animate-pulse"
                style={{ 
                  left: `calc(${progressPercentage}% - 8px)`,
                  top: '50%',
                  transform: 'translateY(-50%)'
                }}
              />
            </>
          )}
        </div>

        {/* XP gained indicator */}
        <div className="flex justify-center">
          <div className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-full bg-gold-500/10 border border-gold-500/30 text-gold-600",
            isAnimating && "animate-pulse"
          )}>
            <Star className="w-4 h-4 fill-current" />
            <span className="font-semibold">+{xpAfter - xpBefore} XP</span>
          </div>
        </div>
      </div>

      {/* Level up flash overlay */}
      {showLevelUpFlash && (
        <div className="fixed inset-0 pointer-events-none z-50">
          <div className="absolute inset-0 bg-gold-400/30 animate-flash-out" />
        </div>
      )}
    </div>
  );
}
