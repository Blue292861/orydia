export interface GiftRewardItem {
  reward_type_id: string;
  quantity: number;
  name?: string;
  image_url?: string;
}

export interface GiftRewards {
  orydors?: number;
  xp?: number;
  items?: GiftRewardItem[];
}

export interface AdminGift {
  id: string;
  title: string;
  message: string;
  rewards: GiftRewards;
  recipient_type: 'all' | 'premium' | 'specific';
  recipient_user_ids: string[];
  expires_at: string | null;
  is_persistent: boolean;
  created_by?: string;
  created_at: string;
}

export interface GiftWithClaimStatus extends AdminGift {
  is_claimed: boolean;
}

export interface UserGiftClaim {
  id: string;
  user_id: string;
  gift_id: string;
  claimed_at: string;
}
