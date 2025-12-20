import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Coins, Key, CreditCard } from "lucide-react";
import { depositToVault, getUserDuplicateCards } from "@/services/guildVaultService";
import { UserDuplicateCard } from "@/types/GuildVault";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface GuildVaultDepositProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  guildId: string;
  onSuccess: () => void;
}

export function GuildVaultDeposit({ open, onOpenChange, guildId, onSuccess }: GuildVaultDepositProps) {
  const [orydorsAmount, setOrydorsAmount] = useState("");
  const [keysAmount, setKeysAmount] = useState("");
  const [userOrydors, setUserOrydors] = useState(0);
  const [userKeys, setUserKeys] = useState(0);
  const [duplicateCards, setDuplicateCards] = useState<UserDuplicateCard[]>([]);
  const [selectedCards, setSelectedCards] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      loadUserResources();
    }
  }, [open]);

  const loadUserResources = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const [statsRes, cardsRes] = await Promise.all([
      supabase.from('user_stats').select('total_points, aildor_keys').eq('user_id', user.id).single(),
      getUserDuplicateCards()
    ]);

    if (statsRes.data) {
      setUserOrydors(statsRes.data.total_points || 0);
      setUserKeys((statsRes.data as any).aildor_keys || 0);
    }
    setDuplicateCards(cardsRes);
  };

  const handleDepositOrydors = async () => {
    const amount = parseInt(orydorsAmount);
    if (!amount || amount <= 0) return;

    setLoading(true);
    try {
      await depositToVault(guildId, { resource_type: 'orydors', quantity: amount });
      toast.success(`${amount} Orydors déposés dans le coffre`);
      setOrydorsAmount("");
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDepositKeys = async () => {
    const amount = parseInt(keysAmount);
    if (!amount || amount <= 0) return;

    setLoading(true);
    try {
      await depositToVault(guildId, { resource_type: 'aildor_key', quantity: amount });
      toast.success(`${amount} Clé(s) d'Aildor déposée(s)`);
      setKeysAmount("");
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDepositCard = async (rewardTypeId: string, quantity: number) => {
    setLoading(true);
    try {
      await depositToVault(guildId, { resource_type: 'card', quantity, reward_type_id: rewardTypeId });
      toast.success('Carte déposée dans le coffre');
      onSuccess();
      loadUserResources();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Déposer dans le coffre</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="orydors">
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="orydors" className="gap-1">
              <Coins className="h-4 w-4" /> Orydors
            </TabsTrigger>
            <TabsTrigger value="keys" className="gap-1">
              <Key className="h-4 w-4" /> Clés
            </TabsTrigger>
            <TabsTrigger value="cards" className="gap-1">
              <CreditCard className="h-4 w-4" /> Cartes
            </TabsTrigger>
          </TabsList>

          <TabsContent value="orydors" className="space-y-4 mt-4">
            <div>
              <Label>Montant à déposer</Label>
              <Input
                type="number"
                value={orydorsAmount}
                onChange={(e) => setOrydorsAmount(e.target.value)}
                placeholder="0"
                max={userOrydors}
              />
              <p className="text-sm text-muted-foreground mt-1">
                Disponible : {userOrydors.toLocaleString()} Orydors
              </p>
            </div>
            <Button 
              onClick={handleDepositOrydors} 
              disabled={loading || !orydorsAmount || parseInt(orydorsAmount) <= 0}
              className="w-full"
            >
              Déposer
            </Button>
          </TabsContent>

          <TabsContent value="keys" className="space-y-4 mt-4">
            <div>
              <Label>Nombre de clés</Label>
              <Input
                type="number"
                value={keysAmount}
                onChange={(e) => setKeysAmount(e.target.value)}
                placeholder="0"
                max={userKeys}
              />
              <p className="text-sm text-muted-foreground mt-1">
                Disponible : {userKeys} Clé(s) d'Aildor
              </p>
            </div>
            <Button 
              onClick={handleDepositKeys} 
              disabled={loading || !keysAmount || parseInt(keysAmount) <= 0}
              className="w-full"
            >
              Déposer
            </Button>
          </TabsContent>

          <TabsContent value="cards" className="mt-4">
            <p className="text-sm text-muted-foreground mb-4">
              Seuls vos doubles peuvent être déposés (vous gardez toujours au moins 1 exemplaire)
            </p>
            {duplicateCards.length === 0 ? (
              <p className="text-center py-4 text-muted-foreground">Aucun double disponible</p>
            ) : (
              <div className="grid grid-cols-2 gap-3 max-h-64 overflow-auto">
                {duplicateCards.map((card) => (
                  <div key={card.reward_type_id} className="border rounded-lg p-2">
                    <img 
                      src={card.reward_type.image_url} 
                      alt={card.reward_type.name}
                      className="w-full h-20 object-cover rounded mb-2"
                    />
                    <p className="text-xs font-medium truncate">{card.reward_type.name}</p>
                    <p className="text-xs text-muted-foreground mb-2">
                      {card.available_to_deposit} dispo
                    </p>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleDepositCard(card.reward_type_id, 1)}
                      disabled={loading}
                      className="w-full text-xs"
                    >
                      Déposer 1
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
