
export interface Achievement {
  id: string;
  name: string;
  description: string;
  points: number;
  unlocked: boolean;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface UserStats {
  totalPoints: number;
  booksRead: string[];
  achievements: Achievement[];
  isPremium: boolean;
  level: number;
  experiencePoints: number;
}
