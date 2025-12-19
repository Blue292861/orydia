import React from 'react';
import { LeaderboardEntry } from '@/types/Leaderboard';
import { LeaderboardCard } from './LeaderboardCard';
import { Separator } from '@/components/ui/separator';

interface LeaderboardListProps {
  topUsers: LeaderboardEntry[];
  currentUserEntry: LeaderboardEntry | null;
  currentUserId?: string;
}

export const LeaderboardList: React.FC<LeaderboardListProps> = ({
  topUsers,
  currentUserEntry,
  currentUserId,
}) => {
  const isCurrentUserInTop10 = currentUserId && 
    topUsers.some(u => u.userId === currentUserId);

  return (
    <div className="space-y-2">
      {/* Podium (Top 3) */}
      <div className="space-y-2 mb-4">
        {topUsers.slice(0, 3).map((entry) => (
          <LeaderboardCard
            key={entry.userId}
            entry={entry}
            isCurrentUser={entry.userId === currentUserId}
            showPodium={true}
          />
        ))}
      </div>

      {topUsers.length > 3 && <Separator className="my-4" />}

      {/* Ranks 4-10 */}
      <div className="space-y-2">
        {topUsers.slice(3).map((entry) => (
          <LeaderboardCard
            key={entry.userId}
            entry={entry}
            isCurrentUser={entry.userId === currentUserId}
          />
        ))}
      </div>

      {/* Current user if not in top 10 */}
      {currentUserEntry && !isCurrentUserInTop10 && (
        <>
          <Separator className="my-4" />
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground text-center">
              Votre position
            </p>
            <LeaderboardCard
              entry={currentUserEntry}
              isCurrentUser={true}
            />
          </div>
        </>
      )}

      {topUsers.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          Aucun utilisateur dans le classement
        </div>
      )}
    </div>
  );
};
