import { ChestReward } from "@/types/RewardType";
import { cn } from "@/lib/utils";
import { RarityEffects, RarityParticles } from "./RarityEffects";
import { useState, useEffect } from "react";

interface RewardCardDisplayProps {
  reward: ChestReward;
  variation?: number;
}

export function RewardCardDisplay({ reward, variation }: RewardCardDisplayProps) {
  const [isRevealed, setIsRevealed] = useState(false);
  const [showEffects, setShowEffects] = useState(false);

  useEffect(() => {
    // Trigger reveal animation
    const revealDelay = getRevealDelay(reward.rarity);
    const timer1 = setTimeout(() => setIsRevealed(true), 100);
    const timer2 = setTimeout(() => setShowEffects(true), revealDelay / 2);
    
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [reward.rarity]);

  const getRevealDelay = (rarity: string) => {
    switch(rarity) {
      case 'legendary': return 1200;
      case 'epic': return 800;
      case 'rare': return 500;
      default: return 300;
    }
  };

  const rarityColors = {
    common: 'from-slate-400 to-slate-600',
    rare: 'from-blue-400 to-blue-600',
    epic: 'from-purple-400 to-purple-600',
    legendary: 'from-amber-400 to-amber-600'
  };

  const rarityGlow = {
    common: 'shadow-slate-500/30',
    rare: 'shadow-blue-500/50',
    epic: 'shadow-purple-500/60',
    legendary: 'shadow-amber-500/80'
  };

  const rarityParticles = {
    common: 0,
    rare: 12,
    epic: 24,
    legendary: 40
  };

  const rarityAnimation = {
    common: 'animate-reveal-common',
    rare: 'animate-reveal-rare',
    epic: 'animate-reveal-epic',
    legendary: 'animate-reveal-legendary'
  };

  const rarityHaloColor = {
    common: 'bg-slate-400/20',
    rare: 'bg-blue-500/30',
    epic: 'bg-purple-500/40',
    legendary: 'bg-amber-500/50'
  };

  const rarity = reward.rarity as keyof typeof rarityColors;
  const borderColor = rarityColors[rarity] || rarityColors.common;
  const glowEffect = rarityGlow[rarity] || rarityGlow.common;
  const particleCount = rarityParticles[rarity] || 0;
  const animation = rarityAnimation[rarity] || rarityAnimation.common;
  const haloColor = rarityHaloColor[rarity] || rarityHaloColor.common;

  return (
    <div className="relative flex items-center justify-center">
      {/* Background halo effect */}
      <div className={cn(
        "absolute w-80 h-80 rounded-full blur-3xl transition-all duration-1000",
        haloColor,
        showEffects ? "opacity-100 scale-100" : "opacity-0 scale-50",
        rarity === 'legendary' && "animate-pulse-slow",
        rarity === 'epic' && "animate-pulse"
      )} />

      {/* Particles explosion */}
      {isRevealed && (
        <RarityParticles rarity={rarity} count={particleCount} />
      )}

      {/* Card */}
      <div className={cn(
        "relative w-64 h-96 rounded-2xl overflow-hidden",
        `shadow-2xl ${glowEffect}`,
        isRevealed ? animation : "opacity-0 scale-50",
        rarity === 'legendary' && showEffects && "animate-glow"
      )}>
        {/* Rarity effects overlay */}
        <RarityEffects rarity={rarity} isActive={showEffects} />

        {/* Border gradient */}
        <div className={cn(
          "absolute inset-0 p-1 bg-gradient-to-br rounded-2xl",
          borderColor
        )}>
          <div className="w-full h-full bg-gradient-to-br from-background to-muted rounded-xl overflow-hidden">
            {/* Card content */}
            <div className="flex flex-col h-full p-6">
              {/* Rarity badge */}
              <div className="flex justify-end mb-2">
                <span className={cn(
                  "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider",
                  `bg-gradient-to-r ${borderColor} text-white`,
                  rarity === 'legendary' && "animate-pulse",
                  rarity === 'epic' && "shadow-lg shadow-purple-500/50"
                )}>
                  {reward.rarity}
                </span>
              </div>

              {/* Image */}
              <div className="flex-1 flex items-center justify-center">
                <img
                  src={reward.imageUrl}
                  alt={reward.name}
                  className={cn(
                    "max-w-full max-h-48 object-contain transition-transform duration-500",
                    showEffects && rarity === 'legendary' && "animate-gentle-float"
                  )}
                />
              </div>

              {/* Name and quantity */}
              <div className="space-y-2">
                <h3 className={cn(
                  "text-xl font-bold text-center",
                  rarity === 'legendary' && "text-amber-500",
                  rarity === 'epic' && "text-purple-500",
                  rarity === 'rare' && "text-blue-500"
                )}>
                  {reward.name}
                </h3>
                <div className="flex items-center justify-center space-x-2">
                  <p className={cn(
                    "text-3xl font-bold",
                    rarity === 'legendary' ? "text-amber-500" : "text-primary"
                  )}>
                    ×{reward.quantity}
                  </p>
                  {variation && (
                    <span className={cn(
                      "text-sm font-semibold",
                      variation > 100 ? "text-green-500" : variation < 100 ? "text-orange-500" : "text-muted-foreground"
                    )}>
                      ({variation}%)
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
