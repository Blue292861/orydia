import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Crown, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const PremiumAdmin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [months, setMonths] = useState('1');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleGrantPremium = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !months) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs",
        variant: "destructive"
      });
      return;
    }

    const monthsNumber = parseInt(months);
    if (monthsNumber < 1 || monthsNumber > 12) {
      toast({
        title: "Erreur",
        description: "La période doit être entre 1 et 12 mois",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Chercher l'utilisateur par email dans la table auth.users
      const { data: userData, error: userError } = await supabase.auth.admin.listUsers();
      
      if (userError) {
        throw new Error('Erreur lors de la recherche de l\'utilisateur: ' + userError.message);
      }

      const user = userData.users.find(u => u.email?.toLowerCase() === email.toLowerCase());
      
      if (!user) {
        throw new Error('Utilisateur non trouvé avec cet email. Assurez-vous que l\'utilisateur a un compte sur la plateforme.');
      }

      // Utiliser l'ID trouvé pour accorder le premium avec la fonction sécurisée
      const { error: premiumError } = await supabase.rpc('grant_manual_premium_secure', {
        p_user_id: user.id,
        p_months: monthsNumber
      });

      if (premiumError) {
        throw premiumError;
      }

      toast({
        title: "Succès",
        description: `Premium accordé pour ${monthsNumber} mois à ${email}`,
      });

      setEmail('');
      setMonths('1');
    } catch (error) {
      console.error('Erreur lors de l\'attribution du premium:', error);
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Impossible d'accorder le premium",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRevokePremium = async () => {
    if (!email) {
      toast({
        title: "Erreur",
        description: "Veuillez saisir un email",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Chercher l'utilisateur par email dans la table auth.users
      const { data: userData, error: userError } = await supabase.auth.admin.listUsers();
      
      if (userError) {
        throw new Error('Erreur lors de la recherche de l\'utilisateur: ' + userError.message);
      }

      const user = userData.users.find(u => u.email?.toLowerCase() === email.toLowerCase());
      
      if (!user) {
        throw new Error('Utilisateur non trouvé avec cet email');
      }

      const { error: revokeError } = await supabase.rpc('revoke_manual_premium_secure', {
        p_user_id: user.id
      });

      if (revokeError) {
        throw revokeError;
      }

      toast({
        title: "Succès",
        description: `Premium révoqué pour ${email}`,
      });

      setEmail('');
    } catch (error) {
      console.error('Erreur lors de la révocation du premium:', error);
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Impossible de révoquer le premium",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Crown className="w-6 h-6 text-yellow-500" />
          Gestion Premium Manuel
        </h2>
        <p className="text-muted-foreground">
          Accordez ou révoquez le statut premium à un utilisateur
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Attribuer le Premium
          </CardTitle>
          <CardDescription>
            Accordez le statut premium à un utilisateur en utilisant son adresse email
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleGrantPremium} className="space-y-4">
            <div>
              <Label htmlFor="email">Adresse email de l'utilisateur</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="utilisateur@example.com"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="months">Période en mois (1-12)</Label>
              <Input
                id="months"
                type="number"
                min="1"
                max="12"
                value={months}
                onChange={(e) => setMonths(e.target.value)}
                required
              />
            </div>

            <div className="flex gap-2">
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="flex items-center gap-2"
              >
                <Crown className="w-4 h-4" />
                {isSubmitting ? 'Attribution en cours...' : 'Accorder Premium'}
              </Button>
              
              <Button 
                type="button"
                variant="destructive"
                onClick={handleRevokePremium}
                disabled={isSubmitting || !email}
              >
                Révoquer Premium
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Information</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>• L'utilisateur doit avoir un compte inscrit avec l'email spécifié</p>
          <p>• Fonctionne pour tous les utilisateurs, même ceux sans abonnement existant</p>
          <p>• Le premium manuel remplace tout abonnement Stripe existant</p>
          <p>• La période commence immédiatement à partir d'aujourd'hui</p>
          <p>• Révoquer le premium supprime immédiatement l'accès</p>
        </CardContent>
      </Card>
    </div>
  );
};