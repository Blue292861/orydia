import React from 'react';

export const WesternFrame: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <svg 
      className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}
      viewBox="0 0 400 300" 
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="western-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#b45309" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#92400e" stopOpacity="0.5" />
        </linearGradient>
      </defs>
      
      {/* Cadre en bois rustique */}
      <rect x="8" y="8" width="384" height="284" rx="5" ry="5"
        fill="none" 
        stroke="url(#western-gradient)" 
        strokeWidth="4" 
      />
      <rect x="12" y="12" width="376" height="276" rx="3" ry="3"
        fill="none" 
        stroke="#92400e" 
        strokeWidth="1.5" 
        opacity="0.5"
      />
      
      {/* Étoiles de shérif aux coins */}
      <g opacity="0.5" fill="#b45309">
        <path d="M 25 25 L 27 30 L 32 30 L 28 33 L 30 38 L 25 35 L 20 38 L 22 33 L 18 30 L 23 30 Z" />
        <path d="M 375 25 L 377 30 L 382 30 L 378 33 L 380 38 L 375 35 L 370 38 L 372 33 L 368 30 L 373 30 Z" />
        <path d="M 25 275 L 27 280 L 32 280 L 28 283 L 30 288 L 25 285 L 20 288 L 22 283 L 18 280 L 23 280 Z" />
        <path d="M 375 275 L 377 280 L 382 280 L 378 283 L 380 288 L 375 285 L 370 288 L 372 283 L 368 280 L 373 280 Z" />
      </g>
    </svg>
  );
};
