import React from 'react';

export const DystopiaFrame: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <svg 
      className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}
      viewBox="0 0 400 300" 
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="dystopia-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#064e3b" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#022c22" stopOpacity="0.5" />
        </linearGradient>
      </defs>
      
      {/* Cadre industriel oppressif */}
      <rect x="5" y="5" width="390" height="290"
        fill="none" 
        stroke="url(#dystopia-gradient)" 
        strokeWidth="3" 
        strokeDasharray="15,5"
      />
      
      {/* Engrenages et mécanismes */}
      <g opacity="0.5">
        {/* Engrenage haut gauche */}
        <circle cx="30" cy="30" r="12" fill="none" stroke="#064e3b" strokeWidth="2" />
        <circle cx="30" cy="30" r="6" fill="none" stroke="#047857" strokeWidth="1.5" />
        <g stroke="#064e3b" strokeWidth="2">
          <line x1="30" y1="18" x2="30" y2="22" />
          <line x1="30" y1="38" x2="30" y2="42" />
          <line x1="18" y1="30" x2="22" y2="30" />
          <line x1="38" y1="30" x2="42" y2="30" />
        </g>
        
        {/* Engrenage haut droit */}
        <circle cx="370" cy="30" r="12" fill="none" stroke="#064e3b" strokeWidth="2" />
        <circle cx="370" cy="30" r="6" fill="none" stroke="#047857" strokeWidth="1.5" />
        <g stroke="#064e3b" strokeWidth="2">
          <line x1="370" y1="18" x2="370" y2="22" />
          <line x1="370" y1="38" x2="370" y2="42" />
          <line x1="358" y1="30" x2="362" y2="30" />
          <line x1="378" y1="30" x2="382" y2="30" />
        </g>
        
        {/* Barbelés stylisés */}
        <g stroke="#064e3b" strokeWidth="1.5" fill="none">
          <path d="M 10 270 L 15 275 L 20 270 L 25 275 L 30 270" />
          <path d="M 370 270 L 375 275 L 380 270 L 385 275 L 390 270" />
        </g>
      </g>
    </svg>
  );
};
