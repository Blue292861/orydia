import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';
import { ShoppingCart, Star, Plus } from 'lucide-react';

// Produits de démonstration
const demoProducts = [
  {
    id: 'prod-1',
    name: 'Livre de Recettes Médiévales',
    price: 2999, // 29.99 €
    image: '/lovable-uploads/e4ca1c2e-eeba-4149-b13f-50ac08071650.png',
    description: 'Un livre fascinant sur la cuisine du Moyen Âge',
    tensensReward: 150 // 5% de récompense en Tensens
  },
  {
    id: 'prod-2',
    name: 'Chandelier Artisanal',
    price: 4999, // 49.99 €
    image: '/lovable-uploads/9318a8b9-7fe4-43c9-8aea-a49486e5baac.png',
    description: 'Chandelier forgé à la main dans le style médiéval',
    tensensReward: 250
  },
  {
    id: 'prod-3',
    name: 'Coffret de Thés Nobles',
    price: 1999, // 19.99 €
    image: '/lovable-uploads/b50e70c6-4063-405e-8340-84ade6817368.png',
    description: 'Sélection de thés fins dans un coffret authentique',
    tensensReward: 100
  }
];

interface Purchase {
  id: string;
  productName: string;
  price: number;
  tensensEarned: number;
  date: string;
}

export const EcommerceDemo: React.FC = () => {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [apiKey, setApiKey] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Simulation d'un achat
  const handlePurchase = async (product: typeof demoProducts[0]) => {
    if (!apiKey.trim()) {
      toast({
        title: 'Clé API requise',
        description: 'Veuillez entrer une clé API valide pour tester l\'attribution de points.',
        variant: 'destructive'
      });
      return;
    }

    setIsProcessing(true);
    
    try {
      // Simulation d'un processus d'achat Stripe
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Attribuer des points via l'API
      const response = await fetch('https://aotzivwzoxmnnawcxioo.supabase.co/functions/v1/award-points', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': apiKey,
        },
        body: JSON.stringify({
          user_id: 'demo-user-id', // En réalité, ceci serait l'ID utilisateur réel
          points: product.tensensReward,
          transaction_type: 'purchase_reward',
          reference_id: product.id,
          description: `Récompense pour l'achat de: ${product.name}`,
          source_app: 'ecommerce_demo'
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erreur lors de l\'attribution des points');
      }

      // Enregistrer l'achat
      const newPurchase: Purchase = {
        id: `purchase-${Date.now()}`,
        productName: product.name,
        price: product.price,
        tensensEarned: product.tensensReward,
        date: new Date().toISOString()
      };

      setPurchases(prev => [newPurchase, ...prev]);

      toast({
        title: '🎉 Achat réussi !',
        description: `Vous avez gagné ${product.tensensReward} Tensens pour cet achat.`,
      });

    } catch (error) {
      console.error('Erreur lors de l\'achat:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de traiter l\'achat. Vérifiez votre clé API.',
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Boutique E-commerce (Démo)
          </CardTitle>
          <CardDescription>
            Simulation d'une boutique e-commerce qui attribue des points Tensens pour chaque achat.
            Cette démo montre comment une application externe peut récompenser les utilisateurs.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <Label htmlFor="apiKey">Clé API pour les tests</Label>
            <Input
              id="apiKey"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Entrez votre clé API pour tester l'attribution de points"
              className="mt-1"
            />
            <p className="text-sm text-muted-foreground mt-1">
              Utilisez une clé API créée dans l'administration pour tester la fonctionnalité.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {demoProducts.map((product) => (
              <Card key={product.id} className="overflow-hidden">
                <div className="aspect-square relative overflow-hidden">
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform"
                  />
                  <Badge className="absolute top-2 right-2 bg-amber-500 text-white">
                    +{product.tensensReward} Tensens
                  </Badge>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-lg mb-1">{product.name}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{product.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="text-xl font-bold">
                      {(product.price / 100).toFixed(2)} €
                    </div>
                    <Button 
                      onClick={() => handlePurchase(product)}
                      disabled={isProcessing}
                      className="flex items-center gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Acheter
                    </Button>
                  </div>
                  <div className="flex items-center gap-1 mt-2 text-sm text-amber-600">
                    <Star className="h-4 w-4 fill-current" />
                    Gagnez {product.tensensReward} Tensens
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {purchases.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Historique des Achats</CardTitle>
            <CardDescription>
              Achats effectués et points Tensens gagnés via cette démo.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {purchases.map((purchase) => (
                <div 
                  key={purchase.id} 
                  className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200"
                >
                  <div>
                    <h4 className="font-medium">{purchase.productName}</h4>
                    <p className="text-sm text-muted-foreground">
                      {new Date(purchase.date).toLocaleString('fr-FR')}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">
                      {(purchase.price / 100).toFixed(2)} €
                    </div>
                    <div className="text-sm text-green-600 font-medium">
                      +{purchase.tensensEarned} Tensens
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};