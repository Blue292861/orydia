import React from 'react';

export const RomanceFrame: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <svg 
      className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}
      viewBox="0 0 400 300" 
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="romance-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fda4af" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#fb7185" stopOpacity="0.4" />
        </linearGradient>
      </defs>
      
      {/* Cadre elliptique avec ornements floraux */}
      <ellipse cx="200" cy="150" rx="195" ry="145" 
        fill="none" 
        stroke="url(#romance-gradient)" 
        strokeWidth="3" 
      />
      
      {/* Fleurs aux coins */}
      <g opacity="0.5">
        {/* Coin haut gauche */}
        <circle cx="30" cy="30" r="8" fill="#fda4af" opacity="0.6" />
        <circle cx="25" cy="38" r="6" fill="#fb7185" opacity="0.5" />
        <circle cx="37" cy="36" r="5" fill="#fda4af" opacity="0.5" />
        
        {/* Coin haut droit */}
        <circle cx="370" cy="30" r="8" fill="#fda4af" opacity="0.6" />
        <circle cx="375" cy="38" r="6" fill="#fb7185" opacity="0.5" />
        <circle cx="363" cy="36" r="5" fill="#fda4af" opacity="0.5" />
        
        {/* Coin bas gauche */}
        <circle cx="30" cy="270" r="8" fill="#fda4af" opacity="0.6" />
        <circle cx="25" cy="262" r="6" fill="#fb7185" opacity="0.5" />
        <circle cx="37" cy="264" r="5" fill="#fda4af" opacity="0.5" />
        
        {/* Coin bas droit */}
        <circle cx="370" cy="270" r="8" fill="#fda4af" opacity="0.6" />
        <circle cx="375" cy="262" r="6" fill="#fb7185" opacity="0.5" />
        <circle cx="363" cy="264" r="5" fill="#fda4af" opacity="0.5" />
      </g>
      
      {/* Feuilles décoratives */}
      <path d="M 20 150 Q 15 145, 20 140" stroke="#86efac" strokeWidth="2" fill="none" opacity="0.4" />
      <path d="M 380 150 Q 385 145, 380 140" stroke="#86efac" strokeWidth="2" fill="none" opacity="0.4" />
    </svg>
  );
};
