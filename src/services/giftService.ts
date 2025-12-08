import { supabase } from "@/integrations/supabase/client";
import { AdminGift, GiftRewards } from "@/types/Gift";

/**
 * Get all available gifts for the current user (not expired, not claimed)
 */
export async function getAvailableGifts(): Promise<AdminGift[]> {
  const { data, error } = await supabase
    .from('admin_gifts')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching available gifts:', error);
    throw error;
  }

  return (data || []).map(gift => ({
    ...gift,
    rewards: gift.rewards as GiftRewards,
    recipient_type: gift.recipient_type as 'all' | 'premium' | 'specific'
  }));
}

/**
 * Check if user has unclaimed gifts
 */
export async function hasUnclaimedGifts(): Promise<boolean> {
  const { data, error } = await supabase
    .from('admin_gifts')
    .select('id')
    .limit(1);

  if (error) {
    console.error('Error checking unclaimed gifts:', error);
    return false;
  }

  return (data?.length || 0) > 0;
}

/**
 * Claim a gift - calls the edge function to securely process the claim
 */
export async function claimGift(giftId: string): Promise<{
  success: boolean;
  rewards?: GiftRewards;
  error?: string;
}> {
  const { data, error } = await supabase.functions.invoke('claim-gift', {
    body: { gift_id: giftId }
  });

  if (error) {
    console.error('Error claiming gift:', error);
    return { success: false, error: error.message };
  }

  return data;
}

/**
 * Admin: Create a new gift
 */
export async function createGift(gift: {
  title: string;
  message: string;
  rewards: GiftRewards;
  recipient_type: 'all' | 'premium' | 'specific';
  recipient_user_ids?: string[];
  expires_at: string;
}): Promise<AdminGift> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('admin_gifts')
    .insert({
      title: gift.title,
      message: gift.message,
      rewards: gift.rewards,
      recipient_type: gift.recipient_type,
      recipient_user_ids: gift.recipient_user_ids || [],
      expires_at: gift.expires_at,
      created_by: user.id
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating gift:', error);
    throw error;
  }

  return {
    ...data,
    rewards: data.rewards as GiftRewards,
    recipient_type: data.recipient_type as 'all' | 'premium' | 'specific'
  };
}

/**
 * Admin: Get all gifts (including expired and claimed)
 */
export async function getAllGifts(): Promise<AdminGift[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Admin query - fetch all gifts directly
  const { data, error } = await supabase
    .from('admin_gifts')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching all gifts:', error);
    throw error;
  }

  return (data || []).map(gift => ({
    ...gift,
    rewards: gift.rewards as GiftRewards,
    recipient_type: gift.recipient_type as 'all' | 'premium' | 'specific'
  }));
}

/**
 * Admin: Delete a gift
 */
export async function deleteGift(giftId: string): Promise<void> {
  const { error } = await supabase
    .from('admin_gifts')
    .delete()
    .eq('id', giftId);

  if (error) {
    console.error('Error deleting gift:', error);
    throw error;
  }
}

/**
 * Admin: Get claim stats for a gift
 */
export async function getGiftClaimStats(giftId: string): Promise<number> {
  const { count, error } = await supabase
    .from('user_gift_claims')
    .select('*', { count: 'exact', head: true })
    .eq('gift_id', giftId);

  if (error) {
    console.error('Error fetching gift claim stats:', error);
    return 0;
  }

  return count || 0;
}
