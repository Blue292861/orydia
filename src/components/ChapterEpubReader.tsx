import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ReactReader } from 'react-reader';
import { ChapterEpub } from '@/types/ChapterEpub';
import { chapterEpubService } from '@/services/chapterEpubService';
import { Button } from '@/components/ui/button';
import { ChapterReadingControls } from '@/components/ChapterReadingControls';
import { ChapterBannerAd } from '@/components/ChapterBannerAd';
import { ArrowLeft, ArrowRight, Gift } from 'lucide-react';
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
        </div>
      </div>

      {/* EPUB Reader */}
      <div className="flex-1" style={{ height: 'calc(100vh - 64px)' }}>
        {epubError ? (
          <div className="flex flex-col items-center justify-center h-full gap-4">
            <p className="text-destructive">{epubError}</p>
            <Button onClick={() => window.location.reload()}>Recharger</Button>
          </div>
        ) : (
          <ReactReader
            url={chapter.epub_url}
            location={location}
            locationChanged={handleLocationChange}
            epubInitOptions={{ openAs: 'epub' }}
            epubOptions={{
              flow: 'paginated',
              manager: 'default',
              spread: 'none',
            }}
            getRendition={(rendition) => {
              console.log('EPUB rendition ready', rendition);
              setEpubReady(true);
              setEpubError(null);

              const themeStyles = {
                light: { body: { background: themeColors.light.background, color: themeColors.light.color } },
                dark: { body: { background: themeColors.dark.background, color: themeColors.dark.color } },
                sepia: { body: { background: themeColors.sepia.background, color: themeColors.sepia.color } },
              } as const;

              rendition.themes.register('light', themeStyles.light);
              rendition.themes.register('dark', themeStyles.dark);
              rendition.themes.register('sepia', themeStyles.sepia);
              rendition.themes.select(theme);
              rendition.themes.fontSize(`${fontSize}px`);

              rendition.on('rendered', (section: any) => {
                console.log('EPUB rendered section', section?.href);
              });
              rendition.on('relocated', (loc: any) => {
                console.log('EPUB relocated', loc?.start?.cfi);
              });
              // @ts-ignore
              rendition.on('displayError', (err: any) => {
                console.error('EPUB displayError', err);
                setEpubError("Erreur d’affichage du chapitre");
              });
            }}
            loadingView={
              <div className="flex items-center justify-center h-full">
                <div className="text-center space-y-2">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                  <p className="text-muted-foreground">Chargement du chapitre...</p>
                </div>
              </div>
            }
          />
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
