import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, Loader2 } from 'lucide-react';
import { ExternalAd } from '@/components/ExternalAd';

interface AdInterstitialProps {
  onClose: () => void;
  onAdWatched?: () => void;
  title: string;
  description?: string;
  showCloseButton?: boolean;
  autoCloseDelay?: number;
}

export const AdInterstitial: React.FC<AdInterstitialProps> = ({ 
  onClose, 
  onAdWatched,
  title,
  description,
  showCloseButton = true,
  autoCloseDelay = 5000
}) => {
  const [adLoaded, setAdLoaded] = useState(false);
  const [canClose, setCanClose] = useState(!autoCloseDelay);

  useEffect(() => {
    if (adLoaded && autoCloseDelay) {
      const timer = setTimeout(() => {
        setCanClose(true);
        onAdWatched?.();
      }, autoCloseDelay);

      return () => clearTimeout(timer);
    }
  }, [adLoaded, autoCloseDelay, onAdWatched]);

  const handleClose = () => {
    if (canClose || showCloseButton) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/95 flex flex-col items-center justify-center z-[9999] p-4">
      {showCloseButton && (
        <Button
          variant="ghost"
          size="icon"
          onClick={handleClose}
          disabled={!canClose && !!autoCloseDelay}
          className="absolute top-4 right-4 text-white hover:bg-white/10"
        >
          <X className="h-6 w-6" />
        </Button>
      )}

      <div className="w-full max-w-4xl mx-auto text-center space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl md:text-3xl font-bold text-white">{title}</h2>
          {description && (
            <p className="text-muted-foreground">{description}</p>
          )}
        </div>

        <div className="relative bg-gray-900 border border-gray-700 rounded-lg p-4 min-h-[300px] flex items-center justify-center">
          {!adLoaded && (
            <div className="flex items-center gap-2 text-white">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span>Chargement de la publicité...</span>
            </div>
          )}
          <ExternalAd onAdLoaded={() => setAdLoaded(true)} />
        </div>

        {autoCloseDelay && (
          <p className="text-sm text-gray-400">
            {canClose 
              ? "Vous pouvez maintenant continuer"
              : "Merci de patienter quelques secondes..."}
          </p>
        )}
      </div>
    </div>
  );
};
