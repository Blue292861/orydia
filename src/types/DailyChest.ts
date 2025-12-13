export interface DailyChestItem {
  rewardTypeId: string;
  dropChance: number;
  quantity: number;
}

export interface DailyChestConfig {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  minOrydors: number;
  maxOrydors: number;
  itemPool: DailyChestItem[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DailyChestClaim {
  id: string;
  userId: string;
  configId: string | null;
  claimedAt: string;
  claimDate: string;
  orydorsWon: number;
  itemWonId: string | null;
  itemQuantity: number;
}

export interface DailyChestReward {
  orydors: number;
  item?: {
    id: string;
    name: string;
    imageUrl: string;
    rarity: string;
    quantity: number;
  };
}
