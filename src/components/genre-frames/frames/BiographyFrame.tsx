import React from 'react';

export const BiographyFrame: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <svg 
      className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}
      viewBox="0 0 400 300" 
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="biography-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#57534e" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#44403c" stopOpacity="0.5" />
        </linearGradient>
      </defs>
      
      {/* Cadre livre classique */}
      <rect x="12" y="12" width="376" height="276" rx="8" ry="8"
        fill="none" 
        stroke="url(#biography-gradient)" 
        strokeWidth="3" 
      />
      
      {/* Pages de livre */}
      <g opacity="0.4" stroke="#78716c" strokeWidth="1" fill="none">
        <line x1="200" y1="15" x2="200" y2="285" strokeDasharray="3,3" />
        <line x1="20" y1="30" x2="180" y2="30" />
        <line x1="20" y1="40" x2="180" y2="40" />
        <line x1="220" y1="30" x2="380" y2="30" />
        <line x1="220" y1="40" x2="380" y2="40" />
      </g>
      
      {/* Marque-pages et coins */}
      <g opacity="0.5">
        {/* Marque-page */}
        <rect x="195" y="5" width="10" height="20" fill="#57534e" opacity="0.6" />
        
        {/* Coins protecteurs de livre */}
        <path d="M 15 15 L 25 15 L 15 25 Z" fill="#44403c" opacity="0.4" />
        <path d="M 385 15 L 375 15 L 385 25 Z" fill="#44403c" opacity="0.4" />
        <path d="M 15 285 L 25 285 L 15 275 Z" fill="#44403c" opacity="0.4" />
        <path d="M 385 285 L 375 285 L 385 275 Z" fill="#44403c" opacity="0.4" />
      </g>
    </svg>
  );
};
