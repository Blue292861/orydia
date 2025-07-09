
import { UserStats, Achievement } from './UserStats';

export interface UserStatsContextType {
  userStats: UserStats;
  addPointsForBook: (bookId: string, points: number) => void;
  spendPoints: (amount: number) => void;
  addAchievement: (achievement: Achievement) => void;
  updateAchievement: (achievement: Achievement) => void;
  deleteAchievement: (id: string) => void;
  applyPendingPremiumMonths: () => void;
  checkDailyAdLimit: () => Promise<boolean>;
  recordAdView: () => Promise<boolean>;
}
