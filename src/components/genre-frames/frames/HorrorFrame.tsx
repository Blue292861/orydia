import React from 'react';

export const HorrorFrame: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <svg 
      className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}
      viewBox="0 0 400 300" 
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="horror-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#7f1d1d" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#450a0a" stopOpacity="0.6" />
        </linearGradient>
      </defs>
      
      {/* Cadre irrégulier et menaçant */}
      <path d="M 10 8 L 390 12 L 388 288 L 12 292 Z"
        fill="none" 
        stroke="url(#horror-gradient)" 
        strokeWidth="3" 
        strokeDasharray="5,2"
      />
      
      {/* Gouttes de sang stylisées */}
      <g opacity="0.5" fill="#7f1d1d">
        <ellipse cx="30" cy="25" rx="4" ry="6" />
        <ellipse cx="370" cy="30" rx="3" ry="5" />
        <ellipse cx="25" cy="275" rx="5" ry="7" />
        <ellipse cx="375" cy="270" rx="4" ry="6" />
      </g>
      
      {/* Griffures aux coins */}
      <g opacity="0.4" stroke="#991b1b" strokeWidth="1.5" fill="none">
        <line x1="15" y1="15" x2="25" y2="25" />
        <line x1="18" y1="15" x2="28" y2="25" />
        <line x1="21" y1="15" x2="31" y2="25" />
        
        <line x1="385" y1="15" x2="375" y2="25" />
        <line x1="382" y1="15" x2="372" y2="25" />
        <line x1="379" y1="15" x2="369" y2="25" />
      </g>
    </svg>
  );
};
