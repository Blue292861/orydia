import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ItemPoolEntry {
  rewardTypeId: string;
  dropChance: number;
  quantity: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Non autorisé' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Get user from token
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Utilisateur non authentifié' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const userId = user.id;
    const today = new Date().toISOString().split('T')[0];

    console.log(`[claim-daily-chest] User ${userId} attempting to claim for date ${today}`);

    // Check if already claimed today
    const { data: existingClaim } = await supabase
      .from('daily_chest_claims')
      .select('id')
      .eq('user_id', userId)
      .eq('claim_date', today)
      .maybeSingle();

    if (existingClaim) {
      console.log(`[claim-daily-chest] User ${userId} already claimed today`);
      return new Response(JSON.stringify({ 
        error: 'Vous avez déjà réclamé votre coffre quotidien aujourd\'hui',
        alreadyClaimed: true
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Get active config for today
    const { data: config } = await supabase
      .from('daily_chest_configs')
      .select('*')
      .eq('is_active', true)
      .lte('start_date', today)
      .gte('end_date', today)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    // Default values if no config
    const minOrydors = config?.min_orydors ?? 10;
    const maxOrydors = config?.max_orydors ?? 50;
    const itemPool: ItemPoolEntry[] = (config?.item_pool as ItemPoolEntry[]) || [];

    console.log(`[claim-daily-chest] Config: min=${minOrydors}, max=${maxOrydors}, items=${itemPool.length}`);

    // Calculate random Orydors
    const orydorsWon = Math.floor(Math.random() * (maxOrydors - minOrydors + 1)) + minOrydors;
    console.log(`[claim-daily-chest] Orydors rolled: ${orydorsWon}`);

    // Roll for item
    let itemWonId: string | null = null;
    let itemQuantity = 1;
    let itemDetails: { id: string; name: string; imageUrl: string; rarity: string } | null = null;

    if (itemPool.length > 0) {
      // Roll each item independently based on drop chance
      const roll = Math.random() * 100;
      let cumulativeChance = 0;
      
      for (const item of itemPool) {
        cumulativeChance += item.dropChance;
        if (roll <= cumulativeChance) {
          itemWonId = item.rewardTypeId;
          itemQuantity = item.quantity || 1;
          console.log(`[claim-daily-chest] Item won: ${itemWonId} x${itemQuantity}`);
          break;
        }
      }

      // Fetch item details if won
      if (itemWonId) {
        const { data: rewardType } = await supabase
          .from('reward_types')
          .select('id, name, image_url, rarity')
          .eq('id', itemWonId)
          .single();

        if (rewardType) {
          itemDetails = {
            id: rewardType.id,
            name: rewardType.name,
            imageUrl: rewardType.image_url,
            rarity: rewardType.rarity
          };
        }
      }
    }

    // Record the claim
    const { error: claimError } = await supabase
      .from('daily_chest_claims')
      .insert({
        user_id: userId,
        config_id: config?.id || null,
        orydors_won: orydorsWon,
        item_won_id: itemWonId,
        item_quantity: itemQuantity,
        claim_date: today
      });

    if (claimError) {
      console.error(`[claim-daily-chest] Error recording claim:`, claimError);
      throw claimError;
    }

    // Award Orydors to user
    const { data: userStats, error: statsError } = await supabase
      .from('user_stats')
      .select('total_points')
      .eq('user_id', userId)
      .maybeSingle();

    if (statsError) {
      console.error(`[claim-daily-chest] Error fetching user stats:`, statsError);
    }

    const currentPoints = userStats?.total_points || 0;
    const newPoints = currentPoints + orydorsWon;

    const { error: updateError } = await supabase
      .from('user_stats')
      .upsert({
        user_id: userId,
        total_points: newPoints,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' });

    if (updateError) {
      console.error(`[claim-daily-chest] Error updating user stats:`, updateError);
    }

    // Add item to inventory if won
    if (itemWonId) {
      const { data: existingInventory } = await supabase
        .from('user_inventory')
        .select('id, quantity')
        .eq('user_id', userId)
        .eq('reward_type_id', itemWonId)
        .maybeSingle();

      if (existingInventory) {
        await supabase
          .from('user_inventory')
          .update({ quantity: existingInventory.quantity + itemQuantity })
          .eq('id', existingInventory.id);
      } else {
        await supabase
          .from('user_inventory')
          .insert({
            user_id: userId,
            reward_type_id: itemWonId,
            quantity: itemQuantity
          });
      }
    }

    console.log(`[claim-daily-chest] Success! User ${userId} received ${orydorsWon} Orydors${itemDetails ? ` + ${itemDetails.name}` : ''}`);

    return new Response(JSON.stringify({
      success: true,
      orydors: orydorsWon,
      item: itemDetails ? {
        ...itemDetails,
        quantity: itemQuantity
      } : null
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('[claim-daily-chest] Error:', error);
    return new Response(JSON.stringify({ error: 'Erreur serveur' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
