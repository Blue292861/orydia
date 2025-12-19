export interface LeaderboardEntry {
  userId: string;
  username: string;
  avatarUrl: string | null;
  firstName: string | null;
  lastName: string | null;
  totalPoints: number;
  booksReadCount: number;
  level: number;
  experiencePoints: number;
  guildId: string | null;
  guildName: string | null;
  rank: number;
}

export interface LeaderboardData {
  topUsers: LeaderboardEntry[];
  currentUserEntry: LeaderboardEntry | null;
  currentUserRank: number | null;
}
