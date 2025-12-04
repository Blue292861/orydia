import { supabase } from '@/integrations/supabase/client';
import { Collection, CollectionItemReward, UserCollectionProgress } from '@/types/Collection';
import { RewardType } from '@/types/RewardType';

export async function fetchCollections(): Promise<Collection[]> {
  const { data, error } = await supabase
    .from('collections')
    .select('*')
    .order('name', { ascending: true });

  if (error) throw error;
  return data as Collection[];
}

export async function fetchActiveCollections(): Promise<Collection[]> {
  const { data, error } = await supabase
    .from('collections')
    .select('*')
    .eq('is_active', true)
    .order('name', { ascending: true });

  if (error) throw error;
  return data as Collection[];
}

export async function createCollection(collection: Omit<Collection, 'id' | 'created_at' | 'updated_at'>): Promise<Collection> {
  const { data, error } = await supabase
    .from('collections')
    .insert(collection)
    .select()
    .single();

  if (error) throw error;
  return data as Collection;
}

export async function updateCollection(id: string, updates: Partial<Collection>): Promise<Collection> {
  const { data, error } = await supabase
    .from('collections')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Collection;
}

export async function deleteCollection(id: string): Promise<void> {
  const { error } = await supabase
    .from('collections')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function getCollectionItemRewards(collectionId: string): Promise<CollectionItemReward[]> {
  const { data, error } = await supabase
    .from('collection_item_rewards')
    .select(`
      *,
      reward_types (*)
    `)
    .eq('collection_id', collectionId);

  if (error) throw error;
  return (data || []).map((item: any) => ({
    ...item,
    reward_type: item.reward_types
  }));
}

export async function setCollectionItemRewards(
  collectionId: string, 
  rewards: { reward_type_id: string; quantity: number }[]
): Promise<void> {
  // Delete existing rewards
  const { error: deleteError } = await supabase
    .from('collection_item_rewards')
    .delete()
    .eq('collection_id', collectionId);

  if (deleteError) throw deleteError;

  // Insert new rewards
  if (rewards.length > 0) {
    const { error: insertError } = await supabase
      .from('collection_item_rewards')
      .insert(rewards.map(r => ({ ...r, collection_id: collectionId })));

    if (insertError) throw insertError;
  }
}

export async function getCardsInCollection(collectionId: string): Promise<RewardType[]> {
  const { data, error } = await supabase
    .from('reward_types')
    .select('*')
    .eq('collection_id', collectionId)
    .eq('category', 'card')
    .eq('is_active', true);

  if (error) throw error;
  return data as RewardType[];
}

export async function getUserCollectionProgress(userId: string): Promise<UserCollectionProgress[]> {
  // Get all active collections
  const collections = await fetchActiveCollections();
  
  // Get user's inventory (cards)
  const { data: inventory, error: invError } = await supabase
    .from('user_inventory')
    .select(`
      *,
      reward_types (*)
    `)
    .eq('user_id', userId);

  if (invError) throw invError;

  // Get user's collection completions
  const { data: completions, error: compError } = await supabase
    .from('user_collection_completions')
    .select('*')
    .eq('user_id', userId);

  if (compError) throw compError;

  const userCards = new Map<string, number>();
  (inventory || []).forEach((item: any) => {
    if (item.reward_types?.category === 'card') {
      userCards.set(item.reward_type_id, item.quantity);
    }
  });

  const completionMap = new Map(
    (completions || []).map((c: any) => [c.collection_id, c])
  );

  // Build progress for each collection
  const progressList: UserCollectionProgress[] = [];

  for (const collection of collections) {
    const cards = await getCardsInCollection(collection.id);
    const totalCards = cards.length;
    
    if (totalCards === 0) continue; // Skip empty collections

    const collectionCards = cards.map(card => ({
      card,
      owned: userCards.has(card.id),
      quantity: userCards.get(card.id) || 0
    }));

    const collectedCards = collectionCards.filter(c => c.owned).length;
    const progress = totalCards > 0 ? (collectedCards / totalCards) * 100 : 0;
    const isComplete = collectedCards === totalCards;
    const completion = completionMap.get(collection.id);
    const chestClaimed = completion?.chest_claimed || false;

    progressList.push({
      collection,
      totalCards,
      collectedCards,
      progress,
      isComplete,
      chestClaimed,
      cards: collectionCards
    });
  }

  return progressList;
}

export async function claimCollectionReward(userId: string, collectionId: string): Promise<{
  orydors: number;
  xp: number;
  items: { name: string; quantity: number; image_url: string }[];
}> {
  // Verify collection is complete
  const progress = await getUserCollectionProgress(userId);
  const collectionProgress = progress.find(p => p.collection.id === collectionId);

  if (!collectionProgress) {
    throw new Error('Collection non trouvée');
  }

  if (!collectionProgress.isComplete) {
    throw new Error('Collection non complète');
  }

  if (collectionProgress.chestClaimed) {
    throw new Error('Récompense déjà réclamée');
  }

  const collection = collectionProgress.collection;
  const itemRewards = await getCollectionItemRewards(collectionId);

  // Mark collection as claimed
  const { error: claimError } = await supabase
    .from('user_collection_completions')
    .upsert({
      user_id: userId,
      collection_id: collectionId,
      completed_at: new Date().toISOString(),
      chest_claimed: true,
      claimed_at: new Date().toISOString()
    });

  if (claimError) throw claimError;

  // Award Orydors
  if (collection.orydors_reward > 0) {
    await supabase.functions.invoke('award-points', {
      body: {
        userId,
        points: collection.orydors_reward,
        transactionType: 'collection_reward',
        description: `Récompense collection: ${collection.name}`,
        referenceId: collection.id
      }
    });
  }

  // Award XP - update user_stats directly with increment
  if (collection.xp_reward > 0) {
    const { data: currentStats } = await supabase
      .from('user_stats')
      .select('experience_points')
      .eq('user_id', userId)
      .single();

    if (currentStats) {
      await supabase
        .from('user_stats')
        .update({
          experience_points: currentStats.experience_points + collection.xp_reward
        })
        .eq('user_id', userId);
    }
  }

  // Award items
  const items: { name: string; quantity: number; image_url: string }[] = [];
  for (const itemReward of itemRewards) {
    if (itemReward.reward_type) {
      // Add to inventory
      const { data: existing } = await supabase
        .from('user_inventory')
        .select('*')
        .eq('user_id', userId)
        .eq('reward_type_id', itemReward.reward_type_id)
        .single();

      if (existing) {
        await supabase
          .from('user_inventory')
          .update({ quantity: existing.quantity + itemReward.quantity })
          .eq('id', existing.id);
      } else {
        await supabase
          .from('user_inventory')
          .insert({
            user_id: userId,
            reward_type_id: itemReward.reward_type_id,
            quantity: itemReward.quantity
          });
      }

      items.push({
        name: itemReward.reward_type.name,
        quantity: itemReward.quantity,
        image_url: itemReward.reward_type.image_url
      });
    }
  }

  return {
    orydors: collection.orydors_reward,
    xp: collection.xp_reward,
    items
  };
}
