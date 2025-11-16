
import React, { useState, useEffect } from 'react';
import { Book } from '@/types/Book';
import { Audiobook } from '@/types/Audiobook';
import { Info, Headphones } from 'lucide-react';
import { BookCarousel } from './BookCarousel';
import { MonthSuccessCarousel } from './MonthSuccessCarousel';
import { BookPreviewDialog } from './BookPreviewDialog';
import { audiobookService } from '@/services/audiobookService';
import { useResponsive } from '@/hooks/useResponsive';
import { RecentReads } from './RecentReads';

interface BookLibraryProps {
  books: Book[];
  onBookSelect: (book: Book) => void;
}

export const BookLibrary: React.FC<BookLibraryProps> = ({ books, onBookSelect }) => {
  const { isMobile, isTablet } = useResponsive();
  const [featuredAudiobooks, setFeaturedAudiobooks] = useState<Audiobook[]>([]);
  const [pacoChronicleAudiobooks, setPacoChronicleAudiobooks] = useState<Audiobook[]>([]);
  const [previewBook, setPreviewBook] = useState<Book | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [showOnlyPremium, setShowOnlyPremium] = useState(false);
  
  // Écouter les changements de filtre premium
  useEffect(() => {
    const saved = localStorage.getItem('showOnlyPremium');
    if (saved !== null) {
      setShowOnlyPremium(saved === 'true');
    }
    
    const handleFilterChange = (e: Event) => {
      const customEvent = e as CustomEvent;
      setShowOnlyPremium(customEvent.detail.showOnlyPremium);
    };
    
    window.addEventListener('premiumFilterChanged', handleFilterChange);
    return () => window.removeEventListener('premiumFilterChanged', handleFilterChange);
  }, []);

  // Filtrer les livres selon la préférence premium
  const filteredBooks = showOnlyPremium 
    ? books.filter(b => b.isPremium) 
    : books;
  
  const successBooks = filteredBooks.filter(b => b.isMonthSuccess);
  const pacoBooks = filteredBooks.filter(b => b.isPacoFavourite);

  const handleBookPreview = (book: Book) => {
    setPreviewBook(book);
    setShowPreview(true);
  };

  const handleReadBook = (book: Book) => {
    onBookSelect(book);
  };

  useEffect(() => {
    const loadFeaturedContent = async () => {
      try {
        const [audiobooks, pacoChronicleData] = await Promise.all([
          audiobookService.getFeaturedAudiobooks(),
          audiobookService.getPacoChronicleAudiobooks()
        ]);
        setFeaturedAudiobooks(audiobooks);
        setPacoChronicleAudiobooks(pacoChronicleData);
      } catch (error) {
        console.error('Erreur lors du chargement du contenu à la une:', error);
      }
    };

    loadFeaturedContent();
  }, []);

  const getSpacing = () => {
    if (isMobile) return 'space-y-4';
    if (isTablet) return 'space-y-5';
    return 'space-y-6 sm:space-y-8';
  };

  const getInfoPadding = () => {
    if (isMobile) return 'p-3';
    if (isTablet) return 'p-4';
    return 'p-4 sm:p-6';
  };

  return (
    <div className={`max-w-full overflow-x-hidden ${getSpacing()}`}>

      <MonthSuccessCarousel
        books={successBooks}
        onBookSelect={handleBookPreview}
      />

      <BookCarousel
        title="Les conseils de Paco"
        books={pacoBooks}
        onBookSelect={handleBookPreview}
        large={false}
        emptyMessage="Aucun livre dans cette catégorie pour le moment."
      />

      {/* La Chronique de Paco */}
      {pacoChronicleAudiobooks.length > 0 && (
        <div className={getSpacing()}>
          <h2 className={`font-cursive text-wood-300 px-2 flex items-center gap-2 ${
            isMobile ? 'text-lg' : isTablet ? 'text-xl' : 'text-2xl sm:text-3xl lg:text-4xl'
          }`}>
            <Headphones className={`${isMobile ? 'w-5 h-5' : 'w-6 h-6'}`} />
            La Chronique de Paco
          </h2>
          <div className="px-2">
            <div className={`flex gap-4 overflow-x-auto pb-4 ${
              isMobile ? 'scroll-smooth' : ''
            }`}>
              {pacoChronicleAudiobooks.map((audiobook) => (
                <div key={audiobook.id} className="min-w-[120px] max-w-[168px]">
                  <div className="bg-wood-800/60 border border-wood-700 rounded-lg p-4 cursor-pointer hover:bg-wood-700/60 transition-colors">
                    <img 
                      src={audiobook.cover_url} 
                      alt={audiobook.name}
                      className="w-full aspect-[2/3] object-cover rounded-md mb-3"
                    />
                    <h3 className="text-wood-100 font-semibold text-sm mb-1 line-clamp-2">
                      {audiobook.name}
                    </h3>
                    <p className="text-wood-400 text-xs mb-2">par {audiobook.author}</p>
                    {audiobook.points > 0 && (
                      <div className="text-primary text-xs">+{audiobook.points} Tensens</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Audio à la une */}
      <div className={getSpacing()}>
        <h2 className={`font-cursive text-wood-300 px-2 flex items-center gap-2 ${
          isMobile ? 'text-lg' : isTablet ? 'text-xl' : 'text-2xl sm:text-3xl lg:text-4xl'
        }`}>
          <Headphones className={`${isMobile ? 'w-5 h-5' : 'w-6 h-6'}`} />
          Audio à la une
        </h2>
        <div className="px-2">
          {featuredAudiobooks.length > 0 ? (
            <div className={`flex gap-4 overflow-x-auto pb-4 ${
              isMobile ? 'scroll-smooth' : ''
            }`}>
              {featuredAudiobooks.map((audiobook) => (
                <div key={audiobook.id} className="min-w-[120px] max-w-[168px]">
                  <div className="bg-wood-800/60 border border-wood-700 rounded-lg p-4 cursor-pointer hover:bg-wood-700/60 transition-colors">
                    <img 
                      src={audiobook.cover_url} 
                      alt={audiobook.name}
                      className="w-full aspect-[2/3] object-cover rounded-md mb-3"
                    />
                    <h3 className="text-wood-100 font-semibold text-sm mb-1 line-clamp-2">
                      {audiobook.name}
                    </h3>
                    <p className="text-wood-400 text-xs mb-2">par {audiobook.author}</p>
                    {audiobook.points > 0 && (
                      <div className="text-primary text-xs">+{audiobook.points} Tensens</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={`text-wood-300 px-2 ${
              isMobile ? 'text-xs' : isTablet ? 'text-sm' : 'text-sm'
            }`}>
              Aucun audiobook à la une pour le moment.
            </div>
          )}
        </div>
      </div>

      {/* Reprise de lecture - harmonisé avec les autres catégories */}
      <div className={getSpacing()}>
        <h2 className={`font-display text-forest-700 px-2 flex items-center gap-2 ${
          isMobile ? 'text-lg' : isTablet ? 'text-xl' : 'text-2xl sm:text-3xl lg:text-4xl'
        }`}>
          <Info className={`${isMobile ? 'w-5 h-5' : 'w-6 h-6'}`} />
          En cours de lecture
        </h2>
        <div className="px-2">
          <RecentReads 
            onSelectBook={handleReadBook}
            onSelectAudiobook={(audiobook, chapter) => {
              console.log('Audiobook selected:', audiobook, chapter);
            }}
          />
        </div>
      </div>

      {books.length === 0 && (
        <div className={`text-center py-12 px-4`}>
          <p className={`text-forest-200 ${
            isMobile ? 'text-sm' : isTablet ? 'text-base' : 'text-base'
          }`}>
            Aucun livre dans votre bibliothèque pour le moment. Allez dans le panneau d'administration pour en ajouter.
          </p>
        </div>
      )}

      <BookPreviewDialog
        book={previewBook}
        open={showPreview}
        onOpenChange={setShowPreview}
        onReadBook={handleReadBook}
      />
    </div>
  );
};
