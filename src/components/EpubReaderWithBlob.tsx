// src/components/EpubReaderWithBlob.tsx
import React, { useState, useEffect, useRef } from 'react';
import { ReactReader } from 'react-reader';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ChevronLeft, ChevronRight, List } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

interface EpubReaderProps {
  url: string;
}

export const EpubReaderWithBlob: React.FC<EpubReaderProps> = ({ url }) => {
  const [location, setLocation] = useState<string | number>(0);
  const [isReady, setIsReady] = useState(false);
  const [epubUrl, setEpubUrl] = useState<string | null>(null);
  const [flowMode, setFlowMode] = useState<'scrolled-continuous' | 'paginated'>('scrolled-continuous');
  const [tocItems, setTocItems] = useState<any[]>([]);
  const [showToc, setShowToc] = useState(false);
  const [rendition, setRendition] = useState<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchEpub = async () => {
      if (!url) return;
      setIsReady(false);
      try {
        const match = url.match(/\/object\/public\/epubs\/(.+)$/);
        const filePath = match ? match[1] : url.split('/').pop() || '';
        const { data, error } = await supabase.storage.from('epubs').download(filePath);
        if (error) throw error;
        if (data) {
          setEpubUrl(URL.createObjectURL(data));
          setIsReady(true);
          toast({ title: "EPUB récupéré" });
        }
      } catch (error) {
        toast({ title: "Erreur de téléchargement", variant: "destructive" });
      }
    };
    fetchEpub();
  }, [url, toast]);

  const handleRenditionReady = (rendition: any) => {
    setRendition(rendition);
    if (rendition.book?.navigation?.toc) setTocItems(rendition.book.navigation.toc);
    
    const configureScroller = () => {
      const scroller = (rendition as any)?.manager?.container as HTMLElement;
      const container = containerRef.current;
      if (scroller && container) {
        scroller.style.overflowY = 'auto';
        scroller.style.height = `${container.clientHeight}px`;
        setTimeout(() => {
          if (scroller.scrollHeight <= scroller.clientHeight + 10 && flowMode === 'scrolled-continuous') {
            setFlowMode('paginated');
          }
        }, 1500);
      }
    };
    configureScroller();
  };

  const goToPrevPage = () => rendition?.prev();
  const goToNextPage = () => rendition?.next();
  const goToTocItem = (href: string) => {
    rendition?.display(href);
    setShowToc(false);
  };

  const readerStyles: any = {
    container: { width: '100%', height: '100%' },
    arrow: { display: 'none' },
    prev: { display: 'none' },
    next: { display: 'none' },
  };

  return (
    <div className="relative w-full h-[85vh] flex flex-col">
      <div className="sticky top-0 z-20 bg-background/95 border-b px-4 py-2">
        <Dialog open={showToc} onOpenChange={setShowToc}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm"><List className="h-4 w-4" />TOC</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Table des matières</DialogTitle></DialogHeader>
            <ScrollArea className="h-[60vh]">
              {tocItems.map((item: any, i: number) => (
                <Button key={i} variant="ghost" className="w-full justify-start" onClick={() => goToTocItem(item.href)}>
                  {item.label}
                </Button>
              ))}
            </ScrollArea>
          </DialogContent>
        </Dialog>
      </div>

      <div ref={containerRef} className="flex-1 epub-reader-container relative overflow-hidden">
        {!isReady && <div className="absolute inset-0 flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>}
        {epubUrl && (
          <ReactReader
            url={epubUrl}
            location={location}
            locationChanged={setLocation}
            getRendition={handleRenditionReady}
            epubOptions={{ flow: flowMode, manager: flowMode === 'paginated' ? 'default' : 'continuous', spread: 'none' }}
            showToc={false}
            readerStyles={readerStyles}
            swipeable={false}
          />
        )}
        {flowMode === 'paginated' && isReady && epubUrl && (
          <>
            <Button variant="outline" size="icon" className="absolute left-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full shadow-lg" onClick={goToPrevPage}>
              <ChevronLeft className="h-6 w-6" />
            </Button>
            <Button variant="outline" size="icon" className="absolute right-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full shadow-lg" onClick={goToNextPage}>
              <ChevronRight className="h-6 w-6" />
            </Button>
          </>
        )}
      </div>
    </div>
  );
};
