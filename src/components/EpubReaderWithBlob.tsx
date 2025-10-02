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

  useEffect(() => {
    const fetchEpub = async () => {
      if (!url) return;
      setIsReady(false);
      try {
        // Extraire le chemin complet après /object/public/epubs/
        // Format attendu: https://.../storage/v1/object/public/epubs/epubs/fichier.epub
        const match = url.match(/\/object\/public\/epubs\/(.+)$/);
        const filePath = match ? match[1] : url.split('/').pop() || '';
        
        console.log('Downloading EPUB from path:', filePath);
        
        const { data, error } = await supabase.storage
          .from('epubs')
          .download(filePath);
          
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
  }, [url, toast]);

  const handleLocationChanged = (cfi: string) => {
    setLocation(cfi);
  };

  return (
    <div style={{ position: 'relative', height: '80vh', width: '100%' }}>
      {!isReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
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
        />
      )}
    </div>
  );
};
