import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Star, Sparkles } from 'lucide-react';
import { useConfetti } from '@/hooks/useConfetti';

interface CollectionCompleteAnimationProps {
  isOpen: boolean;
  collectionName: string;
  collectionIconUrl?: string;
  onContinue: () => void;
}

export const CollectionCompleteAnimation: React.FC<CollectionCompleteAnimationProps> = ({
  isOpen,
  collectionName,
  collectionIconUrl,
  onContinue,
}) => {
  const { triggerConfetti, cleanup } = useConfetti();

  useEffect(() => {
    if (isOpen) {
      // Rainbow confetti for collection completion
      setTimeout(() => {
        triggerConfetti({
          colors: ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899'],
          count: 180,
          duration: 4000,
        });
      }, 500);
    }
    return () => cleanup();
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md">
      {/* Orbiting stars */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute left-1/2 top-1/2 animate-collection-orbit"
            style={{
              animationDelay: `${i * 0.3}s`,
              animationDuration: `${3 + i * 0.5}s`,
            }}
          >
            <Star 
              className="w-4 h-4 text-amber-400" 
              fill="currentColor"
              style={{
                transform: `translateX(${80 + i * 15}px)`,
              }}
            />
          </div>
        ))}
      </div>

      <div className="flex flex-col items-center gap-6 p-8 max-w-md mx-4">
        {/* Collection icon with energy effect */}
        <div className="relative">
          {/* Energy rings */}
          <div className="absolute inset-0 -m-16 rounded-full border-2 border-primary/40 animate-collection-ring-1" />
          <div className="absolute inset-0 -m-12 rounded-full border-2 border-amber-400/40 animate-collection-ring-2" />
          <div className="absolute inset-0 -m-8 rounded-full border-2 border-primary/60 animate-collection-ring-3" />
          
          {/* Central glow */}
          <div className="absolute inset-0 -m-4 rounded-full bg-gradient-to-r from-primary/40 to-amber-400/40 blur-xl animate-pulse" />
          
          {/* Icon container */}
          <div className="relative animate-collection-icon-appear">
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-gradient-to-br from-primary via-primary/80 to-amber-500 flex items-center justify-center shadow-2xl shadow-primary/50 border-4 border-primary/50 overflow-hidden">
              {collectionIconUrl ? (
                <img 
                  src={collectionIconUrl} 
                  alt={collectionName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Star className="w-16 h-16 md:w-20 md:h-20 text-white" fill="currentColor" />
              )}
            </div>
            
            {/* Completion badge */}
            <div className="absolute -bottom-2 -right-2 w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg animate-bounce">
              <span className="text-white text-xl font-bold">✓</span>
            </div>
          </div>
        </div>

        {/* Sparkle decorations */}
        <div className="absolute top-1/4 left-1/4 animate-collection-sparkle">
          <Sparkles className="w-6 h-6 text-amber-400" />
        </div>
        <div className="absolute top-1/3 right-1/4 animate-collection-sparkle" style={{ animationDelay: '0.2s' }}>
          <Sparkles className="w-5 h-5 text-primary" />
        </div>
        <div className="absolute bottom-1/3 left-1/3 animate-collection-sparkle" style={{ animationDelay: '0.4s' }}>
          <Sparkles className="w-4 h-4 text-emerald-400" />
        </div>

        {/* Text content */}
        <div className="text-center space-y-3 animate-collection-text-appear">
          <div className="flex items-center justify-center gap-2">
            <Star className="w-5 h-5 text-amber-400" fill="currentColor" />
            <span className="text-amber-400 text-sm uppercase tracking-widest font-bold">
              Collection Complète
            </span>
            <Star className="w-5 h-5 text-amber-400" fill="currentColor" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-white">
            {collectionName}
          </h2>
          <p className="text-primary/80 text-sm md:text-base">
            Vous avez rassemblé toutes les cartes !
          </p>
          <p className="text-amber-200 text-sm flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4" />
            Récompenses de collection débloquées
            <Sparkles className="w-4 h-4" />
          </p>
        </div>

        {/* Continue button */}
        <Button
          onClick={onContinue}
          size="lg"
          className="mt-4 bg-gradient-to-r from-primary to-amber-500 hover:from-primary/90 hover:to-amber-500/90 text-white font-semibold px-10 py-4 rounded-full shadow-lg shadow-primary/30 transition-all hover:scale-105 animate-collection-button-appear"
        >
          Continuer
        </Button>
      </div>
    </div>
  );
};
