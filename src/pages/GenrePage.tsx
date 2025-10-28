import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Search, Filter } from 'lucide-react';
import { BookCard } from '@/components/BookCard';
import { AudiobookCard } from '@/components/AudiobookCard';
import { GameCard } from '@/components/GameCard';
import { Book } from '@/types/Book';
import { Audiobook } from '@/types/Audiobook';  
import { Game } from '@/types/Game';
import { fetchBooksFromDB } from '@/services/bookService';
import { audiobookService } from '@/services/audiobookService';
import { gameService } from '@/services/gameService';
import { LITERARY_GENRES, GENRE_DESCRIPTIONS, LiteraryGenre } from '@/constants/genres';
import { genreAnalyticsService } from '@/services/genreAnalyticsService';
import { createBookPath } from '@/utils/slugUtils';

export const GenrePage: React.FC = () => {
  const { genre } = useParams<{ genre: string }>();
  const navigate = useNavigate();
  const [books, setBooks] = useState<Book[]>([]);
  const [audiobooks, setAudiobooks] = useState<Audiobook[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const currentGenre = genre as LiteraryGenre;
  const isValidGenre = LITERARY_GENRES.includes(currentGenre);

  useEffect(() => {
    if (!isValidGenre) {
      navigate('/');
      return;
    }
    loadContent();
  }, [currentGenre, isValidGenre, navigate]);

  const loadContent = async () => {
    if (!isValidGenre) return;
    
    setLoading(true);
    try {
      // Fetch all content and filter by genre
      const [booksData, audiobooksData, gamesData] = await Promise.all([
        fetchBooksFromDB(),
        audiobookService.getAllAudiobooks(),
        gameService.getAllGames()
      ]);

      // Filter by genre using the genres field directly or fallback to tags
      const filteredBooks = booksData.filter(book => {
        // Prioritize the genres field, fallback to extracting from tags
        const bookGenres = (book.genres && book.genres.length > 0) 
          ? book.genres 
          : genreAnalyticsService.extractGenresFromTags(book.tags || []);
        return bookGenres.includes(currentGenre);
      });

      const filteredAudiobooks = audiobooksData.filter(audiobook => {
        // Prioritize the genres field, fallback to extracting from tags
        const audiobookGenres = (audiobook.genres && audiobook.genres.length > 0)
          ? audiobook.genres
          : genreAnalyticsService.extractGenresFromTags(audiobook.tags || []);
        return audiobookGenres.includes(currentGenre);
      });

      const filteredGames = gamesData.filter(game => {
        // For games, we'll use a simple check for now since they don't have tags yet
        // This could be extended when games have genre classification
        return game.name.toLowerCase().includes(currentGenre.toLowerCase()) ||
               game.description?.toLowerCase().includes(currentGenre.toLowerCase());
      });

      setBooks(filteredBooks);
      setAudiobooks(filteredAudiobooks);
      setGames(filteredGames);
    } catch (error) {
      console.error('Error loading genre content:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get all available tags from current content
  const allTags = useMemo(() => {
    const bookTags = books.flatMap(book => book.tags || []);
    const audiobookTags = audiobooks.flatMap(audiobook => audiobook.tags || []);
    return Array.from(new Set([...bookTags, ...audiobookTags]));
  }, [books, audiobooks]);

  // Filter content by search term and tags
  const filteredBooks = useMemo(() => books.filter(book => {
    const matchesSearch = book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         book.author.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTags = selectedTags.length === 0 || 
                       selectedTags.every(tag => (book.tags || []).includes(tag));
    return matchesSearch && matchesTags;
  }), [books, searchTerm, selectedTags]);

  const filteredAudiobooks = useMemo(() => audiobooks.filter(audiobook => {
    const matchesSearch = audiobook.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         audiobook.author.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTags = selectedTags.length === 0 || 
                       selectedTags.every(tag => (audiobook.tags || []).includes(tag));
    return matchesSearch && matchesTags;
  }), [audiobooks, searchTerm, selectedTags]);

  const filteredGames = useMemo(() => games.filter(game => {
    const matchesSearch = game.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         game.author.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch; // Games don't have tags filtering yet
  }), [games, searchTerm]);

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedTags([]);
  };

  if (!isValidGenre) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-wood-900 via-wood-800 to-wood-900 flex items-center justify-center">
        <div className="text-wood-100">Chargement...</div>
      </div>
    );
  }

  const totalContent = filteredBooks.length + filteredAudiobooks.length + filteredGames.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-wood-900 via-wood-800 to-wood-900 text-wood-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')}
            className="text-wood-300 hover:text-wood-100"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
          <div>
            <h1 className="text-4xl font-bold text-wood-100">{currentGenre}</h1>
            <p className="text-wood-300 mt-1">{GENRE_DESCRIPTIONS[currentGenre]}</p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="space-y-4 bg-wood-800/50 p-4 rounded-lg border border-wood-700">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-wood-300 h-4 w-4" />
            <Input
              placeholder="Rechercher dans ce genre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-wood-800/60 border-wood-700 text-wood-100 placeholder:text-wood-400"
            />
          </div>

          {allTags.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-wood-300" />
                <span className="text-sm font-medium text-wood-300">Filtrer par tags :</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {allTags.map((tag) => (
                  <Badge
                    key={tag}
                    variant={selectedTags.includes(tag) ? "default" : "secondary"}
                    className="cursor-pointer capitalize"
                    onClick={() => toggleTag(tag)}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {(searchTerm || selectedTags.length > 0) && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-wood-300">
                {totalContent} résultat(s) trouvé(s)
              </p>
              <Button variant="ghost" size="sm" onClick={clearFilters} className="text-primary hover:text-primary/90">
                Effacer les filtres
              </Button>
            </div>
          )}
        </div>

        {/* Content Tabs */}
        <Tabs defaultValue="books" className="space-y-6">
          <TabsList className="bg-wood-800/50 border-wood-700">
            <TabsTrigger value="books" className="data-[state=active]:bg-primary">
              Livres ({filteredBooks.length})
            </TabsTrigger>
            <TabsTrigger value="audiobooks" className="data-[state=active]:bg-primary">
              Audiolivres ({filteredAudiobooks.length})
            </TabsTrigger>
            <TabsTrigger value="games" className="data-[state=active]:bg-primary">
              Jeux ({filteredGames.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="books">
            {filteredBooks.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {filteredBooks.map((book) => (
                  <BookCard 
                    key={book.id} 
                    book={book} 
                    onBookSelect={(b) => navigate(createBookPath(b.author, b.title))} 
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 border border-wood-700 bg-wood-800/30 rounded-lg">
                <p className="text-wood-300">Aucun livre trouvé dans ce genre.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="audiobooks">
            {filteredAudiobooks.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {filteredAudiobooks.map((audiobook) => (
                  <AudiobookCard 
                    key={audiobook.id} 
                    audiobook={audiobook} 
                    onClick={() => navigate(createBookPath(audiobook.author, audiobook.name))} 
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 border border-wood-700 bg-wood-800/30 rounded-lg">
                <p className="text-wood-300">Aucun audiolivre trouvé dans ce genre.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="games">
            {filteredGames.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {filteredGames.map((game) => (
                  <GameCard 
                    key={game.id} 
                    game={game} 
                    onSelect={() => {/* Pas de route jeu pour le moment */}} 
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 border border-wood-700 bg-wood-800/30 rounded-lg">
                <p className="text-wood-300">Aucun jeu trouvé dans ce genre.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default GenrePage;