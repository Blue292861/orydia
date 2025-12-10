import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trash2, Plus, Sparkles, Check, ChevronsUpDown, Globe, BookOpen, Search } from 'lucide-react';
import { RewardType, LootTable } from '@/types/RewardType';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

type LootMode = 'global' | 'book';

export const LootTableEditor: React.FC = () => {
  const [lootMode, setLootMode] = useState<LootMode>('global');
  const [books, setBooks] = useState<any[]>([]);
  const [rewardTypes, setRewardTypes] = useState<RewardType[]>([]);
  const [selectedBookId, setSelectedBookId] = useState<string>('');
  const [silverLoot, setSilverLoot] = useState<LootTable[]>([]);
  const [goldLoot, setGoldLoot] = useState<LootTable[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookComboOpen, setBookComboOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchBooks();
    fetchRewardTypes();
  }, []);

  // Fetch loot tables when mode or selected book changes
  useEffect(() => {
    if (lootMode === 'global') {
      fetchGlobalLootTables();
    } else if (selectedBookId) {
      fetchBookLootTables(selectedBookId);
    } else {
      setSilverLoot([]);
      setGoldLoot([]);
    }
  }, [lootMode, selectedBookId]);

  const fetchBooks = async () => {
    try {
      const { data, error } = await supabase
        .from('books')
        .select('id, title, author')
        .order('created_at', { ascending: false });

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

  // Fetch GLOBAL items (book_id IS NULL)
  const fetchGlobalLootTables = async () => {
    try {
      const { data, error } = await supabase
        .from('loot_tables')
        .select('*')
        .is('book_id', null);

      if (error) throw error;

      setSilverLoot((data?.filter(l => l.chest_type === 'silver') || []) as LootTable[]);
      setGoldLoot((data?.filter(l => l.chest_type === 'gold') || []) as LootTable[]);
    } catch (error) {
      console.error('Error fetching global loot tables:', error);
      toast({ title: "Erreur", description: "Impossible de charger les items globaux", variant: "destructive" });
    }
  };

  // Fetch BOOK-SPECIFIC items
  const fetchBookLootTables = async (bookId: string) => {
    try {
      const { data, error } = await supabase
        .from('loot_tables')
        .select('*')
        .eq('book_id', bookId);

      if (error) throw error;

      setSilverLoot((data?.filter(l => l.chest_type === 'silver') || []) as LootTable[]);
      setGoldLoot((data?.filter(l => l.chest_type === 'gold') || []) as LootTable[]);
    } catch (error) {
      console.error('Error fetching book loot tables:', error);
      toast({ title: "Erreur", description: "Impossible de charger les tables de loot", variant: "destructive" });
    }
  };

  const addLootEntry = (chestType: 'silver' | 'gold') => {
    const newEntry: Partial<LootTable> = {
      book_id: lootMode === 'global' ? null : selectedBookId,
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

      // Delete existing entries based on mode
      if (lootMode === 'global') {
        const { error: deleteError } = await supabase
          .from('loot_tables')
          .delete()
          .is('book_id', null)
          .eq('chest_type', chestType);

        if (deleteError) throw deleteError;
      } else {
        const { error: deleteError } = await supabase
          .from('loot_tables')
          .delete()
          .eq('book_id', selectedBookId)
          .eq('chest_type', chestType);

        if (deleteError) throw deleteError;
      }

      // Insert new entries
      if (lootList.length > 0) {
        const { error: insertError } = await supabase
          .from('loot_tables')
          .insert(lootList.map(l => ({
            book_id: lootMode === 'global' ? null : l.book_id,
            chest_type: l.chest_type,
            reward_type_id: l.reward_type_id,
            drop_chance_percentage: l.drop_chance_percentage,
            min_quantity: l.min_quantity,
            max_quantity: l.max_quantity
          })));

        if (insertError) throw insertError;
      }

      toast({ 
        title: "Succès", 
        description: `Table de loot ${chestType === 'silver' ? 'argentée' : 'dorée'} ${lootMode === 'global' ? 'globale' : 'du livre'} sauvegardée` 
      });
    } catch (error) {
      console.error('Error saving loot tables:', error);
      toast({ title: "Erreur", description: "Impossible de sauvegarder", variant: "destructive" });
    }
  };

  const getRarityBackgroundClass = (rewardTypeId: string | null) => {
    const reward = rewardTypes.find(r => r.id === rewardTypeId);
    switch (reward?.rarity) {
      case 'common': return 'bg-gray-100 dark:bg-gray-800/50';
      case 'rare': return 'bg-blue-100 dark:bg-blue-950/50 border-blue-300 dark:border-blue-700';
      case 'epic': return 'bg-purple-100 dark:bg-purple-950/50 border-purple-300 dark:border-purple-700';
      case 'legendary': return 'bg-amber-100 dark:bg-amber-950/50 border-amber-400 dark:border-amber-600';
      default: return '';
    }
  };

  const simulateDrops = (lootList: LootTable[], rolls: number = 100) => {
    const results: Record<string, number> = {};
    let emptyChests = 0;

    for (let i = 0; i < rolls; i++) {
      let gotSomething = false;
      lootList.forEach(entry => {
        const roll = Math.random() * 100;
        if (roll <= entry.drop_chance_percentage) {
          const rewardName = rewardTypes.find(r => r.id === entry.reward_type_id)?.name || 'Unknown';
          results[rewardName] = (results[rewardName] || 0) + 1;
          gotSomething = true;
        }
      });
      if (!gotSomething) emptyChests++;
    }

    return { results, emptyChests };
  };

  const renderLootTable = (chestType: 'silver' | 'gold', lootList: LootTable[]) => {
    const { results: simulation, emptyChests } = simulateDrops(lootList);

    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            Chaque item a sa propre chance d'apparition (cumulative)
          </div>
          <Button onClick={() => addLootEntry(chestType)}>
            <Plus className="w-4 h-4 mr-2" />
            Ajouter
          </Button>
        </div>

        <div className="space-y-2">
          {lootList.map((entry, index) => (
            <Card key={index} className={getRarityBackgroundClass(entry.reward_type_id)}>
              <CardContent className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
                  <div className="md:col-span-2">
                    <Label>Récompense</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" role="combobox" className="w-full justify-between">
                          {entry.reward_type_id 
                            ? rewardTypes.find(r => r.id === entry.reward_type_id)?.name || 'Sélectionner...'
                            : 'Rechercher...'}
                          <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[300px] p-0 bg-popover z-[100]">
                        <Command>
                          <CommandInput placeholder="Rechercher une récompense..." />
                          <CommandList>
                            <CommandEmpty>Aucune récompense trouvée.</CommandEmpty>
                            <CommandGroup>
                              {rewardTypes.map(reward => (
                                <CommandItem
                                  key={reward.id}
                                  value={`${reward.name} ${reward.category}`}
                                  onSelect={() => updateLootEntry(chestType, index, 'reward_type_id', reward.id)}
                                >
                                  <Check className={cn("mr-2 h-4 w-4", entry.reward_type_id === reward.id ? "opacity-100" : "opacity-0")} />
                                  <span className="font-medium">{reward.name}</span>
                                  <span className="ml-2 text-sm text-muted-foreground">({reward.category})</span>
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div>
                    <Label>Chance %</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
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
                Simulation (100 ouvertures)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                {Object.entries(simulation).map(([name, count]) => (
                  <div key={name} className="p-2 bg-muted rounded">
                    <div className="font-medium">{name}</div>
                    <div className="text-muted-foreground">~{count} fois</div>
                  </div>
                ))}
                <div className="p-2 bg-muted/50 rounded border border-dashed">
                  <div className="font-medium">Coffres vides</div>
                  <div className="text-muted-foreground">~{emptyChests} fois (Orydors seuls)</div>
                </div>
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

      {/* Mode selector: Global vs Book-specific */}
      <Tabs value={lootMode} onValueChange={(v) => setLootMode(v as LootMode)}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="global" className="flex items-center gap-2">
            <Globe className="w-4 h-4" />
            Items Globaux
          </TabsTrigger>
          <TabsTrigger value="book" className="flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            Items par Livre
          </TabsTrigger>
        </TabsList>

        <TabsContent value="global" className="mt-4">
          <Card className="mb-4">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground">
                🌍 Ces items apparaîtront dans <strong>TOUS les coffres</strong>, peu importe le livre terminé.
              </p>
            </CardContent>
          </Card>

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
        </TabsContent>

        <TabsContent value="book" className="mt-4">
          <Card className="mb-4">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground mb-4">
                📖 Ces items n'apparaîtront <strong>QUE dans le coffre du livre sélectionné</strong> (en plus des items globaux).
              </p>

              <Label>Sélectionner un livre</Label>
              <Popover open={bookComboOpen} onOpenChange={setBookComboOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={bookComboOpen}
                    className="w-full justify-between"
                  >
                    {selectedBookId
                      ? books.find((book) => book.id === selectedBookId)?.title
                      : "Rechercher un livre..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[500px] p-0 bg-popover z-[100]">
                  <Command>
                    <CommandInput placeholder="Rechercher par titre ou auteur..." />
                    <CommandList>
                      <CommandEmpty>Aucun livre trouvé.</CommandEmpty>
                      <CommandGroup>
                        {books.map((book) => (
                          <CommandItem
                            key={book.id}
                            value={`${book.title} ${book.author}`}
                            onSelect={() => {
                              setSelectedBookId(book.id);
                              setBookComboOpen(false);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                selectedBookId === book.id ? "opacity-100" : "opacity-0"
                              )}
                            />
                            <div className="flex flex-col">
                              <span className="font-medium">{book.title}</span>
                              <span className="text-sm text-muted-foreground">{book.author}</span>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </CardContent>
          </Card>

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

          {!selectedBookId && (
            <div className="text-center py-8 text-muted-foreground">
              Sélectionnez un livre pour configurer ses items spécifiques
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
