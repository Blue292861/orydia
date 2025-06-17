
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { ShoppingCart, Zap } from 'lucide-react';

const TENSENS_PACKS = [
  { id: 'pack-small', name: 'Pack Petit', tensens: 100, price: 199, description: '100 Tensens' },
  { id: 'pack-medium', name: 'Pack Moyen', tensens: 500, price: 899, description: '500 Tensens', popular: true },
  { id: 'pack-large', name: 'Pack Grand', tensens: 1000, price: 1599, description: '1000 Tensens' },
  { id: 'pack-mega', name: 'Pack Méga', tensens: 2500, price: 3499, description: '2500 Tensens', bonus: '+500 bonus' },
];

export const BuyTensensDialog: React.FC = () => {
  const [loading, setLoading] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const handlePurchase = async (pack: typeof TENSENS_PACKS[0]) => {
    setLoading(pack.id);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: 'Erreur',
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
        title: 'Erreur',
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
        <Button variant="outline" size="sm" className="ml-2">
          <ShoppingCart className="h-4 w-4 mr-1" />
          Acheter
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-500" />
            Acheter des Tensens
          </DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {TENSENS_PACKS.map((pack) => (
            <Card key={pack.id} className={`relative ${pack.popular ? 'ring-2 ring-blue-500' : ''}`}>
              {pack.popular && (
                <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-blue-500">
                  Populaire
                </Badge>
              )}
              <CardHeader className="text-center pb-2">
                <CardTitle className="text-lg">{pack.name}</CardTitle>
                <div className="flex items-center justify-center gap-1">
                  <img src="/lovable-uploads/4a891ef6-ff72-4b5a-b33c-0dc33dd3aa26.png" alt="Tensens" className="h-6 w-6" />
                  <span className="text-2xl font-bold text-yellow-600">{pack.tensens}</span>
                </div>
                {pack.bonus && (
                  <Badge variant="secondary" className="mt-1">
                    {pack.bonus}
                  </Badge>
                )}
              </CardHeader>
              <CardContent className="text-center">
                <div className="text-3xl font-bold mb-2">
                  {(pack.price / 100).toFixed(2)} €
                </div>
                <p className="text-sm text-muted-foreground mb-4">{pack.description}</p>
                <Button 
                  onClick={() => handlePurchase(pack)}
                  disabled={loading === pack.id}
                  className="w-full"
                >
                  {loading === pack.id ? 'Redirection...' : 'Acheter'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};
