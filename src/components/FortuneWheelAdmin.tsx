import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Plus, Pencil, Trash2, Loader2, Sparkles, Flame } from 'lucide-react';
import { WheelConfig, WheelSegment, StreakBonus } from '@/types/FortuneWheel';
import { getAllWheelConfigs, createWheelConfig, updateWheelConfig, deleteWheelConfig } from '@/services/fortuneWheelService';

interface RewardType {
  id: string;
  name: string;
  imageUrl: string;
  rarity: string;
}

export const FortuneWheelAdmin: React.FC = () => {
  const [configs, setConfigs] = useState<WheelConfig[]>([]);
  const [rewardTypes, setRewardTypes] = useState<RewardType[]>([]);
  const [streakBonuses, setStreakBonuses] = useState<StreakBonus[]>([]);
  const [loading, setLoading] = useState(true);
  const [showConfigDialog, setShowConfigDialog] = useState(false);
  const [editingConfig, setEditingConfig] = useState<WheelConfig | null>(null);
  
  // Form state
  const [formName, setFormName] = useState('');
  const [formStartDate, setFormStartDate] = useState('');
  const [formEndDate, setFormEndDate] = useState('');
  const [formIsActive, setFormIsActive] = useState(true);
  const [formSegments, setFormSegments] = useState<WheelSegment[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [configsData, rewardTypesData, bonusesData] = await Promise.all([
        getAllWheelConfigs(),
        supabase.from('reward_types').select('id, name, image_url, rarity').eq('is_active', true).then(r => r.data || []),
        supabase.from('streak_bonuses').select('*').order('streak_level').then(r => r.data || [])
      ]);
      
      setConfigs(configsData);
      setRewardTypes(rewardTypesData.map(r => ({
        id: r.id,
        name: r.name,
        imageUrl: r.image_url,
        rarity: r.rarity
      })));
      setStreakBonuses(bonusesData.map(b => ({
        id: b.id,
        streakLevel: b.streak_level,
        bonusType: b.bonus_type as 'probability_boost' | 'quantity_boost',
        bonusValue: b.bonus_value,
        description: b.description,
        isActive: b.is_active ?? true
      })));
    } catch (error) {
      console.error('Error loading data:', error);
      toast({ title: 'Erreur de chargement', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormName('');
    setFormStartDate('');
    setFormEndDate('');
    setFormIsActive(true);
    setFormSegments([
      { id: 'seg1', type: 'orydors', value: 200, probability: 50, color: '#FFD700', label: '200 Orydors' },
      { id: 'seg2', type: 'orydors', value: 1000, probability: 5, color: '#FF6B00', label: '1000 Orydors' },
      { id: 'seg3', type: 'xp', value: 40, probability: 45, color: '#10B981', label: '40 XP' }
    ]);
    setEditingConfig(null);
  };

  const openCreateDialog = () => {
    resetForm();
    setShowConfigDialog(true);
  };

  const openEditDialog = (config: WheelConfig) => {
    setEditingConfig(config);
    setFormName(config.name);
    setFormStartDate(config.startDate.split('T')[0]);
    setFormEndDate(config.endDate.split('T')[0]);
    setFormIsActive(config.isActive);
    setFormSegments(config.segments);
    setShowConfigDialog(true);
  };

  const handleSaveConfig = async () => {
    if (!formName || !formStartDate || !formEndDate || formSegments.length === 0) {
      toast({ title: 'Veuillez remplir tous les champs', variant: 'destructive' });
      return;
    }

    const totalProbability = formSegments.reduce((sum, s) => sum + s.probability, 0);
    if (Math.abs(totalProbability - 100) > 0.1) {
      toast({ 
        title: 'Erreur de probabilité', 
        description: `Total: ${totalProbability}%. Doit être égal à 100%.`,
        variant: 'destructive' 
      });
      return;
    }

    try {
      const configData = {
        name: formName,
        startDate: formStartDate,
        endDate: formEndDate,
        isActive: formIsActive,
        segments: formSegments
      };

      if (editingConfig) {
        await updateWheelConfig(editingConfig.id, configData);
        toast({ title: 'Configuration mise à jour' });
      } else {
        await createWheelConfig(configData);
        toast({ title: 'Configuration créée' });
      }

      setShowConfigDialog(false);
      loadData();
    } catch (error: any) {
      toast({ title: 'Erreur', description: error.message, variant: 'destructive' });
    }
  };

  const handleDeleteConfig = async (id: string) => {
    if (!confirm('Supprimer cette configuration ?')) return;

    try {
      await deleteWheelConfig(id);
      toast({ title: 'Configuration supprimée' });
      loadData();
    } catch (error: any) {
      toast({ title: 'Erreur', description: error.message, variant: 'destructive' });
    }
  };

  const addSegment = () => {
    const newSegment: WheelSegment = {
      id: `seg${Date.now()}`,
      type: 'orydors',
      value: 100,
      probability: 0,
      color: '#6B7280',
      label: 'Nouveau segment'
    };
    setFormSegments([...formSegments, newSegment]);
  };

  const updateSegment = (index: number, updates: Partial<WheelSegment>) => {
    const newSegments = [...formSegments];
    newSegments[index] = { ...newSegments[index], ...updates };
    setFormSegments(newSegments);
  };

  const removeSegment = (index: number) => {
    setFormSegments(formSegments.filter((_, i) => i !== index));
  };

  const handleUpdateStreakBonus = async (bonus: StreakBonus, updates: Partial<StreakBonus>) => {
    try {
      await supabase
        .from('streak_bonuses')
        .update({
          bonus_type: updates.bonusType || bonus.bonusType,
          bonus_value: updates.bonusValue || bonus.bonusValue,
          description: updates.description || bonus.description,
          is_active: updates.isActive !== undefined ? updates.isActive : bonus.isActive
        })
        .eq('id', bonus.id);
      
      toast({ title: 'Bonus mis à jour' });
      loadData();
    } catch (error: any) {
      toast({ title: 'Erreur', description: error.message, variant: 'destructive' });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="configs">
        <TabsList>
          <TabsTrigger value="configs" className="flex items-center gap-1">
            <Sparkles className="h-4 w-4" />
            Configurations
          </TabsTrigger>
          <TabsTrigger value="bonuses" className="flex items-center gap-1">
            <Flame className="h-4 w-4" />
            Bonus de série
          </TabsTrigger>
        </TabsList>

        <TabsContent value="configs" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={openCreateDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle configuration
            </Button>
          </div>

          <div className="grid gap-4">
            {configs.map(config => (
              <Card key={config.id} className={config.isActive ? 'ring-2 ring-green-500' : ''}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{config.name}</CardTitle>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => openEditDialog(config)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDeleteConfig(config.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground">
                    <p>Du {new Date(config.startDate).toLocaleDateString()} au {new Date(config.endDate).toLocaleDateString()}</p>
                    <p>{config.segments.length} segments</p>
                  </div>
                </CardContent>
              </Card>
            ))}

            {configs.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                Aucune configuration. Créez-en une !
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="bonuses" className="space-y-4">
          <div className="grid gap-4">
            {streakBonuses.map(bonus => (
              <Card key={bonus.id}>
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl font-bold text-orange-500">
                        {bonus.streakLevel}j
                      </div>
                      <div>
                        <p className="font-medium">{bonus.description}</p>
                        <p className="text-sm text-muted-foreground">
                          {bonus.bonusType === 'probability_boost' ? 'Boost probabilité' : 'Boost quantité'}: 
                          {' '}x{bonus.bonusValue}
                        </p>
                      </div>
                    </div>
                    <Switch
                      checked={bonus.isActive}
                      onCheckedChange={(checked) => handleUpdateStreakBonus(bonus, { isActive: checked })}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Config Dialog */}
      <Dialog open={showConfigDialog} onOpenChange={setShowConfigDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingConfig ? 'Modifier la configuration' : 'Nouvelle configuration'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label>Nom</Label>
                <Input value={formName} onChange={e => setFormName(e.target.value)} />
              </div>
              <div>
                <Label>Date de début</Label>
                <Input type="date" value={formStartDate} onChange={e => setFormStartDate(e.target.value)} />
              </div>
              <div>
                <Label>Date de fin</Label>
                <Input type="date" value={formEndDate} onChange={e => setFormEndDate(e.target.value)} />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Switch checked={formIsActive} onCheckedChange={setFormIsActive} />
              <Label>Active</Label>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Segments ({formSegments.reduce((s, seg) => s + seg.probability, 0)}% total)</Label>
                <Button variant="outline" size="sm" onClick={addSegment}>
                  <Plus className="h-4 w-4 mr-1" />
                  Ajouter
                </Button>
              </div>

              {formSegments.map((segment, index) => (
                <Card key={segment.id} className="p-3">
                  <div className="grid grid-cols-6 gap-2 items-end">
                    <div>
                      <Label className="text-xs">Type</Label>
                      <Select 
                        value={segment.type} 
                        onValueChange={v => updateSegment(index, { type: v as 'orydors' | 'xp' | 'item' })}
                      >
                        <SelectTrigger className="h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="orydors">Orydors</SelectItem>
                          <SelectItem value="xp">XP</SelectItem>
                          <SelectItem value="item">Item</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {segment.type === 'item' ? (
                      <div className="col-span-2">
                        <Label className="text-xs">Item</Label>
                        <Select 
                          value={segment.rewardTypeId || ''} 
                          onValueChange={v => {
                            const rt = rewardTypes.find(r => r.id === v);
                            updateSegment(index, { 
                              rewardTypeId: v, 
                              label: rt?.name || 'Item',
                              quantity: segment.quantity || 1
                            });
                          }}
                        >
                          <SelectTrigger className="h-8">
                            <SelectValue placeholder="Choisir..." />
                          </SelectTrigger>
                          <SelectContent>
                            {rewardTypes.map(rt => (
                              <SelectItem key={rt.id} value={rt.id}>{rt.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    ) : (
                      <div>
                        <Label className="text-xs">Valeur</Label>
                        <Input 
                          type="number" 
                          className="h-8"
                          value={segment.value || ''} 
                          onChange={e => updateSegment(index, { 
                            value: parseInt(e.target.value) || 0,
                            label: `${e.target.value} ${segment.type === 'orydors' ? 'Orydors' : 'XP'}`
                          })} 
                        />
                      </div>
                    )}

                    <div>
                      <Label className="text-xs">Prob. %</Label>
                      <Input 
                        type="number" 
                        className="h-8"
                        value={segment.probability} 
                        onChange={e => updateSegment(index, { probability: parseFloat(e.target.value) || 0 })} 
                      />
                    </div>

                    <div>
                      <Label className="text-xs">Couleur</Label>
                      <Input 
                        type="color" 
                        className="h-8 p-1"
                        value={segment.color} 
                        onChange={e => updateSegment(index, { color: e.target.value })} 
                      />
                    </div>

                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => removeSegment(index)}
                      className="h-8"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfigDialog(false)}>
              Annuler
            </Button>
            <Button onClick={handleSaveConfig}>
              {editingConfig ? 'Mettre à jour' : 'Créer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
