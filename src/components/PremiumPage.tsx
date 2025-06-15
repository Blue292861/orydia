
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Star, Check } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

export const PremiumPage: React.FC = () => {
  const { subscription, manageSubscription } = useAuth();

  const handleCheckout = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout');
      if (error) {
        throw error;
      }
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error: any) {
      console.error('Error creating checkout session:', error);
      toast({
        title: "Erreur de paiement",
        description: "Impossible de démarrer la session de paiement. Veuillez réessayer.",
        variant: "destructive",
      });
    }
  };

  const features = [
    'Accès illimité aux livres',
    'Accès anticipé aux nouvelles sorties',
    'Contenu exclusif premium',
    'Expérience de lecture sans publicité',
    'Support client prioritaire',
    'Badges premium spéciaux'
  ];

  return (
    <div className="space-y-6 pb-20">
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Star className="h-8 w-8 text-yellow-500" />
          <h2 className="text-3xl font-bold">Abonnement Premium</h2>
          <Star className="h-8 w-8 text-yellow-500" />
        </div>
        <p className="text-muted-foreground">Débloquez tout le potentiel de votre expérience de lecture</p>
      </div>

      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Plan Premium</CardTitle>
          <div className="text-4xl font-bold text-primary">9,99€/mois</div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center gap-3">
                <Check className="h-5 w-5 text-green-500" />
                <span>{feature}</span>
              </div>
            ))}
          </div>
          
          {subscription.isPremium ? (
            <Button className="w-full" size="lg" onClick={manageSubscription}>
              Gérer mon abonnement
            </Button>
          ) : (
            <Button className="w-full" size="lg" onClick={handleCheckout}>
              Passer à Premium
            </Button>
          )}
          
          <p className="text-xs text-center text-muted-foreground">
            Résiliez à tout moment. Garantie de remboursement de 30 jours.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pourquoi choisir Premium ?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Rejoignez des milliers de lecteurs qui ont amélioré leur expérience de lecture avec nos fonctionnalités premium. 
            Accédez à du contenu exclusif, des fonctionnalités avancées et un support prioritaire.
          </p>
          <div className="bg-secondary/20 p-4 rounded-lg">
            <p className="text-sm">
              <strong>Offre limitée :</strong> Obtenez votre premier mois pour seulement 4,99€ ! 
              Utilisez le code LECTEUR50 lors du paiement.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
