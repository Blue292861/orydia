import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { searchGuilds, getAllGuilds, joinGuild } from '@/services/guildService';
import { GuildSearchResult } from '@/types/Guild';
import { Search, Users, Loader2, Shield, Crown } from 'lucide-react';

interface GuildSearchListProps {
  onJoinSuccess: () => void;
}

export const GuildSearchList: React.FC<GuildSearchListProps> = ({ onJoinSuccess }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [guilds, setGuilds] = useState<GuildSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [joiningGuildId, setJoiningGuildId] = useState<string | null>(null);

  const loadGuilds = async () => {
    setIsLoading(true);
    try {
      const data = searchQuery.trim() 
        ? await searchGuilds(searchQuery.trim())
        : await getAllGuilds();
      setGuilds(data);
    } catch (error) {
      console.error('Error loading guilds:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadGuilds();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadGuilds();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleJoin = async (guildId: string, guildName: string) => {
    setJoiningGuildId(guildId);
    try {
      const result = await joinGuild(guildId);
      if (result.success) {
        toast({
          title: '🎉 Bienvenue !',
          description: `Vous avez rejoint la guilde "${guildName}"`
        });
        onJoinSuccess();
      } else {
        toast({
          title: 'Erreur',
          description: result.error || 'Impossible de rejoindre la guilde',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue',
        variant: 'destructive'
      });
    } finally {
      setJoiningGuildId(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Search input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-wood-400" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Rechercher une guilde..."
          className="pl-10 bg-forest-700/50 border-forest-500 text-wood-100 placeholder:text-wood-500"
        />
      </div>

      {/* Guilds list */}
      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-gold-400" />
          </div>
        ) : guilds.length === 0 ? (
          <div className="text-center py-8 text-wood-400">
            <Shield className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>Aucune guilde trouvée</p>
            {searchQuery && <p className="text-sm mt-1">Essayez une autre recherche</p>}
          </div>
        ) : (
          guilds.map((guild) => (
            <Card 
              key={guild.id} 
              className="relative overflow-hidden bg-forest-800/50 border-forest-600 hover:border-gold-500/30 transition-colors"
            >
              {/* Banner background */}
              {guild.banner_url && (
                <div 
                  className="absolute inset-0 opacity-20"
                  style={{
                    backgroundImage: `url(${guild.banner_url})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}
                />
              )}
              
              <div className="relative p-4 flex items-center gap-4">
                {/* Guild icon */}
                <div className="flex-shrink-0 w-14 h-14 rounded-lg bg-gradient-to-br from-gold-500/20 to-forest-600 flex items-center justify-center overflow-hidden">
                  {guild.banner_url ? (
                    <img src={guild.banner_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <Shield className="w-7 h-7 text-gold-400" />
                  )}
                </div>

                {/* Guild info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-wood-100 truncate">{guild.name}</h3>
                  {guild.slogan && (
                    <p className="text-sm text-wood-400 truncate italic">"{guild.slogan}"</p>
                  )}
                  <div className="flex items-center gap-3 mt-1 text-xs text-wood-500">
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {guild.member_count} membre{guild.member_count > 1 ? 's' : ''}
                    </span>
                    {guild.owner_username && (
                      <span className="flex items-center gap-1">
                        <Crown className="w-3 h-3 text-gold-400" />
                        {guild.owner_username}
                      </span>
                    )}
                  </div>
                </div>

                {/* Join button */}
                <Button
                  size="sm"
                  onClick={() => handleJoin(guild.id, guild.name)}
                  disabled={joiningGuildId === guild.id}
                  className="flex-shrink-0 bg-gold-500 hover:bg-gold-600 text-forest-900"
                >
                  {joiningGuildId === guild.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    'Rejoindre'
                  )}
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
