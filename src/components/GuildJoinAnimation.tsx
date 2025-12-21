import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Shield, Users } from 'lucide-react';

interface GuildJoinAnimationProps {
  isOpen: boolean;
  guildName: string;
  guildBannerUrl?: string;
  onContinue: () => void;
}

export const GuildJoinAnimation: React.FC<GuildJoinAnimationProps> = ({
  isOpen,
  guildName,
  guildBannerUrl,
  onContinue,
}) => {
  const [phase, setPhase] = useState<'doors' | 'banner' | 'complete'>('doors');

  useEffect(() => {
    if (isOpen) {
      setPhase('doors');
      // Doors open
      setTimeout(() => setPhase('banner'), 1000);
      // Banner drops
      setTimeout(() => setPhase('complete'), 1800);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md overflow-hidden">
      {/* Castle doors */}
      <div className="absolute inset-0 flex">
        <div 
          className={`w-1/2 h-full bg-gradient-to-r from-stone-800 to-stone-700 border-r-4 border-stone-600 transition-transform duration-1000 ease-in-out ${
            phase !== 'doors' ? '-translate-x-full' : ''
          }`}
        >
          <div className="absolute right-8 top-1/2 -translate-y-1/2 w-6 h-12 rounded-full bg-amber-700 shadow-inner" />
        </div>
        <div 
          className={`w-1/2 h-full bg-gradient-to-l from-stone-800 to-stone-700 border-l-4 border-stone-600 transition-transform duration-1000 ease-in-out ${
            phase !== 'doors' ? 'translate-x-full' : ''
          }`}
        >
          <div className="absolute left-8 top-1/2 -translate-y-1/2 w-6 h-12 rounded-full bg-amber-700 shadow-inner" />
        </div>
      </div>

      {/* Content behind doors */}
      {phase !== 'doors' && (
        <div className="relative flex flex-col items-center gap-6 p-8 max-w-md mx-4">
          {/* Banner dropping */}
          <div 
            className={`relative transition-all duration-700 ease-out ${
              phase === 'complete' ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
            }`}
          >
            {/* Banner pole */}
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-48 h-2 bg-gradient-to-b from-amber-600 to-amber-800 rounded-full" />
            
            {/* Banner fabric */}
            <div className="relative w-44 md:w-56 overflow-hidden">
              {guildBannerUrl ? (
                <img 
                  src={guildBannerUrl} 
                  alt={guildName}
                  className="w-full h-48 md:h-56 object-cover rounded-b-lg shadow-2xl border-4 border-amber-700/50"
                />
              ) : (
                <div className="w-full h-48 md:h-56 bg-gradient-to-b from-forest-600 to-forest-800 rounded-b-lg shadow-2xl border-4 border-amber-700/50 flex items-center justify-center">
                  <Shield className="w-16 h-16 text-gold-400" />
                </div>
              )}
              
              {/* Banner fringe */}
              <div className="absolute bottom-0 left-0 right-0 h-4 flex justify-around">
                {[...Array(7)].map((_, i) => (
                  <div key={i} className="w-3 h-4 bg-amber-600 rounded-b-full" />
                ))}
              </div>
            </div>
          </div>

          {/* Welcome text */}
          {phase === 'complete' && (
            <>
              <div className="text-center space-y-3 animate-guild-welcome-appear">
                <div className="flex items-center justify-center gap-2 text-amber-400">
                  <Users className="w-5 h-5" />
                  <span className="text-sm uppercase tracking-widest">Bienvenue</span>
                  <Users className="w-5 h-5" />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-white">
                  {guildName}
                </h2>
                <p className="text-gold-200/80 text-sm md:text-base">
                  Vous faites maintenant partie de la guilde !
                </p>
              </div>

              <Button
                onClick={onContinue}
                size="lg"
                className="bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-forest-900 font-semibold px-10 py-4 rounded-full shadow-lg shadow-gold-500/30 transition-all hover:scale-105 animate-guild-button-appear"
              >
                Découvrir ma Guilde
              </Button>
            </>
          )}
        </div>
      )}
    </div>
  );
};
