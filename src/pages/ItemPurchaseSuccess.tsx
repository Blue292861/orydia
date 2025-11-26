
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Package, ArrowRight, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const ItemPurchaseSuccess: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [itemData, setItemData] = useState<{
    item_name: string;
    item_image: string;
    quantity: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    const completePurchase = async () => {
      if (!sessionId) {
        setError("Session invalide");
        setLoading(false);
        return;
      }

      try {
        const { data, error: fnError } = await supabase.functions.invoke('complete-item-purchase', {
          body: { session_id: sessionId }
        });

        if (fnError) {
          console.error('Error completing purchase:', fnError);
          setError("Erreur lors de la finalisation de l'achat");
          return;
        }

        if (data?.success) {
          setItemData({
            item_name: data.item_name,
            item_image: data.item_image,
            quantity: data.quantity
          });
          toast({
            title: "Achat réussi !",
            description: `${data.item_name} a été ajouté à votre inventaire.`,
          });
        } else if (data?.error) {
          setError(data.error);
        }
      } catch (err) {
        console.error('Error:', err);
        setError("Une erreur inattendue s'est produite");
      } finally {
        setLoading(false);
      }
    };

    completePurchase();
  }, [sessionId, toast]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-background/95 flex items-center justify-center p-4">
        <Card className="max-w-md w-full bg-gradient-to-br from-slate-800 to-slate-900 border-2 border-slate-600">
          <CardContent className="p-8 text-center">
            <Loader2 className="h-12 w-12 text-amber-400 animate-spin mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-amber-100 mb-2">
              Finalisation de votre achat...
            </h2>
            <p className="text-slate-400">
              Veuillez patienter pendant que nous traitons votre commande.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-background/95 flex items-center justify-center p-4">
        <Card className="max-w-md w-full bg-gradient-to-br from-slate-800 to-slate-900 border-2 border-red-600/50">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-red-900/30 flex items-center justify-center mx-auto mb-4">
              <Package className="h-8 w-8 text-red-400" />
            </div>
            <h2 className="text-xl font-semibold text-red-100 mb-2">
              Erreur
            </h2>
            <p className="text-slate-400 mb-6">
              {error}
            </p>
            <Button
              onClick={() => navigate('/?tab=shop')}
              className="bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500"
            >
              Retour à la boutique
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/95 flex items-center justify-center p-4">
      <Card className="max-w-md w-full bg-gradient-to-br from-slate-800 to-slate-900 border-2 border-amber-600/50 overflow-hidden">
        {/* Header avec effet de succès */}
        <div className="bg-gradient-to-r from-amber-900/50 to-orange-900/50 p-6 text-center border-b border-amber-600/30">
          <div className="w-16 h-16 rounded-full bg-green-900/50 flex items-center justify-center mx-auto mb-4 border-2 border-green-500/50">
            <CheckCircle className="h-10 w-10 text-green-400" />
          </div>
          <h1 className="text-2xl font-bold text-amber-100">
            Achat réussi !
          </h1>
        </div>

        <CardContent className="p-6">
          {/* Détails de l'item */}
          {itemData && (
            <div className="flex items-center gap-4 p-4 bg-slate-800/50 rounded-lg border border-slate-700 mb-6">
              {itemData.item_image && (
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-amber-900/30 flex items-center justify-center border border-amber-600/30">
                  <img 
                    src={itemData.item_image} 
                    alt={itemData.item_name}
                    className="w-14 h-14 object-contain"
                  />
                </div>
              )}
              <div className="flex-1">
                <h3 className="font-semibold text-amber-100">
                  {itemData.item_name}
                </h3>
                <p className="text-sm text-slate-400">
                  Quantité : {itemData.quantity}
                </p>
              </div>
            </div>
          )}

          <p className="text-center text-slate-300 mb-6">
            Votre item a été ajouté à votre inventaire. Vous pouvez le consulter depuis votre profil.
          </p>

          {/* Actions */}
          <div className="flex flex-col gap-3">
            <Button
              onClick={() => navigate('/?tab=profile')}
              className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500"
            >
              Voir mon inventaire
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
            <Button
              onClick={() => navigate('/?tab=shop')}
              variant="outline"
              className="w-full border-slate-600 text-slate-300 hover:bg-slate-800"
            >
              Continuer mes achats
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ItemPurchaseSuccess;
