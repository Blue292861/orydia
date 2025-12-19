import React from 'react';
import { LeaderboardEntry } from '@/types/Leaderboard';
import { UserAvatar } from '@/components/UserAvatar';
import { Badge } from '@/components/ui/badge';
import { Coins, BookOpen, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LeaderboardCardProps {
  entry: LeaderboardEntry;
  isCurrentUser?: boolean;
  showPodium?: boolean;
}

export const LeaderboardCard: React.FC<LeaderboardCardProps> = ({
  entry,
  isCurrentUser = false,
  showPodium = false,
}) => {
  const getRankStyle = () => {
    if (!showPodium) return '';
    switch (entry.rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border-yellow-500/50 ring-2 ring-yellow-500/30';
      case 2:
        return 'bg-gradient-to-r from-slate-300/20 to-gray-400/20 border-slate-400/50 ring-1 ring-slate-400/30';
      case 3:
        return 'bg-gradient-to-r from-orange-600/20 to-amber-700/20 border-orange-600/50 ring-1 ring-orange-600/30';
      default:
        return '';
    }
  };

  const getRankBadge = () => {
    switch (entry.rank) {
      case 1:
        return <span className="text-2xl">🥇</span>;
      case 2:
        return <span className="text-2xl">🥈</span>;
      case 3:
        return <span className="text-2xl">🥉</span>;
      default:
        return (
          <span className="text-lg font-bold text-muted-foreground w-8 text-center">
            #{entry.rank}
          </span>
        );
    }
  };

  const displayName = entry.username || 
    [entry.firstName, entry.lastName].filter(Boolean).join(' ') || 
    'Utilisateur';

  return (
    <div
      className={cn(
        'flex items-center gap-3 p-3 rounded-lg border transition-all',
        'bg-card/50 border-border/50 hover:bg-card/80',
        getRankStyle(),
        isCurrentUser && 'ring-2 ring-primary/50 bg-primary/10'
      )}
    >
      {/* Rank */}
      <div className="flex-shrink-0 w-10 flex justify-center">
        {getRankBadge()}
      </div>

      {/* Avatar */}
      <UserAvatar
        avatarUrl={entry.avatarUrl}
        username={displayName}
        size="md"
      />

      {/* User Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={cn(
            'font-semibold truncate',
            isCurrentUser && 'text-primary'
          )}>
            {displayName}
          </span>
          {isCurrentUser && (
            <Badge variant="secondary" className="text-xs">Vous</Badge>
          )}
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Star className="w-3 h-3" />
            Niv. {entry.level}
          </span>
          {entry.guildName && (
            <span className="truncate">⚔️ {entry.guildName}</span>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="flex-shrink-0 text-right">
        <div className="flex items-center gap-1 text-amber-500 font-bold">
          <Coins className="w-4 h-4" />
          <span>{entry.totalPoints.toLocaleString()}</span>
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <BookOpen className="w-3 h-3" />
          <span>{entry.booksReadCount} lus</span>
        </div>
      </div>
    </div>
  );
};
