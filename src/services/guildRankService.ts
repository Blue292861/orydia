import { supabase } from "@/integrations/supabase/client";
import { GuildRank, GuildMemberRank, GuildRankType, GuildRankPermissions } from "@/types/GuildVault";

/**
 * Parse permissions from JSON
 */
function parsePermissions(permissions: unknown): GuildRankPermissions {
  const p = permissions as Record<string, boolean> | null;
  return {
    can_withdraw: p?.can_withdraw ?? false,
    can_assign_ranks: p?.can_assign_ranks ?? false,
    can_manage_announcements: p?.can_manage_announcements ?? false
  };
}

/**
 * Get all ranks for a guild
 */
export async function getGuildRanks(guildId: string): Promise<GuildRank[]> {
  const { data, error } = await supabase
    .from('guild_ranks')
    .select('*')
    .eq('guild_id', guildId)
    .eq('is_active', true)
    .order('priority', { ascending: false });

  if (error) throw error;
  
  return (data || []).map(row => ({
    ...row,
    permissions: parsePermissions(row.permissions)
  })) as GuildRank[];
}

/**
 * Get all rank assignments for a guild
 */
export async function getGuildMemberRanks(guildId: string): Promise<GuildMemberRank[]> {
  const { data, error } = await supabase
    .from('guild_member_ranks')
    .select(`
      *,
      rank:guild_ranks(*)
    `)
    .eq('guild_id', guildId);

  if (error) throw error;
  
  return (data || []).map((row: any) => ({
    ...row,
    rank: row.rank ? {
      ...row.rank,
      permissions: parsePermissions(row.rank.permissions)
    } : undefined
  })) as GuildMemberRank[];
}

/**
 * Get ranks for a specific member
 */
export async function getMemberRanks(guildId: string, userId: string): Promise<GuildMemberRank[]> {
  const { data, error } = await supabase
    .from('guild_member_ranks')
    .select(`
      *,
      rank:guild_ranks(*)
    `)
    .eq('guild_id', guildId)
    .eq('user_id', userId);

  if (error) throw error;
  
  return (data || []).map((row: any) => ({
    ...row,
    rank: row.rank ? {
      ...row.rank,
      permissions: parsePermissions(row.rank.permissions)
    } : undefined
  })) as GuildMemberRank[];
}

/**
 * Assign a rank to a member (only guild leader can do this)
 */
export async function assignRank(
  guildId: string,
  userId: string,
  rankType: GuildRankType
): Promise<void> {
  // First get the rank id
  const { data: rankData, error: rankError } = await supabase
    .from('guild_ranks')
    .select('id, max_holders')
    .eq('guild_id', guildId)
    .eq('rank_type', rankType)
    .single();

  if (rankError) throw rankError;

  // Check max holders limit
  if (rankData.max_holders) {
    const { count, error: countError } = await supabase
      .from('guild_member_ranks')
      .select('*', { count: 'exact', head: true })
      .eq('rank_id', rankData.id);

    if (countError) throw countError;
    
    if (count && count >= rankData.max_holders) {
      throw new Error(`Ce rang ne peut être attribué qu'à ${rankData.max_holders} membre(s) maximum`);
    }
  }

  // Get current user
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Non authentifié');

  // Assign the rank
  const { error } = await supabase
    .from('guild_member_ranks')
    .insert({
      guild_id: guildId,
      user_id: userId,
      rank_id: rankData.id,
      assigned_by: user.id
    });

  if (error) {
    if (error.code === '23505') {
      throw new Error('Ce membre possède déjà ce rang');
    }
    throw error;
  }
}

/**
 * Remove a rank from a member (only guild leader can do this)
 */
export async function removeRank(
  guildId: string,
  userId: string,
  rankType: GuildRankType
): Promise<void> {
  // Get the rank id
  const { data: rankData, error: rankError } = await supabase
    .from('guild_ranks')
    .select('id')
    .eq('guild_id', guildId)
    .eq('rank_type', rankType)
    .single();

  if (rankError) throw rankError;

  // Cannot remove guild_leader rank directly (use transfer)
  if (rankType === 'guild_leader') {
    throw new Error('Le rang de Chef de Guilde ne peut être retiré que par transfert');
  }

  const { error } = await supabase
    .from('guild_member_ranks')
    .delete()
    .eq('guild_id', guildId)
    .eq('user_id', userId)
    .eq('rank_id', rankData.id);

  if (error) throw error;
}

/**
 * Transfer guild leadership to another member
 */
export async function transferLeadership(
  guildId: string,
  newLeaderId: string
): Promise<void> {
  const { error } = await supabase
    .rpc('transfer_guild_leadership', {
      p_guild_id: guildId,
      p_new_leader_id: newLeaderId
    });

  if (error) throw error;
}

/**
 * Check if user has a specific permission in the guild
 */
export async function hasGuildPermission(
  guildId: string,
  permission: 'can_withdraw' | 'can_assign_ranks' | 'can_manage_announcements'
): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { data, error } = await supabase
    .rpc('has_guild_permission', {
      p_user_id: user.id,
      p_guild_id: guildId,
      p_permission: permission
    });

  if (error) return false;
  return data === true;
}

/**
 * Get count of holders for each rank type in a guild
 */
export async function getRankHolderCounts(guildId: string): Promise<Record<string, number>> {
  const { data, error } = await supabase
    .from('guild_member_ranks')
    .select(`
      rank:guild_ranks(rank_type)
    `)
    .eq('guild_id', guildId);

  if (error) throw error;

  const counts: Record<string, number> = {};
  data?.forEach((item: any) => {
    const rankType = item.rank?.rank_type;
    if (rankType) {
      counts[rankType] = (counts[rankType] || 0) + 1;
    }
  });

  return counts;
}
