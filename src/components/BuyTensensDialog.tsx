
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Coins, Play } from 'lucide-react';
import { TENSENS_PACKS } from '@/data/tensensPacksData';
import { TensensPack } from '@/types/TensensPack';
import { TensensPackGrid } from './TensensPackGrid';
import { TensensDialogHeader } from './TensensDialogHeader';
import { TensensDialogFooter } from './TensensDialogFooter';
import { AdForTensens } from './AdForTensens';
import { useUserStats } from '@/contexts/UserStatsContext';

interface BuyTensensDialogProps {
  trigger?: React.ReactNode;
}

export const BuyTensensDialog: React.FC<BuyTensensDialogProps> = ({ trigger }) => {
  const [loading, setLoading] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [showAd, setShowAd] = useState(false);
  const { userStats, addPointsForBook } = useUserStats();

  const handlePurchase = async (pack: TensensPack) => {
    setLoading(pack.id);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: 'Connexion requise',
          description: 'Vous devez être connecté pour acheter des Tensens.',
          variant: 'destructive',
        });
        return;
      }

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

  const handleWatchAd = () => {
    setShowAd(true);
  };

  const handleAdCompleted = () => {
    // Add 10 Tensens to user's account
    addPointsForBook('ad-reward-' + Date.now(), 10);
    setShowAd(false);
    setOpen(false);
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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="ml-2">
            <Coins className="h-4 w-4 mr-1" />
            Acheter des Tensens
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-5xl bg-gradient-to-b from-wood-50 via-wood-100 to-wood-200 border-2 border-gold-400 shadow-2xl">
        <TensensDialogHeader onClose={() => setOpen(false)} />
        
        {/* Free Tensens section */}
        <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-lg">
          <div className="text-center">
            <h3 className="text-lg font-bold text-green-800 mb-2">
              🎁 Tensens Gratuits !
            </h3>
            <p className="text-green-700 mb-3">
              Regardez une courte publicité et obtenez 10 Tensens gratuits
            </p>
            <Button 
              onClick={handleWatchAd}
              className="bg-green-600 hover:bg-green-700 text-white font-medieval"
            >
              <Play className="mr-2 h-4 w-4" />
              Regarder une publicité (+10 Tensens)
            </Button>
          </div>
        </div>
        
        <TensensPackGrid
          packs={TENSENS_PACKS}
          loading={loading}
          onPurchase={handlePurchase}
        />
        
        <TensensDialogFooter />
      </DialogContent>
    </Dialog>
  );
};
