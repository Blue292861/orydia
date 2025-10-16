import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ReactReader } from 'react-reader';
import ePub from 'epubjs';
import { ChapterEpub } from '@/types/ChapterEpub';
import { chapterEpubService } from '@/services/chapterEpubService';
import { Button } from '@/components/ui/button';
import { ChapterReadingControls } from '@/components/ChapterReadingControls';
import { ChapterBannerAd } from '@/components/ChapterBannerAd';
import { ArrowLeft, ArrowRight, Gift, TestTube, FileCheck } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

type Theme = 'light' | 'dark' | 'sepia';
type ColorblindMode = 'none' | 'deuteranopia' | 'protanopia' | 'tritanopia';

export const ChapterEpubReader: React.FC = () => {
  const { bookId, chapterId } = useParams<{ bookId: string; chapterId: string }>();
  const navigate = useNavigate();
  const [chapter, setChapter] = useState<ChapterEpub | null>(null);
  const [allChapters, setAllChapters] = useState<ChapterEpub[]>([]);
  const [location, setLocation] = useState<string | number>(0);
  const [fontSize, setFontSize] = useState(16);
  const [theme, setTheme] = useState<Theme>('light');
  const [colorblindMode, setColorblindMode] = useState<ColorblindMode>('none');
  const [loading, setLoading] = useState(true);
  const [epubReady, setEpubReady] = useState(false);
  const [epubError, setEpubError] = useState<string | null>(null);
  const [renditionRef, setRenditionRef] = useState<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const epubRootRef = useRef<HTMLDivElement>(null);
  const [slowLoad, setSlowLoad] = useState(false);
  const [testMode, setTestMode] = useState<'normal' | 'test-epub' | 'minimal'>('normal');
  const [minimalRendition, setMinimalRendition] = useState<any>(null);
  useEffect(() => {
    const loadChapter = async () => {
      if (!bookId || !chapterId) return;

      try {
        const [chapterData, chaptersData] = await Promise.all([
          chapterEpubService.getChapterById(chapterId),
          chapterEpubService.getChaptersByBookId(bookId),
        ]);

        if (!chapterData) {
          toast.error('Chapitre introuvable');
          navigate(`/book/${bookId}/chapters`);
          return;
        }

        setChapter(chapterData);
        setAllChapters(chaptersData);

        // Diagnostic HEAD check for EPUB accessibility
        try {
          await fetch(chapterData.epub_url, { method: 'HEAD' });
          console.log('EPUB accessible:', chapterData.epub_url);
        } catch (headError) {
          console.error('EPUB not accessible:', headError);
          setEpubError("Impossible de charger l'EPUB. Vérifiez l'URL et les permissions.");
        }

        // Load saved settings
        const savedFontSize = localStorage.getItem(`chapter_fontSize_${chapterId}`);
        const savedTheme = localStorage.getItem(`chapter_theme_${chapterId}`);
        const savedLocation = localStorage.getItem(`chapter_location_${chapterId}`);

        if (savedFontSize) setFontSize(parseInt(savedFontSize));
        if (savedTheme) setTheme(savedTheme as Theme);
        if (savedLocation) setLocation(savedLocation);
      } catch (error) {
        console.error('Error loading chapter:', error);
        toast.error('Erreur lors du chargement');
      } finally {
        setLoading(false);
      }
    };

    loadChapter();
  }, [bookId, chapterId, navigate]);

  // Slow load indicator and container size debug
  useEffect(() => {
    if (epubReady) {
      setSlowLoad(false);
      return;
    }
    const t = setTimeout(() => setSlowLoad(true), 3000);
    // Debug: log container size
    const el = containerRef.current;
    if (el) {
      console.log('EPUB container size', { width: el.clientWidth, height: el.clientHeight });
    }
    return () => clearTimeout(t);
  }, [epubReady]);

  const handleLocationChange = (newLocation: string) => {
    setLocation(newLocation);
    if (chapterId) {
      localStorage.setItem(`chapter_location_${chapterId}`, newLocation);
    }
  };

  const handleFontSizeChange = (size: number) => {
    setFontSize(size);
    if (chapterId) {
      localStorage.setItem(`chapter_fontSize_${chapterId}`, size.toString());
    }
    // Force re-render to apply new font size
    setLocation((prev) => prev);
  };

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme);
    if (chapterId) {
      localStorage.setItem(`chapter_theme_${chapterId}`, newTheme);
    }
  };

  // Apply theme changes dynamically
  useEffect(() => {
    if (renditionRef) {
      renditionRef.themes?.select(theme);
    }
  }, [theme, renditionRef]);

  // Apply font size changes dynamically
  useEffect(() => {
    if (renditionRef) {
      renditionRef.themes?.fontSize(`${fontSize}px`);
    }
  }, [fontSize, renditionRef]);

  const getNextChapter = () => {
    if (!chapter) return null;
    const currentIndex = allChapters.findIndex((ch) => ch.id === chapter.id);
    return currentIndex < allChapters.length - 1 ? allChapters[currentIndex + 1] : null;
  };

  const isLastChapter = () => {
    if (!chapter) return false;
    const currentIndex = allChapters.findIndex((ch) => ch.id === chapter.id);
    return currentIndex === allChapters.length - 1;
  };

  const handleClaimReward = async () => {
    // Logic to claim Tensens reward
    toast.success('Récompense réclamée !');
    navigate(`/book/${bookId}/chapters`);
  };

  const handleTestEpub = () => {
    setTestMode('test-epub');
    setEpubReady(false);
    setEpubError(null);
    toast.info('Chargement de l\'EPUB de test (Alice in Wonderland)...');
  };

  const handleMinimalMode = async () => {
    if (!chapter) return;
    setTestMode('minimal');
    setEpubError(null);
    
    toast.info('Mode test minimal activé - chargement direct avec ePub.js...');
    
    setTimeout(() => {
      if (!epubRootRef.current) return;
      
      const url = chapter.epub_url;
      const book = ePub(url);
      const rendition = book.renderTo(epubRootRef.current, {
        width: '100%',
        height: '80vh',
        flow: 'paginated',
        spread: 'none',
      });

      // Register themes
      rendition.themes.register('light', {
        body: { background: themeColors.light.background, color: themeColors.light.color },
        p: { color: themeColors.light.color },
        img: { 'max-width': '100%', height: 'auto' },
      });
      rendition.themes.register('dark', {
        body: { background: themeColors.dark.background, color: themeColors.dark.color },
        p: { color: themeColors.dark.color },
        img: { 'max-width': '100%', height: 'auto' },
      });
      rendition.themes.register('sepia', {
        body: { background: themeColors.sepia.background, color: themeColors.sepia.color },
        p: { color: themeColors.sepia.color },
        img: { 'max-width': '100%', height: 'auto' },
      });
      
      rendition.themes.select(theme);
      rendition.themes.fontSize(`${fontSize}px`);
      
      rendition.display().then(() => {
        console.log('✅ Mode minimal: EPUB affiché avec succès');
        toast.success('Mode minimal: EPUB chargé avec succès!');
        setMinimalRendition(rendition);
      }).catch((err: any) => {
        console.error('❌ Mode minimal: échec du display', err);
        setEpubError('Échec du chargement même en mode minimal');
      });
    }, 100);
  };

  const handleVerifyArchive = async () => {
    if (!chapter) return;
    
    toast.info('Vérification de l\'archive EPUB...');
    try {
      const response = await fetch(chapter.epub_url, { method: 'GET' });
      const blob = await response.blob();
      const arrayBuffer = await blob.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      
      // Check for ZIP signature (PK\x03\x04)
      const isPK = bytes[0] === 0x50 && bytes[1] === 0x4B && bytes[2] === 0x03 && bytes[3] === 0x04;
      
      const contentType = response.headers.get('Content-Type');
      const contentDisposition = response.headers.get('Content-Disposition');
      
      console.log('📦 Archive EPUB vérification:', {
        isPKSignature: isPK,
        contentType,
        contentDisposition,
        fileSize: blob.size,
        firstBytes: Array.from(bytes.slice(0, 4)).map(b => `0x${b.toString(16).padStart(2, '0')}`).join(' '),
      });
      
      if (!isPK) {
        toast.error('❌ Fichier corrompu: pas une archive ZIP valide');
      } else if (contentType !== 'application/epub+zip') {
        toast.warning(`⚠️ Type MIME incorrect: ${contentType} (attendu: application/epub+zip)`);
      } else {
        toast.success('✅ Archive EPUB valide (signature PK OK, type MIME OK)');
      }
    } catch (error) {
      console.error('Erreur vérification archive:', error);
      toast.error('Erreur lors de la vérification');
    }
  };

  const themeColors = {
    light: { background: '#ffffff', color: '#000000' },
    dark: { background: '#1a1a1a', color: '#ffffff' },
    sepia: { background: '#f4ecd8', color: '#5c4a2f' },
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!chapter) return null;

  const nextChapter = getNextChapter();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="border-b bg-card p-4 sticky top-0 z-40">
        <div className="container mx-auto flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(`/book/${bookId}/chapters`)}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold line-clamp-1 flex-1">{chapter.title}</h1>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(chapter.epub_url, '_blank')}
            aria-label="Ouvrir l’EPUB dans un nouvel onglet"
          >
            Ouvrir l’EPUB
          </Button>
        </div>
      </div>

      {/* Diagnostic Controls */}
      <div className="border-b bg-card p-3">
        <div className="container mx-auto flex gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={handleTestEpub}
            disabled={testMode === 'test-epub'}
          >
            <TestTube className="h-4 w-4 mr-2" />
            Charger EPUB de test
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleMinimalMode}
            disabled={testMode === 'minimal'}
          >
            <TestTube className="h-4 w-4 mr-2" />
            Mode test minimal
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleVerifyArchive}
          >
            <FileCheck className="h-4 w-4 mr-2" />
            Vérifier l'archive
          </Button>
          {testMode !== 'normal' && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setTestMode('normal');
                setEpubReady(false);
                setEpubError(null);
                if (minimalRendition) {
                  minimalRendition.destroy();
                  setMinimalRendition(null);
                }
              }}
            >
              Retour au mode normal
            </Button>
          )}
        </div>
      </div>

      {/* EPUB Reader */}
      <div
        ref={containerRef}
        className="flex-1 epub-reader-container bg-background"
        style={{ 
          minHeight: '70vh',
          height: 'calc(100vh - 200px)',
          padding: '16px',
          width: '100%',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {epubError ? (
          <div className="flex flex-col items-center justify-center h-full gap-4">
            <p className="text-destructive">{epubError}</p>
            <div className="flex gap-2">
              <Button onClick={() => window.location.reload()}>Recharger</Button>
              <Button
                variant="outline"
                onClick={() => window.open(chapter?.epub_url, '_blank')}
              >
                Ouvrir dans un nouvel onglet
              </Button>
            </div>
          </div>
        ) : testMode === 'minimal' ? (
          <div 
            ref={epubRootRef} 
            style={{ 
              height: '80vh', 
              width: '100%',
              border: '1px solid rgba(0,0,0,0.1)',
              background: themeColors[theme].background,
            }}
          />
        ) : (
          <div style={{ 
            flex: 1, 
            width: '100%', 
            position: 'relative', 
            minHeight: '500px',
            height: '80vh',
            border: '1px solid rgba(0,0,0,0.1)',
          }}>
            {!epubReady && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
                <div className="text-center space-y-2">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                  <p className="text-muted-foreground">Chargement du chapitre...</p>
                  {slowLoad && (
                    <p className="text-sm text-muted-foreground">
                      Cela prend plus de temps que prévu...
                    </p>
                  )}
                </div>
              </div>
            )}
            <ReactReader
              key={testMode === 'test-epub' ? 'test-epub' : chapter.id}
              url={testMode === 'test-epub' 
                ? 'https://gerhardsletten.github.io/react-reader/files/alice.epub'
                : chapter.epub_url
              }
              location={location}
              locationChanged={handleLocationChange}
              epubInitOptions={{ 
                openAs: 'epub',
              }}
              epubOptions={{
                flow: 'paginated',
                manager: 'default',
                spread: 'none',
              }}
              getRendition={(rendition) => {
                console.log('✅ EPUB rendition ready', rendition);
                setRenditionRef(rendition);
                setEpubReady(true);
                setEpubError(null);

                // Clean theme registration with objects (not strings)
                const lightTheme = {
                  body: { 
                    background: `${themeColors.light.background} !important`,
                    color: `${themeColors.light.color} !important`,
                  },
                  p: { color: `${themeColors.light.color} !important` },
                  div: { color: `${themeColors.light.color} !important` },
                  span: { color: `${themeColors.light.color} !important` },
                  h1: { color: `${themeColors.light.color} !important` },
                  h2: { color: `${themeColors.light.color} !important` },
                  h3: { color: `${themeColors.light.color} !important` },
                  img: { 'max-width': '100% !important', height: 'auto !important' },
                };
                
                const darkTheme = {
                  body: { 
                    background: `${themeColors.dark.background} !important`,
                    color: `${themeColors.dark.color} !important`,
                  },
                  p: { color: `${themeColors.dark.color} !important` },
                  div: { color: `${themeColors.dark.color} !important` },
                  span: { color: `${themeColors.dark.color} !important` },
                  h1: { color: `${themeColors.dark.color} !important` },
                  h2: { color: `${themeColors.dark.color} !important` },
                  h3: { color: `${themeColors.dark.color} !important` },
                  img: { 'max-width': '100% !important', height: 'auto !important' },
                };
                
                const sepiaTheme = {
                  body: { 
                    background: `${themeColors.sepia.background} !important`,
                    color: `${themeColors.sepia.color} !important`,
                  },
                  p: { color: `${themeColors.sepia.color} !important` },
                  div: { color: `${themeColors.sepia.color} !important` },
                  span: { color: `${themeColors.sepia.color} !important` },
                  h1: { color: `${themeColors.sepia.color} !important` },
                  h2: { color: `${themeColors.sepia.color} !important` },
                  h3: { color: `${themeColors.sepia.color} !important` },
                  img: { 'max-width': '100% !important', height: 'auto !important' },
                };

                rendition.themes.register('light', lightTheme);
                rendition.themes.register('dark', darkTheme);
                rendition.themes.register('sepia', sepiaTheme);
                rendition.themes.select(theme);
                rendition.themes.fontSize(`${fontSize}px`);

                // Proper display sequence
                rendition.display().then(() => {
                  console.log('✅ EPUB displayed successfully');
                  
                  // Resize to container
                  const el = containerRef.current;
                  if (el) {
                    console.log('📐 Resizing to container', { width: el.clientWidth, height: el.clientHeight });
                    rendition.resize(el.clientWidth, el.clientHeight);
                  }
                  
                  // Then navigate to saved location if any
                  if (location) {
                    setTimeout(() => {
                      rendition.display(location as any).catch((err: any) => {
                        console.warn('Failed to navigate to saved location', err);
                      });
                    }, 100);
                  }
                }).catch((err: any) => {
                  console.error('❌ EPUB display() failed', err);
                  setEpubError('Échec de l\'affichage initial');
                });

                // Event handlers with detailed logs
                rendition.on('rendered', (_section: any) => {
                  console.log('🎨 EPUB rendered section', _section?.href);
                });
                
                rendition.on('relocated', (loc: any) => {
                  console.log('📍 EPUB relocated', loc?.start?.cfi);
                });
                
                rendition.on('resized', (size: any) => {
                  console.log('📐 EPUB resized', size);
                });
                
                // @ts-ignore
                rendition.on('displayError', (err: any) => {
                  console.error('❌ EPUB displayError', err);
                  setEpubError("Erreur d'affichage du chapitre");
                });
              }}
            />
          </div>
        )}
      </div>

      {/* Footer Navigation - Fixed at bottom */}
      {(isLastChapter() || getNextChapter()) && (
        <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-4 z-30">
          <div className="container mx-auto">
            {isLastChapter() ? (
              <Button onClick={handleClaimReward} size="lg" className="w-full">
                <Gift className="mr-2 h-5 w-5" />
                Réclamer vos Tensens
              </Button>
            ) : nextChapter ? (
              <Button
                onClick={() => navigate(`/book/${bookId}/chapter/${nextChapter.id}`)}
                size="lg"
                className="w-full"
              >
                Chapitre suivant
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            ) : null}
          </div>
        </div>
      )}

      {/* Reading Controls */}
      <ChapterReadingControls
        fontSize={fontSize}
        theme={theme}
        colorblindMode={colorblindMode}
        onFontSizeChange={handleFontSizeChange}
        onThemeChange={handleThemeChange}
        onColorblindModeChange={setColorblindMode}
      />

      {/* Ad Banner for non-premium users */}
      <ChapterBannerAd />

      {/* SVG Filters for colorblind modes */}
      <svg style={{ position: 'absolute', width: 0, height: 0 }}>
        <defs>
          <filter id="deuteranopia-filter">
            <feColorMatrix
              type="matrix"
              values="0.625 0.375 0 0 0
                      0.7 0.3 0 0 0
                      0 0.3 0.7 0 0
                      0 0 0 1 0"
            />
          </filter>
          <filter id="protanopia-filter">
            <feColorMatrix
              type="matrix"
              values="0.567 0.433 0 0 0
                      0.558 0.442 0 0 0
                      0 0.242 0.758 0 0
                      0 0 0 1 0"
            />
          </filter>
          <filter id="tritanopia-filter">
            <feColorMatrix
              type="matrix"
              values="0.95 0.05 0 0 0
                      0 0.433 0.567 0 0
                      0 0.475 0.525 0 0
                      0 0 0 1 0"
            />
          </filter>
        </defs>
      </svg>
    </div>
  );
};
