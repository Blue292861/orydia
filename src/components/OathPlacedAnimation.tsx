import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Scroll, Flame } from 'lucide-react';

interface OathPlacedAnimationProps {
  isOpen: boolean;
  bookTitle: string;
  stakeAmount: number;
  onContinue: () => void;
}

export const OathPlacedAnimation: React.FC<OathPlacedAnimationProps> = ({
  isOpen,
  bookTitle,
  stakeAmount,
  onContinue,
}) => {
  const [phase, setPhase] = useState<'scroll' | 'seal' | 'complete'>('scroll');

  useEffect(() => {
    if (isOpen) {
      setPhase('scroll');
      // Scroll unrolls
      setTimeout(() => setPhase('seal'), 800);
      // Seal stamps
      setTimeout(() => setPhase('complete'), 1600);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md">
      {/* Mystical flames background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute left-1/4 bottom-0 w-32 h-64 bg-gradient-to-t from-amber-500/30 to-transparent blur-xl animate-oath-flame-1" />
        <div className="absolute right-1/4 bottom-0 w-24 h-48 bg-gradient-to-t from-orange-500/30 to-transparent blur-xl animate-oath-flame-2" />
      </div>

      <div className="relative flex flex-col items-center gap-6 p-8 max-w-md mx-4">
        {/* Scroll container */}
        <div className="relative">
          {/* Outer glow */}
          <div className="absolute inset-0 -m-8 rounded-lg bg-amber-500/20 blur-xl animate-pulse" />
          
          {/* Parchment scroll */}
          <div 
            className={`relative bg-gradient-to-b from-amber-100 to-amber-200 rounded-lg shadow-2xl border-4 border-amber-700/30 overflow-hidden transition-all duration-700 ${
              phase === 'scroll' ? 'h-0 opacity-0' : 'h-auto opacity-100'
            }`}
            style={{
              animation: phase !== 'scroll' ? 'oath-scroll-unroll 0.8s ease-out forwards' : 'none',
            }}
          >
            <div className="p-6 md:p-8 space-y-4">
              {/* Header */}
              <div className="text-center border-b-2 border-amber-700/30 pb-4">
                <Scroll className="w-8 h-8 mx-auto text-amber-800 mb-2" />
                <h3 className="font-medieval text-xl md:text-2xl text-amber-900 font-bold">
                  Serment du Lecteur
                </h3>
              </div>

              {/* Content */}
              <div className="text-center space-y-3 text-amber-900">
                <p className="font-serif italic">
                  "Par ce serment, je m'engage à terminer..."
                </p>
                <p className="font-bold text-lg">
                  « {bookTitle} »
                </p>
                <p className="font-serif italic">
                  "...sous peine de perdre mes Orydors."
                </p>
              </div>

              {/* Stake */}
              <div className="text-center pt-2">
                <p className="text-amber-800 font-semibold">
                  Mise : {stakeAmount.toLocaleString()} Orydors
                </p>
              </div>
            </div>
          </div>

          {/* Wax seal */}
          {phase === 'complete' && (
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 animate-oath-seal-stamp">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center shadow-lg border-2 border-red-900/50">
                <Flame className="w-8 h-8 text-amber-200" />
              </div>
            </div>
          )}
        </div>

        {/* Text and button appear after seal */}
        {phase === 'complete' && (
          <>
            <div className="text-center space-y-2 mt-8 animate-oath-text-appear">
              <h2 className="text-2xl md:text-3xl font-bold text-amber-100">
                Serment Scellé !
              </h2>
              <p className="text-amber-200/80 text-sm md:text-base">
                Que votre lecture soit victorieuse
              </p>
            </div>

            <Button
              onClick={onContinue}
              size="lg"
              className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-amber-950 font-semibold px-10 py-4 rounded-full shadow-lg shadow-amber-500/30 transition-all hover:scale-105 animate-oath-button-appear"
            >
              Commencer ma Lecture
            </Button>
          </>
        )}
      </div>
    </div>
  );
};
