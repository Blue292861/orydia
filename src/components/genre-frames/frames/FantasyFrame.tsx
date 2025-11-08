import React from 'react';

export const FantasyFrame: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <svg 
      className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}
      viewBox="0 0 400 300" 
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="fantasy-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#d97706" stopOpacity="0.5" />
        </linearGradient>
      </defs>
      
      {/* Cadre rectangulaire avec coins arrondis */}
      <rect x="5" y="5" width="390" height="290" rx="20" ry="20"
        fill="none" 
        stroke="url(#fantasy-gradient)" 
        strokeWidth="3" 
      />
      
      {/* Runes et symboles magiques aux coins */}
      <g opacity="0.6" fill="#f59e0b">
        {/* Coin haut gauche - étoile */}
        <path d="M 25 25 L 27 30 L 32 30 L 28 33 L 30 38 L 25 35 L 20 38 L 22 33 L 18 30 L 23 30 Z" />
        
        {/* Coin haut droit - cristal */}
        <path d="M 375 20 L 380 28 L 375 36 L 370 28 Z" />
        <line x1="375" y1="28" x2="375" y2="20" stroke="#f59e0b" strokeWidth="1" />
        
        {/* Coin bas gauche - lune */}
        <path d="M 20 270 Q 25 275, 20 280 Q 28 277, 28 273 Q 28 269, 20 270" />
        
        {/* Coin bas droit - rune */}
        <path d="M 370 270 L 370 280 M 365 273 L 370 273 L 375 278" stroke="#f59e0b" strokeWidth="2" fill="none" />
      </g>
    </svg>
  );
};
