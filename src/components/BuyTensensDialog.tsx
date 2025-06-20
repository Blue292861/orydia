
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Coins } from 'lucide-react';
import { TENSENS_PACKS } from '@/data/tensensPacksData';
import { TensensPack } from '@/types/TensensPack';
import { TensensPackGrid } from './TensensPackGrid';
import { TensensDialogHeader } from './TensensDialogHeader';
import { TensensDialogFooter } from './TensensDialogFooter';

interface BuyTensensDialogProps {
  trigger?: React.ReactNode;
}

export const BuyTensensDialog: React.FC<BuyTensensDialogProps> = ({ trigger }) => {
  const [loading, setLoading] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

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
