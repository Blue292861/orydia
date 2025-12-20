import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useUserStats } from '@/contexts/UserStatsContext';
import { getMyGuild, getGuildMembers, GUILD_COST } from '@/services/guildService';
import { Guild, GuildMember } from '@/types/Guild';
import { GuildCreationDialog } from './guild/GuildCreationDialog';
import { GuildSearchList } from './guild/GuildSearchList';
import { GuildDashboard } from './guild/GuildDashboard';
import { Shield, Plus, Search, Loader2, Coins, Users, Sparkles } from 'lucide-react';

export const GuildPage: React.FC = () => {
  const { user } = useAuth();
  const { userStats } = useUserStats();
  const [isLoading, setIsLoading] = useState(true);
  const [myGuild, setMyGuild] = useState<Guild | null>(null);
  const [myMembership, setMyMembership] = useState<GuildMember | null>(null);
  const [guildMembers, setGuildMembers] = useState<GuildMember[]>([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [activeTab, setActiveTab] = useState<'search' | 'create'>('search');

  const loadGuildData = async () => {
    setIsLoading(true);
    try {
      const result = await getMyGuild();
      if (result) {
        setMyGuild(result.guild);
        setMyMembership(result.membership);
        const members = await getGuildMembers(result.guild.id);
        setGuildMembers(members);
      } else {
        setMyGuild(null);
        setMyMembership(null);
        setGuildMembers([]);
      }
    } catch (error) {
      console.error('Error loading guild data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadGuildData();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <Shield className="w-16 h-16 text-gold-400/50 mb-4" />
        <h2 className="text-xl font-semibold text-wood-100 mb-2">Guildes de Lecture</h2>
        <p className="text-wood-200 text-center max-w-md">
          Connectez-vous pour rejoindre ou créer une guilde de lecture et partager votre passion avec d'autres lecteurs.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-gold-400" />
      </div>
    );
  }

  // User has a guild - show dashboard
  if (myGuild && myMembership) {
    return (
      <div className="p-4 pb-24">
        <GuildDashboard
          guild={myGuild}
          membership={myMembership}
          members={guildMembers}
          onLeaveSuccess={loadGuildData}
          onRefresh={loadGuildData}
        />
      </div>
    );
  }

  // User has no guild - show join/create options
  return (
    <div className="p-4 pb-24 space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-gold-500/20 to-forest-600 mb-4">
          <Shield className="w-8 h-8 text-gold-400" />
        </div>
        <h1 className="text-2xl font-bold text-gold-300 mb-2">Guildes de Lecture</h1>
        <p className="text-wood-200 max-w-md mx-auto">
          Rejoignez une communauté de lecteurs ou fondez votre propre guilde !
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="p-4 bg-forest-800/50 border-forest-600">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gold-500/20">
              <Coins className="w-5 h-5 text-gold-400" />
            </div>
            <div>
              <p className="text-xs text-wood-200">Vos Orydors</p>
              <p className="text-lg font-bold text-gold-300">{userStats.totalPoints.toLocaleString()}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 bg-forest-800/50 border-forest-600">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gold-500/20">
              <Sparkles className="w-5 h-5 text-gold-400" />
            </div>
            <div>
              <p className="text-xs text-wood-200">Coût création</p>
              <p className="text-lg font-bold text-gold-300">{GUILD_COST.toLocaleString()}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Tabs for search/create */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'search' | 'create')} className="w-full">
        <TabsList className="w-full bg-forest-800/50 border border-forest-600">
          <TabsTrigger 
            value="search" 
            className="flex-1 data-[state=active]:bg-gold-500/20 data-[state=active]:text-gold-300"
          >
            <Search className="w-4 h-4 mr-2" />
            Rejoindre
          </TabsTrigger>
          <TabsTrigger 
            value="create" 
            className="flex-1 data-[state=active]:bg-gold-500/20 data-[state=active]:text-gold-300"
          >
            <Plus className="w-4 h-4 mr-2" />
            Créer
          </TabsTrigger>
        </TabsList>

        <TabsContent value="search" className="mt-4">
          <GuildSearchList onJoinSuccess={loadGuildData} />
        </TabsContent>

        <TabsContent value="create" className="mt-4">
          <Card className="p-6 bg-forest-800/50 border-forest-600">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-gold-500/30 to-forest-600 mb-4">
                <Shield className="w-7 h-7 text-gold-400" />
              </div>
              <h3 className="text-lg font-semibold text-wood-100 mb-2">Fondez votre guilde</h3>
              <p className="text-wood-200 text-sm mb-6">
                Créez votre propre communauté de lecteurs, donnez-lui un nom unique et rassemblez des passionnés autour de vos lectures favorites.
              </p>

              <div className="bg-forest-700/50 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between">
                  <span className="text-wood-100">Coût de création</span>
                  <span className="flex items-center gap-2 font-bold text-gold-400">
                    <Coins className="w-4 h-4" />
                    {GUILD_COST.toLocaleString()} Orydors
                  </span>
                </div>
                {userStats.totalPoints < GUILD_COST && (
                  <p className="text-red-400 text-xs mt-2">
                    Il vous manque {(GUILD_COST - userStats.totalPoints).toLocaleString()} Orydors
                  </p>
                )}
              </div>

              <Button
                onClick={() => setShowCreateDialog(true)}
                disabled={userStats.totalPoints < GUILD_COST}
                className="w-full bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-forest-900"
              >
                <Plus className="w-4 h-4 mr-2" />
                Créer ma guilde
              </Button>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create dialog */}
      <GuildCreationDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSuccess={loadGuildData}
      />
    </div>
  );
};
