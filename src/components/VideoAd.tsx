
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Book } from '@/types/Book';

interface VideoAdProps {
  book: Book;
  onAdFinished: () => void;
}

export const VideoAd: React.FC<VideoAdProps> = ({ book, onAdFinished }) => {
  const [countdown, setCountdown] = useState(5);
  const [canContinue, setCanContinue] = useState(false);

  useEffect(() => {
    // Simule le chargement du script AdSense pour cette unité publicitaire
    try {
      // @ts-ignore
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      console.error("Erreur AdSense:", e);
    }

    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setCanContinue(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-95 flex flex-col items-center justify-center z-50 text-white p-4">
      <div className="w-full max-w-4xl aspect-video bg-gray-900 border border-gray-700 rounded-lg flex items-center justify-center mb-4">
        {/* Espace réservé pour l'unité publicitaire vidéo de Google AdSense */}
        <div className="text-center">
          <p className="text-2xl font-bold">Publicité</p>
          <p className="text-muted-foreground">Votre lecture commence bientôt.</p>
           {/* 
            C'est ici que l'unité publicitaire Google AdSense serait rendue.
            Pour la démonstration, nous utilisons un espace réservé.
            La balise `ins` est la manière standard de définir un bloc d'annonces AdSense.
            Vous devrez remplacer les identifiants par les vôtres.
           */}
          <ins className="adsbygoogle"
               style={{ display: 'block', width: '100%', height: '100%' }}
               data-ad-client="ca-pub-XXXXXXXXXXXXXXXX" // Remplacez par votre ID d'éditeur AdSense
               data-ad-slot="YYYYYYYYYY"               // Remplacez par votre ID de bloc d'annonces
               data-ad-format="auto"
               data-full-width-responsive="true"></ins>
        </div>
      </div>
      <h3 className="text-xl font-bold text-center">Vous allez lire : {book.title}</h3>
      
      <div className="mt-8">
        {canContinue ? (
          <Button onClick={onAdFinished} size="lg">
            Commencer la lecture
          </Button>
        ) : (
          <Button size="lg" variant="secondary" disabled>
            Accès au livre dans {countdown} secondes...
          </Button>
        )}
      </div>
       <p className="text-xs text-muted-foreground mt-4">Les membres Premium profitent d'une lecture sans publicité.</p>
    </div>
  );
};
