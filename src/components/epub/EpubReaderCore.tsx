// src/components/epub/EpubReaderCore.tsx
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { ReactReader } from 'react-reader';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { toPublicEpubUrl } from '@/utils/epubUrl';
import { useEpubSettings } from '@/hooks/useEpubSettings';
import { EpubReadingControls } from '@/components/epub/EpubReadingControls';

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
  const renditionRef = useRef<any>(null);
  
  // Conversion intelligente vers URL publique
  const epubUrl = useMemo(() => toPublicEpubUrl(url), [url]);
  
  // Paramètres de lecture
  const { settings, updateFontSize, updateTheme, updateColorblindMode } = useEpubSettings(bookId);
  
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
    
    // Sauvegarder la progression de lecture
    if (bookId && renditionRef.current) {
      try {
        const book = renditionRef.current.book;
        if (book && book.locations && book.locations.total) {
          const currentLocation = book.locations.locationFromCfi(cfi);
          const progress = Math.round((currentLocation / book.locations.total) * 100);
          
          localStorage.setItem(`epub_progress_${bookId}`, JSON.stringify({
            cfi,
            progress,
            timestamp: Date.now()
          }));
        }
      } catch (error) {
        console.error('Error saving reading progress:', error);
      }
    }
  };
  
  // Appliquer les paramètres au rendition
  useEffect(() => {
    if (!renditionRef.current) return;
    
    const rendition = renditionRef.current;
    
    try {
      // Appliquer la taille de police
      rendition.themes.fontSize(`${settings.fontSize}px`);
      
      // Appliquer le thème
      const themeColors = {
        light: { background: '#ffffff', color: '#000000' },
        dark: { background: '#1a1a1a', color: '#e0e0e0' },
        sepia: { background: '#f4ecd8', color: '#5c4a2f' },
      };
      
      const colors = themeColors[settings.theme];
      rendition.themes.default({
        body: {
          background: `${colors.background} !important`,
          color: `${colors.color} !important`,
          'line-height': '1.6 !important',
          padding: '20px !important',
        },
        p: {
          'margin-bottom': '1em !important',
        },
        img: {
          'max-width': '100% !important',
          height: 'auto !important',
          display: 'block !important',
          margin: '1em auto !important',
        }
      });
    } catch (error) {
      console.error('Error applying EPUB settings:', error);
    }
  }, [settings.fontSize, settings.theme]);
  
  // Charger la progression sauvegardée
  useEffect(() => {
    if (!bookId || !isReady) return;
    
    try {
      const progressKey = `epub_progress_${bookId}`;
      const savedProgress = localStorage.getItem(progressKey);
      
      if (savedProgress) {
        const progress = JSON.parse(savedProgress);
        if (progress.cfi) {
          setLocation(progress.cfi);
        }
      }
    } catch (error) {
      console.error('Error loading reading progress:', error);
    }
  }, [bookId, isReady]);

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

  // File d'attente de sécurité: si aucun événement de rendu ne survient, retirer le loader après 8s
  useEffect(() => {
    const t = window.setTimeout(() => {
      setIsReady((ready) => ready || true);
    }, 8000);
    return () => window.clearTimeout(t);
  }, [epubUrl]);

  // Filtre CSS pour le mode daltonien
  const colorblindFilter = {
    none: 'none',
    deuteranopia: 'url(#deuteranopia-filter)',
    protanopia: 'url(#protanopia-filter)',
    tritanopia: 'url(#tritanopia-filter)',
  }[settings.colorblindMode];

  return (
    <>
      {/* Filtres SVG pour daltonisme */}
      <svg style={{ position: 'absolute', width: 0, height: 0 }}>
        <defs>
          <filter id="deuteranopia-filter">
            <feColorMatrix type="matrix" values="0.625 0.375 0 0 0 0.7 0.3 0 0 0 0 0.3 0.7 0 0 0 0 0 1 0" />
          </filter>
          <filter id="protanopia-filter">
            <feColorMatrix type="matrix" values="0.567 0.433 0 0 0 0.558 0.442 0 0 0 0 0.242 0.758 0 0 0 0 0 1 0" />
          </filter>
          <filter id="tritanopia-filter">
            <feColorMatrix type="matrix" values="0.95 0.05 0 0 0 0 0.433 0.567 0 0 0 0.475 0.525 0 0 0 0 0 1 0" />
          </filter>
        </defs>
      </svg>

      <div 
        className="relative w-full h-[calc(100vh-160px)] min-h-[600px]"
        style={{ filter: colorblindFilter }}
      >
        {!isReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}
        <ReactReader
          url={epubUrl}
          location={location}
          locationChanged={handleLocationChanged}
          getRendition={(rendition: any) => {
            renditionRef.current = rendition;
            try {
              const markReady = () => {
                if (!isReady) {
                  setIsReady(true);
                  toast({ title: 'EPUB chargé', description: 'Le livre est prêt à être lu' });
                  
                  // Générer les locations pour navigation fluide
                  if (rendition.book && !rendition.book.locations.total) {
                    rendition.book.locations.generate(1024).then(() => {
                      console.log('[EpubReaderCore] Locations generated');
                    });
                  }
                }
              };
              rendition.on('rendered', markReady);
              rendition.on('displayed', markReady);
            } catch (e) {
              console.error('[EpubReaderCore] Rendition setup error:', e);
            }
          }}
          epubOptions={{
            flow: 'scrolled-continuous',
            manager: 'continuous',
            spread: 'none'
          }}
          showToc={false}
          readerStyles={readerStyles}
          swipeable={false}
        />
        
        {/* Contrôles de lecture flottants */}
        <EpubReadingControls
          fontSize={settings.fontSize}
          theme={settings.theme}
          colorblindMode={settings.colorblindMode}
          onFontSizeChange={updateFontSize}
          onThemeChange={updateTheme}
          onColorblindModeChange={updateColorblindMode}
        />
      </div>
    </>
  );
};
