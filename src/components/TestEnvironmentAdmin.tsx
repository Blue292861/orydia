import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ChestOpeningDialog } from '@/components/ChestOpeningDialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { 
  Package, 
  BookCheck, 
  Sparkles, 
  Trophy, 
  Coins, 
  Play,
  AlertTriangle,
  FlaskConical,
  Wand2
} from 'lucide-react';
import { rollChestRewards } from '@/services/chestService';
import { fetchCollections, getUserCollectionProgress } from '@/services/collectionService';
import { Collection } from '@/types/Collection';
import { ChestReward } from '@/types/RewardType';
import { ChallengeCompletionAnimation } from './ChallengeCompletionAnimation';
import { SkillUnlockAnimation } from './SkillUnlockAnimation';
import { OathPlacedAnimation } from './OathPlacedAnimation';
import { OathResultAnimation } from './OathResultAnimation';
import { GuildJoinAnimation } from './GuildJoinAnimation';
import { GuildCreationAnimation } from './GuildCreationAnimation';
import { CollectionCompleteAnimation } from './CollectionCompleteAnimation';
import { ChapterCompletionAnimation } from './ChapterCompletionAnimation';

interface Book {
  id: string;
  title: string;
  author: string;
  points: number;
  is_interactive: boolean;
  genres: string[];
}

interface InteractiveChapter {
  id: string;
  title: string;
  chapter_number: number;
  is_ending: boolean;
  ending_reward_points: number | null;
}

