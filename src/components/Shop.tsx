
import React, { useState, useMemo } from 'react';
import { ShopItem } from '@/types/ShopItem';
import { useUserStats } from '@/contexts/UserStatsContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sword, Shield, Sparkles, Star, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { SoundEffects } from '@/utils/soundEffects';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

interface ShopProps {
  shopItems: ShopItem[];
}

export const Shop: React.FC<ShopProps> = ({ shopItems }) => {
  const { userStats, spendPoints } = useUserStats();
  const { toast } = useToast();
  const [filters, setFilters] = useState({
    seller: 'Tous',
    category: 'Toutes',
    affordable: false,
  });

  const handlePurchase = (item: ShopItem) => {
    if (userStats.totalPoints >= item.price) {
      spendPoints(item.price);
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

  const { uniqueSellers, uniqueCategories, filteredItems } = useMemo(() => {
    const sellers = ['Tous', ...Array.from(new Set(shopItems.map(item => item.seller)))];
    const categories = ['Toutes', ...Array.from(new Set(shopItems.map(item => item.category)))];

    let items = shopItems;

    if (filters.seller !== 'Tous') {
      items = items.filter(item => item.seller === filters.seller);
    }
    if (filters.category !== 'Toutes') {
      items = items.filter(item => item.category === filters.category);
    }
    if (filters.affordable) {
      items = items.filter(item => userStats.totalPoints >= item.price);
    }

    return { uniqueSellers: sellers, uniqueCategories: categories, filteredItems: items };
  }, [shopItems, filters, userStats.totalPoints]);


  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* RPG Header */}
      <div className="relative bg-gradient-to-r from-amber-900 via-yellow-800 to-amber-900 border-b-4 border-amber-600">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative text-center py-8 px-4">
          <h1 className="text-5xl font-bold text-amber-200 mb-2 font-serif drop-shadow-lg">
            🏪 L'Emporium du Marchand
          </h1>
          <p className="text-amber-100 text-lg">Échangez vos Tensens durement gagnés contre des objets légendaires !</p>
          
          <div className="mt-4 inline-flex items-center gap-2 bg-black/40 px-6 py-3 rounded-full border border-amber-600">
            <img src="/lovable-uploads/4a891ef6-ff72-4b5a-b33c-0dc33dd3aa26.png" alt="Icône Tensens" className="h-6 w-6" />
            <span className="text-2xl font-bold text-amber-200">{userStats.totalPoints}</span>
            <span className="text-amber-300">Tensens</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 mb-8 flex flex-col md:flex-row gap-4 items-center">
          <h3 className="text-lg font-semibold text-amber-200 whitespace-nowrap">Filtres :</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 w-full">
            <div>
              <Label htmlFor="seller-filter" className="text-sm font-medium text-slate-300">Vendeur</Label>
              <Select value={filters.seller} onValueChange={seller => setFilters(f => ({ ...f, seller }))}>
                <SelectTrigger id="seller-filter" className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue placeholder="Choisir un vendeur" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-600 text-white">
                  {uniqueSellers.map(seller => <SelectItem key={seller} value={seller}>{seller}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="category-filter" className="text-sm font-medium text-slate-300">Catégorie</Label>
               <Select value={filters.category} onValueChange={category => setFilters(f => ({ ...f, category }))}>
                <SelectTrigger id="category-filter" className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue placeholder="Choisir une catégorie" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-600 text-white">
                  {uniqueCategories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2 pt-6">
                <Switch 
                  id="affordable-filter" 
                  checked={filters.affordable}
                  onCheckedChange={checked => setFilters(f => ({ ...f, affordable: checked }))}
                />
                <Label htmlFor="affordable-filter" className="text-slate-300">Abordables seulement</Label>
            </div>
          </div>
        </div>


        {filteredItems.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-slate-800/50 border border-slate-600 rounded-lg p-8 max-w-md mx-auto">
              <div className="text-6xl mb-4">🏺</div>
              <p className="text-slate-300 text-lg">Les étagères du marchand sont vides...</p>
              <p className="text-slate-400 mt-2">Aucun objet ne correspond à vos filtres. Essayez de les modifier !</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredItems.map((item) => (
              <Card key={item.id} className="bg-gradient-to-b from-slate-800 to-slate-900 border-2 border-slate-600 hover:border-amber-500 transition-all duration-300 hover:shadow-xl hover:shadow-amber-500/20 group flex flex-col">
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
                    <span className="ml-1 text-xs font-semibold">{item.category}</span>
                  </Badge>
                </div>

                <CardHeader className="pb-2">
                  <CardTitle className="text-xl text-amber-200 font-serif">{item.name}</CardTitle>
                   <div className="flex items-center gap-1.5 text-sm text-slate-400">
                      <User className="h-4 w-4" />
                      <span>{item.seller}</span>
                   </div>
                </CardHeader>

                <CardContent className="space-y-4 flex flex-col flex-grow">
                  <p className="text-slate-300 text-sm line-clamp-3 flex-grow">{item.description}</p>
                  
                  <div className="flex items-center justify-between mt-auto">
                    <div className="flex items-center gap-2 bg-amber-900/30 px-3 py-2 rounded-lg border border-amber-600/50">
                      <img src="/lovable-uploads/4a891ef6-ff72-4b5a-b33c-0dc33dd3aa26.png" alt="Icône Tensens" className="h-5 w-5" />
                      <span className="font-bold text-amber-200 text-lg">{item.price}</span>
                    </div>
                    
                    <Button 
                      onClick={() => handlePurchase(item)}
                      disabled={userStats.totalPoints < item.price}
                      className={`font-semibold px-4 py-2 transition-all duration-200 ${
                        userStats.totalPoints >= item.price 
                          ? 'bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-black border-2 border-amber-400 hover:border-amber-300 shadow-lg hover:shadow-amber-400/50' 
                          : 'bg-slate-600 text-slate-400 cursor-not-allowed border-2 border-slate-500'
                      }`}
                      size="sm"
                    >
                      {userStats.totalPoints >= item.price ? '⚔️ Acheter' : '🔒 Verrouillé'}
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
