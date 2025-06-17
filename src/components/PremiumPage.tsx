
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Star, Check, Crown } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const PremiumPage: React.FC = () => {
  const { subscription, manageSubscription } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  const features = [
    'Accès illimité à tous les livres',
    'Accès anticipé aux nouveautés',
    'Contenu exclusif premium',
    'Expérience de lecture sans publicité',
    'Support client prioritaire',
    'Badges premium exclusifs',
    'Téléchargement hors ligne',
    'Synchronisation multi-appareils'
  ];

  return (
    <div className="space-y-6 pb-20">
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Crown className="h-8 w-8 text-yellow-500" />
          <h2 className="text-3xl font-bold">Abonnement Premium</h2>
          <Crown className="h-8 w-8 text-yellow-500" />
        </div>
        <p className="text-muted-foreground text-lg">
          Débloquez tout le potentiel de votre expérience de lecture
        </p>
      </div>

      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl flex items-center justify-center gap-2">
            <Star className="h-6 w-6 text-yellow-500" />
            Plan Premium
          </CardTitle>
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground line-through">
              14,99€/mois
            </div>
            <div className="text-4xl font-bold text-primary">9,99€/mois</div>
            <div className="text-sm text-green-600 font-medium">
              Économisez 33% ! Offre limitée
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center gap-3">
                <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                <span>{feature}</span>
              </div>
            ))}
          </div>
          
          {subscription.isPremium ? (
            <Button className="w-full" size="lg" onClick={manageSubscription}>
              <Crown className="h-4 w-4 mr-2" />
              Gérer mon abonnement Premium
            </Button>
          ) : (
            <Button className="w-full" size="lg" onClick={handleCheckout} disabled={loading}>
              {loading ? 'Redirection vers le paiement...' : 'Passer à Premium maintenant'}
            </Button>
          )}
          
          <p className="text-xs text-center text-muted-foreground">
            Résiliez à tout moment • Garantie de remboursement de 30 jours • Paiement sécurisé
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pourquoi choisir Premium ?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Rejoignez des milliers de lecteurs qui ont transformé leur expérience de lecture avec nos 
            fonctionnalités premium. Accédez à du contenu exclusif, des fonctionnalités avancées et 
            un support prioritaire.
          </p>
          <div className="bg-gradient-to-r from-orange-100 to-yellow-100 p-4 rounded-lg border border-orange-200">
            <p className="text-sm">
              <strong>🎉 Offre de lancement :</strong> Obtenez votre premier mois pour seulement 4,99€ ! 
              Utilisez le code <code className="bg-white px-2 py-1 rounded font-mono">LECTEUR50</code> lors du paiement.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="text-center p-4 bg-secondary/10 rounded-lg">
              <div className="text-2xl font-bold text-primary">10 000+</div>
              <div className="text-sm text-muted-foreground">Livres disponibles</div>
            </div>
            <div className="text-center p-4 bg-secondary/10 rounded-lg">
              <div className="text-2xl font-bold text-primary">50+</div>
              <div className="text-sm text-muted-foreground">Nouveautés chaque mois</div>
            </div>
            <div className="text-center p-4 bg-secondary/10 rounded-lg">
              <div className="text-2xl font-bold text-primary">4.8★</div>
              <div className="text-sm text-muted-foreground">Note moyenne des utilisateurs</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
