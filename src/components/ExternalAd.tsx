import React, { useEffect, useRef } from 'react';

interface ExternalAdProps {
  onAdLoaded?: () => void;
  className?: string;
}

export const ExternalAd: React.FC<ExternalAdProps> = ({ onAdLoaded, className = '' }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const scriptLoadedRef = useRef(false);

  useEffect(() => {
    if (!containerRef.current || scriptLoadedRef.current) return;

    // Créer le script de publicité
    const script = document.createElement('script');
    script.dataset.zone = '10192618';
    script.src = 'https://groleegni.net/vignette.min.js';
    
    script.onload = () => {
      scriptLoadedRef.current = true;
      onAdLoaded?.();
    };

    script.onerror = () => {
      console.error('Erreur lors du chargement de la publicité');
    };

    containerRef.current.appendChild(script);

    return () => {
      if (containerRef.current && script.parentNode) {
        script.remove();
      }
    };
  }, [onAdLoaded]);

  return (
    <div 
      ref={containerRef} 
      className={`w-full flex items-center justify-center ${className}`}
    />
  );
};
