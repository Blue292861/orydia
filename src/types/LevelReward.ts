export interface LevelReward {
  id: string;
  level: number;
  orydorsReward: number;
  xpBonus: number;
  itemRewards: ItemRewardEntry[];
  premiumDays: number;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ItemRewardEntry {
  rewardTypeId: string;
  quantity: number;
}

export interface PendingLevelReward {
  id: string;
  userId: string;
  level: number;
  levelRewardId: string;
  createdAt: string;
  levelReward?: LevelReward;
}

export interface ClaimedLevelRewards {
  levels: number[];
  totalOrydors: number;
  totalXp: number;
  totalPremiumDays: number;
  items: { rewardTypeId: string; name: string; imageUrl: string; quantity: number; rarity: string }[];
}
