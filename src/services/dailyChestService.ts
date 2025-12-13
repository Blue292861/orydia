import { supabase } from '@/integrations/supabase/client';
import { DailyChestConfig, DailyChestClaim, DailyChestItem } from '@/types/DailyChest';

// Get active config for today
export const getActiveConfig = async (): Promise<DailyChestConfig | null> => {
  const today = new Date().toISOString().split('T')[0];
  
  const { data, error } = await supabase
    .from('daily_chest_configs')
    .select('*')
    .eq('is_active', true)
    .lte('start_date', today)
    .gte('end_date', today)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();
  
  if (error || !data) return null;
  
  return {
    id: data.id,
    name: data.name,
    startDate: data.start_date,
    endDate: data.end_date,
    minOrydors: data.min_orydors,
    maxOrydors: data.max_orydors,
    itemPool: (data.item_pool as unknown as DailyChestItem[]) || [],
    isActive: data.is_active,
    createdAt: data.created_at,
    updatedAt: data.updated_at
  };
};

// Check if user can claim today
export const canClaimToday = async (userId: string): Promise<boolean> => {
  const today = new Date().toISOString().split('T')[0];
  
  const { data, error } = await supabase
    .from('daily_chest_claims')
    .select('id')
    .eq('user_id', userId)
    .eq('claim_date', today)
    .maybeSingle();
  
  return !data && !error;
};

// Get time until next chest (midnight)
export const getTimeUntilNextChest = (): number => {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  return tomorrow.getTime() - now.getTime();
};

// Format time remaining as HH:MM:SS
export const formatTimeRemaining = (ms: number): string => {
  const hours = Math.floor(ms / (1000 * 60 * 60));
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((ms % (1000 * 60)) / 1000);
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

// Admin functions
export const getAllConfigs = async (): Promise<DailyChestConfig[]> => {
  const { data, error } = await supabase
    .from('daily_chest_configs')
    .select('*')
    .order('start_date', { ascending: false });
  
  if (error) throw error;
  
  return (data || []).map(item => ({
    id: item.id,
    name: item.name,
    startDate: item.start_date,
    endDate: item.end_date,
    minOrydors: item.min_orydors,
    maxOrydors: item.max_orydors,
    itemPool: (item.item_pool as unknown as DailyChestItem[]) || [],
    isActive: item.is_active,
    createdAt: item.created_at,
    updatedAt: item.updated_at
  }));
};

export const createConfig = async (config: Omit<DailyChestConfig, 'id' | 'createdAt' | 'updatedAt'>): Promise<DailyChestConfig> => {
  const { data, error } = await supabase
    .from('daily_chest_configs')
    .insert({
      name: config.name,
      start_date: config.startDate,
      end_date: config.endDate,
      min_orydors: config.minOrydors,
      max_orydors: config.maxOrydors,
      item_pool: config.itemPool as unknown as any,
      is_active: config.isActive
    })
    .select()
    .single();
  
  if (error) throw error;
  
  return {
    id: data.id,
    name: data.name,
    startDate: data.start_date,
    endDate: data.end_date,
    minOrydors: data.min_orydors,
    maxOrydors: data.max_orydors,
    itemPool: (data.item_pool as unknown as DailyChestItem[]) || [],
    isActive: data.is_active,
    createdAt: data.created_at,
    updatedAt: data.updated_at
  };
};

export const updateConfig = async (id: string, config: Partial<Omit<DailyChestConfig, 'id' | 'createdAt' | 'updatedAt'>>): Promise<void> => {
  const updateData: any = {};
  if (config.name !== undefined) updateData.name = config.name;
  if (config.startDate !== undefined) updateData.start_date = config.startDate;
  if (config.endDate !== undefined) updateData.end_date = config.endDate;
  if (config.minOrydors !== undefined) updateData.min_orydors = config.minOrydors;
  if (config.maxOrydors !== undefined) updateData.max_orydors = config.maxOrydors;
  if (config.itemPool !== undefined) updateData.item_pool = config.itemPool;
  if (config.isActive !== undefined) updateData.is_active = config.isActive;
  
  const { error } = await supabase
    .from('daily_chest_configs')
    .update(updateData)
    .eq('id', id);
  
  if (error) throw error;
};

export const deleteConfig = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('daily_chest_configs')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
};

// Get claim history for a user
export const getUserClaimHistory = async (userId: string, limit = 10): Promise<DailyChestClaim[]> => {
  const { data, error } = await supabase
    .from('daily_chest_claims')
    .select('*')
    .eq('user_id', userId)
    .order('claimed_at', { ascending: false })
    .limit(limit);
  
  if (error) throw error;
  
  return (data || []).map(item => ({
    id: item.id,
    userId: item.user_id,
    configId: item.config_id,
    claimedAt: item.claimed_at,
    claimDate: item.claim_date,
    orydorsWon: item.orydors_won,
    itemWonId: item.item_won_id,
    itemQuantity: item.item_quantity
  }));
};
