import React from 'react';

export const FantasticFrame: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <svg 
      className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}
      viewBox="0 0 400 300" 
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="fantastic-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#818cf8" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#6366f1" stopOpacity="0.5" />
        </linearGradient>
      </defs>
      
      {/* Cadre mystique avec vagues */}
      <path d="M 10 50 Q 10 5, 50 5 L 350 5 Q 390 5, 390 50 L 390 250 Q 390 295, 350 295 L 50 295 Q 10 295, 10 250 Z"
        fill="none" 
        stroke="url(#fantastic-gradient)" 
        strokeWidth="2.5" 
      />
      
      {/* Lunes et étoiles mystiques */}
      <g opacity="0.5">
        {/* Croissant de lune haut gauche */}
        <path d="M 25 20 Q 30 25, 25 30 Q 35 28, 35 22 Q 35 16, 25 20" fill="#818cf8" opacity="0.5" />
        
        {/* Étoiles scintillantes */}
        <g fill="#818cf8">
          <path d="M 375 20 L 376 25 L 381 25 L 377 28 L 379 33 L 375 30 L 371 33 L 373 28 L 369 25 L 374 25 Z" />
          <circle cx="370" cy="35" r="2" opacity="0.6" />
          <circle cx="382" cy="30" r="1.5" opacity="0.7" />
        </g>
        
        {/* Spirales magiques */}
        <g stroke="#818cf8" strokeWidth="1.5" fill="none" opacity="0.4">
          <path d="M 25 270 Q 28 273, 30 270 Q 32 267, 35 270 Q 37 273, 40 270" />
          <path d="M 375 270 Q 372 273, 370 270 Q 368 267, 365 270 Q 363 273, 360 270" />
        </g>
        
        {/* Orbes mystiques */}
        <circle cx="30" cy="280" r="4" fill="#818cf8" opacity="0.3" />
        <circle cx="30" cy="280" r="6" fill="none" stroke="#6366f1" strokeWidth="1" opacity="0.3" />
        <circle cx="370" cy="280" r="4" fill="#818cf8" opacity="0.3" />
        <circle cx="370" cy="280" r="6" fill="none" stroke="#6366f1" strokeWidth="1" opacity="0.3" />
      </g>
    </svg>
  );
};
