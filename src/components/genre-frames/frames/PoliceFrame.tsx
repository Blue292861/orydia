import React from 'react';

export const PoliceFrame: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <svg 
      className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}
      viewBox="0 0 400 300" 
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="police-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1e40af" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#1e3a8a" stopOpacity="0.5" />
        </linearGradient>
      </defs>
      
      {/* Cadre badge de police */}
      <path d="M 200 5 L 390 80 L 390 220 L 200 295 L 10 220 L 10 80 Z"
        fill="none" 
        stroke="url(#police-gradient)" 
        strokeWidth="2.5" 
      />
      
      {/* Étoiles de badge */}
      <g opacity="0.5" fill="#1e40af">
        <path d="M 25 25 L 27 32 L 34 32 L 29 36 L 31 43 L 25 39 L 19 43 L 21 36 L 16 32 L 23 32 Z" />
        <path d="M 375 25 L 377 32 L 384 32 L 379 36 L 381 43 L 375 39 L 369 43 L 371 36 L 366 32 L 373 32 Z" />
      </g>
      
      {/* Ruban police */}
      <g opacity="0.4" stroke="#1e40af" strokeWidth="2" fill="none">
        <line x1="20" y1="270" x2="380" y2="270" strokeDasharray="10,5" />
        <text x="150" y="275" fontSize="12" fill="#1e3a8a" opacity="0.6">POLICE LINE</text>
      </g>
    </svg>
  );
};
