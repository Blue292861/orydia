// src/components/EpubReaderWithBlob.tsx
import React, { useState, useEffect } from 'react';
import { ReactReader } from 'react-reader';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface EpubReaderProps {
  url: string;
}

export const EpubReaderWithBlob: React.FC<EpubReaderProps> = ({ url }) => {
  const [location, setLocation] = useState<string | number>(0);
  const [isReady, setIsReady] = useState(false);
  const [epubUrl, setEpubUrl] = useState<string | null>(null);
  const { toast } = useToast();

  // Styles pour forcer une hauteur auto à l'intérieur de ReactReader
  const readerStyles = {
    container: { width: '100%', height: 'auto' },
    containerExpanded: { width: '100%', height: 'auto' },
  };

  useEffect(() => {
    const fetchEpub = async () => {
      if (!url) return;
      setIsReady(false);
      try {
        const { data, error } = await supabase.storage.from('epubs').download(url.split('/').pop() || '');
        if (error) throw error;
        
        if (data) {
          const blobUrl = URL.createObjectURL(data);
          setEpubUrl(blobUrl);
          toast({
            title: "EPUB récupéré",
            description: "Le contenu est prêt à être lu."
          });
          setIsReady(true);
        }
      } catch (error) {
        console.error('Download error:', error);
        toast({
          title: "Erreur de téléchargement",
          description: "Impossible de récupérer le fichier.",
          variant: "destructive",
        });
      }
    };
    fetchEpub();
  }, [url]);

  const handleLocationChanged = (cfi: string) => {
    setLocation(cfi);
  };

  return (
    // Hauteur du conteneur parent à 'auto'
    <div style={{ position: 'relative', width: '100%', height: 'auto' }}>
      {!isReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10" style={{ height: '80vh' }}>
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}
      {epubUrl && (
        <ReactReader
          url={epubUrl}
          location={location}
          locationChanged={handleLocationChanged}
          epubOptions={{ flow: 'scrolled-continuous', manager: 'continuous' }}
          showToc={false}
          readerStyles={readerStyles} // AJOUT des styles pour hauteur auto
        />
      )}
    </div>
  );
};
