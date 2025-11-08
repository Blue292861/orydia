import React from 'react';

export const ComedyFrame: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <svg 
      className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}
      viewBox="0 0 400 300" 
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="comedy-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#eab308" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#ca8a04" stopOpacity="0.5" />
        </linearGradient>
      </defs>
      
      {/* Cadre ondulé et joyeux */}
      <path d="M 5 20 Q 5 5, 20 5 L 380 5 Q 395 5, 395 20 L 395 280 Q 395 295, 380 295 L 20 295 Q 5 295, 5 280 Z"
        fill="none" 
        stroke="url(#comedy-gradient)" 
        strokeWidth="3" 
      />
      
      {/* Étoiles de rire et sourires */}
      <g opacity="0.6" fill="#eab308">
        {/* Étoiles scintillantes */}
        <path d="M 25 25 L 27 30 L 32 30 L 28 33 L 30 38 L 25 35 L 20 38 L 22 33 L 18 30 L 23 30 Z" />
        <path d="M 375 25 L 377 30 L 382 30 L 378 33 L 380 38 L 375 35 L 370 38 L 372 33 L 368 30 L 373 30 Z" />
        
        {/* Sourires */}
        <g stroke="#eab308" strokeWidth="2" fill="none">
          <path d="M 15 270 Q 25 280, 35 270" strokeLinecap="round" />
          <circle cx="20" cy="265" r="1.5" fill="#eab308" />
          <circle cx="30" cy="265" r="1.5" fill="#eab308" />
          
          <path d="M 365 270 Q 375 280, 385 270" strokeLinecap="round" />
          <circle cx="370" cy="265" r="1.5" fill="#eab308" />
          <circle cx="380" cy="265" r="1.5" fill="#eab308" />
        </g>
      </g>
    </svg>
  );
};
