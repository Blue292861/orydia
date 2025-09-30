// src/components/EpubReader.tsx
import React, { useState, useEffect } from 'react';
import { ReactReader } from 'react-reader';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface EpubReaderProps {
  url: string;
}

export const EpubReader: React.FC<EpubReaderProps> = ({ url }) => {
  const [location, setLocation] = useState<string | number>(0);
  const [isReady, setIsReady] = useState(false);
  const { toast } = useToast();
  
  // Utiliser useEffect pour s'assurer que l'état est réinitialisé si l'URL change
  useEffect(() => {
    setIsReady(false);
    setLocation(0);
  }, [url]);

  const handleLocationChanged = (cfi: string) => {
    setLocation(cfi);
  };
  
  const handleReady = () => {
    setIsReady(true);
    toast({
      title: "EPUB chargé",
      description: "Le contenu est prêt à être lu."
    });
  };

  if (!url) {
    return <div className="p-4 text-center text-red-500">URL du fichier EPUB manquante.</div>;
  }

  return (
    // CORRECTION: Remplacé height: '80vh' par height: 'auto' pour le défilement continu
    <div style={{ position: 'relative', height: 'auto', width: '100%' }}>
      {!isReady && (
        // La div de chargement conserve une hauteur fixe pour être visible
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10" style={{ height: '80vh' }}>
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}
      <ReactReader
        url={url}
        location={location}
        locationChanged={handleLocationChanged}
        epubOptions={{ flow: 'scrolled-continuous', manager: 'continuous' }}
        showToc={false}
        getRendition={handleReady} // Ajouté le handleReady manquant
      />
    </div>
  );
};
