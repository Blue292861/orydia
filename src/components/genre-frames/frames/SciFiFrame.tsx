import React from 'react';

export const SciFiFrame: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <svg 
      className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}
      viewBox="0 0 400 300" 
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="scifi-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.7" />
          <stop offset="50%" stopColor="#06b6d4" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.7" />
        </linearGradient>
      </defs>
      
      {/* Cadre hexagonal technologique */}
      <path d="M 50 5 L 350 5 L 395 150 L 350 295 L 50 295 L 5 150 Z"
        fill="none" 
        stroke="url(#scifi-gradient)" 
        strokeWidth="2.5" 
      />
      
      {/* Circuits et lignes technologiques */}
      <g opacity="0.4" stroke="#22d3ee" strokeWidth="1.5" fill="none">
        {/* Coins avec circuits */}
        <circle cx="50" cy="5" r="3" fill="#22d3ee" />
        <line x1="50" y1="5" x2="60" y2="15" />
        <circle cx="60" cy="15" r="2" fill="#06b6d4" />
        
        <circle cx="350" cy="5" r="3" fill="#22d3ee" />
        <line x1="350" y1="5" x2="340" y2="15" />
        <circle cx="340" cy="15" r="2" fill="#06b6d4" />
        
        <circle cx="50" cy="295" r="3" fill="#22d3ee" />
        <line x1="50" y1="295" x2="60" y2="285" />
        <circle cx="60" cy="285" r="2" fill="#06b6d4" />
        
        <circle cx="350" cy="295" r="3" fill="#22d3ee" />
        <line x1="350" y1="295" x2="340" y2="285" />
        <circle cx="340" cy="285" r="2" fill="#06b6d4" />
      </g>
    </svg>
  );
};
