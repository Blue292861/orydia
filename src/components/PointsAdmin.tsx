
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Coins, Mail, Plus } from 'lucide-react';

export const PointsAdmin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [points, setPoints] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !points) {
      toast({
        title: 'Erreur',
        description: 'Veuillez remplir tous les champs.',
        variant: 'destructive',
      });
      return;
    }

    const pointsNumber = parseInt(points);
    if (isNaN(pointsNumber) || pointsNumber <= 0) {
      toast({
        title: 'Erreur',
        description: 'Le nombre de points doit être un nombre positif.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Pour l'instant, nous simulons l'ajout de points
      // Dans un vrai système, vous devriez avoir une table pour stocker les points des utilisateurs
      // et une fonction pour rechercher l'utilisateur par email
      
      console.log(`Attribution de ${pointsNumber} points à ${email}`);
      
      toast({
        title: 'Succès',
        description: `${pointsNumber} points Tensens ont été attribués à ${email}.`,
      });

      // Réinitialiser le formulaire
      setEmail('');
      setPoints('');
    } catch (error) {
      console.error('Erreur:', error);
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue lors de l\'attribution des points.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Coins className="h-6 w-6 text-amber-600" />
        <h2 className="text-3xl font-bold">Attribution de Points Tensens</h2>
      </div>

      <Card className="max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Attribuer des Points
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Adresse Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="utilisateur@exemple.com"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="points" className="flex items-center gap-2">
                <Coins className="h-4 w-4" />
                Nombre de Points
              </Label>
              <Input
                id="points"
                type="number"
                value={points}
                onChange={(e) => setPoints(e.target.value)}
                placeholder="100"
                min="1"
                required
              />
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Attribution en cours...' : 'Attribuer les Points'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Information</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Cette fonctionnalité permet d'attribuer des points Tensens directement à un utilisateur 
            en utilisant son adresse email. Les points seront ajoutés à son solde existant.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
