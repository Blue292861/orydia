
import React, { useState, useEffect } from 'react';
import { Book } from '@/types/Book';
import { Game } from '@/types/Game';
import { Audiobook } from '@/types/Audiobook';
import { Info, Headphones, Gamepad2 } from 'lucide-react';
import { BookCarousel } from './BookCarousel';
import { GameCard } from './GameCard';
import { gameService } from '@/services/gameService';
import { audiobookService } from '@/services/audiobookService';
import { useResponsive } from '@/hooks/useResponsive';

interface BookLibraryProps {
  books: Book[];
  onBookSelect: (book: Book) => void;
  onGameSelect?: (game: Game) => void;
}

export const BookLibrary: React.FC<BookLibraryProps> = ({ books, onBookSelect, onGameSelect }) => {
  const { isMobile, isTablet } = useResponsive();
  const [featuredAudiobooks, setFeaturedAudiobooks] = useState<Audiobook[]>([]);
  const [featuredGames, setFeaturedGames] = useState<Game[]>([]);
  
  const successBooks = books.filter(b => b.isMonthSuccess);
  const pacoBooks = books.filter(b => b.isPacoFavourite);

  useEffect(() => {
    const loadFeaturedContent = async () => {
      try {
        const [audiobooks, games] = await Promise.all([
          audiobookService.getFeaturedAudiobooks(),
          gameService.getFeaturedGames()
        ]);
        setFeaturedAudiobooks(audiobooks);
        setFeaturedGames(games);
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
    <div className={`max-w-full overflow-hidden ${getSpacing()}`}>
      {/* Audio à la une */}
      {featuredAudiobooks.length > 0 && (
        <div className={getSpacing()}>
          <h2 className={`font-cursive text-wood-300 px-2 flex items-center gap-2 ${
            isMobile ? 'text-lg' : isTablet ? 'text-xl' : 'text-2xl sm:text-3xl lg:text-4xl'
          }`}>
            <Headphones className={`${isMobile ? 'w-5 h-5' : 'w-6 h-6'}`} />
            Audio à la une
          </h2>
          <div className="px-2">
            <div className={`flex gap-4 overflow-x-auto pb-4 ${
              isMobile ? 'scroll-smooth' : ''
            }`}>
              {featuredAudiobooks.map((audiobook) => (
                <div key={audiobook.id} className="min-w-[200px] max-w-[280px]">
                  <div className="bg-wood-800/60 border border-wood-700 rounded-lg p-4 cursor-pointer hover:bg-wood-700/60 transition-colors">
                    <img 
                      src={audiobook.cover_url} 
                      alt={audiobook.name}
                      className="w-full aspect-[3/4] object-cover rounded-md mb-3"
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

      {/* Jeux à la une */}
      {featuredGames.length > 0 && (
        <div className={getSpacing()}>
          <h2 className={`font-cursive text-wood-300 px-2 flex items-center gap-2 ${
            isMobile ? 'text-lg' : isTablet ? 'text-xl' : 'text-2xl sm:text-3xl lg:text-4xl'
          }`}>
            <Gamepad2 className={`${isMobile ? 'w-5 h-5' : 'w-6 h-6'}`} />
            Jeux à la une
          </h2>
          <div className="px-2">
            <div className={`flex gap-4 overflow-x-auto pb-4 ${
              isMobile ? 'scroll-smooth' : ''
            }`}>
              {featuredGames.map((game) => (
                <GameCard 
                  key={game.id} 
                  game={game} 
                  onSelect={onGameSelect || (() => {})} 
                />
              ))}
            </div>
          </div>
        </div>
      )}

      <BookCarousel
        title="Succès du mois"
        books={successBooks}
        onBookSelect={onBookSelect}
        large={true}
        emptyMessage="Aucun livre dans cette catégorie pour le moment."
      />

      <BookCarousel
        title="Les conseils de Paco"
        books={pacoBooks}
        onBookSelect={onBookSelect}
        emptyMessage="Aucun livre dans cette catégorie pour le moment."
      />
      
      <div className={getSpacing()}>
        <h2 className={`font-cursive text-wood-300 px-2 ${
          isMobile ? 'text-lg' : isTablet ? 'text-xl' : 'text-2xl sm:text-3xl lg:text-4xl'
        }`}>
          En cours de lecture
        </h2>
        <div className={`bg-wood-800/60 border border-wood-700 rounded-lg flex items-center justify-center text-center text-wood-200 mx-2 ${getInfoPadding()}`}>
          <Info className={`mr-2 text-primary shrink-0 ${
            isMobile ? 'h-4 w-4' : isTablet ? 'h-5 w-5' : 'h-5 w-5 sm:h-6 sm:w-6'
          }`} />
          <div>
            <p className={`font-semibold ${
              isMobile ? 'text-sm' : isTablet ? 'text-base' : 'text-base'
            }`}>
              Bientôt disponible !
            </p>
            <p className={`text-wood-400 ${
              isMobile ? 'text-xs' : isTablet ? 'text-sm' : 'text-sm'
            }`}>
              La fonctionnalité de suivi des lectures en cours est en préparation.
            </p>
          </div>
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
    </div>
  );
};
