import React from 'react';

export const ErotismFrame: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <svg 
      className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}
      viewBox="0 0 400 300" 
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="erotism-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#9f1239" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#881337" stopOpacity="0.5" />
        </linearGradient>
      </defs>
      
      {/* Cadre élégant et sensuel */}
      <ellipse cx="200" cy="150" rx="190" ry="140"
        fill="none" 
        stroke="url(#erotism-gradient)" 
        strokeWidth="2.5" 
      />
      
      {/* Roses stylisées */}
      <g opacity="0.5">
        {/* Rose haut gauche */}
        <circle cx="30" cy="30" r="8" fill="#9f1239" opacity="0.4" />
        <circle cx="30" cy="30" r="5" fill="#be123c" opacity="0.5" />
        <path d="M 30 38 Q 28 45, 30 50" stroke="#4c0519" strokeWidth="2" fill="none" />
        <path d="M 28 42 L 25 45" stroke="#15803d" strokeWidth="1.5" fill="none" />
        <path d="M 32 42 L 35 45" stroke="#15803d" strokeWidth="1.5" fill="none" />
        
        {/* Rose haut droit */}
        <circle cx="370" cy="30" r="8" fill="#9f1239" opacity="0.4" />
        <circle cx="370" cy="30" r="5" fill="#be123c" opacity="0.5" />
        <path d="M 370 38 Q 372 45, 370 50" stroke="#4c0519" strokeWidth="2" fill="none" />
        
        {/* Pétales décoratifs */}
        <ellipse cx="25" cy="270" rx="6" ry="4" fill="#9f1239" opacity="0.3" transform="rotate(25 25 270)" />
        <ellipse cx="375" cy="270" rx="6" ry="4" fill="#9f1239" opacity="0.3" transform="rotate(-25 375 270)" />
      </g>
    </svg>
  );
};
