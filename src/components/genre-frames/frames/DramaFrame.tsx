import React from 'react';

export const DramaFrame: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <svg 
      className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}
      viewBox="0 0 400 300" 
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="drama-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#64748b" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#475569" stopOpacity="0.5" />
        </linearGradient>
      </defs>
      
      {/* Cadre sobre et élégant */}
      <rect x="8" y="8" width="384" height="284"
        fill="none" 
        stroke="url(#drama-gradient)" 
        strokeWidth="3" 
      />
      <rect x="15" y="15" width="370" height="270"
        fill="none" 
        stroke="#64748b" 
        strokeWidth="1" 
        opacity="0.4"
      />
      
      {/* Masques de théâtre */}
      <g opacity="0.5">
        {/* Masque sourire haut gauche */}
        <ellipse cx="25" cy="25" rx="10" ry="12" fill="none" stroke="#64748b" strokeWidth="2" />
        <path d="M 20 28 Q 25 32, 30 28" stroke="#64748b" strokeWidth="1.5" fill="none" />
        <circle cx="22" cy="23" r="1.5" fill="#64748b" />
        <circle cx="28" cy="23" r="1.5" fill="#64748b" />
        
        {/* Masque triste haut droit */}
        <ellipse cx="375" cy="25" rx="10" ry="12" fill="none" stroke="#64748b" strokeWidth="2" />
        <path d="M 370 32 Q 375 28, 380 32" stroke="#64748b" strokeWidth="1.5" fill="none" />
        <circle cx="372" cy="23" r="1.5" fill="#64748b" />
        <circle cx="378" cy="23" r="1.5" fill="#64748b" />
        
        {/* Rideau de théâtre stylisé */}
        <g stroke="#64748b" strokeWidth="1.5" fill="none" opacity="0.4">
          <path d="M 15 10 Q 18 12, 15 14" />
          <path d="M 385 10 Q 382 12, 385 14" />
        </g>
      </g>
    </svg>
  );
};
