import { cn } from "@/lib/utils";

interface RarityEffectsProps {
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  isActive: boolean;
}

export function RarityEffects({ rarity, isActive }: RarityEffectsProps) {
  if (!isActive) return null;

  return (
    <>
      {/* Legendary rotating rays */}
      {rarity === 'legendary' && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
          <div 
            className="absolute inset-[-50%] animate-spin-slow"
            style={{
              background: 'conic-gradient(from 0deg, transparent, rgba(251,191,36,0.4), transparent, rgba(251,191,36,0.4), transparent, rgba(251,191,36,0.4), transparent)'
            }}
          />
          {/* Sparkles */}
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-amber-300 rounded-full animate-legendary-sparkle"
              style={{
                left: `${20 + (i * 10)}%`,
                top: `${15 + (i % 3) * 30}%`,
                animationDelay: `${i * 0.3}s`
              }}
            />
          ))}
        </div>
      )}

      {/* Epic pulsing rings */}
      {rarity === 'epic' && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 rounded-2xl border-4 border-purple-500/40 animate-epic-ring" />
          <div className="absolute inset-2 rounded-xl border-2 border-purple-400/30 animate-epic-ring" style={{ animationDelay: '0.3s' }} />
          <div className="absolute inset-4 rounded-lg border border-purple-300/20 animate-epic-ring" style={{ animationDelay: '0.6s' }} />
        </div>
      )}

      {/* Rare shimmer effect */}
      {rarity === 'rare' && (
        <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
          <div 
            className="absolute inset-0 animate-shimmer"
            style={{
              background: 'linear-gradient(90deg, transparent 0%, rgba(59,130,246,0.3) 50%, transparent 100%)',
              backgroundSize: '200% 100%'
            }}
          />
        </div>
      )}
    </>
  );
}

// Particle explosion component for rarity reveals
interface RarityParticlesProps {
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  count: number;
}

export function RarityParticles({ rarity, count }: RarityParticlesProps) {
  if (count === 0) return null;

  const particleColor = {
    common: 'bg-slate-400',
    rare: 'bg-blue-400',
    epic: 'bg-purple-400',
    legendary: 'bg-amber-400'
  }[rarity];

  const glowColor = {
    common: 'shadow-slate-400/50',
    rare: 'shadow-blue-400/50',
    epic: 'shadow-purple-400/50',
    legendary: 'shadow-amber-400/50'
  }[rarity];

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {Array.from({ length: count }).map((_, i) => {
        const angle = (i / count) * 360;
        const distance = 80 + Math.random() * 60;
        const size = rarity === 'legendary' ? 3 + Math.random() * 3 : 2 + Math.random() * 2;
        const duration = 1.5 + Math.random() * 1;
        
        return (
          <div
            key={i}
            className={cn(
              "absolute rounded-full shadow-lg",
              particleColor,
              glowColor
            )}
            style={{
              width: `${size}px`,
              height: `${size}px`,
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              animation: `particle-explode ${duration}s ease-out forwards`,
              animationDelay: `${Math.random() * 0.3}s`,
              '--particle-x': `${Math.cos(angle * Math.PI / 180) * distance}px`,
              '--particle-y': `${Math.sin(angle * Math.PI / 180) * distance}px`,
            } as React.CSSProperties}
          />
        );
      })}
    </div>
  );
}

// Flash overlay for dramatic reveals
interface RarityFlashProps {
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  isActive: boolean;
}

export function RarityFlash({ rarity, isActive }: RarityFlashProps) {
  if (!isActive) return null;

  const flashColor = {
    common: 'bg-slate-200',
    rare: 'bg-blue-400',
    epic: 'bg-purple-500',
    legendary: 'bg-amber-400'
  }[rarity];

  return (
    <div className={cn(
      "absolute inset-0 pointer-events-none animate-flash-out z-50",
      flashColor
    )} />
  );
}
