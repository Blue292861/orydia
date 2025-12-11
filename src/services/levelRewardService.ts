import { supabase } from '@/integrations/supabase/client';
import { LevelReward, PendingLevelReward, ItemRewardEntry } from '@/types/LevelReward';

export const getAllLevelRewards = async (): Promise<LevelReward[]> => {
  const { data, error } = await supabase
    .from('level_rewards')
    .select('*')
    .order('level', { ascending: true });

  if (error) throw error;

  return (data || []).map(mapDbToLevelReward);
};

export const getLevelReward = async (level: number): Promise<LevelReward | null> => {
  const { data, error } = await supabase
    .from('level_rewards')
    .select('*')
    .eq('level', level)
    .eq('is_active', true)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  if (!data) return null;

  return mapDbToLevelReward(data);
};

export const createLevelReward = async (reward: Omit<LevelReward, 'id' | 'createdAt' | 'updatedAt'>): Promise<LevelReward> => {
  const { data, error } = await supabase
    .from('level_rewards')
    .insert([{
      level: reward.level,
      orydors_reward: reward.orydorsReward,
      xp_bonus: reward.xpBonus,
      item_rewards: reward.itemRewards as any,
      premium_days: reward.premiumDays,
      description: reward.description,
      is_active: reward.isActive
    }])
    .select()
    .single();

  if (error) throw error;
  return mapDbToLevelReward(data);
};

export const updateLevelReward = async (id: string, reward: Partial<LevelReward>): Promise<LevelReward> => {
  const updateData: any = { updated_at: new Date().toISOString() };
  
  if (reward.orydorsReward !== undefined) updateData.orydors_reward = reward.orydorsReward;
  if (reward.xpBonus !== undefined) updateData.xp_bonus = reward.xpBonus;
  if (reward.itemRewards !== undefined) updateData.item_rewards = reward.itemRewards;
  if (reward.premiumDays !== undefined) updateData.premium_days = reward.premiumDays;
  if (reward.description !== undefined) updateData.description = reward.description;
  if (reward.isActive !== undefined) updateData.is_active = reward.isActive;

  const { data, error } = await supabase
    .from('level_rewards')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return mapDbToLevelReward(data);
};

export const deleteLevelReward = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('level_rewards')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

export const getPendingLevelRewards = async (userId: string): Promise<PendingLevelReward[]> => {
  const { data, error } = await supabase
    .from('pending_level_rewards')
    .select(`
      *,
      level_rewards (*)
    `)
    .eq('user_id', userId)
    .order('level', { ascending: true });

  if (error) throw error;

  return (data || []).map((item: any) => ({
    id: item.id,
    userId: item.user_id,
    level: item.level,
    levelRewardId: item.level_reward_id,
    createdAt: item.created_at,
    levelReward: item.level_rewards ? mapDbToLevelReward(item.level_rewards) : undefined
  }));
};

export const claimAllLevelRewards = async (): Promise<any> => {
  const { data, error } = await supabase.functions.invoke('claim-level-rewards');
  if (error) throw error;
  return data;
};

const mapDbToLevelReward = (data: any): LevelReward => ({
  id: data.id,
  level: data.level,
  orydorsReward: data.orydors_reward || 0,
  xpBonus: data.xp_bonus || 0,
  itemRewards: (data.item_rewards as ItemRewardEntry[]) || [],
  premiumDays: data.premium_days || 0,
  description: data.description,
  isActive: data.is_active,
  createdAt: data.created_at,
  updatedAt: data.updated_at
});
