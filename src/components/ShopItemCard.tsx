
import React from 'react';
import { ShopItem } from '@/types/ShopItem';
import { useUserStats } from '@/contexts/UserStatsContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sword, Shield, Sparkles, Star, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { SoundEffects } from '@/utils/soundEffects';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useResponsive } from '@/hooks/useResponsive';

interface ShopItemCardProps {
  item: ShopItem;
}

export const ShopItemCard: React.FC<ShopItemCardProps> = ({ item }) => {
  const { userStats, spendPoints } = useUserStats();
  const { session } = useAuth();
  const { toast } = useToast();
  const { isMobile } = useResponsive();

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
      toast({ title: "Erreur", description: "Vous devez être connecté pour acheter.", variant: "destructive" });
      return;
    }
    if (userStats.totalPoints >= item.price) {
      spendPoints(item.price);
      
      const { error } = await supabase.from('orders').insert({
        user_id: session.user.id,
        item_id: item.id,
        item_name: item.name,
        price: item.price,
      });

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
        description: `Vous avez acquis ${item.name} pour ${item.price} Tensens !`,
      });
    } else {
      toast({
        title: "💰 Tensens insuffisants",
        description: `Il vous manque ${item.price - userStats.totalPoints} Tensens pour acheter cet objet.`,
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="bg-gradient-to-b from-slate-800 to-slate-900 border-2 border-slate-600 hover:border-amber-500 transition-all duration-300 hover:shadow-xl hover:shadow-amber-500/20 group flex flex-col">
      <div className="relative">
        <div className="aspect-square overflow-hidden rounded-t-lg">
          <img 
            src={item.imageUrl} 
            alt={item.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
        </div>
        
        <Badge className="absolute top-2 left-2 bg-slate-900/80 text-amber-200 border border-amber-600">
          {getCategoryIcon(item.category)}
          <span className={`ml-1 font-semibold ${isMobile ? 'text-[10px]' : 'text-xs'}`}>
            {item.category}
          </span>
        </Badge>
      </div>

      <CardHeader className={isMobile ? 'pb-1 px-3 pt-3' : 'pb-2'}>
        <CardTitle className={`text-amber-200 font-serif ${
          isMobile ? 'text-lg' : 'text-xl'
        }`}>
          {item.name}
        </CardTitle>
        <div className={`flex items-center gap-1.5 text-slate-400 ${
          isMobile ? 'text-xs' : 'text-sm'
        }`}>
          <User className="h-4 w-4" />
          <span>{item.seller}</span>
        </div>
      </CardHeader>

      <CardContent className={`space-y-4 flex flex-col flex-grow ${
        isMobile ? 'px-3 pb-3' : ''
      }`}>
        <p className={`text-slate-300 line-clamp-3 flex-grow ${
          isMobile ? 'text-xs' : 'text-sm'
        }`}>
          {item.description}
        </p>
        
        <div className="flex items-center justify-between mt-auto">
          <div className={`flex items-center gap-2 bg-amber-900/30 rounded-lg border border-amber-600/50 ${
            isMobile ? 'px-2 py-1' : 'px-3 py-2'
          }`}>
            <img src="/lovable-uploads/4a891ef6-ff72-4b5a-b33c-0dc33dd3aa26.png" alt="Icône Tensens" className={`${
              isMobile ? 'h-4 w-4' : 'h-5 w-5'
            }`} />
            <span className={`font-bold text-amber-200 ${
              isMobile ? 'text-base' : 'text-lg'
            }`}>
              {item.price}
            </span>
          </div>
          
          <Button 
            onClick={handlePurchase}
            disabled={userStats.totalPoints < item.price}
            className={`font-semibold transition-all duration-200 ${
              userStats.totalPoints >= item.price 
                ? 'bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-black border-2 border-amber-400 hover:border-amber-300 shadow-lg hover:shadow-amber-400/50' 
                : 'bg-slate-600 text-slate-400 cursor-not-allowed border-2 border-slate-500'
            } ${isMobile ? 'px-2 py-1 text-xs' : 'px-4 py-2 text-sm'}`}
          >
            {userStats.totalPoints >= item.price ? '⚔️ Acheter' : '🔒 Verrouillé'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
