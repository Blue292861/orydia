import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { BookCard } from '@/components/BookCard';
import { AudiobookCard } from '@/components/AudiobookCard';
import { GameCard } from '@/components/GameCard';
import { SimilarAuthorsSection } from '@/components/SimilarAuthorsSection';
import { SimilarTagsSection } from '@/components/SimilarTagsSection';
import { SimilarGenresSection } from '@/components/SimilarGenresSection';
import { Skeleton } from '@/components/ui/skeleton';
import { calculateRecommendations, SearchRecommendations } from '@/utils/searchRecommendations';
import { ArrowLeft, Search } from 'lucide-react';
import { Book } from '@/types/Book';
import { Audiobook } from '@/types/Audiobook';
import { Game } from '@/types/Game';
import { fetchBooksFromDB } from '@/services/bookService';
import { audiobookService } from '@/services/audiobookService';
import { gameService } from '@/services/gameService';
import { useAuth } from '@/contexts/AuthContext';

export default function SearchResultsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { subscription } = useAuth();
  const query = searchParams.get('q') || '';

  const [searchQuery, setSearchQuery] = useState(query);
  const [books, setBooks] = useState<Book[]>([]);
  const [audiobooks, setAudiobooks] = useState<Audiobook[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  // Charger toutes les données
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [booksData, audiobooksData, gamesData] = await Promise.all([
          fetchBooksFromDB(),
          audiobookService.getAllAudiobooks(),
          gameService.getAllGames()
        ]);
        setBooks(booksData);
        setAudiobooks(audiobooksData);
        setGames(gamesData);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Filtrer les résultats selon le premium
  const filterByPremium = <T extends { is_premium?: boolean; isPremium?: boolean }>(items: T[]): T[] => {
    if (subscription.isPremium) return items;
    return items.filter(item => {
      const isPremium = 'is_premium' in item ? item.is_premium : item.isPremium;
      return !isPremium;
    });
  };

  // Résultats filtrés
  const filteredResults = useMemo(() => {
    if (!searchQuery.trim()) {
      return { books: [], audiobooks: [], games: [] };
    }

    const lowerQuery = searchQuery.toLowerCase();
    const matchesQuery = (text: string) => text.toLowerCase().includes(lowerQuery);

    const filteredBooks = filterByPremium(books).filter(
      (book) =>
        !book.isRare && // Exclure les livres rares
        (matchesQuery(book.title) ||
        matchesQuery(book.author) ||
        book.tags?.some((tag) => matchesQuery(tag)) ||
        book.genres?.some((genre) => matchesQuery(genre)))
    );

    const filteredAudiobooks = filterByPremium(audiobooks).filter(
      (audiobook) =>
        matchesQuery(audiobook.name) ||
        matchesQuery(audiobook.author) ||
        audiobook.tags?.some((tag) => matchesQuery(tag)) ||
        audiobook.genres?.some((genre) => matchesQuery(genre))
    );

    const filteredGames = games.filter(
      (game) =>
        matchesQuery(game.name) ||
        matchesQuery(game.author)
    );

    return {
      books: filteredBooks,
      audiobooks: filteredAudiobooks,
      games: filteredGames
    };
  }, [searchQuery, books, audiobooks, games, subscription.isPremium]);

  // Calculer les recommandations
  const recommendations = useMemo<SearchRecommendations | null>(() => {
    const totalResults = filteredResults.books.length + filteredResults.audiobooks.length + filteredResults.games.length;
    
    if (totalResults === 0 || loading) return null;

    return calculateRecommendations(
      filteredResults,
      { books, audiobooks, games }
    );
  }, [filteredResults, books, audiobooks, games, loading]);

  const totalResults = filteredResults.books.length + filteredResults.audiobooks.length + filteredResults.games.length;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSearchParams({ q: searchQuery });
    }
  };

  const handleAuthorClick = (authorName: string) => {
    setSearchQuery(authorName);
    setSearchParams({ q: authorName });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleTagClick = (tag: string) => {
    setSearchQuery(tag);
    setSearchParams({ q: tag });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-wood-50 to-wood-100 p-4 md:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <Skeleton className="h-12 w-full max-w-2xl" />
          <Skeleton className="h-8 w-48" />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[...Array(12)].map((_, i) => (
              <Skeleton key={i} className="h-64" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-wood-50 to-wood-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="flex-shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          
          <form onSubmit={handleSearch} className="flex-1 max-w-2xl">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-forest-500 w-5 h-5" />
              <Input
                type="text"
                placeholder="Rechercher un auteur, une œuvre, un tag..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white/90 border-wood-300 focus:border-amber-400"
              />
            </div>
          </form>
        </div>

        {/* Résultats */}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-forest-900 mb-2">
            Recherche: "{query}"
          </h1>
          <p className="text-forest-600">
            {totalResults} {totalResults > 1 ? 'résultats trouvés' : 'résultat trouvé'}
          </p>
        </div>

        {totalResults === 0 ? (
          <div className="text-center py-12">
            <p className="text-lg text-forest-600">Aucun résultat trouvé pour "{query}"</p>
            <p className="text-sm text-forest-500 mt-2">Essayez avec d'autres mots-clés</p>
          </div>
        ) : (
          <>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="bg-wood-200">
                <TabsTrigger value="all">
                  Tout ({totalResults})
                </TabsTrigger>
                <TabsTrigger value="books">
                  Livres ({filteredResults.books.length})
                </TabsTrigger>
                <TabsTrigger value="audiobooks">
                  Audiobooks ({filteredResults.audiobooks.length})
                </TabsTrigger>
                <TabsTrigger value="games">
                  Jeux ({filteredResults.games.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="space-y-8">
                {filteredResults.books.length > 0 && (
                  <div>
                    <h2 className="text-xl font-bold text-forest-900 mb-4">Livres</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                      {filteredResults.books.map((book) => (
                        <BookCard
                          key={book.id}
                          book={book}
                          onBookSelect={() => navigate(`/book/${book.id}`)}
                          variant="grid"
                        />
                      ))}
                    </div>
                  </div>
                )}

                {filteredResults.audiobooks.length > 0 && (
                  <div>
                    <h2 className="text-xl font-bold text-forest-900 mb-4">Audiobooks</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                      {filteredResults.audiobooks.map((audiobook) => (
                        <AudiobookCard
                          key={audiobook.id}
                          audiobook={audiobook}
                          onClick={() => navigate(`/audiobook/${audiobook.id}`)}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {filteredResults.games.length > 0 && (
                  <div>
                    <h2 className="text-xl font-bold text-forest-900 mb-4">Jeux</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                      {filteredResults.games.map((game) => (
                        <GameCard
                          key={game.id}
                          game={game}
                          onSelect={() => navigate(`/game/${game.id}`)}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="books">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  {filteredResults.books.map((book) => (
                    <BookCard
                      key={book.id}
                      book={book}
                      onBookSelect={() => navigate(`/book/${book.id}`)}
                      variant="grid"
                    />
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="audiobooks">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  {filteredResults.audiobooks.map((audiobook) => (
                    <AudiobookCard
                      key={audiobook.id}
                      audiobook={audiobook}
                      onClick={() => navigate(`/audiobook/${audiobook.id}`)}
                    />
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="games">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  {filteredResults.games.map((game) => (
                    <GameCard
                      key={game.id}
                      game={game}
                      onSelect={() => navigate(`/game/${game.id}`)}
                    />
                  ))}
                </div>
              </TabsContent>
            </Tabs>

            {/* Recommandations */}
            {recommendations && (
              <div className="space-y-8 pt-8 border-t-2 border-amber-300/30">
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-forest-900 mb-2">
                    Vous pourriez aussi aimer
                  </h2>
                  <p className="text-forest-600">
                    Découvrez d'autres œuvres similaires à votre recherche
                  </p>
                </div>

                <SimilarAuthorsSection
                  authors={recommendations.similarAuthors}
                  onAuthorClick={handleAuthorClick}
                />

                <SimilarTagsSection
                  tags={recommendations.similarTags}
                  onTagClick={handleTagClick}
                />

                <SimilarGenresSection genres={recommendations.similarGenres} />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
