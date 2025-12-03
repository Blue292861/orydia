import { supabase } from "@/integrations/supabase/client";
import { ChestRollResult, ChestReward, LootTable, RewardType } from "@/types/RewardType";

/**
 * Calculate Orydors variation based on base points and premium status
 * Freemium: 95%, 100%, or 105%
 * Premium: 190%, 200%, or 210%
 */
export function calculateOrydorsVariation(
  basePoints: number,
  isPremium: boolean
): { amount: number; variation: number } {
  const variations = isPremium 
    ? [190, 200, 210] 
    : [95, 100, 105];
  
  // Weighted random: 25% chance for min, 50% for base, 25% for max
  const random = Math.random();
  let selectedVariation: number;
  
  if (random < 0.25) {
    selectedVariation = variations[0]; // 95% or 190%
  } else if (random < 0.75) {
    selectedVariation = variations[1]; // 100% or 200%
  } else {
    selectedVariation = variations[2]; // 105% or 210%
  }
  
  const amount = Math.floor((basePoints * selectedVariation) / 100);
  return { amount, variation: selectedVariation };
}

/**
 * Roll additional rewards based on loot table drop rates
 */
export function rollAdditionalRewards(
  lootTable: any[]
): ChestReward[] {
  const rewards: ChestReward[] = [];
  
  for (const entry of lootTable) {
    const random = Math.random() * 100;
    
    if (random <= entry.drop_chance_percentage && entry.reward_types) {
      const quantity = Math.floor(
        Math.random() * (entry.max_quantity - entry.min_quantity + 1) + entry.min_quantity
      );
      
      rewards.push({
        type: entry.reward_types.category,
        name: entry.reward_types.name,
        quantity,
        imageUrl: entry.reward_types.image_url,
        rarity: entry.reward_types.rarity,
        rewardTypeId: entry.reward_types.id
      });
    }
  }
  
  return rewards;
}

/**
 * Fetch loot table for a specific book and chest type
 * Merges GLOBAL items (book_id = null) with BOOK-SPECIFIC items
 */
export async function fetchLootTable(
  bookId: string,
  chestType: 'silver' | 'gold'
): Promise<any[]> {
  // Fetch GLOBAL items (book_id IS NULL)
  const { data: globalLoot, error: globalError } = await supabase
    .from('loot_tables')
    .select(`
      *,
      reward_types (*)
    `)
    .is('book_id', null)
    .eq('chest_type', chestType);
  
  if (globalError) {
    console.error('Error fetching global loot table:', globalError);
  }

  // Fetch BOOK-SPECIFIC items
  const { data: bookLoot, error: bookError } = await supabase
    .from('loot_tables')
    .select(`
      *,
      reward_types (*)
    `)
    .eq('book_id', bookId)
    .eq('chest_type', chestType);
  
  if (bookError) {
    console.error('Error fetching book loot table:', bookError);
  }
  
  // Merge global and book-specific items
  return [...(globalLoot || []), ...(bookLoot || [])];
}

/**
 * Main function to roll chest rewards (client-side preview only)
 * Real rolling should be done server-side via open-chest edge function
 */
export async function rollChestRewards(
  bookId: string,
  basePoints: number,
  isPremium: boolean
): Promise<ChestRollResult> {
  const chestType = isPremium ? 'gold' : 'silver';
  
  // Calculate Orydors with variation
  const { amount, variation } = calculateOrydorsVariation(basePoints, isPremium);
  
  // Fetch and roll additional rewards
  const lootTable = await fetchLootTable(bookId, chestType);
  const additionalRewards = rollAdditionalRewards(lootTable);
  
  return {
    chestType,
    orydors: amount,
    orydorsVariation: variation,
    additionalRewards
  };
}

/**
 * Check if user has already opened chest for this book
 */
export async function hasOpenedChestForBook(
  userId: string,
  bookId: string
): Promise<boolean> {
  const { data, error } = await supabase
    .from('chest_openings')
    .select('id')
    .eq('user_id', userId)
    .eq('book_id', bookId)
    .limit(1);
  
  if (error) {
    console.error('Error checking chest opening:', error);
    return false;
  }
  
  return (data?.length || 0) > 0;
}
