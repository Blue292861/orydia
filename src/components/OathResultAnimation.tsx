import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Trophy, Skull, Coins } from 'lucide-react';
import { useConfetti } from '@/hooks/useConfetti';

interface OathResultAnimationProps {
  isOpen: boolean;
  isVictory: boolean;
  bookTitle: string;
  amount: number; // Positive for win, negative for loss
  onContinue: () => void;
}

export const OathResultAnimation: React.FC<OathResultAnimationProps> = ({
  isOpen,
  isVictory,
  bookTitle,
  amount,
  onContinue,
}) => {
  const { triggerConfetti, cleanup } = useConfetti();

  useEffect(() => {
    if (isOpen && isVictory) {
      setTimeout(() => {
        triggerConfetti({
          colors: ['#10b981', '#fbbf24', '#f59e0b', '#22c55e', '#ffffff'],
          count: 200,
          duration: 4000,
        });
      }, 300);
    }
    return () => cleanup();
  }, [isOpen, isVictory]);

  if (!isOpen) return null;

  if (isVictory) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md">
        <div className="flex flex-col items-center gap-6 p-8 max-w-md mx-4">
          {/* Victory glow */}
          <div className="relative">
            <div className="absolute inset-0 -m-12 rounded-full bg-emerald-500/30 animate-ping" />
            <div className="absolute inset-0 -m-8 rounded-full bg-amber-500/20 animate-pulse" />
            
            {/* Trophy */}
            <div className="relative animate-oath-victory-appear">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-600 flex items-center justify-center shadow-2xl shadow-amber-500/50 border-4 border-amber-300/50 animate-glow">
                <Trophy className="w-16 h-16 md:w-20 md:h-20 text-white" />
              </div>
            </div>
          </div>

          {/* Coins raining effect */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className="absolute animate-oath-coin-rain"
                style={{
                  left: `${10 + (i * 7)}%`,
                  animationDelay: `${i * 0.15}s`,
                }}
              >
                <Coins className="w-6 h-6 text-amber-400" />
              </div>
            ))}
          </div>

          {/* Text */}
          <div className="text-center space-y-3 animate-oath-text-slide">
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              Serment Honoré !
            </h2>
            <p className="text-emerald-100 text-lg">
              « {bookTitle} »
            </p>
            <div className="flex items-center justify-center gap-2 text-2xl font-bold text-emerald-400">
              <Coins className="w-6 h-6" />
              +{Math.abs(amount).toLocaleString()} Orydors
            </div>
            <p className="text-amber-200/80 text-sm">
              Votre mise + 10% de bonus !
            </p>
          </div>

          <Button
            onClick={onContinue}
            size="lg"
            className="mt-4 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold px-10 py-4 rounded-full shadow-lg shadow-emerald-500/30 transition-all hover:scale-105"
          >
            Continuer
          </Button>
        </div>
      </div>
    );
  }

  // Defeat animation
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md animate-oath-defeat-shake">
      {/* Ash particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-gray-400/60 rounded-full animate-oath-ash-fall"
            style={{
              left: `${5 + (i * 4.5)}%`,
              animationDelay: `${i * 0.1}s`,
            }}
          />
        ))}
      </div>

      <div className="flex flex-col items-center gap-6 p-8 max-w-md mx-4">
        {/* Defeat emblem */}
        <div className="relative">
          <div className="absolute inset-0 -m-8 rounded-full bg-red-900/40 blur-xl animate-pulse" />
          
          <div className="relative animate-oath-defeat-appear">
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-gradient-to-br from-gray-700 via-gray-800 to-gray-900 flex items-center justify-center shadow-2xl border-4 border-red-900/50">
              <Skull className="w-16 h-16 md:w-20 md:h-20 text-red-400" />
            </div>
            
            {/* Crack effect */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-full h-1 bg-red-500/60 rotate-45 animate-oath-crack" />
            </div>
          </div>
        </div>

        {/* Text */}
        <div className="text-center space-y-3 animate-oath-defeat-text">
          <h2 className="text-3xl md:text-4xl font-bold text-red-400">
            Serment Rompu...
          </h2>
          <p className="text-gray-300 text-lg">
            « {bookTitle} »
          </p>
          <div className="flex items-center justify-center gap-2 text-2xl font-bold text-red-500">
            <Coins className="w-6 h-6" />
            -{Math.abs(amount).toLocaleString()} Orydors
          </div>
          <p className="text-gray-400 text-sm">
            Mise + 10% de pénalité perdus
          </p>
        </div>

        <Button
          onClick={onContinue}
          size="lg"
          variant="outline"
          className="mt-4 border-gray-600 text-gray-300 hover:bg-gray-800 font-semibold px-10 py-4 rounded-full transition-all"
        >
          Continuer
        </Button>
      </div>
    </div>
  );
};
