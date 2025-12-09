import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Gift, Trash2, Plus, Users, Crown, User, X, Sparkles } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { createGift, getAllGifts, deleteGift, getGiftClaimStats } from '@/services/giftService';
import { AdminGift, GiftRewards, GiftRewardItem } from '@/types/Gift';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';


interface RewardType {
  id: string;
  name: string;
  image_url: string;
  category: string;
}

const GiftAdmin: React.FC = () => {
  const [gifts, setGifts] = useState<AdminGift[]>([]);
  const [claimCounts, setClaimCounts] = useState<Record<string, number>>({});
  const [rewardTypes, setRewardTypes] = useState<RewardType[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [orydors, setOrydors] = useState(0);
  const [xp, setXp] = useState(0);
  const [selectedItems, setSelectedItems] = useState<GiftRewardItem[]>([]);
  const [recipientType, setRecipientType] = useState<'all' | 'premium' | 'specific'>('all');
  const [specificEmails, setSpecificEmails] = useState<string[]>([]);
  const [expiresAt, setExpiresAt] = useState('');
  const [isPersistent, setIsPersistent] = useState(false);

  useEffect(() => {
    loadGifts();
    loadRewardTypes();
  }, []);

  const loadGifts = async () => {
    try {
      const data = await getAllGifts();
      setGifts(data);
      
      // Load claim counts
      const counts: Record<string, number> = {};
      for (const gift of data) {
        counts[gift.id] = await getGiftClaimStats(gift.id);
      }
      setClaimCounts(counts);
    } catch (error) {
      console.error('Error loading gifts:', error);
    }
  };

  const loadRewardTypes = async () => {
    const { data } = await supabase
      .from('reward_types')
      .select('id, name, image_url, category')
      .eq('is_active', true)
      .order('name');
    
    if (data) {
      setRewardTypes(data);
    }
  };

  const handleAddItem = (rewardTypeId: string) => {
    const rewardType = rewardTypes.find(rt => rt.id === rewardTypeId);
    if (!rewardType) return;

    const existing = selectedItems.find(i => i.reward_type_id === rewardTypeId);
    if (existing) {
      setSelectedItems(selectedItems.map(i => 
        i.reward_type_id === rewardTypeId 
          ? { ...i, quantity: i.quantity + 1 }
          : i
      ));
    } else {
      setSelectedItems([...selectedItems, {
        reward_type_id: rewardTypeId,
        quantity: 1,
        name: rewardType.name,
        image_url: rewardType.image_url
      }]);
    }
  };

  const handleRemoveItem = (rewardTypeId: string) => {
    setSelectedItems(selectedItems.filter(i => i.reward_type_id !== rewardTypeId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !message.trim() || (!isPersistent && !expiresAt)) {
      toast({ title: "Erreur", description: "Veuillez remplir tous les champs obligatoires", variant: "destructive" });
      return;
    }

    if (recipientType === 'specific' && specificEmails.length === 0) {
      toast({ title: "Erreur", description: "Veuillez sélectionner au moins un destinataire", variant: "destructive" });
      return;
    }

    setLoading(true);

    try {
      // For 'specific' recipient type, we store emails for now
      // The claim function will validate eligibility
      const recipientUserIds: string[] = [];

      const rewards: GiftRewards = {
        orydors: orydors || 0,
        xp: xp || 0,
        items: selectedItems
      };

      await createGift({
        title,
        message,
        rewards,
        recipient_type: recipientType,
        recipient_user_ids: recipientUserIds,
        expires_at: isPersistent ? null : new Date(expiresAt).toISOString(),
        is_persistent: isPersistent
      });

      toast({ title: "Succès", description: "Cadeau créé avec succès !" });
      
      // Reset form
      setTitle('');
      setMessage('');
      setOrydors(0);
      setXp(0);
      setSelectedItems([]);
      setRecipientType('all');
      setSpecificEmails([]);
      setExpiresAt('');
      setIsPersistent(false);
      setShowForm(false);
      
      loadGifts();
    } catch (error) {
      console.error('Error creating gift:', error);
      toast({ title: "Erreur", description: "Impossible de créer le cadeau", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (giftId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce cadeau ?')) return;
    
    try {
      await deleteGift(giftId);
      toast({ title: "Succès", description: "Cadeau supprimé" });
      loadGifts();
    } catch (error) {
      console.error('Error deleting gift:', error);
      toast({ title: "Erreur", description: "Impossible de supprimer", variant: "destructive" });
    }
  };

  const getRecipientIcon = (type: string) => {
    switch (type) {
      case 'all': return <Users className="w-4 h-4" />;
      case 'premium': return <Crown className="w-4 h-4" />;
      case 'specific': return <User className="w-4 h-4" />;
      default: return null;
    }
  };

  const getRecipientLabel = (type: string) => {
    switch (type) {
      case 'all': return 'Tous les utilisateurs';
      case 'premium': return 'Utilisateurs premium';
      case 'specific': return 'Utilisateurs spécifiques';
      default: return type;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-amber-100 flex items-center gap-2">
          <Gift className="w-6 h-6" />
          Gestion des Cadeaux
        </h2>
        <Button 
          onClick={() => setShowForm(!showForm)}
          className="bg-amber-600 hover:bg-amber-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nouveau cadeau
        </Button>
      </div>

      {showForm && (
        <Card className="bg-amber-950/30 border-amber-700/30">
          <CardHeader>
            <CardTitle className="text-amber-100">Créer un nouveau cadeau</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-amber-200">Titre *</Label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ex: Bienvenue sur Orydia !"
                    className="bg-amber-950/50 border-amber-700/50"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 bg-purple-950/30 rounded-lg border border-purple-800/30">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-purple-400" />
                      <Label className="text-purple-200">Cadeau persistant</Label>
                    </div>
                    <Switch checked={isPersistent} onCheckedChange={setIsPersistent} />
                  </div>
                </div>
              </div>

              {!isPersistent && (
                <div className="space-y-2">
                  <Label className="text-amber-200">Date d'expiration *</Label>
                  <Input
                    type="datetime-local"
                    value={expiresAt}
                    onChange={(e) => setExpiresAt(e.target.value)}
                    className="bg-amber-950/50 border-amber-700/50"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label className="text-amber-200">Message *</Label>
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Le message qui accompagnera le cadeau..."
                  rows={4}
                  className="bg-amber-950/50 border-amber-700/50"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-amber-200">Orydors</Label>
                  <Input
                    type="number"
                    value={orydors}
                    onChange={(e) => setOrydors(parseInt(e.target.value) || 0)}
                    min={0}
                    className="bg-amber-950/50 border-amber-700/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-amber-200">XP</Label>
                  <Input
                    type="number"
                    value={xp}
                    onChange={(e) => setXp(parseInt(e.target.value) || 0)}
                    min={0}
                    className="bg-amber-950/50 border-amber-700/50"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-amber-200">Ajouter des items</Label>
                <Select onValueChange={handleAddItem}>
                  <SelectTrigger className="bg-amber-950/50 border-amber-700/50">
                    <SelectValue placeholder="Sélectionner un item..." />
                  </SelectTrigger>
                  <SelectContent>
                    {rewardTypes.map((rt) => (
                      <SelectItem key={rt.id} value={rt.id}>
                        {rt.name} ({rt.category})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                {selectedItems.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedItems.map((item) => (
                      <Badge 
                        key={item.reward_type_id}
                        variant="secondary"
                        className="flex items-center gap-2 bg-amber-800/50"
                      >
                        {item.name} x{item.quantity}
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(item.reward_type_id)}
                          className="hover:text-red-400"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-amber-200">Destinataires</Label>
                <RadioGroup
                  value={recipientType}
                  onValueChange={(v) => setRecipientType(v as 'all' | 'premium' | 'specific')}
                  className="flex flex-col gap-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="all" id="all" />
                    <Label htmlFor="all" className="flex items-center gap-2 cursor-pointer">
                      <Users className="w-4 h-4" /> Tous les utilisateurs
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="premium" id="premium" />
                    <Label htmlFor="premium" className="flex items-center gap-2 cursor-pointer">
                      <Crown className="w-4 h-4" /> Utilisateurs premium uniquement
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="specific" id="specific" />
                    <Label htmlFor="specific" className="flex items-center gap-2 cursor-pointer">
                      <User className="w-4 h-4" /> Utilisateurs spécifiques
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {recipientType === 'specific' && (
                <div className="space-y-2">
                  <Label className="text-amber-200">Emails des destinataires (séparés par des virgules)</Label>
                  <Input
                    value={specificEmails.join(', ')}
                    onChange={(e) => setSpecificEmails(e.target.value.split(',').map(email => email.trim()).filter(Boolean))}
                    placeholder="user1@email.com, user2@email.com"
                    className="bg-amber-950/50 border-amber-700/50 text-amber-100"
                  />
                </div>
              )}

              <div className="flex gap-2">
                <Button type="submit" disabled={loading} className="bg-amber-600 hover:bg-amber-700">
                  {loading ? 'Création...' : 'Créer le cadeau'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Annuler
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {gifts.length === 0 ? (
          <Card className="bg-amber-950/20 border-amber-700/30">
            <CardContent className="py-8 text-center text-amber-300">
              Aucun cadeau créé pour le moment
            </CardContent>
          </Card>
        ) : (
          gifts.map((gift) => {
            const isExpired = !gift.is_persistent && gift.expires_at && new Date(gift.expires_at) < new Date();
            
            return (
              <Card 
                key={gift.id} 
                className={`bg-amber-950/20 border-amber-700/30 ${isExpired ? 'opacity-50' : ''}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-amber-100">{gift.title}</h3>
                        {gift.is_persistent && (
                          <Badge className="bg-purple-500/20 text-purple-300 text-xs"><Sparkles className="w-3 h-3 mr-1" />Persistant</Badge>
                        )}
                        {isExpired && (
                          <Badge variant="destructive" className="text-xs">Expiré</Badge>
                        )}
                      </div>
                      
                      <p className="text-sm text-amber-300 mb-2 line-clamp-2">{gift.message}</p>
                      
                      <div className="flex flex-wrap gap-2 mb-2">
                        {gift.rewards.orydors && gift.rewards.orydors > 0 && (
                          <Badge className="bg-amber-700/50">{gift.rewards.orydors} Orydors</Badge>
                        )}
                        {gift.rewards.xp && gift.rewards.xp > 0 && (
                          <Badge className="bg-blue-700/50">{gift.rewards.xp} XP</Badge>
                        )}
                        {gift.rewards.items?.map((item) => (
                          <Badge key={item.reward_type_id} className="bg-purple-700/50">
                            {item.name || 'Item'} x{item.quantity}
                          </Badge>
                        ))}
                      </div>
                      
                      <div className="flex items-center gap-4 text-xs text-amber-400">
                        <span className="flex items-center gap-1">
                          {getRecipientIcon(gift.recipient_type)}
                          {getRecipientLabel(gift.recipient_type)}
                        </span>
                        {gift.expires_at && (
                          <span>Expire: {format(new Date(gift.expires_at), 'dd MMM yyyy HH:mm', { locale: fr })}</span>
                        )}
                        <span
                          {claimCounts[gift.id] || 0} réclamé(s)
                        </span>
                      </div>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(gift.id)}
                      className="text-red-400 hover:text-red-300 hover:bg-red-950/30"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};

export default GiftAdmin;
