
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Coins } from 'lucide-react';
import { ORYDORS_PACKS } from '@/data/orydorsPacksData';
import { OrydorsPack } from '@/types/OrydorsPack';
import { OrydorsPackGrid } from './OrydorsPackGrid';
import { OrydorsDialogHeader } from './OrydorsDialogHeader';
import { OrydorsDialogFooter } from './OrydorsDialogFooter';
import { OrydorsCodeRedemption } from './OrydorsCodeRedemption';
import { FortuneWheel } from './FortuneWheel';
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
  const { user } = useAuth();
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [authMessage, setAuthMessage] = useState('');

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
        
        {/* Fortune Wheel section */}
        {user && (
          <div className="mb-4">
            <FortuneWheel onSpinComplete={() => {}} />
          </div>
        )}
        
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
