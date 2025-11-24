import { supabase } from "@/integrations/supabase/client";
import { ChestReward, UserInventoryItem, GemFragments, RewardType } from "@/types/RewardType";

/**
 * Add rewards to user inventory
 */
export async function addToInventory(
  userId: string,
  rewards: ChestReward[]
): Promise<void> {
  for (const reward of rewards) {
    // Upsert inventory item
    const { error } = await supabase
      .from('user_inventory')
      .upsert({
        user_id: userId,
        reward_type_id: reward.rewardTypeId,
        quantity: reward.quantity
      }, {
        onConflict: 'user_id,reward_type_id',
        ignoreDuplicates: false
      });
    
    if (error) {
      console.error('Error adding to inventory:', error);
      throw error;
    }
    
    // If it's a gem fragment, update gem_fragments table
    if (reward.type === 'fragment') {
      const fragmentValue = reward.quantity;
      await addGemFragments(userId, fragmentValue);
    }
  }
}

/**
 * Get user's complete inventory with reward details
 */
export async function getUserInventory(userId: string): Promise<{
  items: any[],
  gemFragments: GemFragments | null
}> {
  // Fetch inventory items
  const { data: items, error: itemsError } = await supabase
    .from('user_inventory')
    .select(`
      *,
      reward_types (*)
    `)
    .eq('user_id', userId)
    .order('acquired_at', { ascending: false });
  
  if (itemsError) {
    console.error('Error fetching inventory:', itemsError);
    throw itemsError;
  }
  
  // Fetch gem fragments
  const { data: gemFragments, error: gemsError } = await supabase
    .from('gem_fragments')
    .select('*')
    .eq('user_id', userId)
    .single();
  
  if (gemsError && gemsError.code !== 'PGRST116') {
    console.error('Error fetching gem fragments:', gemsError);
  }
  
  return {
    items: items || [],
    gemFragments: gemFragments || null
  };
}

/**
 * Add gem fragments to user's count
 */
export async function addGemFragments(
  userId: string,
  count: number
): Promise<{ currentCount: number; canClaim: boolean }> {
  // Upsert gem fragments
  const { data: existing } = await supabase
    .from('gem_fragments')
    .select('fragment_count')
    .eq('user_id', userId)
    .single();
  
  const newCount = (existing?.fragment_count || 0) + count;
  
  const { error } = await supabase
    .from('gem_fragments')
    .upsert({
      user_id: userId,
      fragment_count: newCount
    }, {
      onConflict: 'user_id'
    });
  
  if (error) {
    console.error('Error adding gem fragments:', error);
    throw error;
  }
  
  return {
    currentCount: newCount,
    canClaim: newCount >= 12
  };
}

/**
 * Claim premium month from gem fragments (requires 12 fragments)
 */
export async function claimPremiumFromFragments(
  userId: string
): Promise<{ success: boolean; monthsGranted: number }> {
  const { data: gemData, error: fetchError } = await supabase
    .from('gem_fragments')
    .select('*')
    .eq('user_id', userId)
    .single();
  
  if (fetchError || !gemData) {
    throw new Error('Gem fragments not found');
  }
  
  if (gemData.fragment_count < 12) {
    throw new Error('Not enough gem fragments (need 12)');
  }
  
  // Calculate how many months can be claimed
  const monthsToGrant = Math.floor(gemData.fragment_count / 12);
  const remainingFragments = gemData.fragment_count % 12;
  
  // Update gem fragments
  const { error: updateError } = await supabase
    .from('gem_fragments')
    .update({
      fragment_count: remainingFragments,
      premium_months_claimed: gemData.premium_months_claimed + monthsToGrant
    })
    .eq('user_id', userId);
  
  if (updateError) {
    console.error('Error updating gem fragments:', updateError);
    throw updateError;
  }
  
  // Grant premium via edge function
  try {
    const { data, error } = await supabase.functions.invoke('grant-premium', {
      body: {
        user_id: userId,
        months: monthsToGrant,
        source: 'gem_fragments'
      }
    });
    
    if (error) throw error;
    
    return {
      success: true,
      monthsGranted: monthsToGrant
    };
  } catch (error) {
    console.error('Error granting premium:', error);
    throw error;
  }
}

/**
 * Get user's chest opening history
 */
export async function getChestHistory(
  userId: string,
  limit: number = 20
) {
  const { data, error } = await supabase
    .from('chest_openings')
    .select(`
      *,
      books (
        title,
        author,
        cover_url
      )
    `)
    .eq('user_id', userId)
    .order('opened_at', { ascending: false })
    .limit(limit);
  
  if (error) {
    console.error('Error fetching chest history:', error);
    throw error;
  }
  
  return data || [];
}
