import React from 'react';

export const AdventureFrame: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <svg 
      className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}
      viewBox="0 0 400 300" 
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="adventure-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#059669" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#047857" stopOpacity="0.5" />
        </linearGradient>
      </defs>
      
      {/* Cadre dynamique avec découpes */}
      <path d="M 15 5 L 385 5 L 395 20 L 395 280 L 385 295 L 15 295 L 5 280 L 5 20 Z"
        fill="none" 
        stroke="url(#adventure-gradient)" 
        strokeWidth="3" 
      />
      
      {/* Épées croisées et boussoles */}
      <g opacity="0.5">
        {/* Épées croisées haut gauche */}
        <g stroke="#059669" strokeWidth="2" fill="none">
          <line x1="20" y1="15" x2="35" y2="35" />
          <line x1="35" y1="15" x2="20" y2="35" />
          <rect x="26" y="12" width="3" height="6" fill="#047857" />
          <rect x="26" y="32" width="3" height="6" fill="#047857" />
        </g>
        
        {/* Boussole haut droit */}
        <circle cx="375" cy="25" r="10" fill="none" stroke="#059669" strokeWidth="2" />
        <path d="M 375 18 L 375 32 M 368 25 L 382 25" stroke="#047857" strokeWidth="1.5" />
        <path d="M 375 20 L 377 25 L 375 27 L 373 25 Z" fill="#059669" />
        
        {/* Carte au trésor coin bas */}
        <rect x="15" y="265" width="30" height="25" rx="2" fill="none" stroke="#059669" strokeWidth="1.5" opacity="0.6" />
        <path d="M 20 270 L 25 280 L 35 275" stroke="#047857" strokeWidth="1.5" fill="none" strokeDasharray="2,2" />
      </g>
    </svg>
  );
};
