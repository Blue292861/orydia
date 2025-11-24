import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { RewardType } from '@/types/RewardType';
import { Trash2, Edit, Plus, Upload } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

export const RewardTypesAdmin: React.FC = () => {
  const [rewardTypes, setRewardTypes] = useState<RewardType[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingReward, setEditingReward] = useState<RewardType | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'card' as 'currency' | 'fragment' | 'card' | 'item',
    rarity: 'common' as 'common' | 'rare' | 'epic' | 'legendary',
    image_url: '',
    metadata: '{}'
  });

  useEffect(() => {
    fetchRewardTypes();
  }, []);

  const fetchRewardTypes = async () => {
    try {
      const { data, error } = await supabase
        .from('reward_types')
        .select('*')
        .order('category', { ascending: true });

      if (error) throw error;
      setRewardTypes((data || []) as RewardType[]);
    } catch (error) {
      console.error('Error fetching reward types:', error);
      toast({ title: "Erreur", description: "Impossible de charger les types de récompenses", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `reward-images/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(filePath);

      setFormData(prev => ({ ...prev, image_url: publicUrl }));
      toast({ title: "Succès", description: "Image téléchargée avec succès" });
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({ title: "Erreur", description: "Impossible de télécharger l'image", variant: "destructive" });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      let metadataObj = {};
      try {
        metadataObj = JSON.parse(formData.metadata);
      } catch {
        toast({ title: "Erreur", description: "Format JSON invalide pour les métadonnées", variant: "destructive" });
        return;
      }

      if (editingReward) {
        const { error } = await supabase
          .from('reward_types')
          .update({
            name: formData.name,
            description: formData.description,
            category: formData.category,
            rarity: formData.rarity,
            image_url: formData.image_url,
            metadata: metadataObj,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingReward.id);

        if (error) throw error;
        toast({ title: "Succès", description: "Type de récompense modifié" });
      } else {
        const { error } = await supabase
          .from('reward_types')
          .insert({
            name: formData.name,
            description: formData.description,
            category: formData.category,
            rarity: formData.rarity,
            image_url: formData.image_url,
            metadata: metadataObj
          });

        if (error) throw error;
        toast({ title: "Succès", description: "Type de récompense créé" });
      }

      resetForm();
      fetchRewardTypes();
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error saving reward type:', error);
      toast({ title: "Erreur", description: "Impossible de sauvegarder", variant: "destructive" });
    }
  };

  const handleEdit = (reward: RewardType) => {
    setEditingReward(reward);
    setFormData({
      name: reward.name,
      description: reward.description || '',
      category: reward.category,
      rarity: reward.rarity,
      image_url: reward.image_url,
      metadata: JSON.stringify(reward.metadata, null, 2)
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce type de récompense ?')) return;

    try {
      const { error } = await supabase
        .from('reward_types')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast({ title: "Succès", description: "Type de récompense supprimé" });
      fetchRewardTypes();
    } catch (error) {
      console.error('Error deleting reward type:', error);
      toast({ title: "Erreur", description: "Impossible de supprimer", variant: "destructive" });
    }
  };

  const resetForm = () => {
    setEditingReward(null);
    setFormData({
      name: '',
      description: '',
      category: 'card',
      rarity: 'common',
      image_url: '',
      metadata: '{}'
    });
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'text-gray-500 border-gray-500';
      case 'rare': return 'text-blue-500 border-blue-500';
      case 'epic': return 'text-purple-500 border-purple-500';
      case 'legendary': return 'text-amber-500 border-amber-500';
      default: return 'text-gray-500 border-gray-500';
    }
  };

  if (loading) return <div className="p-4">Chargement...</div>;

  return (
    <div className="p-4 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gestion des Types de Récompenses</h2>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nouveau Type
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingReward ? 'Modifier' : 'Créer'} un Type de Récompense</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Nom</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>

              <div>
                <Label>Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Catégorie</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, category: value as any }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="currency">Monnaie</SelectItem>
                      <SelectItem value="fragment">Fragment</SelectItem>
                      <SelectItem value="card">Carte</SelectItem>
                      <SelectItem value="item">Objet</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Rareté</Label>
                  <Select
                    value={formData.rarity}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, rarity: value as any }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="common">Commun</SelectItem>
                      <SelectItem value="rare">Rare</SelectItem>
                      <SelectItem value="epic">Épique</SelectItem>
                      <SelectItem value="legendary">Légendaire</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Image</Label>
                <div className="space-y-2">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                  {formData.image_url && (
                    <img src={formData.image_url} alt="Preview" className="w-32 h-32 object-contain border rounded" />
                  )}
                </div>
              </div>

              <div>
                <Label>Métadonnées (JSON)</Label>
                <Textarea
                  value={formData.metadata}
                  onChange={(e) => setFormData(prev => ({ ...prev, metadata: e.target.value }))}
                  rows={4}
                  placeholder='{"key": "value"}'
                />
              </div>

              <div className="flex gap-2">
                <Button type="submit" className="flex-1">
                  {editingReward ? 'Modifier' : 'Créer'}
                </Button>
                <Button type="button" variant="outline" onClick={() => { setIsDialogOpen(false); resetForm(); }}>
                  Annuler
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {rewardTypes.map((reward) => (
          <Card key={reward.id} className={`border-2 ${getRarityColor(reward.rarity)}`}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="text-sm">{reward.name}</span>
                <div className="flex gap-1">
                  <Button size="sm" variant="ghost" onClick={() => handleEdit(reward)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => handleDelete(reward.id)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <img src={reward.image_url} alt={reward.name} className="w-full h-32 object-contain mb-2" />
              <p className="text-xs text-muted-foreground mb-2">{reward.description}</p>
              <div className="flex gap-2 text-xs">
                <span className="px-2 py-1 bg-muted rounded">{reward.category}</span>
                <span className={`px-2 py-1 rounded ${getRarityColor(reward.rarity)}`}>{reward.rarity}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
