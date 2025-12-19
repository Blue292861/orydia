import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Trash2, Edit, Calendar, Target, Gift } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Challenge, ChallengeFormData, ObjectiveFormData, ItemRewardConfig, ChallengeObjectiveType } from '@/types/Challenge';
import { getAllChallenges, createChallenge, updateChallenge, deleteChallenge } from '@/services/challengeService';
import { LITERARY_GENRES } from '@/constants/genres';
import { BookSearchSelect } from '@/components/BookSearchSelect';

const OBJECTIVE_TYPES: { value: ChallengeObjectiveType; label: string }[] = [
  { value: 'read_book', label: 'Lire un livre spécifique' },
  { value: 'read_saga_book', label: 'Lire un livre d\'une saga (au choix)' },
  { value: 'read_genre', label: 'Lire des livres d\'un genre' },
  { value: 'collect_item', label: 'Obtenir un item' },
  { value: 'read_any_books', label: 'Lire des livres (au choix)' },
  { value: 'read_chapters_book', label: 'Lire X chapitres d\'un livre' },
  { value: 'read_chapters_genre', label: 'Lire X chapitres d\'un genre' },
  { value: 'read_chapters_selection', label: 'Lire X chapitres d\'une sélection' },
];

const ICONS = ['🎯', '📚', '⭐', '🏆', '🎄', '🎃', '💎', '🔥', '🌟', '🎁', '🌈', '🎮'];

