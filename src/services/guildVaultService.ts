import { supabase } from "@/integrations/supabase/client";
import { 
  GuildVault, 
  GuildVaultCard, 
  GuildVaultTransaction,
  DepositRequest,
  WithdrawRequest,
  UserDuplicateCard
} from "@/types/GuildVault";

/**
 * Get the vault for a guild
 */
export async function getGuildVault(guildId: string): Promise<GuildVault | null> {
  const { data, error } = await supabase
    .from('guild_vault')
    .select('*')
    .eq('guild_id', guildId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  return data as unknown as GuildVault;
}

/**
 * Get all cards in the vault
 */
export async function getVaultCards(guildId: string): Promise<GuildVaultCard[]> {
  const { data, error } = await supabase
    .from('guild_vault_cards')
    .select(`
      *,
      reward_type:reward_types(
        id, name, image_url, rarity, category, description
      )
    `)
    .eq('guild_id', guildId)
    .gt('quantity', 0);

  if (error) throw error;
  return (data || []) as unknown as GuildVaultCard[];
}

/**
 * Get recent transactions
 */
export async function getVaultTransactions(
  guildId: string, 
  limit: number = 20
): Promise<GuildVaultTransaction[]> {
  // Get transactions without FK joins (new tables don't have FK to profiles)
  const { data, error } = await supabase
    .from('guild_vault_transactions')
    .select('*')
    .eq('guild_id', guildId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  
  // Fetch profiles separately
  const userIds = new Set<string>();
  data?.forEach(t => {
    if (t.user_id) userIds.add(t.user_id);
    if (t.recipient_id) userIds.add(t.recipient_id);
  });

  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, username, avatar_url, first_name')
    .in('id', Array.from(userIds));

  const profileMap = new Map(profiles?.map(p => [p.id, p]) || []);

  return (data || []).map(t => ({
    ...t,
    user_profile: profileMap.get(t.user_id) || null,
    recipient_profile: t.recipient_id ? profileMap.get(t.recipient_id) || null : null
  })) as unknown as GuildVaultTransaction[];
}

/**
 * Get user's duplicate cards (quantity > 1)
 */
export async function getUserDuplicateCards(): Promise<UserDuplicateCard[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Non authentifié');

  const { data, error } = await supabase
    .from('user_inventory')
    .select(`
      reward_type_id,
      quantity,
      reward_type:reward_types!inner(
        id, name, image_url, rarity, category
      )
    `)
    .eq('user_id', user.id)
    .gt('quantity', 1);

  if (error) throw error;

  return (data || []).map((item: any) => ({
    reward_type_id: item.reward_type_id,
    quantity: item.quantity,
    available_to_deposit: item.quantity - 1,
    reward_type: item.reward_type
  }));
}

/**
 * Deposit resources into the vault
 */
export async function depositToVault(
  guildId: string,
  request: DepositRequest
): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Non authentifié');

  // Verify user is a guild member
  const { data: membership } = await supabase
    .from('guild_members')
    .select('id')
    .eq('guild_id', guildId)
    .eq('user_id', user.id)
    .single();

  if (!membership) throw new Error('Vous n\'êtes pas membre de cette guilde');

  if (request.resource_type === 'orydors') {
    // Get user's current orydors
    const { data: stats } = await supabase
      .from('user_stats')
      .select('total_points')
      .eq('user_id', user.id)
      .single();

    if (!stats || stats.total_points < request.quantity) {
      throw new Error('Orydors insuffisants');
    }

    // Deduct from user
    await supabase
      .from('user_stats')
      .update({ total_points: stats.total_points - request.quantity })
      .eq('user_id', user.id);

    // Add to vault
    const { data: vault } = await supabase
      .from('guild_vault')
      .select('orydors')
      .eq('guild_id', guildId)
      .single();

    if (vault) {
      await supabase
        .from('guild_vault')
        .update({ orydors: (vault.orydors || 0) + request.quantity })
        .eq('guild_id', guildId);
    }

  } else if (request.resource_type === 'aildor_key') {
    const AILDOR_KEY_ID = '550e8400-e29b-41d4-a716-446655440000';
    
    // Get user's current keys from user_inventory
    const { data: keyInventory } = await supabase
      .from('user_inventory')
      .select('quantity')
      .eq('user_id', user.id)
      .eq('reward_type_id', AILDOR_KEY_ID)
      .maybeSingle();

    const currentKeys = keyInventory?.quantity || 0;
    if (currentKeys < request.quantity) {
      throw new Error('Clés d\'Aildor insuffisantes');
    }

    // Deduct from user inventory
    await supabase
      .from('user_inventory')
      .update({ quantity: currentKeys - request.quantity })
      .eq('user_id', user.id)
      .eq('reward_type_id', AILDOR_KEY_ID);

    // Add to vault
    const { data: vault } = await supabase
      .from('guild_vault')
      .select('aildor_keys')
      .eq('guild_id', guildId)
      .single();

    if (vault) {
      await supabase
        .from('guild_vault')
        .update({ aildor_keys: (vault.aildor_keys || 0) + request.quantity })
        .eq('guild_id', guildId);
    }

  } else if (request.resource_type === 'card' && request.reward_type_id) {
    // Get user's card quantity
    const { data: inventory } = await supabase
      .from('user_inventory')
      .select('quantity')
      .eq('user_id', user.id)
      .eq('reward_type_id', request.reward_type_id)
      .single();

    if (!inventory || inventory.quantity <= request.quantity) {
      throw new Error('Vous devez garder au moins un exemplaire de cette carte');
    }

    // Deduct from user
    await supabase
      .from('user_inventory')
      .update({ quantity: inventory.quantity - request.quantity })
      .eq('user_id', user.id)
      .eq('reward_type_id', request.reward_type_id);

    // Add to vault (upsert)
    const { data: existingCard } = await supabase
      .from('guild_vault_cards')
      .select('quantity')
      .eq('guild_id', guildId)
      .eq('reward_type_id', request.reward_type_id)
      .single();

    if (existingCard) {
      await supabase
        .from('guild_vault_cards')
        .update({ quantity: existingCard.quantity + request.quantity })
        .eq('guild_id', guildId)
        .eq('reward_type_id', request.reward_type_id);
    } else {
      await supabase
        .from('guild_vault_cards')
        .insert({
          guild_id: guildId,
          reward_type_id: request.reward_type_id,
          quantity: request.quantity
        });
    }
  }

  // Log transaction
  await supabase
    .from('guild_vault_transactions')
    .insert({
      guild_id: guildId,
      user_id: user.id,
      action: 'deposit',
      resource_type: request.resource_type,
      resource_id: request.reward_type_id || null,
      quantity: request.quantity
    });
}

/**
 * Withdraw resources from the vault (requires permission)
 */
export async function withdrawFromVault(
  guildId: string,
  request: WithdrawRequest
): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Non authentifié');

  // Check permission
  const { data: hasPermission } = await supabase
    .rpc('has_guild_permission', {
      p_user_id: user.id,
      p_guild_id: guildId,
      p_permission: 'can_withdraw'
    });

  if (!hasPermission) {
    throw new Error('Vous n\'avez pas la permission de retirer du coffre');
  }

  if (request.resource_type === 'orydors') {
    // Get vault orydors
    const { data: vault } = await supabase
      .from('guild_vault')
      .select('orydors')
      .eq('guild_id', guildId)
      .single();

    if (!vault || (vault.orydors || 0) < request.quantity) {
      throw new Error('Orydors insuffisants dans le coffre');
    }

    // Deduct from vault
    await supabase
      .from('guild_vault')
      .update({ orydors: (vault.orydors || 0) - request.quantity })
      .eq('guild_id', guildId);

    // Add to recipient
    const { data: recipientStats } = await supabase
      .from('user_stats')
      .select('total_points')
      .eq('user_id', request.recipient_id)
      .single();

    if (recipientStats) {
      await supabase
        .from('user_stats')
        .update({ total_points: recipientStats.total_points + request.quantity })
        .eq('user_id', request.recipient_id);
    }

  } else if (request.resource_type === 'aildor_key') {
    // Get vault keys
    const { data: vault } = await supabase
      .from('guild_vault')
      .select('aildor_keys')
      .eq('guild_id', guildId)
      .single();

    if (!vault || (vault.aildor_keys || 0) < request.quantity) {
      throw new Error('Clés insuffisantes dans le coffre');
    }

    // Deduct from vault
    await supabase
      .from('guild_vault')
      .update({ aildor_keys: (vault.aildor_keys || 0) - request.quantity })
      .eq('guild_id', guildId);

    // Add to recipient
    const { data: recipientStats } = await supabase
      .from('user_stats')
      .select('aildor_keys')
      .eq('user_id', request.recipient_id)
      .single();

    const currentKeys = (recipientStats as any)?.aildor_keys || 0;
    await supabase
      .from('user_stats')
      .update({ aildor_keys: currentKeys + request.quantity } as any)
      .eq('user_id', request.recipient_id);

  } else if (request.resource_type === 'card' && request.reward_type_id) {
    // Get vault card
    const { data: vaultCard } = await supabase
      .from('guild_vault_cards')
      .select('quantity')
      .eq('guild_id', guildId)
      .eq('reward_type_id', request.reward_type_id)
      .single();

    if (!vaultCard || vaultCard.quantity < request.quantity) {
      throw new Error('Cartes insuffisantes dans le coffre');
    }

    // Deduct from vault
    await supabase
      .from('guild_vault_cards')
      .update({ quantity: vaultCard.quantity - request.quantity })
      .eq('guild_id', guildId)
      .eq('reward_type_id', request.reward_type_id);

    // Add to recipient
    const { data: existingCard } = await supabase
      .from('user_inventory')
      .select('quantity')
      .eq('user_id', request.recipient_id)
      .eq('reward_type_id', request.reward_type_id)
      .single();

    if (existingCard) {
      await supabase
        .from('user_inventory')
        .update({ quantity: existingCard.quantity + request.quantity })
        .eq('user_id', request.recipient_id)
        .eq('reward_type_id', request.reward_type_id);
    } else {
      await supabase
        .from('user_inventory')
        .insert({
          user_id: request.recipient_id,
          reward_type_id: request.reward_type_id,
          quantity: request.quantity
        });
    }
  }

  // Log transaction
  await supabase
    .from('guild_vault_transactions')
    .insert({
      guild_id: guildId,
      user_id: user.id,
      action: 'assign',
      resource_type: request.resource_type,
      resource_id: request.reward_type_id || null,
      quantity: request.quantity,
      recipient_id: request.recipient_id,
      note: request.note
    });
}
