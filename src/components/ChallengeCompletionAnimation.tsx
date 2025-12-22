import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Trophy, Sparkles } from 'lucide-react';
import { useConfetti } from '@/hooks/useConfetti';
import { Challenge } from '@/types/Challenge';

interface ChallengeCompletionAnimationProps {
  isOpen: boolean;
  challenge: Challenge | null;
  onContinue: () => void;
}

export const ChallengeCompletionAnimation: React.FC<ChallengeCompletionAnimationProps> = ({
  isOpen,
  challenge,
  onContinue,
}) => {
  const { triggerConfetti, cleanup } = useConfetti();

  useEffect(() => {
    if (isOpen) {
      // Trigger confetti with emerald/gold colors
      setTimeout(() => {
        triggerConfetti({
          colors: ['#10b981', '#34d399', '#fbbf24', '#f59e0b', '#ffffff'],
          count: 150,
          duration: 3000,
        });
      }, 300);
    }
    return () => cleanup();
  }, [isOpen]);

  if (!isOpen || !challenge) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md">
      <div className="flex flex-col items-center gap-6 p-8 max-w-md mx-4">
        {/* Glowing halo */}
        <div className="relative">
          {/* Outer pulse */}
          <div className="absolute inset-0 -m-12 rounded-full bg-emerald-500/20 animate-ping" />
          <div className="absolute inset-0 -m-8 rounded-full bg-emerald-400/30 animate-pulse" />
          
          {/* Central badge */}
          <div className="relative animate-challenge-badge-appear">
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-gradient-to-br from-emerald-400 via-emerald-500 to-emerald-600 flex items-center justify-center shadow-2xl shadow-emerald-500/50 border-4 border-emerald-300/50">
              <span className="text-5xl md:text-6xl animate-bounce">{challenge.icon}</span>
            </div>
            
            {/* Trophy badge */}
            <div className="absolute -bottom-2 -right-2 w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg animate-challenge-trophy-pop">
              <Trophy className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        {/* Sparkles decoration */}
        <div className="absolute top-1/4 left-1/4 animate-challenge-sparkle-1">
          <Sparkles className="w-6 h-6 text-amber-400" />
        </div>
        <div className="absolute top-1/3 right-1/4 animate-challenge-sparkle-2">
          <Sparkles className="w-5 h-5 text-emerald-400" />
        </div>
        <div className="absolute bottom-1/3 left-1/3 animate-challenge-sparkle-3">
          <Sparkles className="w-4 h-4 text-amber-300" />
        </div>

        {/* Text content */}
        <div className="text-center space-y-3 animate-challenge-text-slide">
          <h2 className="text-3xl md:text-4xl font-bold text-white">
            Défi Accompli !
          </h2>
          <p className="text-emerald-100 text-lg md:text-xl leading-relaxed">
            {challenge.name}
          </p>
          <p className="text-amber-300 text-sm md:text-base flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4" />
            Récompenses réclamées avec succès
            <Sparkles className="w-4 h-4" />
          </p>
        </div>

        {/* Continue button */}
        <Button
          onClick={onContinue}
          size="lg"
          className="mt-4 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold px-10 py-4 rounded-full shadow-lg shadow-emerald-500/30 transition-all hover:scale-105 animate-challenge-button-appear"
        >
          Continuer
        </Button>
      </div>
    </div>
  );
};
