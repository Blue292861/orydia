
import React from 'react';
import { ShopItem } from '@/types/ShopItem';
import { useUserStats } from '@/contexts/UserStatsContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Coins, Sword, Shield, Sparkles, Star } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { SoundEffects } from '@/utils/soundEffects';

interface ShopProps {
  shopItems: ShopItem[];
}

export const Shop: React.FC<ShopProps> = ({ shopItems }) => {
  const { userStats, spendPoints } = useUserStats();

  const handlePurchase = (item: ShopItem) => {
    if (userStats.totalPoints >= item.price) {
      spendPoints(item.price);
      SoundEffects.playPurchase();
      toast({
        title: "⚔️ Purchase Successful!",
        description: `You've acquired ${item.name} for ${item.price} gold coins!`,
      });
    } else {
      toast({
        title: "💰 Insufficient Gold",
        description: `You need ${item.price - userStats.totalPoints} more gold coins to purchase this item.`,
        variant: "destructive",
      });
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'weapon':
      case 'weapons':
        return <Sword className="h-4 w-4" />;
      case 'armor':
      case 'armour':
        return <Shield className="h-4 w-4" />;
      case 'magic':
      case 'spell':
        return <Sparkles className="h-4 w-4" />;
      default:
        return <Star className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white pb-20">
      {/* RPG Header */}
      <div className="relative bg-gradient-to-r from-amber-900 via-yellow-800 to-amber-900 border-b-4 border-amber-600">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative text-center py-8 px-4">
          <h1 className="text-5xl font-bold text-amber-200 mb-2 font-serif drop-shadow-lg">
            🏪 The Merchant's Emporium
          </h1>
          <p className="text-amber-100 text-lg">Trade your hard-earned gold for legendary items!</p>
          
          {/* Player Gold Display */}
          <div className="mt-4 inline-flex items-center gap-2 bg-black/40 px-6 py-3 rounded-full border border-amber-600">
            <Coins className="h-6 w-6 text-amber-400" />
            <span className="text-2xl font-bold text-amber-200">{userStats.totalPoints}</span>
            <span className="text-amber-300">Gold Coins</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {shopItems.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-slate-800/50 border border-slate-600 rounded-lg p-8 max-w-md mx-auto">
              <div className="text-6xl mb-4">🏺</div>
              <p className="text-slate-300 text-lg">The merchant's shelves are empty...</p>
              <p className="text-slate-400 mt-2">Check back later for new arrivals!</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {shopItems.map((item) => (
              <Card key={item.id} className="bg-gradient-to-b from-slate-800 to-slate-900 border-2 border-slate-600 hover:border-amber-500 transition-all duration-300 hover:shadow-xl hover:shadow-amber-500/20 group">
                <div className="relative">
                  <div className="aspect-square overflow-hidden rounded-t-lg">
                    <img 
                      src={item.imageUrl} 
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                  </div>
                  
                  {/* Category Badge */}
                  <Badge className="absolute top-2 left-2 bg-slate-900/80 text-amber-200 border border-amber-600">
                    {getCategoryIcon(item.category)}
                    <span className="ml-1 text-xs font-semibold">{item.category}</span>
                  </Badge>
                </div>

                <CardHeader className="pb-2">
                  <CardTitle className="text-xl text-amber-200 font-serif">{item.name}</CardTitle>
                </CardHeader>

                <CardContent className="space-y-4">
                  <p className="text-slate-300 text-sm line-clamp-3">{item.description}</p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 bg-amber-900/30 px-3 py-2 rounded-lg border border-amber-600/50">
                      <Coins className="h-5 w-5 text-amber-400" />
                      <span className="font-bold text-amber-200 text-lg">{item.price}</span>
                    </div>
                    
                    <Button 
                      onClick={() => handlePurchase(item)}
                      disabled={userStats.totalPoints < item.price}
                      className={`font-semibold px-6 py-2 transition-all duration-200 ${
                        userStats.totalPoints >= item.price 
                          ? 'bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-black border-2 border-amber-400 hover:border-amber-300 shadow-lg hover:shadow-amber-400/50' 
                          : 'bg-slate-600 text-slate-400 cursor-not-allowed border-2 border-slate-500'
                      }`}
                      size="sm"
                    >
                      {userStats.totalPoints >= item.price ? '⚔️ Purchase' : '🔒 Locked'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
