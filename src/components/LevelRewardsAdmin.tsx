import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Pencil, Trash2, Gift, Crown, Star, Package } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { LevelReward, ItemRewardEntry } from '@/types/LevelReward';
import { getAllLevelRewards, createLevelReward, updateLevelReward, deleteLevelReward } from '@/services/levelRewardService';
import { supabase } from '@/integrations/supabase/client';

interface RewardType {
  id: string;
  name: string;
  imageUrl: string;
  category: string;
  rarity: string;
}

export const LevelRewardsAdmin: React.FC = () => {
  const [rewards, setRewards] = useState<LevelReward[]>([]);
  const [rewardTypes, setRewardTypes] = useState<RewardType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingReward, setEditingReward] = useState<LevelReward | null>(null);
  
  // Form state
  const [formLevel, setFormLevel] = useState(1);
  const [formOrydors, setFormOrydors] = useState(0);
  const [formXp, setFormXp] = useState(0);
  const [formPremiumDays, setFormPremiumDays] = useState(0);
  const [formDescription, setFormDescription] = useState('');
  const [formIsActive, setFormIsActive] = useState(true);
  const [formItems, setFormItems] = useState<ItemRewardEntry[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [rewardsData, typesData] = await Promise.all([
        getAllLevelRewards(),
        supabase.from('reward_types').select('*').eq('is_active', true)
      ]);
      
      setRewards(rewardsData);
      setRewardTypes((typesData.data || []).map((t: any) => ({
        id: t.id,
        name: t.name,
        imageUrl: t.image_url,
        category: t.category,
        rarity: t.rarity
      })));
    } catch (error) {
      console.error('Error loading data:', error);
      toast({ title: 'Erreur', description: 'Impossible de charger les données', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormLevel(1);
    setFormOrydors(0);
    setFormXp(0);
    setFormPremiumDays(0);
    setFormDescription('');
    setFormIsActive(true);
    setFormItems([]);
    setEditingReward(null);
  };

  const handleOpenAdd = () => {
    resetForm();
    // Find next available level
    const existingLevels = rewards.map(r => r.level);
    let nextLevel = 2;
    while (existingLevels.includes(nextLevel)) {
      nextLevel++;
    }
    setFormLevel(nextLevel);
    setShowDialog(true);
  };

  const handleOpenEdit = (reward: LevelReward) => {
    setEditingReward(reward);
    setFormLevel(reward.level);
    setFormOrydors(reward.orydorsReward);
    setFormXp(reward.xpBonus);
    setFormPremiumDays(reward.premiumDays);
    setFormDescription(reward.description || '');
    setFormIsActive(reward.isActive);
    setFormItems(reward.itemRewards || []);
    setShowDialog(true);
  };

  const handleSubmit = async () => {
    try {
      const rewardData = {
        level: formLevel,
        orydorsReward: formOrydors,
        xpBonus: formXp,
        premiumDays: formPremiumDays,
        description: formDescription,
        isActive: formIsActive,
        itemRewards: formItems
      };

      if (editingReward) {
        await updateLevelReward(editingReward.id, rewardData);
        toast({ title: 'Succès', description: 'Récompense mise à jour' });
      } else {
        await createLevelReward(rewardData);
        toast({ title: 'Succès', description: 'Récompense créée' });
      }

      setShowDialog(false);
      resetForm();
      loadData();
    } catch (error: any) {
      console.error('Error saving reward:', error);
      toast({ 
        title: 'Erreur', 
        description: error.message?.includes('duplicate') 
          ? 'Une récompense existe déjà pour ce niveau'
          : 'Impossible de sauvegarder',
        variant: 'destructive' 
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer cette récompense de niveau ?')) return;
    
    try {
      await deleteLevelReward(id);
      toast({ title: 'Succès', description: 'Récompense supprimée' });
      loadData();
    } catch (error) {
      toast({ title: 'Erreur', description: 'Impossible de supprimer', variant: 'destructive' });
    }
  };

  const addItem = () => {
    if (rewardTypes.length === 0) return;
    setFormItems([...formItems, { rewardTypeId: rewardTypes[0].id, quantity: 1 }]);
  };

  const updateItem = (index: number, field: 'rewardTypeId' | 'quantity', value: string | number) => {
    const updated = [...formItems];
    updated[index] = { ...updated[index], [field]: value };
    setFormItems(updated);
  };

  const removeItem = (index: number) => {
    setFormItems(formItems.filter((_, i) => i !== index));
  };

  const getRewardTypeName = (id: string) => {
    return rewardTypes.find(t => t.id === id)?.name || 'Inconnu';
  };

  if (loading) {
    return <div className="text-center py-8">Chargement...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold">Récompenses de Niveau</h3>
        <Button onClick={handleOpenAdd} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Ajouter
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {rewards.map((reward) => (
          <Card key={reward.id} className={!reward.isActive ? 'opacity-50' : ''}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-amber-500" />
                  Niveau {reward.level}
                </CardTitle>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={() => handleOpenEdit(reward)}>
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(reward.id)}>
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {reward.orydorsReward > 0 && (
                <div className="flex items-center gap-2">
                  <img src="/lovable-uploads/4a891ef6-ff72-4b5a-b33c-0dc33dd3aa26.png" alt="Orydors" className="w-4 h-4" />
                  <span>{reward.orydorsReward} Orydors</span>
                </div>
              )}
              {reward.xpBonus > 0 && (
                <div className="flex items-center gap-2">
                  <Gift className="w-4 h-4 text-blue-500" />
                  <span>+{reward.xpBonus} XP bonus</span>
                </div>
              )}
              {reward.premiumDays > 0 && (
                <div className="flex items-center gap-2">
                  <Crown className="w-4 h-4 text-amber-500" />
                  <span>{reward.premiumDays} jours premium</span>
                </div>
              )}
              {reward.itemRewards.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap">
                  <Package className="w-4 h-4 text-purple-500" />
                  {reward.itemRewards.map((item, i) => (
                    <Badge key={i} variant="secondary">
                      {item.quantity}x {getRewardTypeName(item.rewardTypeId)}
                    </Badge>
                  ))}
                </div>
              )}
              {reward.description && (
                <p className="text-sm text-muted-foreground">{reward.description}</p>
              )}
              {!reward.isActive && <Badge variant="outline">Désactivée</Badge>}
            </CardContent>
          </Card>
        ))}
      </div>

      {rewards.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          Aucune récompense de niveau configurée
        </div>
      )}

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingReward ? 'Modifier la récompense' : 'Nouvelle récompense de niveau'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label>Niveau</Label>
              <Input 
                type="number" 
                min={1} 
                value={formLevel} 
                onChange={(e) => setFormLevel(parseInt(e.target.value) || 1)}
                disabled={!!editingReward}
              />
            </div>

            <div>
              <Label>Orydors</Label>
              <Input 
                type="number" 
                min={0} 
                value={formOrydors} 
                onChange={(e) => setFormOrydors(parseInt(e.target.value) || 0)}
              />
            </div>

            <div>
              <Label>XP Bonus</Label>
              <Input 
                type="number" 
                min={0} 
                value={formXp} 
                onChange={(e) => setFormXp(parseInt(e.target.value) || 0)}
              />
            </div>

            <div>
              <Label>Jours Premium</Label>
              <Input 
                type="number" 
                min={0} 
                value={formPremiumDays} 
                onChange={(e) => setFormPremiumDays(parseInt(e.target.value) || 0)}
              />
            </div>

            <div>
              <Label>Description (optionnel)</Label>
              <Textarea 
                value={formDescription} 
                onChange={(e) => setFormDescription(e.target.value)}
                placeholder="Description de la récompense..."
              />
            </div>

            <div className="flex items-center gap-2">
              <Switch checked={formIsActive} onCheckedChange={setFormIsActive} />
              <Label>Active</Label>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label>Items</Label>
                <Button type="button" variant="outline" size="sm" onClick={addItem}>
                  <Plus className="w-4 h-4 mr-1" /> Ajouter
                </Button>
              </div>
              
              {formItems.map((item, index) => (
                <div key={index} className="flex gap-2 items-center">
                  <Select 
                    value={item.rewardTypeId} 
                    onValueChange={(v) => updateItem(index, 'rewardTypeId', v)}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {rewardTypes.map((type) => (
                        <SelectItem key={type.id} value={type.id}>
                          {type.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input 
                    type="number" 
                    min={1} 
                    value={item.quantity}
                    onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                    className="w-20"
                  />
                  <Button variant="ghost" size="sm" onClick={() => removeItem(index)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowDialog(false)}>Annuler</Button>
              <Button onClick={handleSubmit}>
                {editingReward ? 'Mettre à jour' : 'Créer'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LevelRewardsAdmin;
