import React, { useState, useEffect } from 'react';
import { ShopItem } from '@/types/ShopItem';
import { useUserStats } from '@/contexts/UserStatsContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sword, Shield, Sparkles, Star, User, X, CreditCard, Coins, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { SoundEffects } from '@/utils/soundEffects';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { AddressRequiredDialog } from '@/components/AddressRequiredDialog';
import { AuthRequiredDialog } from '@/components/AuthRequiredDialog';


interface ShopItemDetailProps {
  item: ShopItem;
  onClose: () => void;
}

export const ShopItemDetail: React.FC<ShopItemDetailProps> = ({ item, onClose }) => {
  const { userStats, spendPoints } = useUserStats();
  const { session, subscription } = useAuth();
  const { toast } = useToast();
  const [showAddressDialog, setShowAddressDialog] = useState(false);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [showAdInterstitial, setShowAdInterstitial] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const isRealMoney = item.paymentType === 'real_money';

  useEffect(() => {
    const fetchProfile = async () => {
      if (session?.user?.id) {
        const { data } = await supabase
          .from('profiles')
          .select('address, postal_code, city, country')
          .eq('id', session.user.id)
          .single();
        
        setUserProfile(data);
      }
    };
    
    fetchProfile();
  }, [session]);

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'arme':
      case 'armes':
        return <Sword className="h-4 w-4" />;
      case 'armure':
        return <Shield className="h-4 w-4" />;
      case 'magie':
      case 'sort':
        return <Sparkles className="h-4 w-4" />;
      default:
        return <Star className="h-4 w-4" />;
    }
  };

  const handlePurchase = async () => {
    if (!session) {
      setShowAuthDialog(true);
      return;
    }

    if (isRealMoney) {
      // Achat avec Stripe
      await processRealMoneyPurchase();
    } else {
      // Afficher la publicité pour les utilisateurs freemium
      if (!subscription?.isPremium) {
        setShowAdInterstitial(true);
        return;
      }
      processPurchase();
    }
  };

  const processRealMoneyPurchase = async () => {
    setIsProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-item-checkout', {
        body: {
          item_id: item.id,
          item_name: item.name,
          item_description: item.description,
          real_price_cents: item.realPriceCents,
          reward_type_id: item.rewardTypeId,
          quantity: 1
        }
      });

      if (error) {
        console.error('Error creating checkout:', error);
        toast({
          title: "Erreur",
          description: "Impossible de créer la session de paiement",
          variant: "destructive",
        });
        return;
      }

      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error('Error:', err);
      toast({
        title: "Erreur",
        description: "Une erreur inattendue s'est produite",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const processPurchase = async () => {
    // Vérifier si l'adresse est renseignée (seulement pour les articles physiques)
    if (!userProfile?.address || !userProfile?.city || !userProfile?.country) {
      setShowAddressDialog(true);
      return;
    }
    
    // Les admins ont des Orydors illimités
    if (userStats.isAdmin || userStats.totalPoints >= item.price) {
      spendPoints(item.price);
      
      const { error } = await supabase.from('orders').insert([{
        user_id: session.user.id,
        item_id: item.id,
        item_name: item.name,
        price: item.price,
        order_number: `ORY-${Date.now()}`
      }]);

      if (error) {
        console.error("Erreur lors de la création de la commande:", error);
        toast({
          title: "Une erreur est survenue",
          description: "Votre achat n'a pas pu être enregistré, mais vos points ont été débités. Veuillez contacter le support.",
          variant: "destructive",
        });
        return;
      }

      SoundEffects.playPurchase();
      toast({
        title: "⚔️ Achat Réussi !",
        description: `Vous avez acquis ${item.name} pour ${item.price} Orydors !`,
      });
      onClose();
    } else {
      toast({
        title: "💰 Orydors insuffisants",
        description: `Il vous manque ${item.price - userStats.totalPoints} Orydors pour acheter cet objet.`,
        variant: "destructive",
      });
    }
  };

  const handleAddressSaved = async () => {
    // Recharger le profil
    const { data } = await supabase
      .from('profiles')
      .select('address, postal_code, city, country')
      .eq('id', session!.user.id)
      .single();
    
    setUserProfile(data);
    setShowAddressDialog(false);
    
    // Relancer l'achat
    processPurchase();
  };

  const handleAdWatched = () => {
    setShowAdInterstitial(false);
    processPurchase();
  };

  const formatPrice = () => {
    if (isRealMoney && item.realPriceCents) {
      return `${(item.realPriceCents / 100).toFixed(2)}€`;
    }
    return `${item.price} Orydors`;
  };

  const canPurchase = () => {
    if (isRealMoney) return true;
    return userStats.totalPoints >= item.price;
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
      <div className="bg-gradient-to-b from-slate-800 to-slate-900 border-2 border-slate-600 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="absolute top-2 right-2 z-10 bg-black/50 hover:bg-black/70"
          >
            <X className="h-4 w-4" />
          </Button>
          
          <div className="aspect-video overflow-hidden">
            <img 
              src={item.imageUrl} 
              alt={item.name}
              className="w-full h-full object-cover" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
          </div>
          
          <Badge className="absolute top-2 left-2 bg-slate-900/80 text-amber-200 border border-amber-600">
            {getCategoryIcon(item.category)}
            <span className="ml-1 font-semibold text-xs">
              {item.category}
            </span>
          </Badge>

          {isRealMoney && (
            <Badge className="absolute top-2 left-24 bg-green-900/80 text-green-200 border border-green-600">
              <CreditCard className="h-3 w-3 mr-1" />
              <span className="font-semibold text-xs">Paiement réel</span>
            </Badge>
          )}
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
          <div>
            <h2 className="text-2xl font-bold text-amber-200 font-serif mb-2">
              {item.name}
            </h2>
            <div className="flex items-center gap-2 text-slate-400 text-sm mb-4">
              <User className="h-4 w-4" />
              <span>Vendu par {item.seller}</span>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-amber-200 mb-2">Description</h3>
            <p className="text-slate-300 text-sm leading-relaxed">
              {item.description}
            </p>
          </div>

          {item.content && (
            <div>
              <h3 className="text-lg font-semibold text-amber-200 mb-2">Détails</h3>
              <div className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
                {item.content}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-600 bg-slate-900/50">
          <div className="flex items-center justify-between">
            <div className={`flex items-center gap-2 rounded-lg border px-3 py-2 ${
              isRealMoney 
                ? 'bg-green-900/30 border-green-600/50' 
                : 'bg-amber-900/30 border-amber-600/50'
            }`}>
              {isRealMoney ? (
                <CreditCard className="h-5 w-5 text-green-400" />
              ) : (
                <Coins className="h-5 w-5 text-amber-400" />
              )}
              <span className={`font-bold text-lg ${isRealMoney ? 'text-green-200' : 'text-amber-200'}`}>
                {formatPrice()}
              </span>
            </div>
            
            <Button 
              onClick={handlePurchase}
              disabled={!canPurchase() || isProcessing}
              className={`font-semibold transition-all duration-200 px-6 py-2 ${
                canPurchase() 
                  ? isRealMoney
                    ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white border-2 border-green-400 hover:border-green-300 shadow-lg hover:shadow-green-400/50'
                    : 'bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-black border-2 border-amber-400 hover:border-amber-300 shadow-lg hover:shadow-amber-400/50' 
                  : 'bg-slate-600 text-slate-400 cursor-not-allowed border-2 border-slate-500'
              }`}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Chargement...
                </>
              ) : canPurchase() ? (
                isRealMoney ? '💳 Acheter' : '⚔️ Acheter'
              ) : (
                '🔒 Verrouillé'
              )}
            </Button>
          </div>
        </div>
      </div>


      <AddressRequiredDialog
        open={showAddressDialog}
        onClose={() => setShowAddressDialog(false)}
        onAddressSaved={handleAddressSaved}
        userId={session?.user?.id || ''}
      />
      
      <AuthRequiredDialog
        open={showAuthDialog}
        onOpenChange={setShowAuthDialog}
        message="Pour acheter des articles, vous devez vous connecter."
      />
    </div>
  );
};
