// src/types/UserStatsContext.ts

import { UserStats, Achievement } from './UserStats';

export interface UserStatsContextType {
  userStats: UserStats;
  loadUserStats: () => Promise<void>;
  addPointsForBook: (bookId: string, points: number) => void;
  openChestForBook: (bookId: string, bookTitle: string) => Promise<any>;
  spendPoints: (amount: number) => void;
  addAchievement: (achievement: Achievement) => void;
  updateAchievement: (achievement: Achievement) => void;
  deleteAchievement: (id: string) => void;
  applyPendingPremiumMonths: () => void;
  checkDailyAdLimit: () => Promise<boolean>;
  recordAdView: () => Promise<boolean>;
  markTutorialAsSeen: (tutorialId: string) => void;
  completeTutorial: () => Promise<void>;
}
