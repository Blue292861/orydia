import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit, Calendar, Gift, Percent, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { DailyChestConfig, DailyChestItem } from '@/types/DailyChest';
import { getAllConfigs, createConfig, updateConfig, deleteConfig } from '@/services/dailyChestService';
import { supabase } from '@/integrations/supabase/client';

interface RewardType {
  id: string;
  name: string;
  imageUrl: string;
  rarity: string;
}

export const DailyChestAdmin: React.FC = () => {
  const [configs, setConfigs] = useState<DailyChestConfig[]>([]);
  const [rewardTypes, setRewardTypes] = useState<RewardType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingConfig, setEditingConfig] = useState<DailyChestConfig | null>(null);

  // Form state
  const [formName, setFormName] = useState('');
  const [formStartDate, setFormStartDate] = useState('');
  const [formEndDate, setFormEndDate] = useState('');
  const [formMinOrydors, setFormMinOrydors] = useState(10);
  const [formMaxOrydors, setFormMaxOrydors] = useState(100);
  const [formIsActive, setFormIsActive] = useState(true);
  const [formItemPool, setFormItemPool] = useState<DailyChestItem[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [configsData, { data: rewardsData }] = await Promise.all([
        getAllConfigs(),
        supabase.from('reward_types').select('id, name, image_url, rarity').eq('is_active', true)
      ]);
      setConfigs(configsData);
      setRewardTypes((rewardsData || []).map(r => ({
        id: r.id,
        name: r.name,
        imageUrl: r.image_url,
        rarity: r.rarity
      })));
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Erreur lors du chargement');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormName('');
    setFormStartDate('');
    setFormEndDate('');
    setFormMinOrydors(10);
    setFormMaxOrydors(100);
    setFormIsActive(true);
    setFormItemPool([]);
    setEditingConfig(null);
  };

  const openCreateForm = () => {
    resetForm();
    setShowForm(true);
  };

  const openEditForm = (config: DailyChestConfig) => {
    setEditingConfig(config);
    setFormName(config.name);
    setFormStartDate(config.startDate);
    setFormEndDate(config.endDate);
    setFormMinOrydors(config.minOrydors);
    setFormMaxOrydors(config.maxOrydors);
    setFormIsActive(config.isActive);
    setFormItemPool(config.itemPool || []);
    setShowForm(true);
  };

  const handleSubmit = async () => {
    if (!formName || !formStartDate || !formEndDate) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (formMinOrydors > formMaxOrydors) {
      toast.error('Le minimum d\'Orydors doit être inférieur ou égal au maximum');
      return;
    }

    try {
      const configData = {
        name: formName,
        startDate: formStartDate,
        endDate: formEndDate,
        minOrydors: formMinOrydors,
        maxOrydors: formMaxOrydors,
        isActive: formIsActive,
        itemPool: formItemPool
      };

      if (editingConfig) {
        await updateConfig(editingConfig.id, configData);
        toast.success('Configuration mise à jour');
      } else {
        await createConfig(configData);
        toast.success('Configuration créée');
      }

      setShowForm(false);
      resetForm();
      loadData();
    } catch (error) {
      console.error('Error saving config:', error);
      toast.error('Erreur lors de la sauvegarde');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer cette configuration ?')) return;

    try {
      await deleteConfig(id);
      toast.success('Configuration supprimée');
      loadData();
    } catch (error) {
      console.error('Error deleting config:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  const addItemToPool = () => {
    setFormItemPool([...formItemPool, { rewardTypeId: '', dropChance: 10, quantity: 1 }]);
  };

  const updateItemInPool = (index: number, field: keyof DailyChestItem, value: string | number) => {
    const updated = [...formItemPool];
    updated[index] = { ...updated[index], [field]: value };
    setFormItemPool(updated);
  };

  const removeItemFromPool = (index: number) => {
    setFormItemPool(formItemPool.filter((_, i) => i !== index));
  };

  const totalDropChance = formItemPool.reduce((sum, item) => sum + item.dropChance, 0);

  if (isLoading) {
    return <div className="p-8 text-center">Chargement...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Coffres Quotidiens</h2>
        <Button onClick={openCreateForm} className="bg-amber-600 hover:bg-amber-700">
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle période
        </Button>
      </div>

      {/* Configs list */}
      <div className="grid gap-4">
        {configs.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              Aucune configuration. Créez-en une pour activer les coffres quotidiens.
            </CardContent>
          </Card>
        ) : (
          configs.map(config => (
            <Card key={config.id} className={!config.isActive ? 'opacity-60' : ''}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Gift className="h-5 w-5 text-amber-500" />
                    {config.name}
                    {!config.isActive && (
                      <span className="text-xs bg-gray-600 text-gray-300 px-2 py-0.5 rounded">Inactif</span>
                    )}
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => openEditForm(config)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(config.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Période :</span>
                    <p className="font-medium">{config.startDate} → {config.endDate}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Orydors :</span>
                    <p className="font-medium">{config.minOrydors} - {config.maxOrydors}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Items :</span>
                    <p className="font-medium">{config.itemPool?.length || 0} items configurés</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Form Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingConfig ? 'Modifier la configuration' : 'Nouvelle configuration'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Basic info */}
            <div className="space-y-4">
              <div>
                <Label>Nom de la période</Label>
                <Input
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Ex: Coffre de Noël 2024"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Date de début</Label>
                  <Input
                    type="date"
                    value={formStartDate}
                    onChange={(e) => setFormStartDate(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Date de fin</Label>
                  <Input
                    type="date"
                    value={formEndDate}
                    onChange={(e) => setFormEndDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Orydors minimum</Label>
                  <Input
                    type="number"
                    value={formMinOrydors}
                    onChange={(e) => setFormMinOrydors(parseInt(e.target.value) || 0)}
                    min={0}
                  />
                </div>
                <div>
                  <Label>Orydors maximum</Label>
                  <Input
                    type="number"
                    value={formMaxOrydors}
                    onChange={(e) => setFormMaxOrydors(parseInt(e.target.value) || 0)}
                    min={0}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  checked={formIsActive}
                  onCheckedChange={setFormIsActive}
                />
                <Label>Configuration active</Label>
              </div>
            </div>

            {/* Item pool */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-lg">Pool d'items</Label>
                <Button variant="outline" size="sm" onClick={addItemToPool}>
                  <Plus className="h-4 w-4 mr-1" />
                  Ajouter un item
                </Button>
              </div>

              {formItemPool.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Aucun item configuré. Le coffre ne donnera que des Orydors.
                </p>
              ) : (
                <div className="space-y-3">
                  {formItemPool.map((item, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                      <Select
                        value={item.rewardTypeId}
                        onValueChange={(value) => updateItemInPool(index, 'rewardTypeId', value)}
                      >
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Sélectionner un item" />
                        </SelectTrigger>
                        <SelectContent>
                          {rewardTypes.map(rt => (
                            <SelectItem key={rt.id} value={rt.id}>
                              {rt.name} ({rt.rarity})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <div className="flex items-center gap-1">
                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateItemInPool(index, 'quantity', parseInt(e.target.value) || 1)}
                          className="w-16"
                          min={1}
                        />
                        <span className="text-sm text-muted-foreground">×</span>
                      </div>

                      <div className="flex items-center gap-1">
                        <Input
                          type="number"
                          value={item.dropChance}
                          onChange={(e) => updateItemInPool(index, 'dropChance', parseFloat(e.target.value) || 0)}
                          className="w-20"
                          min={0}
                          max={100}
                          step={0.1}
                        />
                        <Percent className="h-4 w-4 text-muted-foreground" />
                      </div>

                      <Button variant="ghost" size="sm" onClick={() => removeItemFromPool(index)}>
                        <X className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))}

                  <p className={`text-sm ${totalDropChance > 100 ? 'text-amber-500' : 'text-muted-foreground'}`}>
                    Total des chances : {totalDropChance.toFixed(1)}%
                    {totalDropChance > 100 && ' (Les probabilités seront normalisées)'}
                  </p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowForm(false)}>
                Annuler
              </Button>
              <Button onClick={handleSubmit} className="bg-amber-600 hover:bg-amber-700">
                <Save className="h-4 w-4 mr-2" />
                {editingConfig ? 'Mettre à jour' : 'Créer'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
