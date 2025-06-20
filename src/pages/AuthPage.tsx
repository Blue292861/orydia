
import React, { useEffect, useState } from 'react';
import { AuthPanel } from '@/components/AuthPanel';

const AuthPage: React.FC = () => {
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const handleResize = () => {
      // Detect if virtual keyboard is open by checking viewport height change
      const viewportHeight = window.visualViewport?.height || window.innerHeight;
      const windowHeight = window.innerHeight;
      const heightDiff = windowHeight - viewportHeight;
      
      // If height difference is significant, keyboard is likely open
      if (heightDiff > 150) {
        setKeyboardHeight(heightDiff);
      } else {
        setKeyboardHeight(0);
      }
    };

    // Listen for visual viewport changes (better for mobile keyboard detection)
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleResize);
    } else {
      // Fallback for older browsers
      window.addEventListener('resize', handleResize);
    }

    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleResize);
      } else {
        window.removeEventListener('resize', handleResize);
      }
    };
  }, []);

  return (
    <div 
      className="min-h-screen bg-gradient-to-br from-forest-900 via-forest-800 to-forest-700 relative overflow-hidden flex items-center justify-center p-4 transition-all duration-300"
      style={{
        paddingBottom: keyboardHeight > 0 ? `${keyboardHeight + 20}px` : '1rem'
      }}
    >
      {/* Fond animé avec des particules et effets magiques */}
      <div className="absolute inset-0 bg-gradient-to-br from-forest-900/80 via-forest-800/60 to-forest-700/80">
        {/* Particules flottantes */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-forest-200/30 rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 4}s`,
                animationDuration: `${2 + Math.random() * 3}s`
              }}
            />
          ))}
        </div>
        
        {/* Rayons de lumière mystiques */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 left-10 w-32 h-32 bg-gradient-radial from-forest-400/40 to-transparent rounded-full animate-pulse" />
          <div className="absolute bottom-20 right-20 w-24 h-24 bg-gradient-radial from-forest-300/30 to-transparent rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/4 w-20 h-20 bg-gradient-radial from-forest-500/20 to-transparent rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
        </div>
      </div>

      <div 
        className="relative z-10 w-full max-w-4xl transition-transform duration-300"
        style={{
          transform: keyboardHeight > 0 ? 'translateY(-20px)' : 'translateY(0)'
        }}
      >
        {/* En-tête Bienvenue en Orydia */}
        <div className="text-center mb-8">
          <h1 className="font-cursive text-6xl md:text-7xl text-title-blue drop-shadow-2xl mb-4 animate-fade-in-down">
            Bienvenue en Orydia
          </h1>
          <div className="flex justify-center items-center gap-4 mb-6">
            <div className="h-px bg-gradient-to-r from-transparent via-title-blue/50 to-transparent flex-1 max-w-32" />
            <div className="w-2 h-2 bg-title-blue rounded-full animate-pulse" />
            <div className="h-px bg-gradient-to-r from-transparent via-title-blue/50 to-transparent flex-1 max-w-32" />
          </div>
          <p className="font-serif text-forest-200 text-lg md:text-xl opacity-90 animate-fade-in">
            Entrez dans un monde de magie et d'aventures
          </p>
        </div>

        <AuthPanel />
      </div>
    </div>
  );
};

export default AuthPage;
