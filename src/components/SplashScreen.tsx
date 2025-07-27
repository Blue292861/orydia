import React, { useState, useEffect } from 'react';

interface SplashScreenProps {
  onComplete: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [stage, setStage] = useState<'opening' | 'first-image' | 'turning-1' | 'second-image' | 'turning-2' | 'complete'>('opening');

  useEffect(() => {
    const timers = [
      // Livre qui s'ouvre (2s)
      setTimeout(() => setStage('first-image'), 2000),
      // Première image visible (2.5s)
      setTimeout(() => setStage('turning-1'), 4500),
      // Transition page qui se tourne (1.5s)
      setTimeout(() => setStage('second-image'), 6000),
      // Deuxième image visible (2.5s)
      setTimeout(() => setStage('turning-2'), 8500),
      // Transition finale (1.5s)
      setTimeout(() => {
        setStage('complete');
        onComplete();
      }, 10000),
    ];

    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 bg-background flex items-center justify-center overflow-hidden">
      {/* Conteneur du livre */}
      <div className="relative w-full h-full flex items-center justify-center perspective-1000">
        
        {/* Animation d'ouverture du livre */}
        <div 
          className={`
            absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5
            transition-all duration-1500 ease-out
            ${stage === 'opening' ? 'scale-95 opacity-100' : 'scale-100 opacity-0'}
          `}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-80 h-60 bg-primary/10 rounded-lg shadow-2xl animate-pulse" />
          </div>
        </div>

        {/* Page gauche - Première image */}
        <div 
          className={`
            absolute inset-0 flex items-center justify-center
            transition-opacity duration-1000 ease-out
            ${stage === 'first-image' ? 'opacity-100' : 
              stage === 'turning-1' ? 'opacity-0' : 
              'opacity-0'}
          `}
        >
          <img 
            src="/lovable-uploads/5e38b74d-d359-40b2-9b2a-fc6a285acb97.png"
            alt="Neptune Group et Neptune Editions"
            className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg shadow-2xl"
          />
        </div>

        {/* Page droite - Deuxième image */}
        <div 
          className={`
            absolute inset-0 flex items-center justify-center
            transition-opacity duration-1000 ease-out
            ${stage === 'second-image' ? 'opacity-100' : 
              stage === 'turning-2' ? 'opacity-0' : 
              'opacity-0'}
          `}
        >
          <img 
            src="/lovable-uploads/42bd291d-6f9c-4dbe-a698-7260960f8687.png"
            alt="Orydia"
            className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg shadow-2xl"
          />
        </div>

        {/* Effets de particules */}
        <div className="absolute inset-0 pointer-events-none">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className={`
                absolute w-1 h-1 bg-primary/30 rounded-full
                animate-pulse
                ${stage !== 'complete' ? 'opacity-100' : 'opacity-0'}
              `}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
              }}
            />
          ))}
        </div>

        {/* Effet de transition finale */}
        <div 
          className={`
            absolute inset-0 bg-background
            transition-opacity duration-1000 ease-out
            ${stage === 'complete' ? 'opacity-100' : 'opacity-0'}
          `}
        />
      </div>
    </div>
  );
};

export default SplashScreen;