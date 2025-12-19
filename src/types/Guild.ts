export interface Guild {
  id: string;
  name: string;
  slogan: string | null;
  banner_url: string | null;
  owner_id: string;
  member_count: number;
  is_active: boolean;
  creation_cost: number;
  created_at: string;
  updated_at: string;
}

export interface GuildMember {
  id: string;
  guild_id: string;
  user_id: string;
  role: 'owner' | 'admin' | 'member';
  joined_at: string;
  // Joined profile data
  profile?: {
    username: string | null;
    avatar_url: string | null;
    first_name: string | null;
    last_name: string | null;
  } | null;
}

export interface GuildWithMembers extends Guild {
  members: GuildMember[];
}

export interface CreateGuildData {
  name: string;
  slogan?: string;
  bannerFile?: File;
}

export interface GuildSearchResult {
  id: string;
  name: string;
  slogan: string | null;
  banner_url: string | null;
  member_count: number;
  owner_username: string | null;
}
