export interface RewardType {
  id: string;
  name: string;
  description: string | null;
  category: 'currency' | 'fragment' | 'card' | 'item';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  image_url: string;
  metadata: Record<string, any>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface LootTable {
  id: string;
  book_id: string | null;
  genre: string | null;
  chest_type: 'silver' | 'gold';
  reward_type_id: string | null;
  drop_chance_percentage: number;
  min_quantity: number;
  max_quantity: number;
  created_at: string;
}

export interface UserInventoryItem {
  id: string;
  user_id: string;
  reward_type_id: string | null;
  quantity: number;
  acquired_at: string;
  updated_at: string;
}

export interface ChestOpening {
  id: string;
  user_id: string;
  book_id: string | null;
  chest_type: 'silver' | 'gold';
  rewards_obtained: ChestReward[];
  opened_at: string;
}

export interface GemFragments {
  id: string;
  user_id: string;
  fragment_count: number;
  premium_months_claimed: number;
  created_at: string;
  updated_at: string;
}

export interface ChestReward {
  type: string;
  name: string;
  quantity: number;
  imageUrl: string;
  rarity: string;
  rewardTypeId: string;
}

export interface ChestRollResult {
  chestType: 'silver' | 'gold';
  orydors: number;
  orydorsVariation: number;
  additionalRewards: ChestReward[];
}
