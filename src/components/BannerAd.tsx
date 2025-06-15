
import React, { useEffect } from 'react';

interface BannerAdProps {
    className?: string;
}

export const BannerAd: React.FC<BannerAdProps> = ({ className }) => {
  useEffect(() => {
    // Simule le chargement du script AdSense pour cette unité publicitaire
    // Google AdSense s'occupe de la rotation régulière des annonces.
    try {
      // @ts-ignore
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      console.error("Erreur AdSense:", e);
    }
  }, []);

  return (
    <div className={`w-full h-[100px] bg-gray-200/50 dark:bg-gray-800/50 rounded-lg flex items-center justify-center text-gray-500 border border-dashed ${className}`}>
        {/* 
        C'est ici que la bannière publicitaire Google AdSense serait rendue.
        Vous devrez remplacer les identifiants par les vôtres.
        */}
      <div className="text-center">
        <p className="text-sm">Emplacement publicitaire</p>
        <ins className="adsbygoogle"
            style={{ display: 'block' }}
            data-ad-client="ca-pub-XXXXXXXXXXXXXXXX" // Remplacez par votre ID d'éditeur AdSense
            data-ad-slot="ZZZZZZZZZZ"               // Remplacez par votre ID de bloc d'annonces
            data-ad-format="auto"
            data-full-width-responsive="true"></ins>
      </div>
    </div>
  );
};
