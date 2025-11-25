export interface ItemReward {
  rewardTypeId: string;  // ID du reward_type dans la table
  quantity: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  points: number;
  xpReward?: number; // Points d'XP donnés par ce succès
  unlocked: boolean;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary' | 'ultra-legendary';
  premiumMonths?: number; // Number of premium months offered as reward
  itemRewards?: ItemReward[]; // Items donnés en récompense
}

export interface LevelInfo {
  level: number;
  currentXp: number;
  nextLevelXp: number;
  levelTitle: string;
  progressPercentage: number;
}

export interface UserStats {
  totalPoints: number;
  booksRead: string[];
  achievements: Achievement[];
  isPremium: boolean;
  level: number;
  experiencePoints: number;
  levelInfo?: LevelInfo;
  pendingPremiumMonths?: number; // Months of premium pending to be applied
  tutorialsSeen: string[]; // Ajout de la nouvelle propriété
}
