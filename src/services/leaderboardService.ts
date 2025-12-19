import { supabase } from '@/integrations/supabase/client';
import type { LeaderboardEntry, LeaderboardData } from '@/types/Leaderboard';

const mapToLeaderboardEntry = (row: any): LeaderboardEntry => ({
  userId: row.user_id,
  username: row.username,
  avatarUrl: row.avatar_url,
  firstName: row.first_name,
  lastName: row.last_name,
  totalPoints: row.total_points,
  booksReadCount: row.books_read_count,
  level: row.level,
  experiencePoints: row.experience_points,
  guildId: row.guild_id,
  guildName: row.guild_name,
  rank: Number(row.rank || row.guild_rank),
});

export async function getGeneralLeaderboard(userId?: string): Promise<LeaderboardData> {
  // Récupérer le top 10
  const { data: topData, error: topError } = await supabase
    .from('leaderboard_general')
    .select('*')
    .order('rank', { ascending: true })
    .limit(10);

  if (topError) throw topError;

  const topUsers = (topData || []).map(mapToLeaderboardEntry);

  // Récupérer la position de l'utilisateur courant
  let currentUserEntry: LeaderboardEntry | null = null;
  let currentUserRank: number | null = null;

  if (userId) {
    const { data: userData, error: userError } = await supabase
      .from('leaderboard_general')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (!userError && userData) {
      currentUserEntry = mapToLeaderboardEntry(userData);
      currentUserRank = currentUserEntry.rank;
    }
  }

  return { topUsers, currentUserEntry, currentUserRank };
}

export async function getGuildLeaderboard(guildId: string, userId?: string): Promise<LeaderboardData> {
  // Récupérer le top 10 de la guilde
  const { data: topData, error: topError } = await supabase
    .from('leaderboard_guild')
    .select('*')
    .eq('guild_id', guildId)
    .order('guild_rank', { ascending: true })
    .limit(10);

  if (topError) throw topError;

  const topUsers = (topData || []).map(mapToLeaderboardEntry);

  // Récupérer la position de l'utilisateur courant dans la guilde
  let currentUserEntry: LeaderboardEntry | null = null;
  let currentUserRank: number | null = null;

  if (userId) {
    const { data: userData, error: userError } = await supabase
      .from('leaderboard_guild')
      .select('*')
      .eq('guild_id', guildId)
      .eq('user_id', userId)
      .single();

    if (!userError && userData) {
      currentUserEntry = mapToLeaderboardEntry(userData);
      currentUserRank = currentUserEntry.rank;
    }
  }

  return { topUsers, currentUserEntry, currentUserRank };
}

export async function getUserGuildId(userId: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('guild_members')
    .select('guild_id')
    .eq('user_id', userId)
    .single();

  if (error || !data) return null;
  return data.guild_id;
}
