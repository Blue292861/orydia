import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trash2, Plus, Sparkles } from 'lucide-react';
import { RewardType, LootTable } from '@/types/RewardType';

export const LootTableEditor: React.FC = () => {
  const [books, setBooks] = useState<any[]>([]);
  const [rewardTypes, setRewardTypes] = useState<RewardType[]>([]);
  const [selectedBookId, setSelectedBookId] = useState<string>('');
  const [silverLoot, setSilverLoot] = useState<LootTable[]>([]);
  const [goldLoot, setGoldLoot] = useState<LootTable[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchBooks();
    fetchRewardTypes();
  }, []);

  useEffect(() => {
    if (selectedBookId) {
      fetchLootTables(selectedBookId);
    }
  }, [selectedBookId]);

  const fetchBooks = async () => {
    try {
      const { data, error } = await supabase
        .from('books')
        .select('id, title, author')
        .order('title');

      if (error) throw error;
      setBooks(data || []);
    } catch (error) {
      console.error('Error fetching books:', error);
      toast({ title: "Erreur", description: "Impossible de charger les livres", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const fetchRewardTypes = async () => {
    try {
      const { data, error } = await supabase
        .from('reward_types')
        .select('*')
        .eq('is_active', true)
        .order('category');

      if (error) throw error;
      setRewardTypes((data || []) as RewardType[]);
    } catch (error) {
      console.error('Error fetching reward types:', error);
    }
  };

  const fetchLootTables = async (bookId: string) => {
    try {
      const { data, error } = await supabase
        .from('loot_tables')
        .select('*')
        .eq('book_id', bookId);

      if (error) throw error;

      setSilverLoot((data?.filter(l => l.chest_type === 'silver') || []) as LootTable[]);
      setGoldLoot((data?.filter(l => l.chest_type === 'gold') || []) as LootTable[]);
    } catch (error) {
      console.error('Error fetching loot tables:', error);
      toast({ title: "Erreur", description: "Impossible de charger les tables de loot", variant: "destructive" });
    }
  };

  const addLootEntry = (chestType: 'silver' | 'gold') => {
    const newEntry: Partial<LootTable> = {
      book_id: selectedBookId,
      chest_type: chestType,
      reward_type_id: rewardTypes[0]?.id || '',
      drop_chance_percentage: 10,
      min_quantity: 1,
      max_quantity: 1
    };

    if (chestType === 'silver') {
      setSilverLoot([...silverLoot, newEntry as LootTable]);
    } else {
      setGoldLoot([...goldLoot, newEntry as LootTable]);
    }
  };

  const updateLootEntry = (chestType: 'silver' | 'gold', index: number, field: string, value: any) => {
    const updateList = chestType === 'silver' ? [...silverLoot] : [...goldLoot];
    updateList[index] = { ...updateList[index], [field]: value };

    if (chestType === 'silver') {
      setSilverLoot(updateList);
    } else {
      setGoldLoot(updateList);
    }
  };

  const removeLootEntry = (chestType: 'silver' | 'gold', index: number) => {
    if (chestType === 'silver') {
      setSilverLoot(silverLoot.filter((_, i) => i !== index));
    } else {
      setGoldLoot(goldLoot.filter((_, i) => i !== index));
    }
  };

  const saveLootTables = async (chestType: 'silver' | 'gold') => {
    try {
      const lootList = chestType === 'silver' ? silverLoot : goldLoot;

      // Delete existing entries for this book and chest type
      const { error: deleteError } = await supabase
        .from('loot_tables')
        .delete()
        .eq('book_id', selectedBookId)
        .eq('chest_type', chestType);

      if (deleteError) throw deleteError;

      // Insert new entries
      if (lootList.length > 0) {
        const { error: insertError } = await supabase
          .from('loot_tables')
          .insert(lootList.map(l => ({
            book_id: l.book_id,
            chest_type: l.chest_type,
            reward_type_id: l.reward_type_id,
            drop_chance_percentage: l.drop_chance_percentage,
            min_quantity: l.min_quantity,
            max_quantity: l.max_quantity
          })));

        if (insertError) throw insertError;
      }

      toast({ title: "Succès", description: `Table de loot ${chestType === 'silver' ? 'argentée' : 'dorée'} sauvegardée` });
    } catch (error) {
      console.error('Error saving loot tables:', error);
      toast({ title: "Erreur", description: "Impossible de sauvegarder", variant: "destructive" });
    }
  };

  const calculateTotalDropRate = (lootList: LootTable[]) => {
    return lootList.reduce((sum, item) => sum + (item.drop_chance_percentage || 0), 0);
  };

  const simulateDrops = (lootList: LootTable[], rolls: number = 100) => {
    const results: Record<string, number> = {};

    for (let i = 0; i < rolls; i++) {
      lootList.forEach(entry => {
        const roll = Math.random() * 100;
        if (roll <= entry.drop_chance_percentage) {
          const rewardName = rewardTypes.find(r => r.id === entry.reward_type_id)?.name || 'Unknown';
          results[rewardName] = (results[rewardName] || 0) + 1;
        }
      });
    }

    return results;
  };

  const renderLootTable = (chestType: 'silver' | 'gold', lootList: LootTable[]) => {
    const totalDropRate = calculateTotalDropRate(lootList);
    const simulation = simulateDrops(lootList);

    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="text-sm">
            <span className="font-medium">Total des chances: </span>
            <span className={totalDropRate > 100 ? 'text-red-500 font-bold' : 'text-green-500'}>
              {totalDropRate.toFixed(2)}%
            </span>
            {totalDropRate > 100 && <span className="text-red-500 ml-2">⚠️ Dépasse 100%</span>}
          </div>
          <Button onClick={() => addLootEntry(chestType)}>
            <Plus className="w-4 h-4 mr-2" />
            Ajouter
          </Button>
        </div>

        <div className="space-y-2">
          {lootList.map((entry, index) => (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
                  <div className="md:col-span-2">
                    <Label>Récompense</Label>
                    <Select
                      value={entry.reward_type_id || ''}
                      onValueChange={(value) => updateLootEntry(chestType, index, 'reward_type_id', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {rewardTypes.map(reward => (
                          <SelectItem key={reward.id} value={reward.id}>
                            {reward.name} ({reward.category})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Drop %</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      value={entry.drop_chance_percentage}
                      onChange={(e) => updateLootEntry(chestType, index, 'drop_chance_percentage', parseFloat(e.target.value))}
                    />
                  </div>

                  <div>
                    <Label>Min</Label>
                    <Input
                      type="number"
                      min="1"
                      value={entry.min_quantity}
                      onChange={(e) => updateLootEntry(chestType, index, 'min_quantity', parseInt(e.target.value))}
                    />
                  </div>

                  <div>
                    <Label>Max</Label>
                    <Input
                      type="number"
                      min="1"
                      value={entry.max_quantity}
                      onChange={(e) => updateLootEntry(chestType, index, 'max_quantity', parseInt(e.target.value))}
                    />
                  </div>

                  <Button variant="ghost" size="icon" onClick={() => removeLootEntry(chestType, index)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {lootList.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Simulation (100 rolls)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                {Object.entries(simulation).map(([name, count]) => (
                  <div key={name} className="p-2 bg-muted rounded">
                    <div className="font-medium">{name}</div>
                    <div className="text-muted-foreground">{count} fois</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Button onClick={() => saveLootTables(chestType)} className="w-full">
          Sauvegarder la table {chestType === 'silver' ? 'argentée' : 'dorée'}
        </Button>
      </div>
    );
  };

  if (loading) return <div className="p-4">Chargement...</div>;

  return (
    <div className="p-4 space-y-6">
      <h2 className="text-2xl font-bold">Éditeur de Tables de Loot</h2>

      <div className="max-w-md">
        <Label>Sélectionner un livre</Label>
        <Select value={selectedBookId} onValueChange={setSelectedBookId}>
          <SelectTrigger>
            <SelectValue placeholder="Choisir un livre..." />
          </SelectTrigger>
          <SelectContent>
            {books.map(book => (
              <SelectItem key={book.id} value={book.id}>
                {book.title} - {book.author}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedBookId && (
        <Tabs defaultValue="silver">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="silver">Coffre Argenté (Freemium)</TabsTrigger>
            <TabsTrigger value="gold">Coffre Doré (Premium)</TabsTrigger>
          </TabsList>

          <TabsContent value="silver">
            {renderLootTable('silver', silverLoot)}
          </TabsContent>

          <TabsContent value="gold">
            {renderLootTable('gold', goldLoot)}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};
