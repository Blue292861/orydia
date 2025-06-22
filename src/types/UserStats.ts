
export interface Achievement {
  id: string;
  name: string;
  description: string;
  points: number;
  unlocked: boolean;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary' | 'ultra-legendary';
  premiumMonths?: number; // Number of premium months offered as reward
}

export interface UserStats {
  totalPoints: number;
  booksRead: string[];
  achievements: Achievement[];
  isPremium: boolean;
  level: number;
  experiencePoints: number;
  pendingPremiumMonths?: number; // Months of premium pending to be applied
}