export default function ChallengeAdmin() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [books, setBooks] = useState<any[]>([]);
  const [rewardTypes, setRewardTypes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingChallenge, setEditingChallenge] = useState<Challenge | null>(null);
  const [activeTab, setActiveTab] = useState<'active' | 'upcoming' | 'past'>('active');

  const [formData, setFormData] = useState<ChallengeFormData>({
    name: '',
    description: '',
    icon: '🎯',
    startDate: '',
    endDate: '',
    isActive: true,
    orydorsReward: 0,
    xpReward: 0,
    itemRewards: [],
    premiumMonthsReward: 0,
    isGuildChallenge: false,
  });

  const [objectives, setObjectives] = useState<ObjectiveFormData[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [challengesData, booksData, rewardTypesData] = await Promise.all([
        getAllChallenges(),
        supabase.from('books').select('id, title, cover_url, author, genres').order('title'),
        supabase.from('reward_types').select('*').eq('is_active', true),
      ]);

      setChallenges(challengesData);
      setBooks(booksData.data || []);
      setRewardTypes(rewardTypesData.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Erreur lors du chargement');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      icon: '🎯',
      startDate: '',
      endDate: '',
      isActive: true,
      orydorsReward: 0,
      xpReward: 0,
      itemRewards: [],
      premiumMonthsReward: 0,
      isGuildChallenge: false,
    });
    setObjectives([]);
    setEditingChallenge(null);
  };

  const handleEdit = (challenge: Challenge) => {
    setEditingChallenge(challenge);
    setFormData({
      name: challenge.name,
      description: challenge.description,
      icon: challenge.icon,
      startDate: challenge.startDate.toISOString().slice(0, 16),
      endDate: challenge.endDate.toISOString().slice(0, 16),
      isActive: challenge.isActive,
      orydorsReward: challenge.orydorsReward,
      xpReward: challenge.xpReward,
      itemRewards: challenge.itemRewards,
      premiumMonthsReward: challenge.premiumMonthsReward,
      isGuildChallenge: challenge.isGuildChallenge || false,
    });
    setObjectives(challenge.objectives.map(obj => ({
      objectiveType: obj.objectiveType,
      objectiveName: obj.objectiveName,
      targetCount: obj.targetCount,
      targetBookId: obj.targetBookId,
      targetGenre: obj.targetGenre,
      targetRewardTypeId: obj.targetRewardTypeId,
    })));
    setIsDialogOpen(true);
  };

  const handleDelete = async (challengeId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce défi ?')) return;

    const result = await deleteChallenge(challengeId);
    if (result.success) {
      toast.success('Défi supprimé');
      loadData();
    } else {
      toast.error(result.error || 'Erreur lors de la suppression');
    }
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.description || !formData.startDate || !formData.endDate) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (objectives.length === 0) {
      toast.error('Ajoutez au moins un objectif');
      return;
    }

    const result = editingChallenge
      ? await updateChallenge(editingChallenge.id, formData, objectives)
      : await createChallenge(formData, objectives);

    if (result.success) {
      toast.success(editingChallenge ? 'Défi mis à jour' : 'Défi créé');
      setIsDialogOpen(false);
      resetForm();
      loadData();
    } else {
      toast.error(result.error || 'Erreur');
    }
  };

  const addObjective = () => {
    setObjectives([...objectives, {
      objectiveType: 'read_any_books',
      objectiveName: '',
      targetCount: 1,
    }]);
  };

  const updateObjective = (index: number, updates: Partial<ObjectiveFormData>) => {
    const newObjectives = [...objectives];
    newObjectives[index] = { ...newObjectives[index], ...updates };
    setObjectives(newObjectives);
  };

  const removeObjective = (index: number) => {
    setObjectives(objectives.filter((_, i) => i !== index));
  };

  const addItemReward = () => {
    setFormData({
      ...formData,
      itemRewards: [...formData.itemRewards, { rewardTypeId: '', quantity: 1 }],
    });
  };

  const updateItemReward = (index: number, updates: Partial<ItemRewardConfig>) => {
    const newRewards = [...formData.itemRewards];
    newRewards[index] = { ...newRewards[index], ...updates };
    setFormData({ ...formData, itemRewards: newRewards });
  };

  const removeItemReward = (index: number) => {
    setFormData({
      ...formData,
      itemRewards: formData.itemRewards.filter((_, i) => i !== index),
    });
  };

  const now = new Date();
  const filteredChallenges = challenges.filter(c => {
    if (activeTab === 'active') return c.startDate <= now && c.endDate >= now && c.isActive;
    if (activeTab === 'upcoming') return c.startDate > now;
    return c.endDate < now;
  });

  const getChallengeStatus = (challenge: Challenge) => {
    if (!challenge.isActive) return { label: 'Inactif', color: 'bg-muted' };
    if (challenge.startDate > now) return { label: 'À venir', color: 'bg-blue-500' };
    if (challenge.endDate < now) return { label: 'Terminé', color: 'bg-muted' };
    return { label: 'En cours', color: 'bg-green-500' };
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-amber-100">🎯 Gestion des Défis</h2>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="bg-amber-600 hover:bg-amber-700">
              <Plus className="w-4 h-4 mr-2" /> Nouveau Défi
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-slate-900 border-amber-700/50">
            <DialogHeader>
              <DialogTitle className="text-amber-100">
                {editingChallenge ? 'Modifier le défi' : 'Créer un nouveau défi'}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {/* Informations de base */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-amber-200">Nom du défi *</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: Défi de Noël 2025"
                    className="bg-slate-800 border-amber-700/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-amber-200">Icône</Label>
                  <div className="flex gap-2 flex-wrap">
                    {ICONS.map(icon => (
                      <button
                        key={icon}
                        type="button"
                        onClick={() => setFormData({ ...formData, icon })}
                        className={`text-2xl p-2 rounded ${formData.icon === icon ? 'bg-amber-600' : 'bg-slate-800 hover:bg-slate-700'}`}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-amber-200">Description *</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Décrivez le défi..."
                  className="bg-slate-800 border-amber-700/50"
                />
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-amber-200">Date de début *</Label>
                  <Input
                    type="datetime-local"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="bg-slate-800 border-amber-700/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-amber-200">Date de fin *</Label>
                  <Input
                    type="datetime-local"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="bg-slate-800 border-amber-700/50"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                />
                <Label className="text-amber-200">Défi actif</Label>
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.isGuildChallenge}
                  onCheckedChange={(checked) => setFormData({ ...formData, isGuildChallenge: checked })}
                />
                <Label className="text-amber-200">🏰 Défi de guilde (progression collective)</Label>
              </div>

              {formData.isGuildChallenge && (
                <div className="p-3 bg-amber-900/20 border border-amber-600/30 rounded-lg">
                  <p className="text-amber-200 text-sm">
                    ℹ️ Les défis de guilde cumulent la progression de tous les membres. 
                    Exemple : si l'objectif est de lire 500 chapitres, les chapitres lus par tous les membres seront additionnés.
                  </p>
                </div>
              )}

              {/* Récompenses */}
              <Card className="bg-slate-800/50 border-amber-700/30">
                <CardHeader>
                  <CardTitle className="text-amber-100 flex items-center gap-2">
                    <Gift className="w-5 h-5" /> Récompenses
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label className="text-amber-200">Orydors</Label>
                      <Input
                        type="number"
                        min="0"
                        value={formData.orydorsReward}
                        onChange={(e) => setFormData({ ...formData, orydorsReward: parseInt(e.target.value) || 0 })}
                        className="bg-slate-800 border-amber-700/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-amber-200">XP</Label>
                      <Input
                        type="number"
                        min="0"
                        value={formData.xpReward}
                        onChange={(e) => setFormData({ ...formData, xpReward: parseInt(e.target.value) || 0 })}
                        className="bg-slate-800 border-amber-700/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-amber-200">Mois Premium</Label>
                      <Input
                        type="number"
                        min="0"
                        value={formData.premiumMonthsReward}
                        onChange={(e) => setFormData({ ...formData, premiumMonthsReward: parseInt(e.target.value) || 0 })}
                        className="bg-slate-800 border-amber-700/50"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label className="text-amber-200">Items</Label>
                      <Button type="button" variant="outline" size="sm" onClick={addItemReward}>
                        <Plus className="w-3 h-3 mr-1" /> Ajouter
                      </Button>
                    </div>
                    {formData.itemRewards.map((reward, index) => (
                      <div key={index} className="flex gap-2 items-center">
                        <Select
                          value={reward.rewardTypeId}
                          onValueChange={(value) => updateItemReward(index, { rewardTypeId: value })}
                        >
                          <SelectTrigger className="flex-1 bg-slate-800 border-amber-700/50">
                            <SelectValue placeholder="Sélectionner un item" />
                          </SelectTrigger>
                          <SelectContent>
                            {rewardTypes.map(rt => (
                              <SelectItem key={rt.id} value={rt.id}>{rt.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Input
                          type="number"
                          min="1"
                          value={reward.quantity}
                          onChange={(e) => updateItemReward(index, { quantity: parseInt(e.target.value) || 1 })}
                          className="w-20 bg-slate-800 border-amber-700/50"
                        />
                        <Button type="button" variant="ghost" size="sm" onClick={() => removeItemReward(index)}>
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Objectifs */}
              <Card className="bg-slate-800/50 border-amber-700/30">
                <CardHeader>
                  <CardTitle className="text-amber-100 flex items-center gap-2">
                    <Target className="w-5 h-5" /> Objectifs
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {objectives.map((obj, index) => (
                    <div key={index} className="p-4 bg-slate-900/50 rounded-lg space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-amber-200 font-medium">Objectif {index + 1}</span>
                        <Button type="button" variant="ghost" size="sm" onClick={() => removeObjective(index)}>
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label className="text-amber-200/80 text-sm">Type</Label>
                          <Select
                            value={obj.objectiveType}
                            onValueChange={(value: ChallengeObjectiveType) => updateObjective(index, { objectiveType: value })}
                          >
                            <SelectTrigger className="bg-slate-800 border-amber-700/50">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {OBJECTIVE_TYPES.map(type => (
                                <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-amber-200/80 text-sm">Nom affiché</Label>
                          <Input
                            value={obj.objectiveName}
                            onChange={(e) => updateObjective(index, { objectiveName: e.target.value })}
                            placeholder="Ex: Lire 3 livres Fantasy"
                            className="bg-slate-800 border-amber-700/50"
                          />
                        </div>

                        {obj.objectiveType === 'read_book' && (
                          <div className="space-y-2 md:col-span-2">
                            <Label className="text-amber-200/80 text-sm">Livre cible</Label>
                            <BookSearchSelect
                              books={books}
                              value={obj.targetBookId || ''}
                              onChange={(value) => updateObjective(index, { targetBookId: value as string })}
                              placeholder="Rechercher un livre..."
                            />
                          </div>
                        )}

                        {obj.objectiveType === 'read_chapters_book' && (
                          <>
                            <div className="space-y-2 md:col-span-2">
                              <Label className="text-amber-200/80 text-sm">Livre cible</Label>
                              <BookSearchSelect
                                books={books}
                                value={obj.targetBookId || ''}
                                onChange={(value) => updateObjective(index, { targetBookId: value as string })}
                                placeholder="Rechercher un livre..."
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-amber-200/80 text-sm">Nombre de chapitres</Label>
                              <Input
                                type="number"
                                min="1"
                                value={obj.targetCount}
                                onChange={(e) => updateObjective(index, { targetCount: parseInt(e.target.value) || 1 })}
                                className="bg-slate-800 border-amber-700/50"
                              />
                            </div>
                          </>
                        )}

                        {obj.objectiveType === 'read_chapters_genre' && (
                          <>
                            <div className="space-y-2">
                              <Label className="text-amber-200/80 text-sm">Genre</Label>
                              <Select
                                value={obj.targetGenre || ''}
                                onValueChange={(value) => updateObjective(index, { targetGenre: value })}
                              >
                                <SelectTrigger className="bg-slate-800 border-amber-700/50">
                                  <SelectValue placeholder="Sélectionner un genre" />
                                </SelectTrigger>
                                <SelectContent>
                                  {LITERARY_GENRES.map(genre => (
                                    <SelectItem key={genre} value={genre}>{genre}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label className="text-amber-200/80 text-sm">Nombre de chapitres</Label>
                              <Input
                                type="number"
                                min="1"
                                value={obj.targetCount}
                                onChange={(e) => updateObjective(index, { targetCount: parseInt(e.target.value) || 1 })}
                                className="bg-slate-800 border-amber-700/50"
                              />
                            </div>
                          </>
                        )}

                        {obj.objectiveType === 'read_chapters_selection' && (
                          <>
                            <div className="space-y-2 md:col-span-2">
                              <Label className="text-amber-200/80 text-sm">Sélection de livres</Label>
                              <BookSearchSelect
                                books={books}
                                value={obj.targetBookIds || []}
                                onChange={(value) => updateObjective(index, { targetBookIds: value as string[] })}
                                multiple
                                placeholder="Rechercher des livres..."
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-amber-200/80 text-sm">Nombre de chapitres</Label>
                              <Input
                                type="number"
                                min="1"
                                value={obj.targetCount}
                                onChange={(e) => updateObjective(index, { targetCount: parseInt(e.target.value) || 1 })}
                                className="bg-slate-800 border-amber-700/50"
                              />
                            </div>
                          </>
                        )}

                        {obj.objectiveType === 'read_genre' && (
                          <>
                            <div className="space-y-2">
                              <Label className="text-amber-200/80 text-sm">Genre</Label>
                              <Select
                                value={obj.targetGenre || ''}
                                onValueChange={(value) => updateObjective(index, { targetGenre: value })}
                              >
                                <SelectTrigger className="bg-slate-800 border-amber-700/50">
                                  <SelectValue placeholder="Sélectionner un genre" />
                                </SelectTrigger>
                                <SelectContent>
                              {LITERARY_GENRES.map(genre => (
                                <SelectItem key={genre} value={genre}>{genre}</SelectItem>
                              ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label className="text-amber-200/80 text-sm">Nombre de livres</Label>
                              <Input
                                type="number"
                                min="1"
                                value={obj.targetCount}
                                onChange={(e) => updateObjective(index, { targetCount: parseInt(e.target.value) || 1 })}
                                className="bg-slate-800 border-amber-700/50"
                              />
                            </div>
                          </>
                        )}

                        {obj.objectiveType === 'collect_item' && (
                          <div className="space-y-2 md:col-span-2">
                            <Label className="text-amber-200/80 text-sm">Item à obtenir</Label>
                            <Select
                              value={obj.targetRewardTypeId || ''}
                              onValueChange={(value) => updateObjective(index, { targetRewardTypeId: value })}
                            >
                              <SelectTrigger className="bg-slate-800 border-amber-700/50">
                                <SelectValue placeholder="Sélectionner un item" />
                              </SelectTrigger>
                              <SelectContent>
                                {rewardTypes.map(rt => (
                                  <SelectItem key={rt.id} value={rt.id}>{rt.name}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        )}

                        {obj.objectiveType === 'read_any_books' && (
                          <div className="space-y-2">
                            <Label className="text-amber-200/80 text-sm">Nombre de livres</Label>
                            <Input
                              type="number"
                              min="1"
                              value={obj.targetCount}
                              onChange={(e) => updateObjective(index, { targetCount: parseInt(e.target.value) || 1 })}
                              className="bg-slate-800 border-amber-700/50"
                            />
                          </div>
                        )}

                        {obj.objectiveType === 'read_saga_book' && (
                          <div className="space-y-2 md:col-span-2">
                            <Label className="text-amber-200/80 text-sm">Livres de la saga (au choix)</Label>
                            <BookSearchSelect
                              books={books}
                              value={obj.targetBookIds || []}
                              onChange={(value) => updateObjective(index, { targetBookIds: value as string[] })}
                              multiple
                              placeholder="Rechercher des livres de la saga..."
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  <Button type="button" variant="outline" onClick={addObjective} className="w-full">
                    <Plus className="w-4 h-4 mr-2" /> Ajouter un objectif
                  </Button>
                </CardContent>
              </Card>

              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Annuler</Button>
                <Button onClick={handleSubmit} className="bg-amber-600 hover:bg-amber-700">
                  {editingChallenge ? 'Mettre à jour' : 'Créer le défi'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <TabsList className="bg-slate-800">
          <TabsTrigger value="active">En cours</TabsTrigger>
          <TabsTrigger value="upcoming">À venir</TabsTrigger>
          <TabsTrigger value="past">Terminés</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          {isLoading ? (
            <div className="text-center py-8 text-amber-200/60">Chargement...</div>
          ) : filteredChallenges.length === 0 ? (
            <div className="text-center py-8 text-amber-200/60">Aucun défi dans cette catégorie</div>
          ) : (
            <div className="space-y-4">
              {filteredChallenges.map(challenge => {
                const status = getChallengeStatus(challenge);
                return (
                  <Card key={challenge.id} className="bg-slate-800/50 border-amber-700/30">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-2xl">{challenge.icon}</span>
                            <h3 className="text-lg font-semibold text-amber-100">{challenge.name}</h3>
                            <Badge className={status.color}>{status.label}</Badge>
                          </div>
                          <p className="text-amber-200/70 text-sm mb-3">{challenge.description}</p>
                          
                          <div className="flex items-center gap-4 text-sm text-amber-200/60">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {challenge.startDate.toLocaleDateString()} - {challenge.endDate.toLocaleDateString()}
                            </span>
                            <span className="flex items-center gap-1">
                              <Target className="w-4 h-4" />
                              {challenge.objectives.length} objectif(s)
                            </span>
                          </div>

                          <div className="flex gap-2 mt-3 flex-wrap">
                            {challenge.orydorsReward > 0 && (
                              <Badge variant="outline" className="border-amber-500/50 text-amber-300">
                                💰 {challenge.orydorsReward} Orydors
                              </Badge>
                            )}
                            {challenge.xpReward > 0 && (
                              <Badge variant="outline" className="border-purple-500/50 text-purple-300">
                                ⭐ {challenge.xpReward} XP
                              </Badge>
                            )}
                            {challenge.premiumMonthsReward > 0 && (
                              <Badge variant="outline" className="border-yellow-500/50 text-yellow-300">
                                👑 {challenge.premiumMonthsReward} mois premium
                              </Badge>
                            )}
                            {challenge.itemRewards.length > 0 && (
                              <Badge variant="outline" className="border-green-500/50 text-green-300">
                                🎁 {challenge.itemRewards.length} item(s)
                              </Badge>
                            )}
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(challenge)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(challenge.id)}>
                            <Trash2 className="w-4 h-4 text-red-400" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
