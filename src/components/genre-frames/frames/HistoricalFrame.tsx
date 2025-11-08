import React from 'react';

export const HistoricalFrame: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <svg 
      className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}
      viewBox="0 0 400 300" 
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="historical-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#d97706" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#b45309" stopOpacity="0.5" />
        </linearGradient>
      </defs>
      
      {/* Cadre parchemin ancien */}
      <rect x="10" y="10" width="380" height="280" rx="3" ry="3"
        fill="none" 
        stroke="url(#historical-gradient)" 
        strokeWidth="3" 
      />
      
      {/* Effet parchemin usé */}
      <path d="M 10 10 L 390 10" stroke="#92400e" strokeWidth="1.5" opacity="0.3" strokeDasharray="5,3" />
      <path d="M 10 290 L 390 290" stroke="#92400e" strokeWidth="1.5" opacity="0.3" strokeDasharray="5,3" />
      
      {/* Sceaux et symboles historiques */}
      <g opacity="0.5">
        {/* Sceau haut gauche */}
        <circle cx="25" cy="25" r="10" fill="none" stroke="#d97706" strokeWidth="2" />
        <circle cx="25" cy="25" r="6" fill="none" stroke="#b45309" strokeWidth="1" />
        <path d="M 25 19 L 25 31 M 19 25 L 31 25" stroke="#d97706" strokeWidth="1.5" />
        
        {/* Plume d'écriture haut droit */}
        <path d="M 375 15 Q 380 20, 385 30" stroke="#d97706" strokeWidth="2" fill="none" strokeLinecap="round" />
        <path d="M 375 15 L 378 18" stroke="#b45309" strokeWidth="1" />
        
        {/* Parchemin roulé coin bas */}
        <rect x="15" y="270" width="25" height="18" rx="2" fill="none" stroke="#d97706" strokeWidth="1.5" />
        <line x1="20" y1="272" x2="20" y2="286" stroke="#b45309" strokeWidth="1" opacity="0.5" />
        <line x1="25" y1="272" x2="25" y2="286" stroke="#b45309" strokeWidth="1" opacity="0.5" />
        <line x1="30" y1="272" x2="30" y2="286" stroke="#b45309" strokeWidth="1" opacity="0.5" />
      </g>
    </svg>
  );
};
