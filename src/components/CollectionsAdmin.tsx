import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Collection, CollectionItemReward } from '@/types/Collection';
import { RewardType } from '@/types/RewardType';
import { 
  fetchCollections, 
  createCollection, 
  updateCollection, 
  deleteCollection,
  getCollectionItemRewards,
  setCollectionItemRewards,
  getCardsInCollection
} from '@/services/collectionService';
import { Plus, Trash2, Edit, Upload, Package, Coins, Sparkles, Layers } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export const CollectionsAdmin: React.FC = () => {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [allRewardTypes, setAllRewardTypes] = useState<RewardType[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCollection, setEditingCollection] = useState<Collection | null>(null);
  const [collectionCards, setCollectionCards] = useState<Map<string, number>>(new Map());
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon_url: '',
    orydors_reward: 0,
    xp_reward: 0,
    is_active: true
  });

  const [itemRewards, setItemRewards] = useState<{ reward_type_id: string; quantity: number }[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [collectionsData, rewardTypesData] = await Promise.all([
        fetchCollections(),
        supabase.from('reward_types').select('*').eq('is_active', true).order('name')
      ]);

      setCollections(collectionsData);
      setAllRewardTypes((rewardTypesData.data || []) as RewardType[]);

      // Load card counts for each collection
      const cardCounts = new Map<string, number>();
      for (const collection of collectionsData) {
        const cards = await getCardsInCollection(collection.id);
        cardCounts.set(collection.id, cards.length);
      }
      setCollectionCards(cardCounts);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({ title: "Erreur", description: "Impossible de charger les données", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `collection-${Date.now()}.${fileExt}`;
      const filePath = `collection-icons/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      setFormData(prev => ({ ...prev, icon_url: publicUrl }));
      toast({ title: "Succès", description: "Icône téléchargée" });
    } catch (error) {
      console.error('Error uploading:', error);
      toast({ title: "Erreur", description: "Impossible de télécharger l'icône", variant: "destructive" });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      let collectionId: string;

      if (editingCollection) {
        const updated = await updateCollection(editingCollection.id, formData);
        collectionId = updated.id;
        toast({ title: "Succès", description: "Collection modifiée" });
      } else {
        const created = await createCollection(formData);
        collectionId = created.id;
        toast({ title: "Succès", description: "Collection créée" });
      }

      // Save item rewards
      await setCollectionItemRewards(collectionId, itemRewards.filter(r => r.reward_type_id));

      resetForm();
      setIsDialogOpen(false);
      loadData();
    } catch (error) {
      console.error('Error saving:', error);
      toast({ title: "Erreur", description: "Impossible de sauvegarder", variant: "destructive" });
    }
  };

  const handleEdit = async (collection: Collection) => {
    setEditingCollection(collection);
    setFormData({
      name: collection.name,
      description: collection.description || '',
      icon_url: collection.icon_url,
      orydors_reward: collection.orydors_reward,
      xp_reward: collection.xp_reward,
      is_active: collection.is_active
    });

    // Load existing item rewards
    const rewards = await getCollectionItemRewards(collection.id);
    setItemRewards(rewards.map(r => ({ reward_type_id: r.reward_type_id, quantity: r.quantity })));

    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer cette collection ?')) return;

    try {
      await deleteCollection(id);
      toast({ title: "Succès", description: "Collection supprimée" });
      loadData();
    } catch (error) {
      console.error('Error deleting:', error);
      toast({ title: "Erreur", description: "Impossible de supprimer", variant: "destructive" });
    }
  };

  const resetForm = () => {
    setEditingCollection(null);
    setFormData({
      name: '',
      description: '',
      icon_url: '',
      orydors_reward: 0,
      xp_reward: 0,
      is_active: true
    });
    setItemRewards([]);
  };

  const addItemReward = () => {
    setItemRewards(prev => [...prev, { reward_type_id: '', quantity: 1 }]);
  };

  const removeItemReward = (index: number) => {
    setItemRewards(prev => prev.filter((_, i) => i !== index));
  };

  const updateItemReward = (index: number, field: 'reward_type_id' | 'quantity', value: string | number) => {
    setItemRewards(prev => prev.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    ));
  };

  if (loading) return <div className="p-4">Chargement...</div>;

  return (
    <div className="p-4 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Layers className="w-6 h-6" />
          Gestion des Collections
        </h2>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nouvelle Collection
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingCollection ? 'Modifier' : 'Créer'} une Collection</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Nom</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                  placeholder="Ex: Personnages de Fantasy"
                />
              </div>

              <div>
                <Label>Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={2}
                  placeholder="Collectionnez les héros légendaires..."
                />
              </div>

              <div>
                <Label>Icône de la collection</Label>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Input type="file" accept="image/*" onChange={handleImageUpload} className="flex-1" />
                    <Button type="button" variant="outline" size="icon">
                      <Upload className="w-4 h-4" />
                    </Button>
                  </div>
                  {formData.icon_url && (
                    <img src={formData.icon_url} alt="Icône" className="w-16 h-16 object-contain border rounded" />
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                />
                <Label>Collection active</Label>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  Récompenses du coffre de complétion
                </h3>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <Label className="flex items-center gap-1">
                      <Coins className="w-4 h-4 text-amber-500" />
                      Orydors
                    </Label>
                    <Input
                      type="number"
                      min="0"
                      value={formData.orydors_reward}
                      onChange={(e) => setFormData(prev => ({ ...prev, orydors_reward: parseInt(e.target.value) || 0 }))}
                    />
                  </div>
                  <div>
                    <Label className="flex items-center gap-1">
                      <Sparkles className="w-4 h-4 text-purple-500" />
                      XP
                    </Label>
                    <Input
                      type="number"
                      min="0"
                      value={formData.xp_reward}
                      onChange={(e) => setFormData(prev => ({ ...prev, xp_reward: parseInt(e.target.value) || 0 }))}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Items bonus</Label>
                  {itemRewards.map((reward, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Select
                        value={reward.reward_type_id}
                        onValueChange={(value) => updateItemReward(index, 'reward_type_id', value)}
                      >
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Sélectionner un item" />
                        </SelectTrigger>
                        <SelectContent>
                          {allRewardTypes.filter(r => r.category === 'item').map(item => (
                            <SelectItem key={item.id} value={item.id}>
                              {item.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input
                        type="number"
                        min="1"
                        value={reward.quantity}
                        onChange={(e) => updateItemReward(index, 'quantity', parseInt(e.target.value) || 1)}
                        className="w-20"
                      />
                      <Button type="button" variant="ghost" size="icon" onClick={() => removeItemReward(index)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                  <Button type="button" variant="outline" size="sm" onClick={addItemReward}>
                    <Plus className="w-4 h-4 mr-1" />
                    Ajouter un item
                  </Button>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1">
                  {editingCollection ? 'Modifier' : 'Créer'}
                </Button>
                <Button type="button" variant="outline" onClick={() => { setIsDialogOpen(false); resetForm(); }}>
                  Annuler
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {collections.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Layers className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Aucune collection créée</p>
            <p className="text-sm mt-2">Créez votre première collection de cartes !</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {collections.map((collection) => (
            <Card key={collection.id} className={!collection.is_active ? 'opacity-60' : ''}>
              <CardHeader className="pb-2">
                <div className="flex items-start gap-3">
                  <img 
                    src={collection.icon_url} 
                    alt={collection.name} 
                    className="w-12 h-12 object-contain rounded"
                  />
                  <div className="flex-1">
                    <CardTitle className="text-lg">{collection.name}</CardTitle>
                    {collection.description && (
                      <CardDescription className="line-clamp-2">{collection.description}</CardDescription>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Badge variant="secondary">
                    {collectionCards.get(collection.id) || 0} cartes
                  </Badge>
                  {!collection.is_active && (
                    <Badge variant="outline">Inactive</Badge>
                  )}
                </div>

                <div className="text-sm text-muted-foreground">
                  <span className="font-medium">Récompenses :</span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {collection.orydors_reward > 0 && (
                      <Badge variant="outline" className="text-amber-600">
                        <Coins className="w-3 h-3 mr-1" />
                        {collection.orydors_reward}
                      </Badge>
                    )}
                    {collection.xp_reward > 0 && (
                      <Badge variant="outline" className="text-purple-600">
                        <Sparkles className="w-3 h-3 mr-1" />
                        {collection.xp_reward} XP
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => handleEdit(collection)}>
                    <Edit className="w-4 h-4 mr-1" />
                    Modifier
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(collection.id)}>
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
