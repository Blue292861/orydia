// src/components/epub/EpubReaderCore.tsx
import React, { useState, useMemo } from 'react';
import { ReactReader } from 'react-reader';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { toPublicEpubUrl } from '@/utils/epubUrl';

interface EpubReaderCoreProps {
  url: string;
  bookId?: string;
}

/**
 * Lecteur EPUB minimal et robuste
 * - Utilise les URLs publiques Supabase directes (pas de blob)
 * - Mode scroll continu uniquement
 * - Pas de manipulation du scroller interne
 * - Pas de fonctionnalités avancées (TOC, progression, thèmes) pour garantir la stabilité
 */
export const EpubReaderCore: React.FC<EpubReaderCoreProps> = ({ url, bookId }) => {
  const [location, setLocation] = useState<string | number>(0);
  const [isReady, setIsReady] = useState(false);
  const { toast } = useToast();
  
  // Conversion intelligente vers URL publique
  const epubUrl = useMemo(() => toPublicEpubUrl(url), [url]);
  
  const handleReady = () => {
    setIsReady(true);
    toast({
      title: "EPUB chargé",
      description: "Le livre est prêt à être lu"
    });
  };
  
  const handleError = (error: any) => {
    console.error('[EpubReaderCore] Error:', error);
    toast({
      title: "Erreur de chargement",
      description: "Impossible de charger l'EPUB",
      variant: "destructive"
    });
  };
  
  const handleLocationChanged = (cfi: string) => {
    setLocation(cfi);
  };

  if (!epubUrl) {
    return (
      <div className="flex items-center justify-center h-[85vh] text-destructive">
        URL du fichier EPUB manquante
      </div>
    );
  }

  // Styles minimaux pour ReactReader (cacher les flèches natives)
  const readerStyles: any = {
    arrow: { display: 'none' },
    prev: { display: 'none' },
    next: { display: 'none' },
  };

  return (
    <div className="relative w-full h-[85vh]">
      {!isReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}
      <ReactReader
        url={epubUrl}
        location={location}
        locationChanged={handleLocationChanged}
        epubOptions={{
          flow: 'scrolled-continuous',
          manager: 'continuous',
          spread: 'none'
        }}
        showToc={false}
        readerStyles={readerStyles}
        swipeable={false}
      />
    </div>
  );
};
