export type GuildRankType = 
  | 'guild_leader'
  | 'treasurer'
  | 'reading_champion'
  | 'genre_champion'
  | 'lore_keeper'
  | 'dragon_slayer'
  | 'veteran'
  | 'elite'
  | 'member';

export interface GuildRankPermissions {
  can_withdraw: boolean;
  can_assign_ranks: boolean;
  can_manage_announcements: boolean;
}

export interface GuildRank {
  id: string;
  guild_id: string;
  rank_type: GuildRankType;
  display_name: string;
  description: string | null;
  icon: string;
  color: string;
  permissions: GuildRankPermissions;
  max_holders: number | null;
  priority: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface GuildMemberRank {
  id: string;
  guild_id: string;
  user_id: string;
  rank_id: string;
  assigned_by: string | null;
  assigned_at: string;
  // Joined data
  rank?: GuildRank;
}

export interface GuildVault {
  id: string;
  guild_id: string;
  orydors: number;
  aildor_keys: number;
  created_at: string;
  updated_at: string;
}

export interface GuildVaultCard {
  id: string;
  guild_id: string;
  reward_type_id: string;
  quantity: number;
  created_at: string;
  updated_at: string;
  // Joined data
  reward_type?: {
    id: string;
    name: string;
    image_url: string;
    rarity: string;
    category: string;
    description: string | null;
  };
}

export type VaultTransactionAction = 'deposit' | 'withdraw' | 'assign';
export type VaultResourceType = 'orydors' | 'aildor_key' | 'card';

export interface GuildVaultTransaction {
  id: string;
  guild_id: string;
  user_id: string;
  action: VaultTransactionAction;
  resource_type: VaultResourceType;
  resource_id: string | null;
  quantity: number;
  recipient_id: string | null;
  note: string | null;
  created_at: string;
  // Joined data
  user_profile?: {
    username: string | null;
    avatar_url: string | null;
    first_name: string | null;
  };
  recipient_profile?: {
    username: string | null;
    avatar_url: string | null;
    first_name: string | null;
  };
  reward_type?: {
    name: string;
    image_url: string;
  };
}

export interface DepositRequest {
  resource_type: VaultResourceType;
  quantity: number;
  reward_type_id?: string; // For cards
}

export interface WithdrawRequest {
  resource_type: VaultResourceType;
  quantity: number;
  recipient_id: string;
  reward_type_id?: string; // For cards
  note?: string;
}

export interface UserDuplicateCard {
  reward_type_id: string;
  quantity: number;
  available_to_deposit: number; // quantity - 1
  reward_type: {
    id: string;
    name: string;
    image_url: string;
    rarity: string;
    category: string;
  };
}

export interface GuildMemberWithRanks {
  id: string;
  guild_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'member';
  joined_at: string;
  profile?: {
    username: string | null;
    avatar_url: string | null;
    first_name: string | null;
    last_name: string | null;
  } | null;
  ranks: GuildMemberRank[];
}
