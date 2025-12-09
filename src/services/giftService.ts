import { supabase } from "@/integrations/supabase/client";
import { AdminGift, GiftRewards, GiftWithClaimStatus } from "@/types/Gift";
import { Json } from "@/integrations/supabase/types";

/**
 * Get all available gifts for the current user with claim status
 */
export async function getAvailableGifts(): Promise<GiftWithClaimStatus[]> {
  const { data: { user } } = await supabase.auth.getUser();
  
  const { data: gifts, error } = await supabase
    .from('admin_gifts')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching available gifts:', error);
    throw error;
  }

  // Get user's claims to determine claimed status
  let claimedIds = new Set<string>();
  if (user) {
    const { data: claims } = await supabase
      .from('user_gift_claims')
      .select('gift_id')
      .eq('user_id', user.id);
    
    claimedIds = new Set(claims?.map(c => c.gift_id) || []);
  }

  return (gifts || []).map(gift => ({
    ...gift,
    rewards: gift.rewards as GiftRewards,
    recipient_type: gift.recipient_type as 'all' | 'premium' | 'specific',
    is_persistent: gift.is_persistent ?? false,
    is_claimed: claimedIds.has(gift.id)
  }));
}

/**
 * Check if user has unclaimed gifts
 */
export async function hasUnclaimedGifts(): Promise<boolean> {
  const gifts = await getAvailableGifts();
  return gifts.some(g => !g.is_claimed);
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
  expires_at?: string | null;
  is_persistent?: boolean;
}): Promise<AdminGift> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('admin_gifts')
    .insert([{
      title: gift.title,
      message: gift.message,
      rewards: gift.rewards as unknown as Json,
      recipient_type: gift.recipient_type,
      recipient_user_ids: gift.recipient_user_ids || [],
      expires_at: gift.is_persistent ? null : gift.expires_at,
      is_persistent: gift.is_persistent || false,
      created_by: user.id
    }])
    .select()
    .single();

  if (error) {
    console.error('Error creating gift:', error);
    throw error;
  }

  return {
    ...data,
    rewards: data.rewards as GiftRewards,
    recipient_type: data.recipient_type as 'all' | 'premium' | 'specific',
    is_persistent: data.is_persistent ?? false
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
    recipient_type: gift.recipient_type as 'all' | 'premium' | 'specific',
    is_persistent: gift.is_persistent ?? false
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
