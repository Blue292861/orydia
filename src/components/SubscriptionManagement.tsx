import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Crown, AlertTriangle, CheckCircle, Calendar } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface SubscriptionManagementProps {
  subscription: {
    isPremium: boolean;
    subscriptionTier: string | null;
    subscriptionEnd: string | null;
    cancel_at_period_end?: boolean;
    cancellation_date?: string | null;
  };
  onSubscriptionUpdate: () => void;
}

export const SubscriptionManagement: React.FC<SubscriptionManagementProps> = ({
  subscription,
  onSubscriptionUpdate
}) => {
  const { manageSubscription } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleCancelSubscription = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('cancel-subscription');
      
      if (error) throw error;
      
      toast({
        title: "Résiliation programmée",
        description: data.message,
      });
      
      onSubscriptionUpdate();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de résilier l'abonnement",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!subscription.isPremium) {
    return null;
  }

  const endDate = subscription.subscriptionEnd ? new Date(subscription.subscriptionEnd) : null;
  const isCancelled = subscription.cancel_at_period_end;

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Crown className="h-5 w-5 text-yellow-500" />
          Gestion de l'abonnement
          {isCancelled ? (
            <Badge variant="outline" className="text-orange-600 border-orange-600">
              Résiliation programmée
            </Badge>
          ) : (
            <Badge variant="outline" className="text-green-600 border-green-600">
              Actif
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Plan actuel</p>
            <p className="font-semibold">{subscription.subscriptionTier}</p>
          </div>
          {endDate && (
            <div>
              <p className="text-sm text-muted-foreground">
                {isCancelled ? "Se termine le" : "Prochain renouvellement"}
              </p>
              <p className="font-semibold flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {endDate.toLocaleDateString('fr-FR')}
              </p>
            </div>
          )}
        </div>

        {isCancelled ? (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Votre abonnement a été résilié et se terminera le{' '}
              <strong>{endDate?.toLocaleDateString('fr-FR')}</strong>.
              Vous conservez l'accès premium jusqu'à cette date.
            </AlertDescription>
          </Alert>
        ) : (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Votre abonnement premium est actif. Vous bénéficiez de tous les avantages premium.
            </AlertDescription>
          </Alert>
        )}

        <div className="flex gap-2 flex-wrap">
          <Button onClick={manageSubscription} variant="outline">
            Gérer via Stripe
          </Button>
          
          {!isCancelled && (
            <Button 
              onClick={handleCancelSubscription}
              disabled={isLoading}
              variant="outline"
              className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
            >
              {isLoading ? "Résiliation..." : "Résilier l'abonnement"}
            </Button>
          )}
        </div>

        <p className="text-xs text-muted-foreground">
          {isCancelled 
            ? "Votre abonnement se terminera à la fin de la période déjà payée. Aucun nouveau prélèvement ne sera effectué."
            : "En cas de résiliation, votre abonnement restera actif jusqu'à la fin de la période en cours."
          }
        </p>
      </CardContent>
    </Card>
  );
};