
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Coins, Play, Clock } from 'lucide-react';
import { ORYDORS_PACKS } from '@/data/orydorsPacksData';
import { OrydorsPack } from '@/types/OrydorsPack';
import { OrydorsPackGrid } from './OrydorsPackGrid';
import { OrydorsDialogHeader } from './OrydorsDialogHeader';
import { OrydorsDialogFooter } from './OrydorsDialogFooter';
import { AdForOrydors } from './AdForOrydors';
import { OrydorsCodeRedemption } from './OrydorsCodeRedemption';
import { useUserStats } from '@/contexts/UserStatsContext';
import { useAuth } from '@/contexts/AuthContext';
import { AuthRequiredDialog } from './AuthRequiredDialog';

interface BuyOrydorsDialogProps {
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  showTrigger?: boolean;
}

export const BuyOrydorsDialog: React.FC<BuyOrydorsDialogProps> = ({ trigger, open, onOpenChange, showTrigger = true }) => {
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
        .eq('ad_type', 'orydors')
        .gte('viewed_at', today.toISOString())
        .lt('viewed_at', tomorrow.toISOString());

      setRemainingAds(5 - (adViews?.length || 0));
    }
  };

  const handlePurchase = async (pack: OrydorsPack) => {
    if (!user) {
      setAuthMessage("Pour acheter des Orydors, vous devez vous connecter.");
      setShowAuthDialog(true);
      setOpenState(false);
      return;
    }

    setLoading(pack.id);
    
    try {

      const { data, error } = await supabase.functions.invoke('create-orydors-checkout', {
        body: {
          pack_id: pack.id,
          pack_name: pack.name,
          orydors_amount: pack.orydors,
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
      setAuthMessage("Pour regarder une publicité et gagner des Orydors gratuits, vous devez vous connecter.");
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
      // Add 10 Orydors to user's account
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
      description: "Vous devez regarder la publicité complètement pour obtenir vos Orydors gratuits.",
      variant: "destructive"
    });
  };

  if (showAd) {
    return (
      <AdForOrydors 
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
              Acheter des Orydors
            </Button>
          )}
        </DialogTrigger>
      )}
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-to-b from-wood-50 via-wood-100 to-wood-200 border-2 border-gold-400 shadow-2xl">
        <OrydorsDialogHeader onClose={() => setOpenState(false)} />
        
        {/* Free Orydors section */}
        <div className="mb-4 p-3 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-300 rounded-lg">
          <div className="text-center">
            <h3 className="text-base font-bold text-green-800 mb-1">
              🎁 Orydors Gratuits !
            </h3>
            <p className="text-green-700 text-sm mb-2">
              Regardez une courte publicité et obtenez 10 Orydors gratuits
            </p>
            {canWatchAd ? (
              <div>
                <Button 
                  onClick={handleWatchAd}
                  className="bg-green-600 hover:bg-green-700 text-white font-medieval"
                >
                  <Play className="mr-2 h-4 w-4" />
                  Regarder une publicité (+10 Orydors)
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
          <OrydorsCodeRedemption />
        </div>
        
        <OrydorsPackGrid
          packs={ORYDORS_PACKS}
          loading={loading}
          onPurchase={handlePurchase}
        />
        
        <OrydorsDialogFooter />
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
