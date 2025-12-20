import React from 'react';
import { LeaderboardEntry } from '@/types/Leaderboard';
import { UserAvatar } from '@/components/UserAvatar';
import { Badge } from '@/components/ui/badge';
import { Coins, BookOpen, Star, Crown } from 'lucide-react';
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
        'relative flex items-center gap-3 p-3 rounded-lg border transition-all',
        'bg-card/50 border-border/50 hover:bg-card/80',
        getRankStyle(),
        isCurrentUser && 'ring-2 ring-primary/50 bg-primary/10',
        // Premium golden frame styling
        entry.isPremium && !isCurrentUser && !showPodium && [
          'border-2 border-amber-400/60',
          'bg-gradient-to-r from-amber-500/5 via-yellow-500/10 to-amber-500/5',
          'shadow-[0_0_15px_-3px_rgba(251,191,36,0.3)]',
        ],
        entry.isPremium && showPodium && [
          'shadow-[0_0_20px_-3px_rgba(251,191,36,0.4)]',
        ]
      )}
    >
      {/* Premium corner decoration */}
      {entry.isPremium && (
        <div className="absolute -top-1 -right-1 z-10">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-400 to-yellow-600 rounded-full blur-sm opacity-60" />
            <div className="relative bg-gradient-to-br from-amber-400 to-yellow-500 rounded-full p-1 shadow-lg">
              <Crown className="w-3 h-3 text-amber-900" />
            </div>
          </div>
        </div>
      )}

      {/* Premium shimmer effect */}
      {entry.isPremium && (
        <div className="absolute inset-0 rounded-lg overflow-hidden pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-400/10 to-transparent animate-shimmer-slide" />
        </div>
      )}

      {/* Rank */}
      <div className="flex-shrink-0 w-10 flex justify-center">
        {getRankBadge()}
      </div>

      {/* Avatar with premium ring */}
      <div className={cn(
        'relative',
        entry.isPremium && 'ring-2 ring-amber-400/50 ring-offset-1 ring-offset-background rounded-full'
      )}>
        <UserAvatar
          avatarUrl={entry.avatarUrl}
          username={displayName}
          size="md"
        />
      </div>

      {/* User Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={cn(
            'font-semibold truncate',
            isCurrentUser && 'text-primary',
            entry.isPremium && 'text-amber-500'
          )}>
            {displayName}
          </span>
          {entry.isPremium && (
            <Badge 
              variant="outline" 
              className="text-[10px] px-1.5 py-0 bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border-amber-400/50 text-amber-500"
            >
              Premium
            </Badge>
          )}
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
        <div className={cn(
          'flex items-center gap-1 font-bold',
          entry.isPremium ? 'text-amber-400' : 'text-amber-500'
        )}>
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
