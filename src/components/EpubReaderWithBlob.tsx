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

  const readerStyles: any = {
    container: { width: '100%', height: '100%' },
    containerExpanded: { width: '100%', height: '100%' },
    readerArea: { left: 0, right: 0, width: '100%', height: '100%' },
    titleArea: { display: 'none' },
    title: { display: 'none' },
    tocArea: { display: 'none' },
    tocButton: { display: 'none' },
    arrow: { display: 'none' },
    prev: { display: 'none', pointerEvents: 'none', width: 0 },
    next: { display: 'none', pointerEvents: 'none', width: 0 },
  };

  const handleRenditionReady = (rendition: any) => {
    try {
      const scroller = (rendition as any)?.manager?.container as HTMLElement | undefined;
      if (scroller) {
        scroller.style.overflowY = 'auto';
        scroller.style.height = '100%';
        scroller.style.maxHeight = '100%';
      }
    } catch (e) {
      console.warn('Impossible de configurer le scroll interne (blob):', e);
    }

    if (rendition.themes) {
      rendition.themes.default({
        'html, body': {
          'height': 'auto !important',
          'min-height': 'auto !important',
          'overflow': 'visible !important',
          'margin': '0 !important',
          'padding': '0 !important',
          '-webkit-text-size-adjust': '100% !important'
        },
        body: {
          'font-family': 'Georgia, serif !important',
          'line-height': '1.6 !important',
          'text-align': 'justify',
          'hyphens': 'auto',
          'word-wrap': 'break-word',
          '-webkit-column-width': 'auto !important',
          '-moz-column-width': 'auto !important',
          'column-width': 'auto !important',
          'columns': 'auto !important',
          'overflow-x': 'hidden !important'
        },
        '*': {
          'box-sizing': 'border-box'
        },
        'p': {
          'margin': '0 0 1em 0 !important',
          'text-indent': '1.5em !important'
        },
        'h1, h2, h3, h4, h5, h6': {
          'margin': '1.5em 0 0.5em 0 !important',
          'text-indent': '0 !important'
        },
        'img, svg, video': {
          'max-width': '100% !important',
          'height': 'auto !important',
          'display': 'block !important',
          'margin': '1em auto !important'
        }
      });

      rendition.on('rendered', (section: any) => {
        try {
          const doc = section?.document;
          if (doc) {
            const html = doc.documentElement as HTMLElement;
            const body = doc.body as HTMLElement;
            if (html) {
              html.style.height = 'auto';
              html.style.overflow = 'visible';
            }
            if (body) {
              body.style.height = 'auto';
              body.style.overflow = 'visible';
              // @ts-ignore
              body.style.webkitColumnWidth = 'auto';
              // @ts-ignore
              body.style.columnWidth = 'auto';
            }
          }
        } catch (e) {
          console.warn('Fix iframe sizing failed (blob):', e);
        }
      });
    }
  };

  const handleLocationChanged = (cfi: string) => {
    setLocation(cfi);
  };

  return (
    <div style={{ position: 'relative', height: '85vh', width: '100%', overflow: 'visible' }}>
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
          getRendition={handleRenditionReady}
          epubOptions={{
            flow: 'scrolled',
            manager: 'continuous',
            allowScriptedContent: true,
            spread: 'none'
          }}
          showToc={false}
          readerStyles={readerStyles}
          swipeable={false}
        />
      )}
    </div>
  );
};
