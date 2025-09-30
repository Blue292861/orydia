// src/components/RewardAd.tsx (Version Corrigée)

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Book } from '@/types/Book';
import { X, Gift } from 'lucide-react';
import { PlatformUtils } from '@/utils/platformDetection';
import { rewardedAdService } from '@/utils/adMob'; // <-- Import de notre service AdMob

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
  const isNative = PlatformUtils.isNative();
  // L'état reflète maintenant le cycle de vie de l'AdMob (Chargé / Récompensé)
  const [adLoaded, setAdLoaded] = useState(false);
  const [adLoading, setAdLoading] = useState(true);
  const [canClaim, setCanClaim] = useState(false);
  const [showPlaceholder, setShowPlaceholder] = useState(false);
  
  // ⚠️ Pour le Web, on utilise un timer simple (non conforme AdMob pour récompense, mais toléré AdSense)
  const [countdown, setCountdown] = useState(15);
  const isWebWithTimer = PlatformUtils.isWeb() && !canClaim;

  const handleRewardAdCompleted = (reward?: { type: string, amount: number }) => {
    // Dans le cas AdMob, la récompense est sécurisée par le SDK.
    // Dans le cas Web, on simule l'achèvement.
    if (isNative) {
        // Optionnel : vérifier que la récompense reçue correspond aux points attendus
        console.log(`AdMob rewarded: ${reward?.amount} ${reward?.type}`);
    }
    setCanClaim(true); // Permettre de cliquer sur le bouton de réclamation
  };

  const showWebAdAndStartTimer = () => {
     setShowPlaceholder(true);
      // Simule la publicité AdSense sur le web (NON SÉCURISÉ POUR RÉCOMPENSE)
      try {
        (window as any).adsbygoogle = (window as any).adsbygoogle || [];
        (window as any).adsbygoogle.push({});
      } catch (e) { /* AdSense error handled */ }

      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            handleRewardAdCompleted(); // Récompense simulée sur le Web
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
  }

  useEffect(() => {
    setAdLoading(true);

    if (isNative) {
        // 1. Logique AdMob Native
        rewardedAdService.load().then(loaded => {
            setAdLoaded(loaded);
            setAdLoading(false);
            if (loaded) {
                // Si la pub est chargée, la montrer immédiatement (expérience standard)
                rewardedAdService.show(handleRewardAdCompleted).catch(() => {
                    // Si l'affichage échoue, l'utilisateur ferme sans récompense
                    onAdClosed();
                });
            } else {
                // Échec du chargement sur Native
                onAdClosed();
            }
        });
    } else {
        // 2. Logique AdSense Web
        const cleanup = showWebAdAndStartTimer();
        setAdLoading(false);
        return cleanup;
    }

    // Nettoyage pour les effets secondaires
    return () => {
        if (isNative) {
            // Le service AdMob gère déjà la suppression des écouteurs
        }
    };
  }, [isNative]);

  const handleClose = () => {
    if (canClaim) {
      // L'utilisateur a le droit de réclamer
      onAdCompleted();
    } else {
      // Fermeture avant la fin de la pub (pour le Web)
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
          // Permettre de fermer si l'on peut réclamer OU si c'est la version Native (AdMob) non chargée/fermée
          disabled={!canClaim && isWebWithTimer} 
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="w-full max-w-4xl aspect-video bg-gray-900 border border-gray-700 rounded-lg flex items-center justify-center mb-6">
        <div className="text-center">
          <Gift className="h-16 w-16 text-yellow-400 mx-auto mb-4" />
          <p className="text-2xl font-bold mb-2">
            {isNative ? "Publicité Récompensée Native (AdMob)" : "Publicité Récompensée Web (AdSense)"}
          </p>
          <p className="text-muted-foreground mb-4">
            Regardez cette courte publicité pour obtenir vos Tensens
          </p>
          
          {/* Sur Native (AdMob), le composant n'affiche pas la balise AdSense car l'annonce est gérée
            par l'interface native qui se superpose à la WebView. On affiche juste l'état.
            
            Sur Web (AdSense), on injecte la balise AdSense.
          */}
          {!isNative && showPlaceholder && (
            <>
              <ins className="adsbygoogle"
                   style={{ display: 'block', width: '100%', height: '250px' }}
                   data-ad-client="ca-pub-XXXXXXXXXXXXXXXX" // Remplacez par votre ID AdSense
                   data-ad-slot="ZZZZZZZZZZ"               // Remplacez par votre ID de bloc AdSense (Web)
                   data-ad-format="fluid"
                   data-ad-layout-key="-gw-3+1f-3d+2z"
                   data-full-width-responsive="true"></ins>
            
              {isWebWithTimer && (
                <div className="mt-4">
                  <div className="text-3xl font-bold text-yellow-400">{countdown}</div>
                  <p className="text-sm text-gray-400">Publicité en cours...</p>
                </div>
              )}
            </>
          )}

          {isNative && adLoading && (
            <div className="mt-4">
                <p className="text-sm text-gray-400">Chargement de la publicité AdMob...</p>
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
            onClick={onAdCompleted} // C'est ici que vous attribuez réellement les points après la confirmation
            size="lg"
            className="bg-green-600 hover:bg-green-700 text-white font-bold"
          >
            <Gift className="mr-2 h-4 w-4" />
            Réclamer ma récompense !
          </Button>
        ) : (
          <Button size="lg" variant="secondary" disabled>
            {isNative ? "Regardez la publicité AdMob" : isWebWithTimer ? `Récompense disponible dans ${countdown}s` : "Chargement de la publicité..."}
          </Button>
        )}
      </div>
      
      <p className="text-xs text-muted-foreground mt-4 text-center">
        Les membres Premium obtiennent leurs récompenses instantanément sans publicité.
      </p>
    </div>
  );
};
