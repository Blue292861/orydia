import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { LeaderboardList } from './LeaderboardList';
import { 
  getGeneralLeaderboard, 
  getGuildLeaderboard, 
  getUserGuildId 
} from '@/services/leaderboardService';
import type { LeaderboardData } from '@/types/Leaderboard';
import { Trophy, Users, RefreshCw, Medal } from 'lucide-react';
import { toast } from 'sonner';

export const LeaderboardTab: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'general' | 'guild'>('general');
  const [generalData, setGeneralData] = useState<LeaderboardData | null>(null);
  const [guildData, setGuildData] = useState<LeaderboardData | null>(null);
  const [userGuildId, setUserGuildId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadLeaderboards = async (showRefreshToast = false) => {
    if (!user) return;

    try {
      if (showRefreshToast) setRefreshing(true);
      else setLoading(true);

      // Load general leaderboard
      const general = await getGeneralLeaderboard(user.id);
      setGeneralData(general);

      // Check if user is in a guild
      const guildId = await getUserGuildId(user.id);
      setUserGuildId(guildId);

      // Load guild leaderboard if user is in a guild
      if (guildId) {
        const guild = await getGuildLeaderboard(guildId, user.id);
        setGuildData(guild);
      }

      if (showRefreshToast) {
        toast.success('Classement actualisé');
      }
    } catch (error) {
      console.error('Error loading leaderboards:', error);
      toast.error('Erreur lors du chargement du classement');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadLeaderboards();
  }, [user]);

  const handleRefresh = () => {
    loadLeaderboards(true);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            Classement
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            Classement
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'general' | 'guild')}>
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="general" className="flex items-center gap-2">
              <Medal className="w-4 h-4" />
              Général
            </TabsTrigger>
            <TabsTrigger 
              value="guild" 
              disabled={!userGuildId}
              className="flex items-center gap-2"
            >
              <Users className="w-4 h-4" />
              Guilde
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general">
            {generalData && (
              <LeaderboardList
                topUsers={generalData.topUsers}
                currentUserEntry={generalData.currentUserEntry}
                currentUserId={user?.id}
              />
            )}
          </TabsContent>

          <TabsContent value="guild">
            {userGuildId && guildData ? (
              <LeaderboardList
                topUsers={guildData.topUsers}
                currentUserEntry={guildData.currentUserEntry}
                currentUserId={user?.id}
              />
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Rejoignez une guilde pour voir le classement</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
