// src/components/BannerAd.tsx (Version Corrigée)

import React, { useEffect } from 'react';
import { PlatformUtils } from '@/utils/platformDetection';
import { bannerAdService } from '@/utils/adMob'; // <-- Import de notre service AdMob

interface BannerAdProps {
    className?: string;
}

export const BannerAd: React.FC<BannerAdProps> = ({ className }) => {
  const isNative = PlatformUtils.isNative();

  useEffect(() => {
    // Si c'est une application native (via Capacitor)
    if (isNative) {
        // Affiche la bannière AdMob via le SDK natif
        bannerAdService.show('BOTTOM'); 

        // S'assurer de cacher la bannière quand le composant est démonté
        return () => {
            bannerAdService.hide();
        };
    } else {
        // Si c'est le Web (navigateur)
        // Simule le chargement du script AdSense pour cette unité publicitaire
        try {
            (window as any).adsbygoogle = (window as any).adsbygoogle || [];
            (window as any).adsbygoogle.push({});
        } catch (e) {
            // AdSense error silently handled
        }
    }
  }, [isNative]);

  if (isNative) {
    // Sur l'application native, le SDK AdMob affiche l'annonce sur la WebView
    // On peut renvoyer un espace vide ou un placeholder pour le composant
    // React lui-même, car l'annonce est nativement superposée.
    return (
        <div className={`w-full h-[0px] ${className}`}>
            {/* AdMob gère l'affichage natif */}
        </div>
    );
  }

  // Rendu pour le Web (AdSense)
  return (
    <div className={`w-full h-[50px] bg-gray-200/50 dark:bg-gray-800/50 rounded flex items-center justify-center text-gray-500 border border-dashed ${className}`}>
      <div className="text-center">
        <p className="text-xs">Emplacement publicitaire (Web AdSense)</p>
        <ins className="adsbygoogle"
            style={{ display: 'block' }}
            data-ad-client="ca-pub-7828832970015207" // Remplacez par votre ID d'éditeur AdSense
            data-ad-slot="9896884132"               // Remplacez par votre ID de bloc d'annonces (Web)
            data-ad-format="auto"
            data-full-width-responsive="true"></ins>
      </div>
    </div>
  );
};
