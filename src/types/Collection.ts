import { RewardType } from './RewardType';

export interface Collection {
  id: string;
  name: string;
  description: string | null;
  icon_url: string;
  orydors_reward: number;
  xp_reward: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CollectionItemReward {
  id: string;
  collection_id: string;
  reward_type_id: string;
  quantity: number;
  reward_type?: RewardType;
}

export interface UserCollectionCompletion {
  id: string;
  user_id: string;
  collection_id: string;
  completed_at: string;
  chest_claimed: boolean;
  claimed_at: string | null;
}

export interface CollectionCard {
  card: RewardType;
  owned: boolean;
  quantity: number;
}

export interface UserCollectionProgress {
  collection: Collection;
  totalCards: number;
  collectedCards: number;
  progress: number;
  isComplete: boolean;
  chestClaimed: boolean;
  cards: CollectionCard[];
}
