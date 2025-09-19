
import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Book } from '@/types/Book';
import { Audiobook } from '@/types/Audiobook';  
import { Game } from '@/types/Game';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Headphones, Gamepad2, ArrowRight } from 'lucide-react';
import { BookCard } from './BookCard';
import { AudiobookCard } from './AudiobookCard';
import { GameCard } from './GameCard';
import { LITERARY_GENRES, GENRE_DESCRIPTIONS, LiteraryGenre } from '@/constants/genres';
import { genreAnalyticsService } from '@/services/genreAnalyticsService';
import { audiobookService } from '@/services/audiobookService';
import { gameService } from '@/services/gameService';

interface SearchPageProps {
  books: Book[];
  onBookSelect: (book: Book) => void;
}

interface GenreContent {
  books: Book[];
  audiobooks: Audiobook[];
  games: Game[];
  totalViews: number;
}

export const SearchPage: React.FC<SearchPageProps> = ({ books, onBookSelect }) => {
  const navigate = useNavigate();
  const [audiobooks, setAudiobooks] = useState<Audiobook[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadAdditionalContent();
  }, []);

  const loadAdditionalContent = async () => {
    setLoading(true);
    try {
      const [audiobooksData, gamesData] = await Promise.all([
        audiobookService.getAllAudiobooks(),
        gameService.getAllGames()
      ]);
      setAudiobooks(audiobooksData);
      setGames(gamesData);
    } catch (error) {
      console.error('Error loading additional content:', error);
    } finally {
      setLoading(false);
    }
  };

  // Group content by genre and get top 5 by views for each genre
  const genreContent = useMemo(() => {
    const genreMap = new Map<LiteraryGenre, GenreContent>();
    
    // Initialize all genres
    LITERARY_GENRES.forEach(genre => {
      genreMap.set(genre, {
        books: [],
        audiobooks: [],
        games: [],
        totalViews: 0
      });
    });

    // Categorize books by genre
    books.forEach(book => {
      const bookGenres = genreAnalyticsService.extractGenresFromTags(book.tags || []);
      bookGenres.forEach(genre => {
        if (LITERARY_GENRES.includes(genre as LiteraryGenre)) {
          const content = genreMap.get(genre as LiteraryGenre);
          if (content) {
            content.books.push(book);
            // Use points as a proxy for popularity/views for now
            content.totalViews += book.points || 0;
          }
        }
      });
    });

    // Categorize audiobooks by genre
    audiobooks.forEach(audiobook => {
      const audiobookGenres = genreAnalyticsService.extractGenresFromTags(audiobook.tags || []);
      audiobookGenres.forEach(genre => {
        if (LITERARY_GENRES.includes(genre as LiteraryGenre)) {
          const content = genreMap.get(genre as LiteraryGenre);
          if (content) {
            content.audiobooks.push(audiobook);
            content.totalViews += audiobook.points || 0;
          }
        }
      });
    });

    // For games, we'll do a simple categorization for now
    games.forEach(game => {
      // Simple genre matching for games based on name/description
      const gameText = `${game.name} ${game.description || ''}`.toLowerCase();
      let assignedGenre: LiteraryGenre | null = null;
      
      if (gameText.includes('fantasy') || gameText.includes('fantaisie') || gameText.includes('magic')) {
        assignedGenre = 'Fantaisie';
      } else if (gameText.includes('sci-fi') || gameText.includes('science') || gameText.includes('futur')) {
        assignedGenre = 'Science-Fiction';
      } else if (gameText.includes('romance') || gameText.includes('amour')) {
        assignedGenre = 'Romance';
      } else if (gameText.includes('adventure') || gameText.includes('aventure')) {
        assignedGenre = 'Aventure';
      } else if (gameText.includes('horror') || gameText.includes('horreur')) {
        assignedGenre = 'Horreur';
      } else if (gameText.includes('mystery') || gameText.includes('mystère')) {
        assignedGenre = 'Mystère/Thriller';
      } else {
        assignedGenre = 'Aventure'; // Default genre for games
      }

      if (assignedGenre) {
        const content = genreMap.get(assignedGenre);
        if (content) {
          content.games.push(game);
          content.totalViews += game.points_reward || 0;
        }
      }
    });

    return genreMap;
  }, [books, audiobooks, games]);

  // Get top 5 content items for each genre
  const getTopContentForGenre = (genre: LiteraryGenre) => {
    const content = genreContent.get(genre);
    if (!content) return { books: [], audiobooks: [], games: [] };

    // Sort by points (popularity proxy) and take top 5 combined
    const allContent = [
      ...content.books.map(item => ({ ...item, type: 'book' as const })),
      ...content.audiobooks.map(item => ({ ...item, type: 'audiobook' as const })),
      ...content.games.map(item => ({ ...item, type: 'game' as const, points: item.points_reward }))
    ].sort((a, b) => (b.points || 0) - (a.points || 0)).slice(0, 5);

    return {
      books: allContent.filter(item => item.type === 'book'),
      audiobooks: allContent.filter(item => item.type === 'audiobook'),
      games: allContent.filter(item => item.type === 'game'),
      total: allContent.length
    };
  };

  const handleGenreClick = (genre: LiteraryGenre) => {
    navigate(`/genre/${encodeURIComponent(genre)}`);
  };

  if (books.length === 0) {
    return (
      <div className="text-center py-12 border border-wood-700 bg-wood-800/30 rounded-lg text-wood-200">
        <p>Il n'y a aucun livre dans la bibliothèque.</p>
        <p className="text-sm text-wood-400">Ajoutez-en depuis le panneau d'administration.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 text-wood-100">
      <div className="space-y-4">
        <h2 className="text-3xl font-bold text-center text-wood-100">Explorer par genres</h2>
        <p className="text-center text-wood-300">Découvrez nos contenus classés par genres littéraires</p>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-wood-300">Chargement des contenus...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {LITERARY_GENRES.map((genre) => {
            const topContent = getTopContentForGenre(genre);
            const totalItems = genreContent.get(genre)?.books.length || 0 + 
                              genreContent.get(genre)?.audiobooks.length || 0 + 
                              genreContent.get(genre)?.games.length || 0;
            
            if (totalItems === 0) return null;

            return (
              <Card 
                key={genre} 
                className="bg-wood-800/50 border-wood-700 hover:bg-wood-800/70 transition-colors cursor-pointer group"
                onClick={() => handleGenreClick(genre)}
              >
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {/* Genre Header */}
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-xl font-bold text-wood-100 group-hover:text-primary transition-colors">
                          {genre}
                        </h3>
                        <p className="text-sm text-wood-400 mt-1">
                          {GENRE_DESCRIPTIONS[genre]}
                        </p>
                      </div>
                      <ArrowRight className="h-5 w-5 text-wood-400 group-hover:text-primary transition-colors" />
                    </div>

                    {/* Content Stats */}
                    <div className="flex items-center gap-4 text-sm text-wood-300">
                      {genreContent.get(genre)?.books.length > 0 && (
                        <div className="flex items-center gap-1">
                          <BookOpen className="h-4 w-4" />
                          <span>{genreContent.get(genre)?.books.length} livre(s)</span>
                        </div>
                      )}
                      {genreContent.get(genre)?.audiobooks.length > 0 && (
                        <div className="flex items-center gap-1">
                          <Headphones className="h-4 w-4" />
                          <span>{genreContent.get(genre)?.audiobooks.length} audio(s)</span>
                        </div>
                      )}
                      {genreContent.get(genre)?.games.length > 0 && (
                        <div className="flex items-center gap-1">
                          <Gamepad2 className="h-4 w-4" />
                          <span>{genreContent.get(genre)?.games.length} jeu(x)</span>
                        </div>
                      )}
                    </div>

                    {/* Top Content Preview */}
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium text-wood-200">Top 5 des succès :</h4>
                      <div className="grid grid-cols-5 gap-2">
                        {/* Show top books */}
                        {topContent.books.slice(0, 5).map((book: any) => (
                          <div key={book.id} className="aspect-[3/4] relative overflow-hidden rounded">
                            <img 
                              src={book.coverUrl} 
                              alt={book.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))}
                        {/* Show top audiobooks */}
                        {topContent.audiobooks.slice(0, 5 - topContent.books.length).map((audiobook: any) => (
                          <div key={audiobook.id} className="aspect-[3/4] relative overflow-hidden rounded">
                            <img 
                              src={audiobook.cover_url} 
                              alt={audiobook.name}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute bottom-0 right-0 bg-primary/80 text-white p-1 rounded-tl">
                              <Headphones className="h-3 w-3" />
                            </div>
                          </div>
                        ))}
                        {/* Show top games */}
                        {topContent.games.slice(0, 5 - topContent.books.length - topContent.audiobooks.length).map((game: any) => (
                          <div key={game.id} className="aspect-[3/4] relative overflow-hidden rounded">
                            <img 
                              src={game.cover_url} 
                              alt={game.name}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute bottom-0 right-0 bg-primary/80 text-white p-1 rounded-tl">
                              <Gamepad2 className="h-3 w-3" />
                            </div>
                          </div>
                        ))}
                      </div>
                      {topContent.total < 5 && (
                        <p className="text-xs text-wood-400">
                          {topContent.total} contenu(s) disponible(s)
                        </p>
                      )}
                    </div>

                    <Badge variant="secondary" className="w-fit">
                      Voir tout le genre
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
