import React from 'react';

export const MysteryFrame: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <svg 
      className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}
      viewBox="0 0 400 300" 
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="mystery-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#475569" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#334155" stopOpacity="0.5" />
        </linearGradient>
      </defs>
      
      {/* Cadre avec coins coupés */}
      <path d="M 30 5 L 370 5 L 395 30 L 395 270 L 370 295 L 30 295 L 5 270 L 5 30 Z"
        fill="none" 
        stroke="url(#mystery-gradient)" 
        strokeWidth="2.5" 
      />
      
      {/* Loupes et indices aux coins */}
      <g opacity="0.5">
        {/* Loupe haut gauche */}
        <circle cx="25" cy="25" r="8" fill="none" stroke="#64748b" strokeWidth="2" />
        <line x1="31" y1="31" x2="37" y2="37" stroke="#64748b" strokeWidth="2" />
        
        {/* Loupe haut droit */}
        <circle cx="375" cy="25" r="8" fill="none" stroke="#64748b" strokeWidth="2" />
        <line x1="369" y1="31" x2="363" y2="37" stroke="#64748b" strokeWidth="2" />
        
        {/* Empreintes digitales stylisées */}
        <g stroke="#475569" strokeWidth="1" fill="none" opacity="0.6">
          <ellipse cx="25" cy="275" rx="8" ry="10" />
          <ellipse cx="25" cy="275" rx="5" ry="7" />
          <ellipse cx="25" cy="275" rx="3" ry="4" />
          
          <ellipse cx="375" cy="275" rx="8" ry="10" />
          <ellipse cx="375" cy="275" rx="5" ry="7" />
          <ellipse cx="375" cy="275" rx="3" ry="4" />
        </g>
      </g>
    </svg>
  );
};
