import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Gift, Clock, Coins, Sparkles, Package } from 'lucide-react';
import { AdminGift } from '@/types/Gift';
import { claimGift } from '@/services/giftService';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ChestOpeningDialog } from './ChestOpeningDialog';
import { ChestReward } from '@/types/RewardType';

interface GiftDetailDialogProps {
  gift: AdminGift;
  open: boolean;
  onClose: () => void;
  onClaimed: () => void;
}

const GiftDetailDialog: React.FC<GiftDetailDialogProps> = ({
  gift,
  open,
  onClose,
  onClaimed
}) => {
  const [claiming, setClaiming] = useState(false);
  const [showChestAnimation, setShowChestAnimation] = useState(false);
  const [chestRewards, setChestRewards] = useState<ChestReward[]>([]);
  const [orydorsReward, setOrydorsReward] = useState(0);

  const handleClaim = async () => {
    setClaiming(true);
    
    try {
      const result = await claimGift(gift.id);
      
      if (result.success && result.rewards) {
        const rewards: ChestReward[] = [];
        
        if (result.rewards.items) {
          for (const item of result.rewards.items) {
            rewards.push({
              rewardTypeId: item.reward_type_id,
              name: item.name || 'Item',
              imageUrl: item.image_url || '',
              quantity: item.quantity,
              rarity: 'common',
              type: 'item'
            });
          }
        }
        
        if (result.rewards.xp && result.rewards.xp > 0) {
          rewards.push({
            rewardTypeId: 'xp',
            name: `${result.rewards.xp} XP`,
            imageUrl: '',
            quantity: result.rewards.xp,
            rarity: 'common',
            type: 'item'
          });
        }
        
        setChestRewards(rewards);
        setOrydorsReward(result.rewards.orydors || 0);
        setShowChestAnimation(true);
      } else {
        toast({ title: "Erreur", description: result.error || "Impossible de récupérer le cadeau", variant: "destructive" });
      }
    } catch (error) {
      console.error('Error claiming gift:', error);
      toast({ title: "Erreur", description: "Une erreur est survenue", variant: "destructive" });
    } finally {
      setClaiming(false);
    }
  };

  const handleChestClose = () => {
    setShowChestAnimation(false);
    toast({ title: "Félicitations !", description: "Vos récompenses ont été ajoutées" });
    onClaimed();
  };

  return (
    <>
      <Dialog open={open && !showChestAnimation} onOpenChange={onClose}>
        <DialogContent className="bg-gradient-to-br from-amber-950 to-orange-950 border-amber-700/50 max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-amber-100">
              <Gift className="w-5 h-5 text-amber-400" />
              {gift.title}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="bg-amber-950/50 rounded-lg p-4 border border-amber-700/30">
              <p className="text-amber-200 whitespace-pre-wrap">{gift.message}</p>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-medium text-amber-300 flex items-center gap-2">
                <Package className="w-4 h-4" />
                Contenu du cadeau
              </h4>
              
              <div className="bg-amber-900/30 rounded-lg p-3 border border-amber-700/30">
                <div className="flex flex-wrap gap-2">
                  {gift.rewards.orydors && gift.rewards.orydors > 0 && (
                    <Badge className="bg-amber-600/80"><Coins className="w-3 h-3 mr-1" />{gift.rewards.orydors} Orydors</Badge>
                  )}
                  {gift.rewards.xp && gift.rewards.xp > 0 && (
                    <Badge className="bg-blue-600/80"><Sparkles className="w-3 h-3 mr-1" />{gift.rewards.xp} XP</Badge>
                  )}
                  {gift.rewards.items?.map((item, index) => (
                    <Badge key={index} className="bg-purple-600/80"><Package className="w-3 h-3 mr-1" />{item.name || 'Item'} x{item.quantity}</Badge>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm text-amber-400">
              <Clock className="w-4 h-4" />
              <span>Expire le {format(new Date(gift.expires_at), "d MMMM yyyy", { locale: fr })}</span>
            </div>

            <Button onClick={handleClaim} disabled={claiming} className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500">
              {claiming ? 'Récupération...' : <><Gift className="w-4 h-4 mr-2" />Récupérer les récompenses</>}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <ChestOpeningDialog open={showChestAnimation} onClose={handleChestClose} chestType="silver" orydors={orydorsReward} orydorsVariation={0} additionalRewards={chestRewards} bookTitle={gift.title} />
    </>
  );
};

export default GiftDetailDialog;
