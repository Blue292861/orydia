
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Coins, Crown, Shield, Sword } from 'lucide-react';

const TENSENS_PACKS = [
  { 
    id: 'pack-small', 
    name: 'Bourse d\'Aventurier', 
    tensens: 331, 
    price: 199, 
    description: '331 Tensens',
    originalPrice: 249,
    icon: <Coins className="h-8 w-8" />
  },
  { 
    id: 'pack-medium', 
    name: 'Coffre du Marchand', 
    tensens: 1494, 
    price: 899, 
    description: '1 494 Tensens', 
    popular: true,
    originalPrice: 1199,
    savings: '25% d\'économie',
    icon: <Shield className="h-8 w-8" />
  },
  { 
    id: 'pack-large', 
    name: 'Trésor du Héros', 
    tensens: 2656, 
    price: 1599, 
    description: '2 656 Tensens',
    originalPrice: 2199,
    savings: '27% d\'économie',
    icon: <Sword className="h-8 w-8" />
  },
  { 
    id: 'pack-mega', 
    name: 'Fortune Royale', 
    tensens: 5810, 
    price: 3499, 
    description: '5 810 Tensens', 
    bonus: '+1 000 Tensens bonus',
    originalPrice: 4999,
    savings: '30% d\'économie',
    icon: <Crown className="h-8 w-8" />
  },
];

interface BuyTensensDialogProps {
  trigger?: React.ReactNode;
}

export const BuyTensensDialog: React.FC<BuyTensensDialogProps> = ({ trigger }) => {
  const [loading, setLoading] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const handlePurchase = async (pack: typeof TENSENS_PACKS[0]) => {
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

      // Créer une session de paiement Stripe
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
        <DialogHeader className="text-center">
          <DialogTitle className="flex items-center justify-center gap-3 text-2xl font-medieval text-forest-800">
            <Coins className="h-6 w-6 text-gold-500" />
            Comptoir du Changeur de Monnaie
            <Coins className="h-6 w-6 text-gold-500" />
          </DialogTitle>
          <p className="text-forest-600 font-serif mt-2">
            Échangez vos pièces d'or contre la monnaie sacrée d'Orydia
          </p>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mt-6">
          {TENSENS_PACKS.map((pack) => (
            <Card key={pack.id} className={`relative bg-gradient-to-b from-wood-100 to-wood-200 border-2 ${pack.popular ? 'border-gold-400 ring-2 ring-gold-300 scale-105' : 'border-wood-400'} hover:border-gold-500 transition-all duration-300 hover:shadow-xl hover:shadow-gold-400/20 group`}>
              {pack.popular && (
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-gold-500 to-gold-600 text-white font-medieval border border-gold-400 shadow-lg">
                  ⭐ Choix du Royaume
                </Badge>
              )}
              
              <CardHeader className="text-center pb-3 bg-gradient-to-b from-forest-700 to-forest-800 text-white rounded-t-lg relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-gold-400/10 via-transparent to-gold-400/10" />
                <div className="relative z-10">
                  <div className="flex justify-center mb-2 text-gold-300">
                    {pack.icon}
                  </div>
                  <CardTitle className="text-lg font-medieval">{pack.name}</CardTitle>
                  <div className="flex items-center justify-center gap-2 mt-2">
                    <img src="/lovable-uploads/4a891ef6-ff72-4b5a-b33c-0dc33dd3aa26.png" alt="Tensens" className="h-6 w-6" />
                    <span className="text-2xl font-bold text-gold-300">{pack.tensens.toLocaleString()}</span>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="text-center p-4 space-y-3">
                {pack.bonus && (
                  <Badge variant="secondary" className="bg-green-100 text-green-800 border border-green-300 font-medieval">
                    🎁 {pack.bonus}
                  </Badge>
                )}
                {pack.savings && (
                  <Badge variant="outline" className="text-orange-700 border-orange-400 bg-orange-50 font-medieval">
                    💰 {pack.savings}
                  </Badge>
                )}
                
                <div className="space-y-1">
                  {pack.originalPrice && (
                    <div className="text-sm text-muted-foreground line-through font-serif">
                      {(pack.originalPrice / 100).toFixed(2)} €
                    </div>
                  )}
                  <div className="text-3xl font-bold text-forest-800 font-medieval">
                    {(pack.price / 100).toFixed(2)} €
                  </div>
                </div>
                
                <Button 
                  onClick={() => handlePurchase(pack)}
                  disabled={loading === pack.id}
                  className="w-full bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-white font-medieval border-2 border-gold-400 hover:border-gold-300 shadow-lg hover:shadow-gold-400/50 transition-all duration-300"
                  size="sm"
                >
                  {loading === pack.id ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Invocation...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Coins className="h-4 w-4" />
                      Acquérir
                    </div>
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="mt-6 p-4 bg-gradient-to-r from-forest-100 via-forest-50 to-forest-100 rounded-lg border border-forest-300 parchment-texture">
          <p className="text-sm text-center text-forest-700 font-serif">
            🛡️ Paiement sécurisé par les mages de Stripe • 🔐 Vos secrets sont protégés par magie ancienne • ⚡ Tensens transférés instantanément dans votre bourse
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
