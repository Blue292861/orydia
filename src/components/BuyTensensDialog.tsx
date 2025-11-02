
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Coins, Play, Clock } from 'lucide-react';
import { TENSENS_PACKS } from '@/data/tensensPacksData';
import { TensensPack } from '@/types/TensensPack';
import { TensensPackGrid } from './TensensPackGrid';
import { TensensDialogHeader } from './TensensDialogHeader';
import { TensensDialogFooter } from './TensensDialogFooter';
import { AdForTensens } from './AdForTensens';
import { TensensCodeRedemption } from './TensensCodeRedemption';
import { useUserStats } from '@/contexts/UserStatsContext';
import { useAuth } from '@/contexts/AuthContext';
import { AuthRequiredDialog } from './AuthRequiredDialog';

interface BuyTensensDialogProps {
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  showTrigger?: boolean;
}

export const BuyTensensDialog: React.FC<BuyTensensDialogProps> = ({ trigger, open, onOpenChange, showTrigger = true }) => {
  const [loading, setLoading] = useState<string | null>(null);
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = typeof open === 'boolean';
  const openState = isControlled ? (open as boolean) : internalOpen;
  const setOpenState = isControlled ? (onOpenChange || (() => {})) : setInternalOpen;
  const [showAd, setShowAd] = useState(false);
  const [canWatchAd, setCanWatchAd] = useState(true);
  const [remainingAds, setRemainingAds] = useState(5);
  const { userStats, addPointsForBook, checkDailyAdLimit, recordAdView } = useUserStats();
  const { user } = useAuth();
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [authMessage, setAuthMessage] = useState('');

  useEffect(() => {
    if (openState) {
      checkAdLimit();
    }
  }, [openState]);

  const checkAdLimit = async () => {
    const canWatch = await checkDailyAdLimit();
    setCanWatchAd(canWatch);
    
    // Get today's ad count to show remaining ads
    const { data } = await supabase.auth.getUser();
    if (data.user) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const { data: adViews } = await supabase
        .from('ad_views')
        .select('id')
        .eq('user_id', data.user.id)
        .eq('ad_type', 'tensens')
        .gte('viewed_at', today.toISOString())
        .lt('viewed_at', tomorrow.toISOString());

      setRemainingAds(5 - (adViews?.length || 0));
    }
  };

  const handlePurchase = async (pack: TensensPack) => {
    if (!user) {
      setAuthMessage("Pour acheter des Tensens, vous devez vous connecter.");
      setShowAuthDialog(true);
      setOpenState(false);
      return;
    }

    setLoading(pack.id);
    
    try {

      const { data, error } = await supabase.functions.invoke('create-tensens-checkout', {
        body: {
          pack_id: pack.id,
          pack_name: pack.name,
          tensens_amount: pack.tensens,
          price: pack.price
        }
      });

      if (error) throw error;

      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error: any) {
      toast({
        title: 'Erreur de paiement',
        description: `Impossible de créer la session de paiement : ${error.message}`,
        variant: 'destructive',
      });
    } finally {
      setLoading(null);
    }
  };

  const handleWatchAd = async () => {
    if (!user) {
      setAuthMessage("Pour regarder une publicité et gagner des Tensens gratuits, vous devez vous connecter.");
      setShowAuthDialog(true);
      setOpenState(false);
      return;
    }

    const canWatch = await checkDailyAdLimit();
    if (!canWatch) {
      toast({
        title: "Limite atteinte",
        description: "Vous avez déjà regardé 5 publicités aujourd'hui. Revenez demain pour en regarder d'autres !",
        variant: "destructive"
      });
      return;
    }
    setShowAd(true);
  };

  const handleAdCompleted = async () => {
    const success = await recordAdView();
    if (success) {
      // Add 10 Tensens to user's account
      addPointsForBook('ad-reward-' + Date.now(), 10);
      setShowAd(false);
      setOpenState(false);
      // Refresh ad limit check
      await checkAdLimit();
    } else {
      toast({
        title: "Erreur",
        description: "Impossible d'enregistrer votre récompense. Veuillez réessayer.",
        variant: "destructive"
      });
    }
  };

  const handleAdClosed = () => {
    setShowAd(false);
    toast({
      title: "Publicité fermée",
      description: "Vous devez regarder la publicité complètement pour obtenir vos Tensens gratuits.",
      variant: "destructive"
    });
  };

  if (showAd) {
    return (
      <AdForTensens 
        onAdCompleted={handleAdCompleted}
        onAdClosed={handleAdClosed}
      />
    );
  }

  return (
    <Dialog open={openState} onOpenChange={setOpenState}>
      {showTrigger && (
        <DialogTrigger asChild>
          {trigger || (
            <Button variant="outline" size="sm" className="ml-2">
              <Coins className="h-4 w-4 mr-1" />
              Acheter des Tensens
            </Button>
          )}
        </DialogTrigger>
      )}
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-to-b from-wood-50 via-wood-100 to-wood-200 border-2 border-gold-400 shadow-2xl">
        <TensensDialogHeader onClose={() => setOpenState(false)} />
        
        {/* Free Tensens section */}
        <div className="mb-4 p-3 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-300 rounded-lg">
          <div className="text-center">
            <h3 className="text-base font-bold text-green-800 mb-1">
              🎁 Tensens Gratuits !
            </h3>
            <p className="text-green-700 text-sm mb-2">
              Regardez une courte publicité et obtenez 10 Tensens gratuits
            </p>
            {canWatchAd ? (
              <div>
                <Button 
                  onClick={handleWatchAd}
                  className="bg-green-600 hover:bg-green-700 text-white font-medieval"
                >
                  <Play className="mr-2 h-4 w-4" />
                  Regarder une publicité (+10 Tensens)
                </Button>
                <p className="text-xs text-green-600 mt-2">
                  {remainingAds} publicité{remainingAds > 1 ? 's' : ''} restante{remainingAds > 1 ? 's' : ''} aujourd'hui
                </p>
              </div>
            ) : (
              <div>
                <Button 
                  disabled
                  className="bg-gray-400 text-white font-medieval cursor-not-allowed"
                >
                  <Clock className="mr-2 h-4 w-4" />
                  Limite quotidienne atteinte
                </Button>
                <p className="text-xs text-gray-600 mt-2">
                  Vous avez regardé vos 5 publicités quotidiennes. Revenez demain !
                </p>
              </div>
            )}
          </div>
        </div>
        
        {/* Code redemption section */}
        <div className="mb-4">
          <TensensCodeRedemption />
        </div>
        
        <TensensPackGrid
          packs={TENSENS_PACKS}
          loading={loading}
          onPurchase={handlePurchase}
        />
        
        <TensensDialogFooter />
      </DialogContent>

      {/* Dialog d'authentification requise */}
      <AuthRequiredDialog
        open={showAuthDialog}
        onOpenChange={setShowAuthDialog}
        message={authMessage}
      />
    </Dialog>
  );
};
