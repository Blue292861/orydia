import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Coins, Key, CreditCard } from "lucide-react";
import { withdrawFromVault } from "@/services/guildVaultService";
import { getGuildMembers } from "@/services/guildService";
import { GuildVault, GuildVaultCard } from "@/types/GuildVault";
import { GuildMember } from "@/types/Guild";
import { toast } from "sonner";

interface GuildVaultWithdrawProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  guildId: string;
  vault: GuildVault | null;
  cards: GuildVaultCard[];
  onSuccess: () => void;
}

export function GuildVaultWithdraw({ open, onOpenChange, guildId, vault, cards, onSuccess }: GuildVaultWithdrawProps) {
  const [members, setMembers] = useState<GuildMember[]>([]);
  const [selectedMember, setSelectedMember] = useState("");
  const [orydorsAmount, setOrydorsAmount] = useState("");
  const [keysAmount, setKeysAmount] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      loadMembers();
    }
  }, [open, guildId]);

  const loadMembers = async () => {
    try {
      const data = await getGuildMembers(guildId);
      setMembers(data);
    } catch (error) {
      console.error('Error loading members:', error);
    }
  };

  const getMemberName = (member: GuildMember) => {
    return member.profile?.username || member.profile?.first_name || 'Membre';
  };

  const handleWithdrawOrydors = async () => {
    if (!selectedMember || !orydorsAmount) return;
    const amount = parseInt(orydorsAmount);
    if (amount <= 0) return;

    setLoading(true);
    try {
      await withdrawFromVault(guildId, {
        resource_type: 'orydors',
        quantity: amount,
        recipient_id: selectedMember
      });
      const member = members.find(m => m.user_id === selectedMember);
      toast.success(`${amount} Orydors attribués à ${getMemberName(member!)}`);
      setOrydorsAmount("");
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdrawKeys = async () => {
    if (!selectedMember || !keysAmount) return;
    const amount = parseInt(keysAmount);
    if (amount <= 0) return;

    setLoading(true);
    try {
      await withdrawFromVault(guildId, {
        resource_type: 'aildor_key',
        quantity: amount,
        recipient_id: selectedMember
      });
      const member = members.find(m => m.user_id === selectedMember);
      toast.success(`${amount} Clé(s) attribuée(s) à ${getMemberName(member!)}`);
      setKeysAmount("");
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleWithdrawCard = async (rewardTypeId: string) => {
    if (!selectedMember) {
      toast.error('Sélectionnez un membre');
      return;
    }

    setLoading(true);
    try {
      await withdrawFromVault(guildId, {
        resource_type: 'card',
        quantity: 1,
        recipient_id: selectedMember,
        reward_type_id: rewardTypeId
      });
      const member = members.find(m => m.user_id === selectedMember);
      toast.success(`Carte attribuée à ${getMemberName(member!)}`);
      onSuccess();
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
          <DialogTitle>Attribuer des ressources</DialogTitle>
        </DialogHeader>

        <div className="mb-4">
          <Label>Destinataire</Label>
          <Select value={selectedMember} onValueChange={setSelectedMember}>
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner un membre" />
            </SelectTrigger>
            <SelectContent>
              {members.map((member) => (
                <SelectItem key={member.user_id} value={member.user_id}>
                  {getMemberName(member)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

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
              <Label>Montant</Label>
              <Input
                type="number"
                value={orydorsAmount}
                onChange={(e) => setOrydorsAmount(e.target.value)}
                placeholder="0"
                max={vault?.orydors || 0}
              />
              <p className="text-sm text-muted-foreground mt-1">
                Dans le coffre : {vault?.orydors?.toLocaleString() || 0}
              </p>
            </div>
            <Button 
              onClick={handleWithdrawOrydors} 
              disabled={loading || !selectedMember || !orydorsAmount}
              className="w-full"
            >
              Attribuer
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
                max={vault?.aildor_keys || 0}
              />
              <p className="text-sm text-muted-foreground mt-1">
                Dans le coffre : {vault?.aildor_keys || 0}
              </p>
            </div>
            <Button 
              onClick={handleWithdrawKeys} 
              disabled={loading || !selectedMember || !keysAmount}
              className="w-full"
            >
              Attribuer
            </Button>
          </TabsContent>

          <TabsContent value="cards" className="mt-4">
            {!selectedMember && (
              <p className="text-center py-4 text-muted-foreground">
                Sélectionnez d'abord un destinataire
              </p>
            )}
            {selectedMember && cards.length === 0 && (
              <p className="text-center py-4 text-muted-foreground">Aucune carte dans le coffre</p>
            )}
            {selectedMember && cards.length > 0 && (
              <div className="grid grid-cols-2 gap-3 max-h-64 overflow-auto">
                {cards.map((card) => (
                  <div key={card.id} className="border rounded-lg p-2">
                    <img 
                      src={card.reward_type?.image_url} 
                      alt={card.reward_type?.name}
                      className="w-full h-20 object-cover rounded mb-2"
                    />
                    <p className="text-xs font-medium truncate">{card.reward_type?.name}</p>
                    <p className="text-xs text-muted-foreground mb-2">x{card.quantity}</p>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleWithdrawCard(card.reward_type_id)}
                      disabled={loading}
                      className="w-full text-xs"
                    >
                      Attribuer 1
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
