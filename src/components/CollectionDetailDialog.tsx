import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { UserCollectionProgress } from '@/types/Collection';
import { claimCollectionReward } from '@/services/collectionService';
import { useAuth } from '@/contexts/AuthContext';
import { Gift, Check, Lock, Coins, Sparkles, Package } from 'lucide-react';
import { toast } from 'sonner';
import { ChestOpeningDialog } from './ChestOpeningDialog';
import { ChestRollResult } from '@/types/RewardType';

interface CollectionDetailDialogProps {
  progress: UserCollectionProgress | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRewardClaimed: () => void;
}

export const CollectionDetailDialog: React.FC<CollectionDetailDialogProps> = ({
  progress,
  open,
  onOpenChange,
  onRewardClaimed
}) => {
  const { user } = useAuth();
  const [claiming, setClaiming] = useState(false);
  const [showChestDialog, setShowChestDialog] = useState(false);
  const [chestResult, setChestResult] = useState<ChestRollResult | null>(null);

  if (!progress) return null;

  const { collection, totalCards, collectedCards, isComplete, chestClaimed, cards } = progress;

  const handleClaimReward = async () => {
    if (!user?.id || claiming) return;

    setClaiming(true);
    try {
      const result = await claimCollectionReward(user.id, collection.id);
      
      // Create chest result for animation
      const chestRollResult: ChestRollResult = {
        chestType: 'gold',
        orydors: result.orydors,
        orydorsVariation: 0,
        additionalRewards: [
          ...(result.xp > 0 ? [{
            type: 'xp',
            name: `${result.xp} XP`,
            quantity: 1,
            imageUrl: '/lovable-uploads/4a891ef6-ff72-4b5a-b33c-0dc33dd3aa26.png',
            rarity: 'epic' as const,
            rewardTypeId: ''
          }] : []),
          ...result.items.map(item => ({
            type: 'item',
            name: item.name,
            quantity: item.quantity,
            imageUrl: item.image_url,
            rarity: 'rare' as const,
            rewardTypeId: ''
          }))
        ]
      };

      setChestResult(chestRollResult);
      setShowChestDialog(true);
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error claiming reward:', error);
      toast.error(error.message || 'Erreur lors de la réclamation');
    } finally {
      setClaiming(false);
    }
  };

  const handleChestClose = () => {
    setShowChestDialog(false);
    setChestResult(null);
    onRewardClaimed();
  };

  const getRarityStyle = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'border-amber-500 bg-amber-500/10';
      case 'epic': return 'border-purple-500 bg-purple-500/10';
      case 'rare': return 'border-blue-500 bg-blue-500/10';
      default: return 'border-muted bg-muted/50';
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <img 
                src={collection.icon_url} 
                alt={collection.name} 
                className="w-12 h-12 object-contain rounded-lg"
              />
              <div>
                <DialogTitle>{collection.name}</DialogTitle>
                {collection.description && (
                  <p className="text-sm text-muted-foreground mt-1">{collection.description}</p>
                )}
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-4">
            {/* Progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium">Progression</span>
                <span className="text-muted-foreground">
                  {collectedCards}/{totalCards} cartes ({Math.round(progress.progress)}%)
                </span>
              </div>
              <Progress value={progress.progress} className="h-3" />
            </div>

            {/* Cards Grid */}
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {cards.map((cardData, index) => (
                <Card 
                  key={cardData.card.id || index} 
                  className={`overflow-hidden transition-all ${
                    cardData.owned 
                      ? getRarityStyle(cardData.card.rarity)
                      : 'opacity-40 grayscale border-dashed'
                  }`}
                >
                  <CardContent className="p-2">
                    <div className="aspect-square relative">
                      {cardData.owned ? (
                        <img
                          src={cardData.card.image_url}
                          alt={cardData.card.name}
                          className="w-full h-full object-cover rounded"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-muted rounded">
                          <Lock className="w-6 h-6 text-muted-foreground" />
                        </div>
                      )}
                      {cardData.owned && cardData.quantity > 1 && (
                        <Badge className="absolute bottom-1 right-1 text-xs px-1">
                          x{cardData.quantity}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs mt-1 truncate text-center">
                      {cardData.owned ? cardData.card.name : '???'}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Rewards Section */}
            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Package className="w-4 h-4" />
                Récompense de complétion
              </h3>
              <div className="flex flex-wrap gap-2 mb-4">
                {collection.orydors_reward > 0 && (
                  <Badge variant="outline" className="text-amber-600 border-amber-300">
                    <Coins className="w-3 h-3 mr-1" />
                    {collection.orydors_reward} Orydors
                  </Badge>
                )}
                {collection.xp_reward > 0 && (
                  <Badge variant="outline" className="text-purple-600 border-purple-300">
                    <Sparkles className="w-3 h-3 mr-1" />
                    {collection.xp_reward} XP
                  </Badge>
                )}
              </div>

              {/* Claim Button */}
              {isComplete && !chestClaimed ? (
                <Button 
                  onClick={handleClaimReward}
                  disabled={claiming}
                  className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                  size="lg"
                >
                  <Gift className="w-5 h-5 mr-2" />
                  {claiming ? 'Ouverture...' : 'Ouvrir le coffre de récompense'}
                </Button>
              ) : chestClaimed ? (
                <Button disabled className="w-full" variant="secondary">
                  <Check className="w-5 h-5 mr-2" />
                  Récompense déjà réclamée
                </Button>
              ) : (
                <Button disabled className="w-full" variant="outline">
                  <Lock className="w-5 h-5 mr-2" />
                  Compléter la collection pour débloquer
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Chest Opening Animation */}
      {chestResult && (
        <ChestOpeningDialog
          isOpen={showChestDialog}
          onClose={handleChestClose}
          chestType={chestResult.chestType}
          orydors={chestResult.orydors}
          orydorsVariation={chestResult.orydorsVariation}
          additionalRewards={chestResult.additionalRewards}
          bookTitle={`Collection: ${collection.name}`}
        />
      )}
    </>
  );
};
