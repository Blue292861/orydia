import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Guild, GuildMember } from '@/types/Guild';
import { GuildMembersList } from './GuildMembersList';
import { GuildSettings } from './GuildSettings';
import { GuildChat } from './GuildChat';
import { GuildAnnouncementBoard } from './GuildAnnouncementBoard';
import { Shield, Users, Settings, MessageCircle, Megaphone, Crown } from 'lucide-react';

interface GuildDashboardProps {
  guild: Guild;
  membership: GuildMember;
  members: GuildMember[];
  onLeaveSuccess: () => void;
  onRefresh: () => void;
}

export const GuildDashboard: React.FC<GuildDashboardProps> = ({
  guild,
  membership,
  members,
  onLeaveSuccess,
  onRefresh
}) => {
  const [activeTab, setActiveTab] = useState('info');
  const isOwner = membership.role === 'owner';
  const isAdmin = membership.role === 'admin' || isOwner;

  return (
    <div className="space-y-4">
      {/* Guild header */}
      <Card className="relative overflow-hidden bg-forest-800/50 border-forest-600">
        {/* Banner */}
        {guild.banner_url && (
          <div 
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage: `url(${guild.banner_url})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-forest-900/90 to-transparent" />

        <div className="relative p-6">
          <div className="flex items-start gap-4">
            {/* Guild icon */}
            <div className="flex-shrink-0 w-20 h-20 rounded-xl bg-gradient-to-br from-gold-500/30 to-forest-600 flex items-center justify-center overflow-hidden border-2 border-gold-500/30">
              {guild.banner_url ? (
                <img src={guild.banner_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <Shield className="w-10 h-10 text-gold-400" />
              )}
            </div>

            {/* Guild info */}
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-gold-300">{guild.name}</h1>
                {isOwner && <Crown className="w-5 h-5 text-gold-400" />}
              </div>
              {guild.slogan && (
                <p className="text-wood-300 italic mt-1">"{guild.slogan}"</p>
              )}
              <div className="flex items-center gap-4 mt-3 text-sm text-wood-200">
                <span className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {guild.member_count} membre{guild.member_count > 1 ? 's' : ''}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-forest-700 text-wood-100 text-xs">
                  {membership.role === 'owner' ? 'Fondateur' : 
                   membership.role === 'admin' ? 'Administrateur' : 'Membre'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full bg-forest-800/50 border border-forest-600">
          <TabsTrigger value="info" className="flex-1 data-[state=active]:bg-gold-500/20 data-[state=active]:text-gold-300">
            <Megaphone className="w-4 h-4 mr-2" />
            Annonces
          </TabsTrigger>
          <TabsTrigger value="chat" className="flex-1 data-[state=active]:bg-gold-500/20 data-[state=active]:text-gold-300">
            <MessageCircle className="w-4 h-4 mr-2" />
            Chat
          </TabsTrigger>
          <TabsTrigger value="members" className="flex-1 data-[state=active]:bg-gold-500/20 data-[state=active]:text-gold-300">
            <Users className="w-4 h-4 mr-2" />
            Membres
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex-1 data-[state=active]:bg-gold-500/20 data-[state=active]:text-gold-300">
            <Settings className="w-4 h-4 mr-2" />
            Paramètres
          </TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="mt-4">
          <GuildAnnouncementBoard guildId={guild.id} isAdmin={isAdmin} />
        </TabsContent>

        <TabsContent value="chat" className="mt-4">
          <GuildChat guildId={guild.id} />
        </TabsContent>

        <TabsContent value="members" className="mt-4">
          <GuildMembersList members={members} currentUserId={membership.user_id} />
        </TabsContent>

        <TabsContent value="settings" className="mt-4">
          <GuildSettings 
            guild={guild} 
            membership={membership}
            onLeaveSuccess={onLeaveSuccess}
            onUpdateSuccess={onRefresh}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};
