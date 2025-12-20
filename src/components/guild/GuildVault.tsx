import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Coins, Key, CreditCard, TrendingUp, TrendingDown, ArrowRightLeft } from "lucide-react";
import { GuildVault as GuildVaultType, GuildVaultCard, GuildVaultTransaction } from "@/types/GuildVault";
import { getGuildVault, getVaultCards, getVaultTransactions } from "@/services/guildVaultService";
import { hasGuildPermission } from "@/services/guildRankService";
import { GuildVaultDeposit } from "./GuildVaultDeposit";
import { GuildVaultWithdraw } from "./GuildVaultWithdraw";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

interface GuildVaultProps {
  guildId: string;
  onRefresh?: () => void;
}

export function GuildVault({ guildId, onRefresh }: GuildVaultProps) {
  const [vault, setVault] = useState<GuildVaultType | null>(null);
  const [cards, setCards] = useState<GuildVaultCard[]>([]);
  const [transactions, setTransactions] = useState<GuildVaultTransaction[]>([]);
  const [canWithdraw, setCanWithdraw] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showDeposit, setShowDeposit] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);

  const loadData = async () => {
    try {
      const [vaultData, cardsData, transactionsData, permission] = await Promise.all([
        getGuildVault(guildId),
        getVaultCards(guildId),
        getVaultTransactions(guildId),
        hasGuildPermission(guildId, 'can_withdraw')
      ]);
      setVault(vaultData);
      setCards(cardsData);
      setTransactions(transactionsData);
      setCanWithdraw(permission);
    } catch (error) {
      console.error('Error loading vault:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [guildId]);

  const handleRefresh = () => {
    loadData();
    onRefresh?.();
  };

  const getTransactionIcon = (action: string) => {
    switch (action) {
      case 'deposit': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'withdraw': return <TrendingDown className="h-4 w-4 text-red-500" />;
      case 'assign': return <ArrowRightLeft className="h-4 w-4 text-blue-500" />;
      default: return null;
    }
  };

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'orydors': return <Coins className="h-4 w-4 text-yellow-500" />;
      case 'aildor_key': return <Key className="h-4 w-4 text-purple-500" />;
      case 'card': return <CreditCard className="h-4 w-4 text-blue-500" />;
      default: return null;
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8">Chargement...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Vault Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-gold-500/10 to-gold-600/10 border-gold-500/30">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-full bg-gold-500/20">
              <Coins className="h-6 w-6 text-gold-400" />
            </div>
            <div>
              <p className="text-sm text-wood-200">Orydors</p>
              <p className="text-2xl font-bold text-gold-300">{vault?.orydors?.toLocaleString() || 0}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500/10 to-violet-500/10 border-purple-500/30">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-full bg-purple-500/20">
              <Key className="h-6 w-6 text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-wood-200">Clés d'Aildor</p>
              <p className="text-2xl font-bold text-purple-300">{vault?.aildor_keys || 0}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/30">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-full bg-blue-500/20">
              <CreditCard className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-wood-200">Cartes</p>
              <p className="text-2xl font-bold text-blue-300">{cards.reduce((sum, c) => sum + c.quantity, 0)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Button onClick={() => setShowDeposit(true)} className="gap-2 bg-gold-500 hover:bg-gold-600 text-forest-900">
          <TrendingUp className="h-4 w-4" />
          Déposer
        </Button>
        {canWithdraw && (
          <Button variant="outline" onClick={() => setShowWithdraw(true)} className="gap-2 border-forest-500 text-wood-100 hover:bg-forest-700">
            <ArrowRightLeft className="h-4 w-4" />
            Attribuer des ressources
          </Button>
        )}
      </div>

      {/* Content Tabs */}
      <Tabs defaultValue="transactions">
        <TabsList className="bg-forest-800/50 border border-forest-600">
          <TabsTrigger value="transactions" className="data-[state=active]:bg-gold-500/20 data-[state=active]:text-gold-300">Historique</TabsTrigger>
          <TabsTrigger value="cards" className="data-[state=active]:bg-gold-500/20 data-[state=active]:text-gold-300">Cartes ({cards.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="transactions" className="mt-4">
          <Card className="bg-forest-800/50 border-forest-600">
            <CardHeader>
              <CardTitle className="text-lg text-wood-100">Dernières transactions</CardTitle>
            </CardHeader>
            <CardContent>
              {transactions.length === 0 ? (
                <p className="text-wood-200 text-center py-4">Aucune transaction</p>
              ) : (
                <div className="space-y-3">
                  {transactions.map((t) => (
                    <div key={t.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-forest-700/50">
                      {getTransactionIcon(t.action)}
                      {getResourceIcon(t.resource_type)}
                      <div className="flex-1">
                        <p className="text-sm text-wood-100">
                          <span className="font-medium">
                            {t.user_profile?.username || t.user_profile?.first_name || 'Membre'}
                          </span>
                          {t.action === 'deposit' && ' a déposé '}
                          {t.action === 'assign' && ' a attribué '}
                          <span className="font-medium">{t.quantity}</span>
                          {t.resource_type === 'orydors' && ' Orydors'}
                          {t.resource_type === 'aildor_key' && ' Clé(s) d\'Aildor'}
                          {t.resource_type === 'card' && ' Carte(s)'}
                          {t.action === 'assign' && t.recipient_profile && (
                            <> à <span className="font-medium">
                              {t.recipient_profile.username || t.recipient_profile.first_name}
                            </span></>
                          )}
                        </p>
                      </div>
                      <span className="text-xs text-wood-300">
                        {formatDistanceToNow(new Date(t.created_at), { addSuffix: true, locale: fr })}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cards" className="mt-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {cards.map((card) => (
              <Card key={card.id} className="overflow-hidden bg-forest-800/50 border-forest-600">
                <img 
                  src={card.reward_type?.image_url} 
                  alt={card.reward_type?.name}
                  className="w-full h-32 object-cover"
                />
                <CardContent className="p-3">
                  <p className="font-medium text-sm truncate text-wood-100">{card.reward_type?.name}</p>
                  <p className="text-xs text-wood-300">x{card.quantity}</p>
                </CardContent>
              </Card>
            ))}
            {cards.length === 0 && (
              <p className="col-span-full text-center text-wood-200 py-8">
                Aucune carte dans le coffre
              </p>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <GuildVaultDeposit 
        open={showDeposit} 
        onOpenChange={setShowDeposit}
        guildId={guildId}
        onSuccess={handleRefresh}
      />
      
      {canWithdraw && (
        <GuildVaultWithdraw 
          open={showWithdraw}
          onOpenChange={setShowWithdraw}
          guildId={guildId}
          vault={vault}
          cards={cards}
          onSuccess={handleRefresh}
        />
      )}
    </div>
  );
}
