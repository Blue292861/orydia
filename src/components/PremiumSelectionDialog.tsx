import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Crown, Check, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface PremiumSelectionDialogProps {
  trigger: React.ReactNode;
}

export const PremiumSelectionDialog: React.FC<PremiumSelectionDialogProps> = ({ trigger }) => {
  const [loading, setLoading] = useState<'monthly' | 'yearly' | null>(null);
  const [open, setOpen] = useState(false);

  const handleCheckout = async (planType: 'monthly' | 'yearly') => {
    setLoading(planType);
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { planType }
      });
      if (error) {
        throw error;
      }
      if (data.url) {
        // Ouvrir le checkout dans un nouvel onglet
        window.open(data.url, '_blank');
        setOpen(false);
      }
    } catch (error: any) {
      console.error('Error creating checkout session:', error);
      toast({
        title: "Erreur de paiement",
        description: "Impossible de démarrer la session de paiement. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setLoading(null);
    }
  };

  const monthlyFeatures = [
    'Accès illimité à tous les livres',
    'Expérience sans publicité',
    'Support client prioritaire',
    'Badges premium exclusifs'
  ];

  const yearlyFeatures = [
    'Tous les avantages du mensuel',
    'Accès anticipé aux nouveautés',
    'Contenu exclusif premium',
    'Économie de 19€88 sur l\'année'
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl flex items-center justify-center gap-2">
            <Crown className="h-6 w-6 text-yellow-500" />
            Choisissez votre abonnement Premium
            <Crown className="h-6 w-6 text-yellow-500" />
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid md:grid-cols-2 gap-6 mt-6">
          {/* Plan Mensuel */}
          <Card className="border-primary/20 bg-gradient-to-br from-blue-50 to-blue-100/50 relative">
            <CardHeader className="text-center">
              <CardTitle className="text-xl flex items-center justify-center gap-2">
                <Sparkles className="h-5 w-5 text-blue-500" />
                Premium Mensuel
              </CardTitle>
              <div className="space-y-2">
                <div className="text-3xl font-bold text-primary">9€99</div>
                <div className="text-sm text-muted-foreground">par mois</div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                {monthlyFeatures.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>
              
              <Button 
                className="w-full" 
                onClick={() => handleCheckout('monthly')}
                disabled={loading !== null}
              >
                {loading === 'monthly' ? 'Redirection...' : 'Choisir le mensuel'}
              </Button>
              
              <p className="text-xs text-center text-muted-foreground">
                Résiliable à tout moment
              </p>
            </CardContent>
          </Card>

          {/* Plan Annuel */}
          <Card className="border-yellow-400 bg-gradient-to-br from-yellow-50 to-amber-100/50 relative">
            {/* Badge économie */}
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
              <div className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                💰 ÉCONOMISEZ 19€88
              </div>
            </div>
            
            <CardHeader className="text-center pt-6">
              <CardTitle className="text-xl flex items-center justify-center gap-2">
                <Crown className="h-5 w-5 text-yellow-600" />
                Premium Annuel
              </CardTitle>
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground line-through">119€88</div>
                <div className="text-3xl font-bold text-yellow-700">100€</div>
                <div className="text-sm text-muted-foreground">pour l'année complète</div>
                <div className="text-xs text-green-600 font-medium">
                  Soit 8€33/mois au lieu de 9€99
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                {yearlyFeatures.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>
              
              <Button 
                className="w-full bg-yellow-600 hover:bg-yellow-700" 
                onClick={() => handleCheckout('yearly')}
                disabled={loading !== null}
              >
                {loading === 'yearly' ? 'Redirection...' : 'Choisir l\'annuel - MEILLEUR PRIX'}
              </Button>
              
              <p className="text-xs text-center text-muted-foreground">
                Paiement unique • Résiliable à tout moment
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6 p-4 bg-muted/30 rounded-lg">
          <p className="text-xs text-center text-muted-foreground">
            ✅ Paiement sécurisé via Stripe • 30 jours satisfait ou remboursé • Activation immédiate
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};