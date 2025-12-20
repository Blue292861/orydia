// Types for chest rewards and XP animations

export interface XPData {
  xpBefore: number;
  xpAfter: number;
  xpGained: number;
  levelBefore: number;
  levelAfter: number;
  didLevelUp: boolean;
  newLevels: number[]; // All levels gained (for multi-level ups)
}

export interface ChestReward {
  type: string;
  name: string;
  quantity: number;
  imageUrl: string;
  rarity: string;
  rewardTypeId: string;
}

export interface ChestOpeningResult {
  chestType: 'silver' | 'gold';
  orydors: number;
  orydorsVariation: number;
  additionalRewards: ChestReward[];
  xpData: XPData;
}
