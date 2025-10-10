// src/components/epub/EpubReaderCore.tsx
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { ReactReader } from 'react-reader';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { toPublicEpubUrl } from '@/utils/epubUrl';
import { useEpubSettings } from '@/hooks/useEpubSettings';
import { EpubReadingControls } from '@/components/epub/EpubReadingControls';
import { EpubDebugBanner } from '@/components/epub/EpubDebugBanner';

interface EpubReaderCoreProps {
  url: string;
  bookId?: string;
}

export const EpubReaderCore: React.FC<EpubReaderCoreProps> = ({ url, bookId }) => {
  const [location, setLocation] = useState<string | number>(0);
  const [isReady, setIsReady] = useState(false);
  const { toast } = useToast();
  const renditionRef = useRef<any>(null);
  const [epubArrayBuffer, setEpubArrayBuffer] = useState<ArrayBuffer | null>(null);
  const [isLoadingFull, setIsLoadingFull] = useState(false);
  
  // Debug mode and URL params
  const [debugMode, setDebugMode] = useState(false);
  const [fullLoadMode, setFullLoadMode] = useState(false);
  const [safeCssMode, setSafeCssMode] = useState(false);
  const [debugInfo, setDebugInfo] = useState({
    spineLength: 0,
    currentIndex: 0,
    currentHref: '',
    preloadStatus: 'idle',
    averageLatency: 0,
    lastError: null as string | null,
  });
  const latencyTimestamps = useRef<number[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Check for debug mode and other flags on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setDebugMode(params.get('debug') === 'epub');
    setFullLoadMode(params.get('epub') === 'full');
    setSafeCssMode(params.get('epubCss') === 'safe');
  }, []);

  // Full load mode: download entire EPUB as ArrayBuffer
  useEffect(() => {
    if (!fullLoadMode || !url || epubArrayBuffer) return;

    const loadFullEpub = async () => {
      setIsLoadingFull(true);
      console.log('[EPUB Full Load] Downloading entire EPUB as ArrayBuffer:', url);
      
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Failed to fetch EPUB: ${response.status}`);
        }
        
        const arrayBuffer = await response.arrayBuffer();
        console.log('[EPUB Full Load] Downloaded:', arrayBuffer.byteLength, 'bytes');
        setEpubArrayBuffer(arrayBuffer);
      } catch (error) {
        console.error('[EPUB Full Load] Error:', error);
        setDebugInfo(prev => ({ ...prev, lastError: `Full load failed: ${error}` }));
      } finally {
        setIsLoadingFull(false);
      }
    };

    loadFullEpub();
  }, [fullLoadMode, url, epubArrayBuffer]);
  
  // Conversion intelligente vers URL publique
  const epubUrl = useMemo(() => toPublicEpubUrl(url), [url]);
  
  // Paramètres de lecture
  const { settings, updateFontSize, updateTheme, updateColorblindMode } = useEpubSettings(bookId);
  
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
  
  // Apply theme and CSS mode changes
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

      // Apply or remove CSS optimizations based on safe mode
      if (containerRef.current) {
        const iframes = containerRef.current.querySelectorAll('iframe');
        iframes.forEach((iframe) => {
          if (safeCssMode) {
            // Safe mode: remove aggressive optimizations
            iframe.style.removeProperty('content-visibility');
            iframe.style.removeProperty('contain-intrinsic-size');
          } else {
            // Normal mode: apply optimizations
            iframe.style.willChange = 'transform';
          }
        });
      }
    } catch (error) {
      console.error('Error applying EPUB settings:', error);
    }
  }, [settings.fontSize, settings.theme, safeCssMode]);
  
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

  // Determine the URL to use: ArrayBuffer for full load mode, or regular URL
  const epubSource = fullLoadMode && epubArrayBuffer ? epubArrayBuffer : epubUrl;

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
        ref={containerRef}
        className="relative w-full h-[calc(100vh-160px)] min-h-[600px] overflow-y-auto"
        style={{ filter: colorblindFilter }}
      >
        {debugMode && (
          <EpubDebugBanner
            spineLength={debugInfo.spineLength}
            currentIndex={debugInfo.currentIndex}
            currentHref={debugInfo.currentHref}
            preloadStatus={debugInfo.preloadStatus}
            averageLatency={debugInfo.averageLatency}
            lastError={debugInfo.lastError}
            isFullLoadMode={fullLoadMode}
            isSafeCssMode={safeCssMode}
            onToggleSafeCss={() => {
              setSafeCssMode(!safeCssMode);
              const params = new URLSearchParams(window.location.search);
              if (!safeCssMode) {
                params.set('epubCss', 'safe');
              } else {
                params.delete('epubCss');
              }
              window.history.replaceState({}, '', `${window.location.pathname}?${params}`);
            }}
            onClose={() => setDebugMode(false)}
          />
        )}
        
        {(!isReady || isLoadingFull) && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-10">
            <div className="text-center space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
              <p className="text-muted-foreground">
                {isLoadingFull ? 'Téléchargement complet en cours...' : 'Chargement de votre livre...'}
              </p>
              {debugMode && (
                <p className="text-xs text-muted-foreground font-mono">
                  Debug mode actif - {fullLoadMode ? 'ArrayBuffer mode' : 'Streaming mode'}
                </p>
              )}
            </div>
          </div>
        )}
        
        {!isLoadingFull && (
          <ReactReader
            url={epubSource}
            location={location}
            locationChanged={handleLocationChanged}
            getRendition={(rendition: any) => {
              const readyStartTime = performance.now();
              renditionRef.current = rendition;
              
              try {
                const book = rendition.book;
                
                // Instrumentation complète du book
                if (book) {
                  if (debugMode) {
                    console.log('[DEBUG] Book spine length:', book.spine?.length || 0);
                    console.log('[DEBUG] Book spine items:', book.spine?.items?.map((item: any) => ({
                      index: item.index,
                      href: item.href,
                      idref: item.idref,
                    })));
                  }
                  
                  setDebugInfo(prev => ({
                    ...prev,
                    spineLength: book.spine?.length || 0,
                  }));
                  
                  // Event listeners sur le book
                  book.ready.then(() => {
                    if (debugMode) console.log('[DEBUG] Book.ready promise resolved');
                  }).catch((err: any) => {
                    const errMsg = `Book ready failed: ${err.message}`;
                    console.error('[DEBUG]', errMsg);
                    setDebugInfo(prev => ({ ...prev, lastError: errMsg }));
                  });
                  
                  book.opened.then(() => {
                    if (debugMode) console.log('[DEBUG] Book.opened promise resolved');
                  }).catch((err: any) => {
                    const errMsg = `Book open failed: ${err.message}`;
                    console.error('[DEBUG]', errMsg);
                    setDebugInfo(prev => ({ ...prev, lastError: errMsg }));
                  });
                }
                
                const markReady = () => {
                  if (!isReady) {
                    setIsReady(true);
                    toast({ title: 'EPUB chargé', description: 'Le livre est prêt à être lu' });
                    
                    // Générer les locations pour navigation fluide
                    if (book && book.locations && !book.locations.total) {
                      const locStartTime = performance.now();
                      book.locations.generate(1024).then(() => {
                        const locDuration = performance.now() - locStartTime;
                        console.log('[EpubReaderCore] Locations generated in', locDuration.toFixed(0), 'ms');
                        if (debugMode) {
                          console.log('[DEBUG] Total locations:', book.locations.total);
                        }
                      });
                    }
                  }
                };
                
                // Event listeners exhaustifs
                rendition.on('rendered', (section: any) => {
                  const renderTime = performance.now();
                  if (debugMode) {
                    console.log('[DEBUG] Section rendered:', {
                      index: section?.index,
                      href: section?.href,
                      timestamp: renderTime,
                    });
                  }
                  
                  latencyTimestamps.current.push(renderTime);
                  if (latencyTimestamps.current.length > 10) {
                    latencyTimestamps.current.shift();
                  }
                  
                  // Calculer latence moyenne
                  if (latencyTimestamps.current.length > 1) {
                    const diffs = [];
                    for (let i = 1; i < latencyTimestamps.current.length; i++) {
                      diffs.push(latencyTimestamps.current[i] - latencyTimestamps.current[i - 1]);
                    }
                    const avgLatency = diffs.reduce((a, b) => a + b, 0) / diffs.length;
                    setDebugInfo(prev => ({ ...prev, averageLatency: avgLatency }));
                  }
                  
                  markReady();
                });
                
                rendition.on('displayed', (section: any) => {
                  if (debugMode) {
                    console.log('[DEBUG] Section displayed:', {
                      index: section?.index,
                      href: section?.href,
                    });
                  }
                  markReady();
                });
                
                rendition.on('displayError', (err: any) => {
                  const errMsg = `Display error: ${err.message || err}`;
                  console.error('[DEBUG]', errMsg);
                  setDebugInfo(prev => ({ ...prev, lastError: errMsg }));
                });
                
                rendition.on('layout', (layout: any) => {
                  if (debugMode) {
                    console.log('[DEBUG] Layout changed:', layout);
                  }
                });
                
                // Optimiser le preloading
                if (rendition.manager && rendition.manager.views) {
                  rendition.manager.settings.minSpreadWidth = 0;
                  rendition.manager.settings.gap = 0;
                  if (debugMode) {
                    console.log('[DEBUG] Manager settings applied');
                  }
                }
                
                // Préchargement automatique lors du scroll
                rendition.on('relocated', (location: any) => {
                  // Mise à jour debug info
                  if (location?.start) {
                    const currentIdx = location.start.index ?? 0;
                    const currentHref = location.start.href || '';
                    setDebugInfo(prev => ({
                      ...prev,
                      currentIndex: currentIdx,
                      currentHref: currentHref,
                    }));
                    
                    if (debugMode) {
                      console.log('[DEBUG] Relocated to:', {
                        index: currentIdx,
                        href: currentHref,
                        cfi: location.start.cfi,
                      });
                    }
                  }
                  
                  // Préchargement des prochaines sections
                  if (rendition.manager && location?.start && book?.spine) {
                    const currentIndex = location.start.index ?? 0;
                    const spine = book.spine;
                    
                    setDebugInfo(prev => ({ ...prev, preloadStatus: 'preloading...' }));
                    
                    let successCount = 0;
                    
                    for (let i = 1; i <= 3; i++) {
                      const nextIndex = currentIndex + i;
                      if (nextIndex < spine.length) {
                        const section = spine.get(nextIndex);
                        if (section) {
                          section.load(book.load.bind(book))
                            .then(() => {
                              successCount++;
                              if (debugMode) {
                                console.log('[DEBUG] Preload success:', nextIndex, section.href);
                              }
                              setDebugInfo(prev => ({ 
                                ...prev, 
                                preloadStatus: `${successCount}/3 OK` 
                              }));
                            })
                            .catch((err: any) => {
                              const errMsg = `Preload failed [${nextIndex}]: ${err.message}`;
                              console.warn('[DEBUG]', errMsg);
                              setDebugInfo(prev => ({ 
                                ...prev, 
                                lastError: errMsg,
                              }));
                            });
                        }
                      }
                    }
                  }
                });
                
                const readyDuration = performance.now() - readyStartTime;
                if (debugMode) {
                  console.log('[DEBUG] Rendition setup completed in', readyDuration.toFixed(0), 'ms');
                }
              } catch (e: any) {
                const errMsg = `Rendition setup error: ${e.message}`;
                console.error('[EpubReaderCore]', errMsg, e);
                setDebugInfo(prev => ({ ...prev, lastError: errMsg }));
              }
            }}
            epubOptions={{
              flow: 'scrolled-continuous',
              manager: 'continuous',
              spread: 'none',
              allowScriptedContent: false,
              snap: false,
            }}
            showToc={false}
            readerStyles={readerStyles}
            swipeable={false}
          />
        )}
        
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
