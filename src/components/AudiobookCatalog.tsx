import React, { useState, useEffect } from 'react';
import { Audiobook } from '@/types/Audiobook';
import { AudiobookCard } from '@/components/AudiobookCard';
import { AudiobookPreviewDialog } from '@/components/AudiobookPreviewDialog';
import { AudiobookChapterList } from '@/components/AudiobookChapterList';
import { AudiobookPlayer } from '@/components/AudiobookPlayer';
import { AudiobookWithProgress } from '@/types/AudiobookChapter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, BookOpen, Star, Crown, Zap, Clock } from 'lucide-react';
import { audiobookService } from '@/services/audiobookService';
import { audiobookChapterService } from '@/services/audiobookChapterService';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

type ViewMode = 'catalog' | 'preview' | 'chapters' | 'player';

export const AudiobookCatalog: React.FC = () => {
  const [allAudiobooks, setAllAudiobooks] = useState<Audiobook[]>([]);
  const [filteredAudiobooks, setFilteredAudiobooks] = useState<Audiobook[]>([]);
  const [featuredAudiobooks, setFeaturedAudiobooks] = useState<Audiobook[]>([]);
  const [recentProgress, setRecentProgress] = useState<AudiobookWithProgress[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [viewMode, setViewMode] = useState<ViewMode>('catalog');
  const [selectedAudiobook, setSelectedAudiobook] = useState<Audiobook | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<AudiobookWithProgress | null>(null);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [genreFilter, setGenreFilter] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [activeTab, setActiveTab] = useState('all');
  
  const { user, subscription } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchAudiobooks();
    if (user) {
      fetchRecentProgress();
    }
  }, [user]);

  useEffect(() => {
    filterAudiobooks();
  }, [allAudiobooks, searchQuery, genreFilter, sortBy]);

  const fetchAudiobooks = async () => {
    try {
      setLoading(true);
      const [all, featured] = await Promise.all([
        audiobookService.getAllAudiobooks(),
        audiobookService.getFeaturedAudiobooks()
      ]);
      
      setAllAudiobooks(all);
      setFeaturedAudiobooks(featured);
    } catch (error) {
      console.error('Error fetching audiobooks:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les audiobooks",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentProgress = async () => {
    if (!user) return;
    
    try {
      const progress = await audiobookChapterService.getRecentProgress(user.id);
      setRecentProgress(progress);
    } catch (error) {
      console.error('Error fetching recent progress:', error);
    }
  };

  const filterAudiobooks = () => {
    let filtered = [...allAudiobooks];

    // Filtrer par recherche
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(audiobook => 
        audiobook.name.toLowerCase().includes(query) ||
        audiobook.author.toLowerCase().includes(query) ||
        audiobook.genre?.toLowerCase().includes(query) ||
        audiobook.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Filtrer par genre
    if (genreFilter !== 'all') {
      if (genreFilter === 'premium') {
        filtered = filtered.filter(audiobook => audiobook.is_premium);
      } else if (genreFilter === 'free') {
        filtered = filtered.filter(audiobook => !audiobook.is_premium);
      } else {
        filtered = filtered.filter(audiobook => audiobook.genre === genreFilter);
      }
    }

    // Trier
    switch (sortBy) {
      case 'recent':
        filtered.sort((a, b) => new Date(b.created_at || '').getTime() - new Date(a.created_at || '').getTime());
        break;
      case 'alphabetical':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'author':
        filtered.sort((a, b) => a.author.localeCompare(b.author));
        break;
      case 'points':
        filtered.sort((a, b) => b.points - a.points);
        break;
    }

    setFilteredAudiobooks(filtered);
  };

  const handleAudiobookClick = (audiobook: Audiobook) => {
    setSelectedAudiobook(audiobook);
    setShowPreviewDialog(true);
  };

  const handleStartListening = (audiobook: Audiobook) => {
    setSelectedAudiobook(audiobook);
    setViewMode('chapters');
  };

  const handlePlayChapter = (audiobook: Audiobook, chapter: AudiobookWithProgress) => {
    setSelectedAudiobook(audiobook);
    setSelectedChapter(chapter);
    setViewMode('player');
  };

  const handleBackToCatalog = () => {
    setViewMode('catalog');
    setSelectedAudiobook(null);
    setSelectedChapter(null);
  };

  const handleBackToChapters = () => {
    setViewMode('chapters');
    setSelectedChapter(null);
  };

  const getUniqueGenres = () => {
    const genres = allAudiobooks
      .map(audiobook => audiobook.genre)
      .filter((genre): genre is string => !!genre);
    return [...new Set(genres)].sort();
  };

  if (viewMode === 'player' && selectedAudiobook && selectedChapter) {
    return (
      <AudiobookPlayer
        audiobook={selectedAudiobook}
        chapter={selectedChapter}
        onBack={handleBackToChapters}
      />
    );
  }

  if (viewMode === 'chapters' && selectedAudiobook) {
    return (
      <AudiobookChapterList
        audiobook={selectedAudiobook}
        onBack={handleBackToCatalog}
        onPlayChapter={handlePlayChapter}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">Catalogue d'Audiobooks</h1>
          <p className="text-muted-foreground text-lg">
            Découvrez notre collection d'audiobooks captivants
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">Chargement...</div>
        ) : (
          <>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="all">Tous les audiobooks</TabsTrigger>
                <TabsTrigger value="featured">À la Une</TabsTrigger>
                <TabsTrigger value="recent">Reprendre l'écoute</TabsTrigger>
                <TabsTrigger value="genres">Par Genre</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="space-y-6">
                {/* Filtres et recherche */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Rechercher un audiobook, auteur, genre..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  
                  <Select value={genreFilter} onValueChange={setGenreFilter}>
                    <SelectTrigger className="w-48">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Filtrer par genre" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les genres</SelectItem>
                      <SelectItem value="premium">Premium uniquement</SelectItem>
                      <SelectItem value="free">Gratuit uniquement</SelectItem>
                      {getUniqueGenres().map(genre => (
                        <SelectItem key={genre} value={genre}>{genre}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Trier par" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="recent">Plus récent</SelectItem>
                      <SelectItem value="alphabetical">Alphabétique</SelectItem>
                      <SelectItem value="author">Auteur</SelectItem>
                      <SelectItem value="points">Points</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {filteredAudiobooks.length === 0 ? (
                  <div className="text-center py-12">
                    <BookOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-xl font-semibold mb-2">Aucun audiobook trouvé</h3>
                    <p className="text-muted-foreground">
                      Essayez de modifier vos critères de recherche
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {filteredAudiobooks.map((audiobook) => (
                      <AudiobookCard
                        key={audiobook.id}
                        audiobook={audiobook}
                        onClick={handleAudiobookClick}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="featured" className="space-y-6">
                <div className="text-center space-y-2">
                  <Star className="h-12 w-12 mx-auto text-yellow-500" />
                  <h2 className="text-2xl font-bold">Audiobooks à la Une</h2>
                  <p className="text-muted-foreground">Nos sélections du moment</p>
                </div>

                {featuredAudiobooks.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">Aucun audiobook en vedette pour le moment</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {featuredAudiobooks.map((audiobook) => (
                      <AudiobookCard
                        key={audiobook.id}
                        audiobook={audiobook}
                        onClick={handleAudiobookClick}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="recent" className="space-y-6">
                <div className="text-center space-y-2">
                  <Clock className="h-12 w-12 mx-auto text-primary" />
                  <h2 className="text-2xl font-bold">Reprendre l'écoute</h2>
                  <p className="text-muted-foreground">Continuez là où vous vous êtes arrêté</p>
                </div>

                {!user ? (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">
                      Connectez-vous pour voir vos audiobooks en cours
                    </p>
                  </div>
                ) : recentProgress.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">
                      Aucun audiobook en cours d'écoute
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentProgress.map((chapter) => (
                      <div key={chapter.id} className="bg-card rounded-lg p-4 border">
                        <p className="font-medium">{chapter.title}</p>
                        <div className="text-sm text-muted-foreground">
                          Progression en cours
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="genres" className="space-y-6">
                <div className="text-center space-y-2">
                  <h2 className="text-2xl font-bold">Explorer par Genre</h2>
                  <p className="text-muted-foreground">Trouvez votre genre préféré</p>
                </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {getUniqueGenres().map(genre => (
                    <Button
                      key={genre}
                      variant="outline"
                      onClick={() => {
                        setGenreFilter(genre);
                        setActiveTab('all');
                      }}
                      className="h-auto p-4 text-center"
                    >
                      <div>
                        <div className="font-medium">{genre}</div>
                        <div className="text-xs text-muted-foreground">
                          {allAudiobooks.filter(a => a.genre === genre).length} audiobooks
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </>
        )}

        <AudiobookPreviewDialog
          audiobook={selectedAudiobook}
          open={showPreviewDialog}
          onOpenChange={setShowPreviewDialog}
          onStartListening={handleStartListening}
        />
      </div>
    </div>
  );
};