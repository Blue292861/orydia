import React from 'react';

export const SliceOfLifeFrame: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <svg 
      className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}
      viewBox="0 0 400 300" 
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="slice-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#a8a29e" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#78716c" stopOpacity="0.4" />
        </linearGradient>
      </defs>
      
      {/* Cadre simple et chaleureux */}
      <rect x="10" y="10" width="380" height="280" rx="15" ry="15"
        fill="none" 
        stroke="url(#slice-gradient)" 
        strokeWidth="2.5" 
      />
      
      {/* Tasses de café stylisées aux coins */}
      <g opacity="0.5" stroke="#78716c" strokeWidth="1.5" fill="none">
        {/* Coin haut gauche */}
        <ellipse cx="25" cy="28" rx="6" ry="4" fill="#a8a29e" opacity="0.3" />
        <path d="M 20 25 Q 20 20, 25 20 Q 30 20, 30 25 L 30 32 Q 30 35, 25 35 Q 20 35, 20 32 Z" />
        <path d="M 30 27 L 35 27 Q 37 27, 37 29 Q 37 31, 35 31 L 30 31" />
        
        {/* Coin haut droit */}
        <ellipse cx="375" cy="28" rx="6" ry="4" fill="#a8a29e" opacity="0.3" />
        <path d="M 370 25 Q 370 20, 375 20 Q 380 20, 380 25 L 380 32 Q 380 35, 375 35 Q 370 35, 370 32 Z" />
      </g>
    </svg>
  );
};