export const TestEnvironmentAdmin: React.FC = () => {
  const { user } = useAuth();
  
  // Books state
  const [books, setBooks] = useState<Book[]>([]);
  const [interactiveBooks, setInteractiveBooks] = useState<Book[]>([]);
  const [loadingBooks, setLoadingBooks] = useState(true);
  
  // Collections state
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loadingCollections, setLoadingCollections] = useState(true);
  
  // Chest test state
  const [chestType, setChestType] = useState<'silver' | 'gold'>('silver');
  const [selectedBookId, setSelectedBookId] = useState<string>('');
  const [basePoints, setBasePoints] = useState<number>(100);
  const [showChestDialog, setShowChestDialog] = useState(false);
  const [chestResult, setChestResult] = useState<{
    orydors: number;
    variation: number;
    rewards: ChestReward[];
  } | null>(null);
  
  // Interactive ending test state
  const [selectedInteractiveBookId, setSelectedInteractiveBookId] = useState<string>('');
  const [interactiveChapters, setInteractiveChapters] = useState<InteractiveChapter[]>([]);
  const [selectedEndingId, setSelectedEndingId] = useState<string>('');
  const [loadingChapters, setLoadingChapters] = useState(false);
  
  // Collection test state
  const [selectedCollectionId, setSelectedCollectionId] = useState<string>('');
  const [showCollectionChest, setShowCollectionChest] = useState(false);
  const [collectionRewards, setCollectionRewards] = useState<{
    orydors: number;
    xp: number;
    items: ChestReward[];
  } | null>(null);
  
  // Points test state
  const [manualOrydors, setManualOrydors] = useState<number>(100);
  const [manualXP, setManualXP] = useState<number>(50);
  const [realAttribution, setRealAttribution] = useState(false);
  
  // Animation test states
  const [showChallengeAnim, setShowChallengeAnim] = useState(false);
  const [showSkillAnim, setShowSkillAnim] = useState(false);
  const [showOathPlacedAnim, setShowOathPlacedAnim] = useState(false);
  const [showOathWinAnim, setShowOathWinAnim] = useState(false);
  const [showOathLoseAnim, setShowOathLoseAnim] = useState(false);
  const [showGuildJoinAnim, setShowGuildJoinAnim] = useState(false);
  const [showGuildCreateAnim, setShowGuildCreateAnim] = useState(false);
  const [showCollectionAnim, setShowCollectionAnim] = useState(false);
  const [showChapterAnim, setShowChapterAnim] = useState(false);

  // Load books
  useEffect(() => {
    const loadBooks = async () => {
      setLoadingBooks(true);
      const { data, error } = await supabase
        .from('books')
        .select('id, title, author, points, is_interactive, genres')
        .order('title');
      
      if (!error && data) {
        setBooks(data);
        setInteractiveBooks(data.filter(b => b.is_interactive));
      }
      setLoadingBooks(false);
    };
    loadBooks();
  }, []);

  // Load collections
  useEffect(() => {
    const loadCollections = async () => {
      setLoadingCollections(true);
      const data = await fetchCollections();
      setCollections(data);
      setLoadingCollections(false);
    };
    loadCollections();
  }, []);

  // Load interactive chapters when book selected
  useEffect(() => {
    if (!selectedInteractiveBookId) {
      setInteractiveChapters([]);
      return;
    }
    
    const loadChapters = async () => {
      setLoadingChapters(true);
      const { data, error } = await supabase
        .from('book_chapters')
        .select('id, title, chapter_number, is_ending, ending_reward_points')
        .eq('book_id', selectedInteractiveBookId)
        .eq('is_ending', true)
        .order('chapter_number');
      
      if (!error && data) {
        setInteractiveChapters(data);
      }
      setLoadingChapters(false);
    };
    loadChapters();
  }, [selectedInteractiveBookId]);

  // Test chest opening
  const handleTestChest = async () => {
    if (!selectedBookId) {
      toast.error('Veuillez sélectionner un livre');
      return;
    }

    const isPremium = chestType === 'gold';
    const book = books.find(b => b.id === selectedBookId);
    const genres = book?.genres || [];
    const result = await rollChestRewards(selectedBookId, genres, basePoints, isPremium);
    
    setChestResult({
      orydors: result.orydors,
      variation: result.orydorsVariation,
      rewards: result.additionalRewards
    });
    setShowChestDialog(true);
  };

  // Test full book completion
  const handleTestBookCompletion = async () => {
    if (!selectedBookId) {
      toast.error('Veuillez sélectionner un livre');
      return;
    }

    const book = books.find(b => b.id === selectedBookId);
    if (!book) return;

    const isPremium = chestType === 'gold';
    const genres = book.genres || [];
    const result = await rollChestRewards(selectedBookId, genres, book.points, isPremium);
    
    setChestResult({
      orydors: result.orydors,
      variation: result.orydorsVariation,
      rewards: result.additionalRewards
    });
    setShowChestDialog(true);
    
    toast.success(`Simulation fin de lecture: ${book.title}`);
  };

  // Test interactive ending
  const handleTestInteractiveEnding = () => {
    if (!selectedEndingId) {
      toast.error('Veuillez sélectionner une fin');
      return;
    }

    const chapter = interactiveChapters.find(c => c.id === selectedEndingId);
    if (!chapter) return;

    const points = chapter.ending_reward_points || 0;
    toast.success(
      `Fin interactive "${chapter.title}" - Récompense: ${points} Orydors`,
      { duration: 5000 }
    );
  };

  // Test collection completion
  const handleTestCollectionCompletion = async () => {
    if (!selectedCollectionId) {
      toast.error('Veuillez sélectionner une collection');
      return;
    }

    const collection = collections.find(c => c.id === selectedCollectionId);
    if (!collection) return;

    // Fetch collection item rewards
    const { data: itemRewards } = await supabase
      .from('collection_item_rewards')
      .select(`
        *,
        reward_types (*)
      `)
      .eq('collection_id', selectedCollectionId);

    const items: ChestReward[] = (itemRewards || []).map(ir => ({
      type: ir.reward_types?.category || 'item',
      name: ir.reward_types?.name || 'Item',
      quantity: ir.quantity || 1,
      imageUrl: ir.reward_types?.image_url || '',
      rarity: ir.reward_types?.rarity || 'common',
      rewardTypeId: ir.reward_type_id
    }));

    setCollectionRewards({
      orydors: collection.orydors_reward || 0,
      xp: collection.xp_reward || 0,
      items
    });
    setShowCollectionChest(true);
  };

  // Test manual points attribution
  const handleTestPointsAttribution = async () => {
    if (!user) {
      toast.error('Vous devez être connecté');
      return;
    }

    if (realAttribution) {
      // Really attribute points
      const { error } = await supabase.functions.invoke('award-points', {
        body: {
          userId: user.id,
          points: manualOrydors,
          transactionType: 'admin_test',
          description: `Test admin: +${manualOrydors} Orydors, +${manualXP} XP`
        }
      });

      if (error) {
        toast.error('Erreur lors de l\'attribution');
        return;
      }

      toast.success(`Attribué: ${manualOrydors} Orydors (XP: preview only)`);
    } else {
      toast.info(
        `Preview: ${manualOrydors} Orydors + ${manualXP} XP (non attribués)`,
        { duration: 3000 }
      );
    }
  };

  const selectedBook = books.find(b => b.id === selectedBookId);
  const selectedCollection = collections.find(c => c.id === selectedCollectionId);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <FlaskConical className="h-6 w-6 text-purple-500" />
        <div>
          <h3 className="text-xl font-bold">Environnement de Test</h3>
          <p className="text-sm text-muted-foreground">
            Testez les fonctionnalités sans impacter les données utilisateurs
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Section 1: Test d'ouverture de coffre */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-amber-500" />
              Ouverture de Coffre
            </CardTitle>
            <CardDescription>
              Simuler l'ouverture d'un coffre avec paramètres personnalisés
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Type de coffre</Label>
              <Select value={chestType} onValueChange={(v) => setChestType(v as 'silver' | 'gold')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="silver">🥈 Coffre d'Argent (Freemium)</SelectItem>
                  <SelectItem value="gold">🥇 Coffre d'Or (Premium)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Livre (pour loot table)</Label>
              <Select value={selectedBookId} onValueChange={setSelectedBookId}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un livre" />
                </SelectTrigger>
                <SelectContent>
                  {books.map(book => (
                    <SelectItem key={book.id} value={book.id}>
                      {book.title} ({book.points} pts)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Points de base</Label>
              <Input
                type="number"
                value={basePoints}
                onChange={(e) => setBasePoints(Number(e.target.value))}
                min={0}
              />
            </div>

            {selectedBook && (
              <div className="p-3 bg-muted rounded-lg text-sm">
                <p><strong>Livre:</strong> {selectedBook.title}</p>
                <p><strong>Points configurés:</strong> {selectedBook.points}</p>
                <p><strong>Variation attendue:</strong> {chestType === 'gold' ? '190-210%' : '95-105%'}</p>
              </div>
            )}

            <Button onClick={handleTestChest} className="w-full">
              <Play className="h-4 w-4 mr-2" />
              Simuler l'ouverture
            </Button>
          </CardContent>
        </Card>

        {/* Section 2: Test fin de lecture complète */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookCheck className="h-5 w-5 text-green-500" />
              Fin de Lecture Complète
            </CardTitle>
            <CardDescription>
              Simuler la complétion d'un livre avec ses points configurés
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Livre à terminer</Label>
              <Select value={selectedBookId} onValueChange={setSelectedBookId}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un livre" />
                </SelectTrigger>
                <SelectContent>
                  {books.map(book => (
                    <SelectItem key={book.id} value={book.id}>
                      {book.title} ({book.points} pts)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Statut utilisateur simulé</Label>
              <Select value={chestType} onValueChange={(v) => setChestType(v as 'silver' | 'gold')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="silver">Freemium (Coffre Argent)</SelectItem>
                  <SelectItem value="gold">Premium (Coffre Or)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {selectedBook && (
              <div className="p-3 bg-muted rounded-lg text-sm space-y-1">
                <p><strong>Livre:</strong> {selectedBook.title}</p>
                <p><strong>Auteur:</strong> {selectedBook.author}</p>
                <p><strong>Points base:</strong> {selectedBook.points} Orydors</p>
                <p><strong>Orydors estimés:</strong> {
                  chestType === 'gold' 
                    ? `${Math.floor(selectedBook.points * 1.9)} - ${Math.floor(selectedBook.points * 2.1)}`
                    : `${Math.floor(selectedBook.points * 0.95)} - ${Math.floor(selectedBook.points * 1.05)}`
                }</p>
              </div>
            )}

            <Button onClick={handleTestBookCompletion} className="w-full" variant="secondary">
              <Play className="h-4 w-4 mr-2" />
              Simuler fin de lecture
            </Button>
          </CardContent>
        </Card>

        {/* Section 3: Test fin interactive */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-blue-500" />
              Fin de Livre Interactif
            </CardTitle>
            <CardDescription>
              Tester les différentes fins et leurs récompenses
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Livre interactif</Label>
              <Select value={selectedInteractiveBookId} onValueChange={setSelectedInteractiveBookId}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un livre interactif" />
                </SelectTrigger>
                <SelectContent>
                  {interactiveBooks.length === 0 ? (
                    <SelectItem value="none" disabled>Aucun livre interactif</SelectItem>
                  ) : (
                    interactiveBooks.map(book => (
                      <SelectItem key={book.id} value={book.id}>
                        {book.title}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Chapitre de fin</Label>
              <Select 
                value={selectedEndingId} 
                onValueChange={setSelectedEndingId}
                disabled={!selectedInteractiveBookId || loadingChapters}
              >
                <SelectTrigger>
                  <SelectValue placeholder={loadingChapters ? "Chargement..." : "Sélectionner une fin"} />
                </SelectTrigger>
                <SelectContent>
                  {interactiveChapters.length === 0 ? (
                    <SelectItem value="none" disabled>Aucune fin configurée</SelectItem>
                  ) : (
                    interactiveChapters.map(chapter => (
                      <SelectItem key={chapter.id} value={chapter.id}>
                        Ch.{chapter.chapter_number}: {chapter.title} ({chapter.ending_reward_points || 0} pts)
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {selectedEndingId && (
              <div className="p-3 bg-muted rounded-lg text-sm">
                {(() => {
                  const chapter = interactiveChapters.find(c => c.id === selectedEndingId);
                  return chapter ? (
                    <>
                      <p><strong>Fin:</strong> {chapter.title}</p>
                      <p><strong>Récompense:</strong> {chapter.ending_reward_points || 0} Orydors</p>
                    </>
                  ) : null;
                })()}
              </div>
            )}

            <Button 
              onClick={handleTestInteractiveEnding} 
              className="w-full"
              variant="secondary"
              disabled={!selectedEndingId}
            >
              <Play className="h-4 w-4 mr-2" />
              Simuler cette fin
            </Button>
          </CardContent>
        </Card>

        {/* Section 4: Test complétion collection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              Complétion de Collection
            </CardTitle>
            <CardDescription>
              Simuler la complétion d'une collection et son coffre
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Collection</Label>
              <Select value={selectedCollectionId} onValueChange={setSelectedCollectionId}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une collection" />
                </SelectTrigger>
                <SelectContent>
                  {collections.length === 0 ? (
                    <SelectItem value="none" disabled>Aucune collection</SelectItem>
                  ) : (
                    collections.map(col => (
                      <SelectItem key={col.id} value={col.id}>
                        {col.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {selectedCollection && (
              <div className="p-3 bg-muted rounded-lg text-sm space-y-1">
                <p><strong>Collection:</strong> {selectedCollection.name}</p>
                <p><strong>Description:</strong> {selectedCollection.description || 'N/A'}</p>
                <Separator className="my-2" />
                <p className="font-medium">Récompenses:</p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {selectedCollection.orydors_reward > 0 && (
                    <Badge variant="secondary">
                      💰 {selectedCollection.orydors_reward} Orydors
                    </Badge>
                  )}
                  {selectedCollection.xp_reward > 0 && (
                    <Badge variant="secondary">
                      ⭐ {selectedCollection.xp_reward} XP
                    </Badge>
                  )}
                </div>
              </div>
            )}

            <Button 
              onClick={handleTestCollectionCompletion} 
              className="w-full"
              variant="secondary"
              disabled={!selectedCollectionId}
            >
              <Play className="h-4 w-4 mr-2" />
              Simuler complétion
            </Button>
          </CardContent>
        </Card>

        {/* Section 5: Attribution manuelle de points */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Coins className="h-5 w-5 text-orange-500" />
              Attribution Manuelle de Points
            </CardTitle>
            <CardDescription>
              Attribuer des Orydors et XP à votre compte (test ou réel)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label>Orydors à attribuer</Label>
                <Input
                  type="number"
                  value={manualOrydors}
                  onChange={(e) => setManualOrydors(Number(e.target.value))}
                  min={0}
                />
              </div>

              <div className="space-y-2">
                <Label>XP à attribuer</Label>
                <Input
                  type="number"
                  value={manualXP}
                  onChange={(e) => setManualXP(Number(e.target.value))}
                  min={0}
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  Attribution réelle
                  {realAttribution && (
                    <Badge variant="destructive" className="text-xs">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      Impact DB
                    </Badge>
                  )}
                </Label>
                <div className="flex items-center gap-2 h-10">
                  <Switch
                    checked={realAttribution}
                    onCheckedChange={setRealAttribution}
                  />
                  <span className="text-sm text-muted-foreground">
                    {realAttribution ? 'Les points seront réellement attribués' : 'Preview seulement'}
                  </span>
                </div>
              </div>
            </div>

            {realAttribution && (
              <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg text-sm text-destructive">
                <strong>⚠️ Attention:</strong> L'attribution réelle modifiera votre solde de points. 
                Cette action ne peut pas être annulée.
              </div>
            )}

            <Button 
              onClick={handleTestPointsAttribution} 
              className="w-full"
              variant={realAttribution ? "destructive" : "secondary"}
            >
              <Play className="h-4 w-4 mr-2" />
              {realAttribution ? 'Attribuer réellement' : 'Simuler l\'attribution'}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Chest Opening Dialog */}
      {chestResult && (
        <ChestOpeningDialog
          isOpen={showChestDialog}
          onClose={() => {
            setShowChestDialog(false);
            setChestResult(null);
          }}
          chestType={chestType}
          orydors={chestResult.orydors}
          orydorsVariation={chestResult.variation}
          additionalRewards={chestResult.rewards}
          bookTitle={selectedBook?.title || 'Test'}
        />
      )}

      {/* Collection Chest Dialog */}
      {collectionRewards && (
        <ChestOpeningDialog
          isOpen={showCollectionChest}
          onClose={() => {
            setShowCollectionChest(false);
            setCollectionRewards(null);
          }}
          chestType="gold"
          orydors={collectionRewards.orydors}
          orydorsVariation={100}
          additionalRewards={collectionRewards.items}
          bookTitle={selectedCollection?.name || 'Collection'}
        />
      )}

      {/* Section Test Animations */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wand2 className="h-5 w-5 text-purple-500" />
            Test des Animations
          </CardTitle>
          <CardDescription>
            Prévisualiser toutes les animations d'immersion
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button onClick={() => setShowChallengeAnim(true)} variant="outline" className="flex flex-col h-auto py-3">
              <Trophy className="h-5 w-5 mb-1 text-emerald-500" />
              <span className="text-xs">Défi complété</span>
            </Button>
            <Button onClick={() => setShowSkillAnim(true)} variant="outline" className="flex flex-col h-auto py-3">
              <Sparkles className="h-5 w-5 mb-1 text-purple-500" />
              <span className="text-xs">Compétence</span>
            </Button>
            <Button onClick={() => setShowOathPlacedAnim(true)} variant="outline" className="flex flex-col h-auto py-3">
              <span className="text-lg mb-1">📜</span>
              <span className="text-xs">Serment placé</span>
            </Button>
            <Button onClick={() => setShowOathWinAnim(true)} variant="outline" className="flex flex-col h-auto py-3">
              <span className="text-lg mb-1">🏆</span>
              <span className="text-xs">Serment gagné</span>
            </Button>
            <Button onClick={() => setShowOathLoseAnim(true)} variant="outline" className="flex flex-col h-auto py-3">
              <span className="text-lg mb-1">💀</span>
              <span className="text-xs">Serment perdu</span>
            </Button>
            <Button onClick={() => setShowGuildJoinAnim(true)} variant="outline" className="flex flex-col h-auto py-3">
              <span className="text-lg mb-1">🏰</span>
              <span className="text-xs">Rejoindre guilde</span>
            </Button>
            <Button onClick={() => setShowGuildCreateAnim(true)} variant="outline" className="flex flex-col h-auto py-3">
              <span className="text-lg mb-1">👑</span>
              <span className="text-xs">Créer guilde</span>
            </Button>
            <Button onClick={() => setShowCollectionAnim(true)} variant="outline" className="flex flex-col h-auto py-3">
              <span className="text-lg mb-1">🃏</span>
              <span className="text-xs">Collection</span>
            </Button>
            <Button onClick={() => setShowChapterAnim(true)} variant="outline" className="flex flex-col h-auto py-3">
              <span className="text-lg mb-1">📖</span>
              <span className="text-xs">Chapitre terminé</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Animation Previews */}
      <ChallengeCompletionAnimation
        isOpen={showChallengeAnim}
        challenge={{ id: 'test', name: 'Lecteur Assidu', icon: '📚', description: 'Lire 5 livres', startDate: new Date(), endDate: new Date(), objectives: [], orydorsReward: 500, xpReward: 100, premiumMonthsReward: 0, itemRewards: [], isGuildChallenge: false, isActive: true, createdAt: new Date() }}
        onContinue={() => setShowChallengeAnim(false)}
      />
      <SkillUnlockAnimation
        isOpen={showSkillAnim}
        skill={{ id: 'test', name: 'Lecture Rapide', description: '+10% Orydors le weekend', icon: '⚡', path_id: '', skill_point_cost: 1, position: 1, bonus_type: 'day_orydors', bonus_config: { days: [0, 6], percentage: 10 }, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }}
        onContinue={() => setShowSkillAnim(false)}
      />
      <OathPlacedAnimation
        isOpen={showOathPlacedAnim}
        bookTitle="Les Ombres du Cataclysme"
        stakeAmount={500}
        deadline={new Date()}
        onContinue={() => setShowOathPlacedAnim(false)}
      />
      <OathResultAnimation
        isOpen={showOathWinAnim}
        isVictory={true}
        bookTitle="Les Ombres du Cataclysme"
        amount={550}
        onContinue={() => setShowOathWinAnim(false)}
      />
      <OathResultAnimation
        isOpen={showOathLoseAnim}
        isVictory={false}
        bookTitle="Les Ombres du Cataclysme"
        amount={550}
        onContinue={() => setShowOathLoseAnim(false)}
      />
      <GuildJoinAnimation
        isOpen={showGuildJoinAnim}
        guildName="Les Chroniqueurs d'Aildor"
        onContinue={() => setShowGuildJoinAnim(false)}
      />
      <GuildCreationAnimation
        isOpen={showGuildCreateAnim}
        guildName="Les Chroniqueurs d'Aildor"
        onContinue={() => setShowGuildCreateAnim(false)}
      />
      <CollectionCompleteAnimation
        isOpen={showCollectionAnim}
        collectionName="Les Héros d'Aildor"
        onContinue={() => setShowCollectionAnim(false)}
      />
      <ChapterCompletionAnimation
        isOpen={showChapterAnim}
        currentChapter={3}
        totalChapters={12}
        bookTitle="Les Ombres du Cataclysme"
        onContinue={() => setShowChapterAnim(false)}
      />
    </div>
  );
};
