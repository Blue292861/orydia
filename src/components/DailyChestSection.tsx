import React, { useState, useEffect } from 'react';
import { Gift, Clock, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useUserStats } from '@/contexts/UserStatsContext';
import { canClaimToday, getTimeUntilNextChest, formatTimeRemaining, getActiveConfig } from '@/services/dailyChestService';
import { ChestOpeningDialog } from '@/components/ChestOpeningDialog';
import { toast } from 'sonner';

interface DailyChestSectionProps {
  onChestClaimed?: () => void;
}

export const DailyChestSection: React.FC<DailyChestSectionProps> = ({ onChestClaimed }) => {
  const { user } = useAuth();
  const { loadUserStats } = useUserStats();
  const [canClaim, setCanClaim] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isClaiming, setIsClaiming] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState('');
  const [showChestDialog, setShowChestDialog] = useState(false);
  const [chestReward, setChestReward] = useState<{
    orydors: number;
    item?: { id: string; name: string; imageUrl: string; rarity: string; quantity: number };
  } | null>(null);
  const [hasActiveConfig, setHasActiveConfig] = useState(false);

  useEffect(() => {
    const checkAvailability = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        const [claimable, config] = await Promise.all([
          canClaimToday(user.id),
          getActiveConfig()
        ]);
        setCanClaim(claimable);
        setHasActiveConfig(!!config);
      } catch (error) {
        console.error('Error checking daily chest availability:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAvailability();
  }, [user]);

  useEffect(() => {
    if (canClaim) return;

    const updateTimer = () => {
      const remaining = getTimeUntilNextChest();
      setTimeRemaining(formatTimeRemaining(remaining));
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [canClaim]);

  const handleClaimChest = async () => {
    if (!user || isClaiming) return;

    setIsClaiming(true);
    try {
      const { data, error } = await supabase.functions.invoke('claim-daily-chest', {
        headers: {
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        }
      });

      if (error) throw error;

      if (data.error) {
        if (data.alreadyClaimed) {
          setCanClaim(false);
        }
        toast.error(data.error);
        return;
      }

      setChestReward({
        orydors: data.orydors,
        item: data.item
      });
      setShowChestDialog(true);
      setCanClaim(false);
      loadUserStats();
      onChestClaimed?.();

    } catch (error) {
      console.error('Error claiming daily chest:', error);
      toast.error('Erreur lors de la réclamation du coffre');
    } finally {
      setIsClaiming(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-gradient-to-br from-amber-900/30 to-yellow-900/20 rounded-xl p-4 border border-amber-700/30 animate-pulse">
        <div className="h-20" />
      </div>
    );
  }

  return (
    <>
      <div className="bg-gradient-to-br from-amber-900/40 to-yellow-900/30 rounded-xl p-4 border border-amber-600/40 relative overflow-hidden">
        {/* Decorative sparkles */}
        <div className="absolute top-2 right-2 text-amber-400/40">
          <Sparkles className="h-6 w-6" />
        </div>
        
        <div className="flex items-center gap-4">
          {/* Chest icon */}
          <div className={`relative ${canClaim ? 'animate-bounce' : ''}`}>
            <div className={`w-16 h-16 rounded-xl flex items-center justify-center ${
              canClaim 
                ? 'bg-gradient-to-br from-amber-500 to-yellow-600 shadow-lg shadow-amber-500/30' 
                : 'bg-gradient-to-br from-gray-600 to-gray-700'
            }`}>
              <Gift className={`h-8 w-8 ${canClaim ? 'text-amber-100' : 'text-gray-400'}`} />
            </div>
            {canClaim && (
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full animate-pulse" />
            )}
          </div>

          {/* Content */}
          <div className="flex-1">
            <h3 className="font-bold text-amber-100 text-lg">Coffre Quotidien</h3>
            {canClaim ? (
              <p className="text-amber-200/80 text-sm">
                Un coffre gratuit vous attend !
              </p>
            ) : (
              <div className="flex items-center gap-2 text-amber-200/60 text-sm">
                <Clock className="h-4 w-4" />
                <span>Prochain coffre dans {timeRemaining}</span>
              </div>
            )}
          </div>

          {/* Button */}
          <Button
            onClick={handleClaimChest}
            disabled={!canClaim || isClaiming || !hasActiveConfig}
            className={`${
              canClaim && hasActiveConfig
                ? 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-amber-950 font-bold shadow-lg shadow-amber-500/30'
                : 'bg-gray-700 text-gray-400'
            }`}
          >
            {isClaiming ? 'Ouverture...' : canClaim ? 'Ouvrir !' : 'Réclamé'}
          </Button>
        </div>

        {!hasActiveConfig && canClaim && (
          <p className="text-amber-200/50 text-xs mt-2 text-center">
            Aucune configuration active pour aujourd'hui
          </p>
        )}
      </div>

      {/* Chest Opening Dialog */}
      {chestReward && (
        <ChestOpeningDialog
          isOpen={showChestDialog}
          onClose={() => {
            setShowChestDialog(false);
            setChestReward(null);
          }}
          chestType="gold"
          orydors={chestReward.orydors}
          orydorsVariation={100}
          additionalRewards={chestReward.item ? [{
            type: 'item' as const,
            name: chestReward.item.name,
            quantity: chestReward.item.quantity,
            imageUrl: chestReward.item.imageUrl,
            rarity: chestReward.item.rarity as 'common' | 'rare' | 'epic' | 'legendary',
            rewardTypeId: chestReward.item.id
          }] : []}
          bookTitle="Coffre Quotidien"
        />
      )}
    </>
  );
};
