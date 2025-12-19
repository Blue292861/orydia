
import React from 'react';
import { ShopItem } from '@/types/ShopItem';
import { useUserStats } from '@/contexts/UserStatsContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShopItemLevelGuard } from '@/components/ShopItemLevelGuard';
import { Sword, Shield, Sparkles, Star, User, CreditCard, Coins } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { SoundEffects } from '@/utils/soundEffects';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useResponsive } from '@/hooks/useResponsive';

interface ShopItemCardProps {
  item: ShopItem;
  onItemClick: (item: ShopItem) => void;
}

export const ShopItemCard: React.FC<ShopItemCardProps> = ({ item, onItemClick }) => {
  const { userStats, spendPoints } = useUserStats();
  const { session } = useAuth();
  const { toast } = useToast();
  const { isMobile } = useResponsive();

  const requiredLevel = item.requiredLevel || 1;
  const userLevel = userStats.level || 1;
  const isRealMoney = item.paymentType === 'real_money';

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

  const handlePurchase = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click when clicking buy button
    
    if (!session) {
      toast({ title: "Erreur", description: "Vous devez être connecté pour acheter.", variant: "destructive" });
      return;
    }
    if (userLevel < requiredLevel) {
      toast({ 
        title: "Niveau insuffisant", 
        description: `Vous devez être niveau ${requiredLevel} pour acheter cet article.`, 
        variant: "destructive" 
      });
      return;
    }
    
    if (userStats.totalPoints >= item.price) {
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

  const handleCardClick = () => {
    onItemClick(item);
  };

  return (
    <ShopItemLevelGuard requiredLevel={requiredLevel} userLevel={userLevel}>
      <Card 
        className="bg-gradient-to-b from-slate-800 to-slate-900 border-2 border-slate-600 hover:border-amber-500 transition-all duration-300 hover:shadow-xl hover:shadow-amber-500/20 group flex flex-col cursor-pointer"
        onClick={handleCardClick}
      >
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
          <div className={`flex items-center gap-2 rounded-lg border ${
            isRealMoney 
              ? 'bg-green-900/30 border-green-600/50' 
              : 'bg-amber-900/30 border-amber-600/50'
          } ${isMobile ? 'px-2 py-1' : 'px-3 py-2'}`}>
            {isRealMoney ? (
              <CreditCard className={`text-green-400 ${isMobile ? 'h-4 w-4' : 'h-5 w-5'}`} />
            ) : (
              <Coins className={`text-amber-400 ${isMobile ? 'h-4 w-4' : 'h-5 w-5'}`} />
            )}
            <span className={`font-bold ${isRealMoney ? 'text-green-200' : 'text-amber-200'} ${
              isMobile ? 'text-base' : 'text-lg'
            }`}>
              {isRealMoney && item.realPriceCents 
                ? `${(item.realPriceCents / 100).toFixed(2)}€` 
                : item.price}
            </span>
          </div>
          
          <Button 
            onClick={handlePurchase}
            disabled={!isRealMoney && (userStats.totalPoints < item.price || userLevel < requiredLevel)}
            className={`font-semibold transition-all duration-200 ${
              isRealMoney
                ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white border-2 border-green-400 hover:border-green-300 shadow-lg hover:shadow-green-400/50'
                : userStats.totalPoints >= item.price && userLevel >= requiredLevel
                  ? 'bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-black border-2 border-amber-400 hover:border-amber-300 shadow-lg hover:shadow-amber-400/50' 
                  : 'bg-slate-600 text-slate-400 cursor-not-allowed border-2 border-slate-500'
            } ${isMobile ? 'px-2 py-1 text-xs' : 'px-4 py-2 text-sm'}`}
          >
            {userLevel < requiredLevel && !isRealMoney
              ? `🔒 Niveau ${requiredLevel}` 
              : isRealMoney 
                ? '💳 Acheter'
                : userStats.totalPoints >= item.price 
                  ? '⚔️ Acheter' 
                  : '💰 Insuffisant'}
          </Button>
        </div>
        
        {/* Badge de niveau requis */}
        {requiredLevel > 1 && (
          <div className="flex items-center gap-1 text-xs text-slate-400 mt-2">
            <Shield className="h-3 w-3" />
            <span>Niveau {requiredLevel} requis</span>
          </div>
        )}
      </CardContent>
    </Card>
    </ShopItemLevelGuard>
  );
};
