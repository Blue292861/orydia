
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Coins } from 'lucide-react';
import { OrydorsPack } from '@/types/OrydorsPack';

interface OrydorsPackCardProps {
  pack: OrydorsPack;
  loading: boolean;
  onPurchase: (pack: OrydorsPack) => void;
}

export const OrydorsPackCard: React.FC<OrydorsPackCardProps> = ({
  pack,
  loading,
  onPurchase,
}) => {
  return (
    <Card className={`relative bg-gradient-to-b from-wood-100 to-wood-200 border-2 ${pack.popular ? 'border-gold-400 ring-2 ring-gold-300 scale-105' : 'border-wood-400'} hover:border-gold-500 transition-all duration-300 hover:shadow-xl hover:shadow-gold-400/20 group`}>
      {pack.popular && (
        <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-gold-500 to-gold-600 text-white font-medieval border border-gold-400 shadow-lg">
          ⭐ Recommandé
        </Badge>
      )}
      
      <CardHeader className="text-center pb-3 bg-gradient-to-b from-forest-700 to-forest-800 text-white rounded-t-lg relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-gold-400/10 via-transparent to-gold-400/10" />
        <div className="relative z-10">
          <div className="flex justify-center mb-2 text-gold-300">
            {pack.icon}
          </div>
          <CardTitle className="text-lg font-medieval">{pack.name}</CardTitle>
          <div className="flex items-center justify-center gap-2 mt-2">
            <img src="/lovable-uploads/4a891ef6-ff72-4b5a-b33c-0dc33dd3aa26.png" alt="Orydors" className="h-6 w-6" />
            <span className="text-2xl font-bold text-gold-300">{pack.orydors.toLocaleString()}</span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="text-center p-4 space-y-3">
        {pack.bonus && (
          <Badge variant="secondary" className="bg-green-100 text-green-800 border border-green-300 font-medieval">
            🎁 {pack.bonus}
          </Badge>
        )}
        {pack.savings && (
          <Badge variant="outline" className="text-orange-700 border-orange-400 bg-orange-50 font-medieval">
            💰 {pack.savings}
          </Badge>
        )}
        
        <div className="space-y-1">
          {pack.originalPrice && (
            <div className="text-sm text-muted-foreground line-through font-serif">
              {(pack.originalPrice / 100).toFixed(2)} €
            </div>
          )}
          <div className="text-3xl font-bold text-forest-800 font-medieval">
            {(pack.price / 100).toFixed(2)} €
          </div>
        </div>
        
        <Button 
          onClick={() => onPurchase(pack)}
          disabled={loading}
          className="w-full bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-white font-medieval border-2 border-gold-400 hover:border-gold-300 shadow-lg hover:shadow-gold-400/50 transition-all duration-300"
          size="sm"
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Chargement...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Coins className="h-4 w-4" />
              Acheter
            </div>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};
