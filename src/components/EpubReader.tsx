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
  
  const handleLoad = () => {
    setIsReady(true);
    toast({
      title: "EPUB chargé",
      description: "Le contenu est prêt à être lu."
    });
  };
  
  const handleError = (error: any) => {
    console.error("EPUB loading error:", error);
    toast({
      title: "Erreur de chargement",
      description: "Impossible de charger le fichier EPUB. Vérifiez l'URL et les permissions.",
      variant: "destructive",
    });
  };

  if (!url) {
    return <div className="p-4 text-center text-red-500">URL du fichier EPUB manquante.</div>;
  }

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
        styles={{
          readerArea: {
            position: 'absolute',
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
            height: '100%',
          }
        }}
      />
    </div>
  );
};
