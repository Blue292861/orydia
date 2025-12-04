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
import { Trash2, Edit, Plus, Upload, HelpCircle, ChevronDown, ChevronUp, Copy } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

// Guide des métadonnées par catégorie
const METADATA_GUIDES: Record<string, { description: string; fields: { name: string; type: string; description: string; required?: boolean }[]; example: object }> = {
  currency: {
    description: "Les métadonnées pour les monnaies définissent le comportement et l'affichage de la devise.",
    fields: [
      { name: "multiplier", type: "number", description: "Multiplicateur de base (ex: 1.5 pour +50%)", required: false },
      { name: "icon", type: "string", description: "Nom de l'icône à afficher", required: false },
      { name: "color", type: "string", description: "Couleur d'affichage (hex ou nom)", required: false },
    ],
    example: {
      multiplier: 1,
      icon: "coins",
      color: "#FFD700"
    }
  },
  fragment: {
    description: "Les fragments sont des morceaux collectables qui peuvent être combinés pour obtenir une récompense.",
    fields: [
      { name: "fragmentsRequired", type: "number", description: "Nombre de fragments nécessaires pour compléter", required: true },
      { name: "rewardOnComplete", type: "string", description: "Type de récompense obtenue (ex: 'premium_month')", required: true },
      { name: "glowEffect", type: "boolean", description: "Activer l'effet lumineux", required: false },
    ],
    example: {
      fragmentsRequired: 12,
      rewardOnComplete: "premium_month",
      glowEffect: true
    }
  },
  card: {
    description: "Les cartes collectables représentent des personnages, auteurs ou éléments de l'univers.",
    fields: [
      { name: "collection", type: "string", description: "Nom de la collection (ex: 'Auteurs', 'Personnages')", required: true },
      { name: "series", type: "string", description: "Série ou édition de la carte", required: false },
      { name: "bookId", type: "string (UUID)", description: "ID du livre associé", required: false },
      { name: "authorName", type: "string", description: "Nom de l'auteur représenté", required: false },
      { name: "quote", type: "string", description: "Citation ou texte affiché sur la carte", required: false },
      { name: "stats", type: "object", description: "Statistiques de la carte (force, sagesse, etc.)", required: false },
    ],
    example: {
      collection: "Auteurs Légendaires",
      series: "Édition Fondateur",
      authorName: "Maxime Laugé",
      quote: "Les mots sont des clés vers d'autres mondes.",
      stats: {
        creativity: 95,
        influence: 88,
        legacy: 92
      }
    }
  },
  item: {
    description: "Les objets sont des items utilisables ou consommables avec des effets spécifiques.",
    fields: [
      { name: "consumable", type: "boolean", description: "L'objet est-il consommable (disparaît après usage)", required: true },
      { name: "effect", type: "string", description: "Type d'effet (ex: 'unlock_chest', 'bonus_xp', 'cosmetic')", required: true },
      { name: "effectValue", type: "number", description: "Valeur de l'effet (ex: multiplicateur, durée)", required: false },
      { name: "stackable", type: "boolean", description: "Peut-on empiler plusieurs exemplaires", required: false },
      { name: "maxStack", type: "number", description: "Nombre maximum dans une pile", required: false },
      { name: "usageLimit", type: "number", description: "Nombre d'utilisations avant épuisement", required: false },
    ],
    example: {
      consumable: true,
      effect: "unlock_chest",
      effectValue: 1,
      stackable: true,
      maxStack: 99
    }
  }
};

export const RewardTypesAdmin: React.FC = () => {
  const [rewardTypes, setRewardTypes] = useState<RewardType[]>([]);
  const [collections, setCollections] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingReward, setEditingReward] = useState<RewardType | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'card' as 'currency' | 'fragment' | 'card' | 'item',
    rarity: 'common' as 'common' | 'rare' | 'epic' | 'legendary',
    image_url: '',
    metadata: '{}',
    collection_id: null as string | null
  });

  useEffect(() => {
    fetchRewardTypes();
    fetchCollections();
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

  const fetchCollections = async () => {
    try {
      const { data, error } = await supabase
        .from('collections')
        .select('id, name')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setCollections(data || []);
    } catch (error) {
      console.error('Error fetching collections:', error);
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
            collection_id: formData.category === 'card' ? formData.collection_id : null,
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
            metadata: metadataObj,
            collection_id: formData.category === 'card' ? formData.collection_id : null
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
      metadata: JSON.stringify(reward.metadata, null, 2),
      collection_id: (reward as any).collection_id || null
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
    setIsGuideOpen(false);
    setFormData({
      name: '',
      description: '',
      category: 'card',
      rarity: 'common',
      image_url: '',
      metadata: '{}',
      collection_id: null
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

              {/* Collection dropdown for cards */}
              {formData.category === 'card' && (
                <div>
                  <Label>Collection (optionnel)</Label>
                  <Select
                    value={formData.collection_id || 'none'}
                    onValueChange={(value) => setFormData(prev => ({ 
                      ...prev, 
                      collection_id: value === 'none' ? null : value 
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Aucune collection" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Aucune collection</SelectItem>
                      {collections.map(c => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">
                    Associer cette carte à une collection pour le système de collection
                  </p>
                </div>
              )}

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

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Métadonnées (JSON)</Label>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsGuideOpen(!isGuideOpen)}
                    className="text-xs gap-1"
                  >
                    <HelpCircle className="w-3 h-3" />
                    Guide
                    {isGuideOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  </Button>
                </div>

                <Collapsible open={isGuideOpen} onOpenChange={setIsGuideOpen}>
                  <CollapsibleContent>
                    {METADATA_GUIDES[formData.category] && (
                      <div className="bg-muted/50 border rounded-lg p-3 mb-2 text-xs space-y-3">
                        <p className="text-muted-foreground italic">
                          {METADATA_GUIDES[formData.category].description}
                        </p>
                        
                        <div>
                          <h4 className="font-semibold mb-2">Champs disponibles :</h4>
                          <div className="space-y-1.5">
                            {METADATA_GUIDES[formData.category].fields.map((field) => (
                              <div key={field.name} className="flex flex-col gap-0.5 bg-background/50 rounded p-1.5">
                                <div className="flex items-center gap-2">
                                  <code className="text-amber-600 font-mono text-[11px]">{field.name}</code>
                                  <span className="text-muted-foreground text-[10px]">({field.type})</span>
                                  {field.required && (
                                    <span className="text-red-500 text-[10px]">*requis</span>
                                  )}
                                </div>
                                <span className="text-muted-foreground text-[10px]">{field.description}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-semibold">Exemple :</h4>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-6 text-[10px] gap-1"
                              onClick={() => {
                                setFormData(prev => ({
                                  ...prev,
                                  metadata: JSON.stringify(METADATA_GUIDES[formData.category].example, null, 2)
                                }));
                                toast({ title: "Exemple copié", description: "L'exemple a été appliqué aux métadonnées" });
                              }}
                            >
                              <Copy className="w-3 h-3" />
                              Utiliser cet exemple
                            </Button>
                          </div>
                          <pre className="bg-background/80 rounded p-2 overflow-x-auto font-mono text-[10px]">
                            {JSON.stringify(METADATA_GUIDES[formData.category].example, null, 2)}
                          </pre>
                        </div>
                      </div>
                    )}
                  </CollapsibleContent>
                </Collapsible>

                <Textarea
                  value={formData.metadata}
                  onChange={(e) => setFormData(prev => ({ ...prev, metadata: e.target.value }))}
                  rows={4}
                  placeholder='{"key": "value"}'
                  className="font-mono text-xs"
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
