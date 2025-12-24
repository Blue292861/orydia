import { supabase } from "@/integrations/supabase/client";
import { WheelConfig, WheelStreak, StreakBonus, WheelSegment, DEFAULT_WHEEL_SEGMENTS } from "@/types/FortuneWheel";

/**
 * Get active wheel configuration
 */
export async function getActiveWheelConfig(): Promise<WheelConfig | null> {
  const today = new Date().toISOString().split('T')[0];
  
  const { data, error } = await supabase
    .from('daily_chest_configs')
    .select('*')
    .eq('is_active', true)
    .lte('start_date', today)
    .gte('end_date', today)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  
  if (error) {
    console.error('Error fetching wheel config:', error);
    return null;
  }
  
  if (!data) return null;
  
  // Parse wheel_segments or use default
  let segments: WheelSegment[] = DEFAULT_WHEEL_SEGMENTS;
  if (data.wheel_segments && Array.isArray(data.wheel_segments) && data.wheel_segments.length > 0) {
    segments = data.wheel_segments as unknown as WheelSegment[];
  }
  
  return {
    id: data.id,
    name: data.name,
    startDate: data.start_date,
    endDate: data.end_date,
    segments,
    isActive: data.is_active,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

/**
 * Get user's wheel streak
 */
export async function getUserStreak(userId: string): Promise<WheelStreak | null> {
  const { data, error } = await supabase
    .from('wheel_streaks')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();
  
  if (error) {
    console.error('Error fetching user streak:', error);
    return null;
  }
  
  if (!data) return null;
  
  return {
    id: data.id,
    userId: data.user_id,
    currentStreak: data.current_streak,
    maxStreak: data.max_streak,
    lastSpinDate: data.last_spin_date,
    streakBrokenAt: data.streak_broken_at,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
  };
}

/**
 * Check if user can spin for free today
 */
export async function canSpinForFree(userId: string): Promise<boolean> {
  const today = new Date().toISOString().split('T')[0];
  
  const { data, error } = await supabase
    .from('daily_chest_claims')
    .select('id')
    .eq('user_id', userId)
    .eq('claim_date', today)
    .eq('spin_type', 'free')
    .maybeSingle();
  
  if (error) {
    console.error('Error checking free spin:', error);
    return false;
  }
  
  return !data; // Can spin if no claim exists for today
}

/**
 * Get time until next free spin (midnight)
 */
export function getTimeUntilNextFreeSpin(): number {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  return tomorrow.getTime() - now.getTime();
}

/**
 * Format time remaining as HH:MM:SS
 */
export function formatTimeRemaining(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Get all streak bonuses
 */
export async function getStreakBonuses(): Promise<StreakBonus[]> {
  const { data, error } = await supabase
    .from('streak_bonuses')
    .select('*')
    .eq('is_active', true)
    .order('streak_level', { ascending: true });
  
  if (error) {
    console.error('Error fetching streak bonuses:', error);
    return [];
  }
  
  return (data || []).map(b => ({
    id: b.id,
    streakLevel: b.streak_level,
    bonusType: b.bonus_type as 'probability_boost' | 'quantity_boost',
    bonusValue: Number(b.bonus_value),
    description: b.description || '',
    isActive: b.is_active,
  }));
}

/**
 * Get the active bonus for a given streak level
 */
export function getActiveBonus(streakLevel: number, bonuses: StreakBonus[]): StreakBonus | null {
  // Find the highest bonus that applies to this streak level
  const applicableBonuses = bonuses.filter(b => b.streakLevel <= streakLevel);
  if (applicableBonuses.length === 0) return null;
  return applicableBonuses[applicableBonuses.length - 1];
}

// ===== Admin Functions =====

/**
 * Get all wheel configs (admin)
 */
export async function getAllWheelConfigs(): Promise<WheelConfig[]> {
  const { data, error } = await supabase
    .from('daily_chest_configs')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching wheel configs:', error);
    return [];
  }
  
  return (data || []).map(d => ({
    id: d.id,
    name: d.name,
    startDate: d.start_date,
    endDate: d.end_date,
    segments: (d.wheel_segments as unknown as WheelSegment[]) || DEFAULT_WHEEL_SEGMENTS,
    isActive: d.is_active,
    createdAt: d.created_at,
    updatedAt: d.updated_at,
  }));
}

/**
 * Create wheel config (admin)
 */
export async function createWheelConfig(config: Omit<WheelConfig, 'id' | 'createdAt' | 'updatedAt'>): Promise<WheelConfig | null> {
  const { data, error } = await supabase
    .from('daily_chest_configs')
    .insert([{
      name: config.name,
      start_date: config.startDate,
      end_date: config.endDate,
      wheel_segments: JSON.parse(JSON.stringify(config.segments)),
      is_active: config.isActive,
    }])
    .select()
    .single();
  
  if (error) {
    console.error('Error creating wheel config:', error);
    return null;
  }
  
  return {
    id: data.id,
    name: data.name,
    startDate: data.start_date,
    endDate: data.end_date,
    segments: (data.wheel_segments as unknown as WheelSegment[]) || [],
    isActive: data.is_active,
  };
}

/**
 * Update wheel config (admin)
 */
export async function updateWheelConfig(id: string, updates: Partial<WheelConfig>): Promise<void> {
  const updateData: Record<string, unknown> = {};
  if (updates.name !== undefined) updateData.name = updates.name;
  if (updates.startDate !== undefined) updateData.start_date = updates.startDate;
  if (updates.endDate !== undefined) updateData.end_date = updates.endDate;
  if (updates.segments !== undefined) updateData.wheel_segments = updates.segments;
  if (updates.isActive !== undefined) updateData.is_active = updates.isActive;
  
  const { error } = await supabase
    .from('daily_chest_configs')
    .update(updateData)
    .eq('id', id);
  
  if (error) {
    console.error('Error updating wheel config:', error);
    throw error;
  }
}

/**
 * Delete wheel config (admin)
 */
export async function deleteWheelConfig(id: string): Promise<void> {
  const { error } = await supabase
    .from('daily_chest_configs')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Error deleting wheel config:', error);
    throw error;
  }
}
