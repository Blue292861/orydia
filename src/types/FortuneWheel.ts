// Types for Fortune Wheel system

export interface WheelSegment {
  id: string;
  type: 'orydors' | 'xp' | 'item';
  value?: number;
  rewardTypeId?: string;
  quantity?: number;
  probability: number;
  color: string;
  label: string;
}

export interface WheelConfig {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  segments: WheelSegment[];
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface WheelStreak {
  id: string;
  userId: string;
  currentStreak: number;
  maxStreak: number;
  lastSpinDate: string | null;
  streakBrokenAt: number | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface StreakBonus {
  id: string;
  streakLevel: number;
  bonusType: 'probability_boost' | 'quantity_boost';
  bonusValue: number;
  description: string;
  isActive: boolean;
}

export interface WheelSpinResult {
  segmentIndex: number;
  reward: {
    type: 'orydors' | 'xp' | 'item';
    value?: number;
    label: string;
    item?: {
      id: string;
      name: string;
      imageUrl: string;
      rarity: string;
      quantity: number;
    };
  };
  newStreak: number;
  bonusApplied?: string;
  xpData?: {
    xpBefore: number;
    xpAfter: number;
    xpGained: number;
    levelBefore: number;
    levelAfter: number;
    didLevelUp: boolean;
    newLevels: number[];
  };
}

// Constants
export const STREAK_RECOVERY_COST = 1650;
export const EXTRA_SPIN_PRICE_ID = 'price_1ShTILGB111MSE5PDiA0SlQ7';

// Default wheel segments
export const DEFAULT_WHEEL_SEGMENTS: WheelSegment[] = [
  { id: 'seg1', type: 'orydors', value: 200, probability: 50, color: '#FFD700', label: '200 Orydors' },
  { id: 'seg2', type: 'orydors', value: 1000, probability: 5, color: '#FF6B00', label: '1000 Orydors' },
  { id: 'seg3', type: 'item', rewardTypeId: '550e8400-e29b-41d4-a716-446655440000', quantity: 1, probability: 1, color: '#8B5CF6', label: "Clé d'Aildor" },
  { id: 'seg4', type: 'item', rewardTypeId: 'a1b2c3d4-5678-9012-3456-789012345678', quantity: 1, probability: 1, color: '#06B6D4', label: 'Fragment' },
  { id: 'seg5', type: 'xp', value: 40, probability: 43, color: '#10B981', label: '40 XP' },
];
