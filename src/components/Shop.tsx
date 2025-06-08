
import React from 'react';
import { ShopItem } from '@/types/ShopItem';
import { useUserStats } from '@/contexts/UserStatsContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Coins } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface ShopProps {
  shopItems: ShopItem[];
}

export const Shop: React.FC<ShopProps> = ({ shopItems }) => {
  const { userStats, spendPoints } = useUserStats();

  const handlePurchase = (item: ShopItem) => {
    if (userStats.totalPoints >= item.price) {
      spendPoints(item.price);
      toast({
        title: "Purchase Successful!",
        description: `You bought ${item.name} for ${item.price} points.`,
      });
    } else {
      toast({
        title: "Insufficient Points",
        description: `You need ${item.price - userStats.totalPoints} more points to buy this item.`,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-2">International Shop</h2>
        <p className="text-muted-foreground">Spend your reading points on amazing items!</p>
      </div>

      {shopItems.length === 0 ? (
        <div className="text-center py-12 border rounded-lg">
          <p className="text-muted-foreground">No items available in the shop yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {shopItems.map((item) => (
            <Card key={item.id} className="overflow-hidden">
              <div className="aspect-square overflow-hidden">
                <img 
                  src={item.imageUrl} 
                  alt={item.name}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-200" 
                />
              </div>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{item.name}</CardTitle>
                <p className="text-sm text-muted-foreground">{item.category}</p>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm">{item.description}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Coins className="h-4 w-4 text-primary" />
                    <span className="font-semibold">{item.price} points</span>
                  </div>
                  <Button 
                    onClick={() => handlePurchase(item)}
                    disabled={userStats.totalPoints < item.price}
                    size="sm"
                  >
                    Buy Now
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
