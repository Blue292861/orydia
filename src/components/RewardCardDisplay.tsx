import { ChestReward } from "@/types/RewardType";
import { cn } from "@/lib/utils";

interface RewardCardDisplayProps {
  reward: ChestReward;
  variation?: number;
}

export function RewardCardDisplay({ reward, variation }: RewardCardDisplayProps) {
  const rarityColors = {
    common: 'from-slate-400 to-slate-600',
    rare: 'from-blue-400 to-blue-600',
    epic: 'from-purple-400 to-purple-600',
    legendary: 'from-amber-400 to-amber-600'
  };

  const rarityGlow = {
    common: 'shadow-none',
    rare: 'shadow-blue-500/50',
    epic: 'shadow-purple-500/50',
    legendary: 'shadow-amber-500/80'
  };

  const rarityParticles = {
    common: 0,
    rare: 10,
    epic: 20,
    legendary: 50
  };

  const borderColor = rarityColors[reward.rarity as keyof typeof rarityColors] || rarityColors.common;
  const glowEffect = rarityGlow[reward.rarity as keyof typeof rarityGlow] || rarityGlow.common;
  const particleCount = rarityParticles[reward.rarity as keyof typeof rarityParticles] || 0;

  return (
    <div className="relative flex items-center justify-center">
      {/* Particles for rare+ rewards */}
      {particleCount > 0 && (
        <div className="absolute inset-0 pointer-events-none">
          {Array.from({ length: particleCount }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "absolute w-1 h-1 rounded-full animate-particle",
                reward.rarity === 'rare' && "bg-blue-400",
                reward.rarity === 'epic' && "bg-purple-400",
                reward.rarity === 'legendary' && "bg-amber-400"
              )}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`
              }}
            />
          ))}
        </div>
      )}

      {/* Card */}
      <div className={cn(
        "relative w-64 h-96 rounded-2xl overflow-hidden card-flip",
        `shadow-2xl ${glowEffect}`,
        reward.rarity === 'legendary' && "animate-glow"
      )}>
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
                  "px-3 py-1 rounded-full text-xs font-bold uppercase",
                  `bg-gradient-to-r ${borderColor} text-white`
                )}>
                  {reward.rarity}
                </span>
              </div>

              {/* Image */}
              <div className="flex-1 flex items-center justify-center">
                <img
                  src={reward.imageUrl}
                  alt={reward.name}
                  className="max-w-full max-h-48 object-contain"
                />
              </div>

              {/* Name and quantity */}
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-center">{reward.name}</h3>
                <div className="flex items-center justify-center space-x-2">
                  <p className="text-3xl font-bold text-primary">×{reward.quantity}</p>
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
