import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { FileImport } from "@/components/FileImport";
import { Trash2, Edit, Plus, FileText, ArrowRight } from "lucide-react";
import { gameService } from "@/services/gameService";
import { Game, GameChapter, GameChoice } from "@/types/Game";
import { toast } from "sonner";

export function GameAdmin() {
  const [games, setGames] = useState<Game[]>([]);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [chapters, setChapters] = useState<GameChapter[]>([]);
  const [choices, setChoices] = useState<GameChoice[]>([]);
  const [selectedChapter, setSelectedChapter] = useState<GameChapter | null>(null);
  const [isCreateGameOpen, setIsCreateGameOpen] = useState(false);
  const [isCreateChapterOpen, setIsCreateChapterOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const [gameForm, setGameForm] = useState({
    name: '',
    author: '',
    description: '',
    cover_url: '',
    is_featured: false,
    points_reward: 0
  });

  const [chapterForm, setChapterForm] = useState({
    title: '',
    content: '',
    chapter_number: 1,
    is_ending: false,
    ending_reward_points: 0
  });

  const [choiceForm, setChoiceForm] = useState({
    choice_text: '',
    next_chapter_id: '',
    points_reward: 0
  });

  useEffect(() => {
    loadGames();
  }, []);

  useEffect(() => {
    if (selectedGame) {
      loadChapters(selectedGame.id);
    }
  }, [selectedGame]);

  useEffect(() => {
    if (selectedChapter) {
      loadChoices(selectedChapter.id);
    }
  }, [selectedChapter]);

  const loadGames = async () => {
    try {
      const data = await gameService.getAllGames();
      setGames(data);
    } catch (error) {
      toast.error("Erreur lors du chargement des jeux");
    } finally {
      setLoading(false);
    }
  };

  const loadChapters = async (gameId: string) => {
    try {
      const data = await gameService.getGameChapters(gameId);
      setChapters(data);
    } catch (error) {
      toast.error("Erreur lors du chargement des chapitres");
    }
  };

  const loadChoices = async (chapterId: string) => {
    try {
      const data = await gameService.getChapterChoices(chapterId);
      setChoices(data);
    } catch (error) {
      toast.error("Erreur lors du chargement des choix");
    }
  };

  const handleCreateGame = async () => {
    try {
      await gameService.createGame(gameForm);
      toast.success("Jeu créé avec succès");
      setIsCreateGameOpen(false);
      setGameForm({
        name: '',
        author: '',
        description: '',
        cover_url: '',
        is_featured: false,
        points_reward: 0
      });
      loadGames();
    } catch (error) {
      toast.error("Erreur lors de la création du jeu");
    }
  };

  const handleCreateChapter = async () => {
    if (!selectedGame) return;
    
    try {
      await gameService.createChapter({
        ...chapterForm,
        game_id: selectedGame.id
      });
      toast.success("Chapitre créé avec succès");
      setIsCreateChapterOpen(false);
      setChapterForm({
        title: '',
        content: '',
        chapter_number: chapters.length + 1,
        is_ending: false,
        ending_reward_points: 0
      });
      loadChapters(selectedGame.id);
    } catch (error) {
      toast.error("Erreur lors de la création du chapitre");
    }
  };

  const handleCreateChoice = async () => {
    if (!selectedChapter) return;
    
    try {
      await gameService.createChoice({
        ...choiceForm,
        chapter_id: selectedChapter.id
      });
      toast.success("Choix créé avec succès");
      setChoiceForm({
        choice_text: '',
        next_chapter_id: '',
        points_reward: 0
      });
      loadChoices(selectedChapter.id);
    } catch (error) {
      toast.error("Erreur lors de la création du choix");
    }
  };

  const handleDeleteGame = async (id: string) => {
    try {
      await gameService.deleteGame(id);
      toast.success("Jeu supprimé");
      loadGames();
      if (selectedGame?.id === id) {
        setSelectedGame(null);
        setChapters([]);
        setChoices([]);
      }
    } catch (error) {
      toast.error("Erreur lors de la suppression");
    }
  };

  if (loading) {
    return <div className="p-6">Chargement...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Administration des Jeux</h1>
        <Dialog open={isCreateGameOpen} onOpenChange={setIsCreateGameOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nouveau Jeu
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Créer un nouveau jeu</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Nom du jeu</Label>
                <Input
                  id="name"
                  value={gameForm.name}
                  onChange={(e) => setGameForm(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="author">Auteur</Label>
                <Input
                  id="author"
                  value={gameForm.author}
                  onChange={(e) => setGameForm(prev => ({ ...prev, author: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={gameForm.description}
                  onChange={(e) => setGameForm(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="cover_url">Image de couverture</Label>
                <div className="space-y-2">
                  <Input
                    id="cover_url"
                    type="text"
                    value={gameForm.cover_url}
                    onChange={(e) => setGameForm(prev => ({ ...prev, cover_url: e.target.value }))}
                    placeholder="URL de l'image ou importer un fichier"
                  />
                  <FileImport 
                    type="image" 
                    onFileImport={(dataUrl) => setGameForm(prev => ({ ...prev, cover_url: dataUrl }))} 
                  />
                </div>
                {gameForm.cover_url && (
                  <img src={gameForm.cover_url} alt="Aperçu" className="mt-2 h-20 w-20 object-cover rounded-md" />
                )}
              </div>
              <div>
                <Label htmlFor="points_reward">Points de récompense</Label>
                <Input
                  id="points_reward"
                  type="number"
                  value={gameForm.points_reward}
                  onChange={(e) => setGameForm(prev => ({ ...prev, points_reward: parseInt(e.target.value) || 0 }))}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Label htmlFor="is_featured">À la une</Label>
                <Switch
                  checked={gameForm.is_featured}
                  onCheckedChange={(checked) => setGameForm(prev => ({ ...prev, is_featured: checked }))}
                />
              </div>
              <Button onClick={handleCreateGame} className="w-full">
                Créer le jeu
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="games" className="space-y-4">
        <TabsList>
          <TabsTrigger value="games">Jeux</TabsTrigger>
          <TabsTrigger value="chapters" disabled={!selectedGame}>Chapitres</TabsTrigger>
          <TabsTrigger value="choices" disabled={!selectedChapter}>Choix</TabsTrigger>
        </TabsList>

        <TabsContent value="games">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {games.map((game) => (
              <Card key={game.id} className={`cursor-pointer transition-colors ${selectedGame?.id === game.id ? 'ring-2 ring-primary' : ''}`}>
                <CardHeader className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1" onClick={() => setSelectedGame(game)}>
                      <CardTitle className="text-lg">{game.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{game.author}</p>
                      {game.is_featured && <Badge className="mt-2">À la une</Badge>}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteGame(game.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="chapters">
          {selectedGame && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Chapitres de "{selectedGame.name}"</h2>
                <Dialog open={isCreateChapterOpen} onOpenChange={setIsCreateChapterOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Nouveau Chapitre
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Créer un nouveau chapitre</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="chapter_title">Titre du chapitre</Label>
                        <Input
                          id="chapter_title"
                          value={chapterForm.title}
                          onChange={(e) => setChapterForm(prev => ({ ...prev, title: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="chapter_number">Numéro du chapitre</Label>
                        <Input
                          id="chapter_number"
                          type="number"
                          value={chapterForm.chapter_number}
                          onChange={(e) => setChapterForm(prev => ({ ...prev, chapter_number: parseInt(e.target.value) || 1 }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="chapter_content">Contenu</Label>
                        <Textarea
                          id="chapter_content"
                          value={chapterForm.content}
                          onChange={(e) => setChapterForm(prev => ({ ...prev, content: e.target.value }))}
                          rows={6}
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <Label htmlFor="is_ending">Chapitre de fin</Label>
                        <Switch
                          checked={chapterForm.is_ending}
                          onCheckedChange={(checked) => setChapterForm(prev => ({ ...prev, is_ending: checked }))}
                        />
                      </div>
                      {chapterForm.is_ending && (
                        <div>
                          <Label htmlFor="ending_reward">Points de récompense de fin</Label>
                          <Input
                            id="ending_reward"
                            type="number"
                            value={chapterForm.ending_reward_points}
                            onChange={(e) => setChapterForm(prev => ({ ...prev, ending_reward_points: parseInt(e.target.value) || 0 }))}
                          />
                        </div>
                      )}
                      <Button onClick={handleCreateChapter} className="w-full">
                        Créer le chapitre
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {chapters.map((chapter) => (
                  <Card key={chapter.id} className={`cursor-pointer transition-colors ${selectedChapter?.id === chapter.id ? 'ring-2 ring-primary' : ''}`}>
                    <CardHeader className="p-4" onClick={() => setSelectedChapter(chapter)}>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        Chapitre {chapter.chapter_number}: {chapter.title}
                      </CardTitle>
                      {chapter.is_ending && <Badge variant="secondary">Fin</Badge>}
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="choices">
          {selectedChapter && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Choix pour "{selectedChapter.title}"</h2>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Ajouter un choix</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="choice_text">Texte du choix</Label>
                    <Input
                      id="choice_text"
                      value={choiceForm.choice_text}
                      onChange={(e) => setChoiceForm(prev => ({ ...prev, choice_text: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="next_chapter">Chapitre suivant</Label>
                    <Select
                      value={choiceForm.next_chapter_id}
                      onValueChange={(value) => setChoiceForm(prev => ({ ...prev, next_chapter_id: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un chapitre" />
                      </SelectTrigger>
                      <SelectContent>
                        {chapters.map((chapter) => (
                          <SelectItem key={chapter.id} value={chapter.id}>
                            Chapitre {chapter.chapter_number}: {chapter.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="choice_points">Points de récompense</Label>
                    <Input
                      id="choice_points"
                      type="number"
                      value={choiceForm.points_reward}
                      onChange={(e) => setChoiceForm(prev => ({ ...prev, points_reward: parseInt(e.target.value) || 0 }))}
                    />
                  </div>
                  <Button onClick={handleCreateChoice}>
                    Ajouter le choix
                  </Button>
                </CardContent>
              </Card>

              <div className="space-y-2">
                {choices.map((choice) => (
                  <Card key={choice.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span>{choice.choice_text}</span>
                          <ArrowRight className="w-4 h-4" />
                          <span className="text-sm text-muted-foreground">
                            {choice.next_chapter_id ? 
                              chapters.find(c => c.id === choice.next_chapter_id)?.title || 'Chapitre inconnu' :
                              'Fin du jeu'
                            }
                          </span>
                          {choice.points_reward > 0 && (
                            <Badge variant="outline">+{choice.points_reward} pts</Badge>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => gameService.deleteChoice(choice.id).then(() => loadChoices(selectedChapter.id))}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}