import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getUserInventory, claimPremiumFromFragments, getChestHistory } from "@/services/inventoryService";
import { getUserCollectionProgress } from "@/services/collectionService";
import { UserCollectionProgress } from "@/types/Collection";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Gem, Gift, History, Sparkles, Crown, Layers } from "lucide-react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { CollectionCard } from "./CollectionCard";
import { CollectionDetailDialog } from "./CollectionDetailDialog";

export function InventoryPage() {
  const { user } = useAuth();
  const [inventory, setInventory] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [collections, setCollections] = useState<UserCollectionProgress[]>([]);
  const [selectedCollection, setSelectedCollection] = useState<UserCollectionProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);

  useEffect(() => {
    if (user?.id) {
      loadInventory();
      loadHistory();
      loadCollections();
    }
  }, [user]);

  const loadInventory = async () => {
    if (!user?.id) return;
    try {
      const data = await getUserInventory(user.id);
      setInventory(data);
    } catch (error) {
      console.error('Error loading inventory:', error);
      toast.error('Erreur lors du chargement de l\'inventaire');
    } finally {
      setLoading(false);
    }
  };

  const loadHistory = async () => {
    if (!user?.id) return;
    try {
      const data = await getChestHistory(user.id, 20);
      setHistory(data);
    } catch (error) {
      console.error('Error loading history:', error);
    }
  };

  const loadCollections = async () => {
    if (!user?.id) return;
    try {
      const data = await getUserCollectionProgress(user.id);
      setCollections(data);
    } catch (error) {
      console.error('Error loading collections:', error);
    }
  };

  const handleClaimPremium = async () => {
    if (!user?.id || claiming) return;
    
    setClaiming(true);
    try {
      const result = await claimPremiumFromFragments(user.id);
      toast.success(`${result.monthsGranted} mois de premium obtenu${result.monthsGranted > 1 ? 's' : ''} !`);
      loadInventory();
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la réclamation du premium');
    } finally {
      setClaiming(false);
    }
  };

  const gemProgress = inventory?.gemFragments 
    ? (inventory.gemFragments.fragment_count / 12) * 100 
    : 0;
  const canClaimPremium = inventory?.gemFragments && inventory.gemFragments.fragment_count >= 12;

  const cards = inventory?.items.filter((item: any) => item.reward_types?.category === 'card') || [];
  const items = inventory?.items.filter((item: any) => item.reward_types?.category === 'item') || [];

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center space-x-3">
        <Gift className="w-8 h-8 text-primary" />
        <h1 className="text-3xl font-bold">Mon Inventaire</h1>
      </div>

      {/* Gem Fragments Section */}
      <Card className="border-2 border-primary/20 bg-gradient-to-br from-purple-900/10 to-pink-900/10">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Gem className="w-6 h-6 text-purple-500" />
            <span>Fragments de Joyaux</span>
          </CardTitle>
          <CardDescription>
            Collectez 12 fragments pour obtenir 1 mois de premium gratuit
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-semibold">Progression</span>
              <span className="text-muted-foreground">
                {inventory?.gemFragments?.fragment_count || 0} / 12
              </span>
            </div>
            <Progress value={gemProgress} className="h-3" />
          </div>

          {inventory?.gemFragments?.premium_months_claimed > 0 && (
            <p className="text-sm text-muted-foreground flex items-center space-x-2">
              <Crown className="w-4 h-4 text-amber-500" />
              <span>
                {inventory.gemFragments.premium_months_claimed} mois premium déjà réclamé{inventory.gemFragments.premium_months_claimed > 1 ? 's' : ''}
              </span>
            </p>
          )}

          <Button
            onClick={handleClaimPremium}
            disabled={!canClaimPremium || claiming}
            className="w-full"
            size="lg"
          >
            <Sparkles className="w-5 h-5 mr-2" />
            {canClaimPremium ? 'Réclamer 1 mois Premium' : 'Pas encore disponible'}
          </Button>
        </CardContent>
      </Card>

      {/* Tabs for different inventory sections */}
      <Tabs defaultValue="collections" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="collections">
            <Layers className="w-4 h-4 mr-2" />
            Collections
          </TabsTrigger>
          <TabsTrigger value="cards">
            Cartes ({cards.length})
          </TabsTrigger>
          <TabsTrigger value="items">
            Objets ({items.length})
          </TabsTrigger>
          <TabsTrigger value="history">
            <History className="w-4 h-4 mr-2" />
            Historique
          </TabsTrigger>
        </TabsList>

        <TabsContent value="collections" className="mt-6">
          {collections.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <Layers className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Aucune collection disponible</p>
                <p className="text-sm mt-2">Les collections apparaîtront ici quand elles seront créées</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {collections.map((progress) => (
                <CollectionCard
                  key={progress.collection.id}
                  progress={progress}
                  onClick={() => setSelectedCollection(progress)}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="cards" className="mt-6">
          {cards.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <p>Aucune carte collectionnée pour le moment</p>
                <p className="text-sm mt-2">Terminez des livres pour en obtenir !</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {cards.map((card: any) => (
                <Card key={card.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="aspect-square relative">
                    <img
                      src={card.reward_types.image_url}
                      alt={card.reward_types.name}
                      className="w-full h-full object-cover"
                    />
                    <Badge 
                      className="absolute top-2 right-2"
                      variant={
                        card.reward_types.rarity === 'legendary' ? 'default' :
                        card.reward_types.rarity === 'epic' ? 'secondary' :
                        card.reward_types.rarity === 'rare' ? 'outline' : 'secondary'
                      }
                    >
                      {card.reward_types.rarity}
                    </Badge>
                  </div>
                  <CardContent className="p-3">
                    <p className="font-semibold text-sm line-clamp-2">{card.reward_types.name}</p>
                    <p className="text-xs text-muted-foreground">×{card.quantity}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="items" className="mt-6">
          {items.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <p>Aucun objet collectionné pour le moment</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {items.map((item: any) => (
                <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="aspect-square relative bg-muted flex items-center justify-center p-4">
                    <img
                      src={item.reward_types.image_url}
                      alt={item.reward_types.name}
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                  <CardContent className="p-3">
                    <p className="font-semibold text-sm line-clamp-2">{item.reward_types.name}</p>
                    <p className="text-xs text-muted-foreground">×{item.quantity}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          {history.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <p>Aucun coffre ouvert pour le moment</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {history.map((chest: any) => (
                <Card key={chest.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <Gift className={`w-5 h-5 ${chest.chest_type === 'gold' ? 'text-amber-500' : 'text-slate-400'}`} />
                          <span className="font-semibold">
                            Coffre {chest.chest_type === 'gold' ? 'Doré' : 'Argenté'}
                          </span>
                        </div>
                        {chest.books && (
                          <p className="text-sm text-muted-foreground mb-2">
                            {chest.books.title} - {chest.books.author}
                          </p>
                        )}
                        <div className="flex flex-wrap gap-2">
                          {chest.rewards_obtained.map((reward: any, idx: number) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {reward.name} ×{reward.quantity}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(chest.opened_at).toLocaleDateString('fr-FR')}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Collection Detail Dialog */}
      <CollectionDetailDialog
        progress={selectedCollection}
        open={!!selectedCollection}
        onOpenChange={(open) => !open && setSelectedCollection(null)}
        onRewardClaimed={() => {
          setSelectedCollection(null);
          loadCollections();
          loadInventory();
        }}
      />
    </div>
  );
}
