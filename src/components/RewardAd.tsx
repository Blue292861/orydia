
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Book } from '@/types/Book';
import { X, Gift } from 'lucide-react';

interface RewardAdProps {
  book: Book;
  pointsToWin: number;
  onAdCompleted: () => void;
  onAdClosed: () => void;
}

export const RewardAd: React.FC<RewardAdProps> = ({ 
  book, 
  pointsToWin, 
  onAdCompleted, 
  onAdClosed 
}) => {
  const [countdown, setCountdown] = useState(15);
  const [canClaim, setCanClaim] = useState(false);
  const [adStarted, setAdStarted] = useState(false);

  useEffect(() => {
    // Simule le chargement du script AdSense pour cette unité publicitaire de récompense
    try {
      // @ts-ignore
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      console.error("Erreur AdSense:", e);
    }

    // Démarrer automatiquement la publicité après 1 seconde
    const startTimer = setTimeout(() => {
      setAdStarted(true);
      
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            setCanClaim(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }, 1000);

    return () => clearTimeout(startTimer);
  }, []);

  const handleClose = () => {
    if (canClaim) {
      onAdCompleted();
    } else {
      onAdClosed();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-95 flex flex-col items-center justify-center z-50 text-white p-4">
      <div className="absolute top-4 right-4">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={handleClose}
          className="text-white hover:bg-white/20"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="w-full max-w-4xl aspect-video bg-gray-900 border border-gray-700 rounded-lg flex items-center justify-center mb-6">
        {/* Espace réservé pour l'unité publicitaire de récompense Google AdSense */}
        <div className="text-center">
          <Gift className="h-16 w-16 text-yellow-400 mx-auto mb-4" />
          <p className="text-2xl font-bold mb-2">Publicité de Récompense</p>
          <p className="text-muted-foreground mb-4">
            Regardez cette courte publicité pour obtenir vos Tensens
          </p>
          
          {/* 
            C'est ici que l'unité publicitaire de récompense Google AdSense serait rendue.
            Pour la démonstration, nous utilisons un espace réservé.
            Les publicités de récompense utilisent un format spécial AdSense.
          */}
          <ins className="adsbygoogle"
               style={{ display: 'block', width: '100%', height: '250px' }}
               data-ad-client="ca-pub-XXXXXXXXXXXXXXXX" // Remplacez par votre ID d'éditeur AdSense
               data-ad-slot="ZZZZZZZZZZ"               // Remplacez par votre ID de bloc d'annonces récompensées
               data-ad-format="fluid"
               data-ad-layout-key="-gw-3+1f-3d+2z"
               data-full-width-responsive="true"></ins>
               
          {adStarted && !canClaim && (
            <div className="mt-4">
              <div className="text-3xl font-bold text-yellow-400">{countdown}</div>
              <p className="text-sm text-gray-400">Publicité en cours...</p>
            </div>
          )}
        </div>
      </div>
      
      <div className="text-center">
        <h3 className="text-xl font-bold mb-2">
          Réclamez vos récompenses pour : {book.title}
        </h3>
        <div className="flex items-center justify-center gap-2 mb-4">
          <img 
            src="/lovable-uploads/4a891ef6-ff72-4b5a-b33c-0dc33dd3aa26.png" 
            alt="Tensens Icon" 
            className="h-6 w-6" 
          />
          <span className="text-2xl font-bold text-yellow-400">{pointsToWin} Tensens</span>
        </div>
        
        {canClaim ? (
          <Button 
            onClick={onAdCompleted} 
            size="lg"
            className="bg-green-600 hover:bg-green-700 text-white font-bold"
          >
            <Gift className="mr-2 h-4 w-4" />
            Réclamer ma récompense !
          </Button>
        ) : (
          <Button size="lg" variant="secondary" disabled>
            {adStarted ? `Récompense disponible dans ${countdown}s` : "Chargement de la publicité..."}
          </Button>
        )}
      </div>
      
      <p className="text-xs text-muted-foreground mt-4 text-center">
        Les membres Premium obtiennent leurs récompenses instantanément sans publicité.
      </p>
    </div>
  );
};
