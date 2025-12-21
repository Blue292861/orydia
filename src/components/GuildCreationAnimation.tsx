import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Crown, Shield, Sparkles } from 'lucide-react';
import { useConfetti } from '@/hooks/useConfetti';

interface GuildCreationAnimationProps {
  isOpen: boolean;
  guildName: string;
  guildBannerUrl?: string;
  onContinue: () => void;
}

export const GuildCreationAnimation: React.FC<GuildCreationAnimationProps> = ({
  isOpen,
  guildName,
  guildBannerUrl,
  onContinue,
}) => {
  const [phase, setPhase] = useState<'building' | 'banner' | 'complete'>('building');
  const { triggerConfetti, cleanup } = useConfetti();

  useEffect(() => {
    if (isOpen) {
      setPhase('building');
      // Castle builds
      setTimeout(() => setPhase('banner'), 1500);
      // Banner and confetti
      setTimeout(() => {
        setPhase('complete');
        triggerConfetti({
          colors: ['#fbbf24', '#f59e0b', '#d97706', '#ffffff', '#a855f7'],
          count: 200,
          duration: 4000,
        });
      }, 2500);
    }
    return () => cleanup();
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md overflow-hidden">
      {/* Divine rays */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute top-0 left-1/2 h-full w-8 bg-gradient-to-b from-amber-400/20 to-transparent origin-top animate-guild-ray"
              style={{
                transform: `translateX(-50%) rotate(${(i - 3.5) * 15}deg)`,
                animationDelay: `${i * 0.1}s`,
              }}
            />
          ))}
        </div>
      </div>

      <div className="relative flex flex-col items-center gap-6 p-8 max-w-md mx-4">
        {/* Castle building animation */}
        <div className="relative">
          {/* Foundation sparkles */}
          <div className={`absolute -inset-8 flex items-center justify-center ${phase === 'building' ? 'opacity-100' : 'opacity-0'} transition-opacity`}>
            <Sparkles className="w-6 h-6 text-amber-400 absolute -left-4 animate-pulse" />
            <Sparkles className="w-6 h-6 text-amber-400 absolute -right-4 animate-pulse" style={{ animationDelay: '0.3s' }} />
            <Sparkles className="w-6 h-6 text-amber-400 absolute -top-4 animate-pulse" style={{ animationDelay: '0.6s' }} />
          </div>

          {/* Castle structure */}
          <div 
            className={`relative transition-all duration-1000 ease-out ${
              phase === 'building' ? 'scale-0 opacity-0' : 'scale-100 opacity-100'
            }`}
          >
            {/* Main tower */}
            <div className="relative w-40 md:w-48 h-48 md:h-56 bg-gradient-to-b from-stone-500 to-stone-700 rounded-t-3xl shadow-2xl border-4 border-stone-400/50 overflow-hidden">
              {/* Tower windows */}
              <div className="absolute top-8 left-1/2 -translate-x-1/2 w-8 h-12 bg-amber-400/80 rounded-t-full shadow-inner" />
              <div className="absolute top-24 left-6 w-6 h-8 bg-stone-900 rounded-t-full" />
              <div className="absolute top-24 right-6 w-6 h-8 bg-stone-900 rounded-t-full" />
              
              {/* Gate */}
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-20 bg-gradient-to-b from-amber-800 to-amber-900 rounded-t-full border-4 border-amber-700" />
              
              {/* Side towers */}
              <div className="absolute -left-4 bottom-0 w-8 h-32 bg-gradient-to-b from-stone-500 to-stone-700 rounded-t-lg border-2 border-stone-400/50" />
              <div className="absolute -right-4 bottom-0 w-8 h-32 bg-gradient-to-b from-stone-500 to-stone-700 rounded-t-lg border-2 border-stone-400/50" />
            </div>

            {/* Banner on castle */}
            {phase === 'complete' && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-8 animate-guild-banner-wave">
                <div className="w-16 h-20 bg-gradient-to-b from-gold-400 to-gold-600 rounded-b-sm flex items-center justify-center shadow-lg">
                  {guildBannerUrl ? (
                    <img src={guildBannerUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <Shield className="w-8 h-8 text-gold-900" />
                  )}
                </div>
                {/* Pole */}
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-1 h-8 bg-amber-800" />
              </div>
            )}
          </div>

          {/* Founder crown */}
          {phase === 'complete' && (
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 animate-guild-crown-appear">
              <Crown className="w-12 h-12 text-amber-400 drop-shadow-lg" fill="currentColor" />
            </div>
          )}
        </div>

        {/* Text content */}
        {phase === 'complete' && (
          <>
            <div className="text-center space-y-3 animate-guild-creation-text">
              <div className="flex items-center justify-center gap-2">
                <Crown className="w-5 h-5 text-amber-400" />
                <span className="text-amber-400 text-sm uppercase tracking-widest font-bold">
                  Fondateur
                </span>
                <Crown className="w-5 h-5 text-amber-400" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-white">
                {guildName}
              </h2>
              <p className="text-gold-200/80 text-sm md:text-base">
                Votre guilde a été créée avec succès !
              </p>
            </div>

            <Button
              onClick={onContinue}
              size="lg"
              className="bg-gradient-to-r from-amber-500 via-gold-500 to-amber-500 hover:from-amber-600 hover:to-amber-600 text-amber-950 font-bold px-10 py-4 rounded-full shadow-lg shadow-amber-500/30 transition-all hover:scale-105 animate-guild-button-appear"
            >
              <Crown className="w-5 h-5 mr-2" />
              Entrer dans ma Guilde
            </Button>
          </>
        )}
      </div>
    </div>
  );
};
