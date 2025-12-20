import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ReaderOathCard } from "@/components/ReaderOathCard";
import { ReaderOathDialog } from "@/components/ReaderOathDialog";
import { readerOathService } from "@/services/readerOathService";
import { ActiveOath, OathHistory, OathStats } from "@/types/ReaderOath";
import { Scroll, Plus, Trophy, Skull, TrendingUp, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function ReaderOathsSection() {
  const [activeOaths, setActiveOaths] = useState<ActiveOath[]>([]);
  const [oathHistory, setOathHistory] = useState<OathHistory[]>([]);
  const [stats, setStats] = useState<OathStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [active, history, oathStats] = await Promise.all([
        readerOathService.getActiveOaths(),
        readerOathService.getOathHistory(),
        readerOathService.getOathStats(),
      ]);
      setActiveOaths(active);
      setOathHistory(history);
      setStats(oathStats);
    } catch (error) {
      console.error("Error loading oaths:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOathPlaced = () => {
    loadData();
  };

  if (isLoading) {
    return (
      <Card className="border-amber-500/20">
        <CardContent className="py-8 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-transparent">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Scroll className="h-5 w-5 text-amber-500" />
              Serments du Lecteur
            </CardTitle>
            <Button
              size="sm"
              onClick={() => setShowDialog(true)}
              className="bg-amber-500 hover:bg-amber-600 text-black"
            >
              <Plus className="h-4 w-4 mr-1" />
              Nouveau serment
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Stats rapides */}
          {stats && stats.total_oaths > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div className="p-3 bg-muted/50 rounded-lg text-center">
                <p className="text-2xl font-bold">{stats.total_oaths}</p>
                <p className="text-xs text-muted-foreground">Total</p>
              </div>
              <div className="p-3 bg-green-500/10 rounded-lg text-center">
                <div className="flex items-center justify-center gap-1">
                  <Trophy className="h-4 w-4 text-green-500" />
                  <p className="text-2xl font-bold text-green-500">{stats.won_oaths}</p>
                </div>
                <p className="text-xs text-muted-foreground">Victoires</p>
              </div>
              <div className="p-3 bg-red-500/10 rounded-lg text-center">
                <div className="flex items-center justify-center gap-1">
                  <Skull className="h-4 w-4 text-red-500" />
                  <p className="text-2xl font-bold text-red-500">{stats.lost_oaths}</p>
                </div>
                <p className="text-xs text-muted-foreground">Défaites</p>
              </div>
              <div className="p-3 bg-primary/10 rounded-lg text-center">
                <div className="flex items-center justify-center gap-1">
                  <TrendingUp className={cn(
                    "h-4 w-4",
                    stats.net_profit >= 0 ? "text-green-500" : "text-red-500"
                  )} />
                  <p className={cn(
                    "text-2xl font-bold",
                    stats.net_profit >= 0 ? "text-green-500" : "text-red-500"
                  )}>
                    {stats.net_profit >= 0 ? '+' : ''}{stats.net_profit}
                  </p>
                </div>
                <p className="text-xs text-muted-foreground">Profit net</p>
              </div>
            </div>
          )}

          <Tabs defaultValue="active">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="active" className="gap-1">
                En cours
                {activeOaths.length > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 text-xs bg-amber-500/20 text-amber-500 rounded-full">
                    {activeOaths.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="history">Historique</TabsTrigger>
            </TabsList>

            <TabsContent value="active" className="mt-4 space-y-3">
              {activeOaths.length === 0 ? (
                <div className="text-center py-8">
                  <Scroll className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-muted-foreground">Aucun serment en cours</p>
                  <p className="text-sm text-muted-foreground/70 mt-1">
                    Placez un pari sur votre prochain livre !
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowDialog(true)}
                    className="mt-4"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Faire un serment
                  </Button>
                </div>
              ) : (
                activeOaths.map((oath) => (
                  <ReaderOathCard key={oath.id} oath={oath} variant="active" />
                ))
              )}
            </TabsContent>

            <TabsContent value="history" className="mt-4 space-y-3">
              {oathHistory.length === 0 ? (
                <div className="text-center py-8">
                  <Trophy className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-muted-foreground">Pas encore d'historique</p>
                  <p className="text-sm text-muted-foreground/70 mt-1">
                    Vos serments résolus apparaîtront ici
                  </p>
                </div>
              ) : (
                oathHistory.map((oath) => (
                  <ReaderOathCard key={oath.id} oath={oath} variant="history" />
                ))
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <ReaderOathDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        onOathPlaced={handleOathPlaced}
      />
    </>
  );
}
