// src/components/EpubReader.tsx
import React, { useState } from 'react';
import { ReactReader } from 'react-reader';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface EpubReaderProps {
  url: string;
}

export const EpubReader: React.FC<EpubReaderProps> = ({ url }) => {
  const [location, setLocation] = useState<string | number>(0);
  const [isReady, setIsReady] = useState(false);
  const { toast } = useToast();

  const handleLocationChanged = (cfi: string) => {
    setLocation(cfi);
    // You can save the user's progress here if needed
  };
  
  const handleLoad = () => {
    setIsReady(true);
  };
  
  const handleError = (error: any) => {
    console.error("EPUB loading error:", error);
    toast({
      title: "Erreur de chargement",
      description: "Impossible de charger le fichier EPUB.",
      variant: "destructive",
    });
  };

  return (
    <div style={{ position: 'relative', height: '80vh', width: '100%' }}>
      {!isReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}
      <ReactReader
        url={url}
        location={location}
        locationChanged={handleLocationChanged}
        onReady={handleLoad}
        onError={handleError}
        // Il est crucial que le conteneur parent ait des dimensions
        // et que le lecteur utilise ces dimensions.
        // Les styles inline ici garantissent que le composant s'affiche correctement.
        // Assurez-vous également que les politiques de sécurité (CORS)
        // de votre bucket Supabase sont configurées pour permettre l'accès.
      />
    </div>
  );
};
