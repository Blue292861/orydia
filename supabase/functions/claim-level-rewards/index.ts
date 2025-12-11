import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Authorization required");
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Get user from token
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    if (authError || !user) {
      throw new Error("Invalid authentication");
    }

    console.log(`[claim-level-rewards] Processing for user: ${user.id}`);

    // Get all pending level rewards for user
    const { data: pendingRewards, error: pendingError } = await supabaseClient
      .from('pending_level_rewards')
      .select(`
        *,
        level_rewards (*)
      `)
      .eq('user_id', user.id);

    if (pendingError) throw pendingError;

    if (!pendingRewards || pendingRewards.length === 0) {
      return new Response(JSON.stringify({
        success: true,
        message: "No pending rewards",
        rewards: null
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    console.log(`[claim-level-rewards] Found ${pendingRewards.length} pending rewards`);

    // Cumulate all rewards
    let totalOrydors = 0;
    let totalXp = 0;
    let totalPremiumDays = 0;
    const levels: number[] = [];
    const itemsToAdd: { rewardTypeId: string; quantity: number }[] = [];

    for (const pending of pendingRewards) {
      const reward = pending.level_rewards;
      if (!reward) continue;

      levels.push(pending.level);
      totalOrydors += reward.orydors_reward || 0;
      totalXp += reward.xp_bonus || 0;
      totalPremiumDays += reward.premium_days || 0;

      // Collect items
      const itemRewards = reward.item_rewards || [];
      for (const item of itemRewards) {
        const existing = itemsToAdd.find(i => i.rewardTypeId === item.rewardTypeId);
        if (existing) {
          existing.quantity += item.quantity;
        } else {
          itemsToAdd.push({ rewardTypeId: item.rewardTypeId, quantity: item.quantity });
        }
      }
    }

    console.log(`[claim-level-rewards] Cumulated rewards - Orydors: ${totalOrydors}, XP: ${totalXp}, Items: ${itemsToAdd.length}`);

    // Award Orydors
    if (totalOrydors > 0) {
      const { data: stats } = await supabaseClient
        .from('user_stats')
        .select('total_points')
        .eq('user_id', user.id)
        .single();

      await supabaseClient
        .from('user_stats')
        .update({ total_points: (stats?.total_points || 0) + totalOrydors })
        .eq('user_id', user.id);

      await supabaseClient
        .from('point_transactions')
        .insert({
          user_id: user.id,
          points: totalOrydors,
          transaction_type: 'level_reward',
          description: `Récompenses de niveau ${levels.join(', ')}`,
          source_app: 'main_app'
        });
    }

    // Award XP bonus
    if (totalXp > 0) {
      const { data: stats } = await supabaseClient
        .from('user_stats')
        .select('experience_points')
        .eq('user_id', user.id)
        .single();

      await supabaseClient
        .from('user_stats')
        .update({ experience_points: (stats?.experience_points || 0) + totalXp })
        .eq('user_id', user.id);
    }

    // Award premium days
    if (totalPremiumDays > 0) {
      const { data: subscriber } = await supabaseClient
        .from('subscribers')
        .select('subscription_end')
        .eq('user_id', user.id)
        .single();

      const currentEnd = subscriber?.subscription_end 
        ? new Date(subscriber.subscription_end) 
        : new Date();
      
      if (currentEnd < new Date()) {
        currentEnd.setTime(Date.now());
      }
      
      currentEnd.setDate(currentEnd.getDate() + totalPremiumDays);

      await supabaseClient
        .from('subscribers')
        .upsert({
          user_id: user.id,
          email: user.email || '',
          subscribed: true,
          subscription_end: currentEnd.toISOString(),
          subscription_tier: 'premium'
        }, { onConflict: 'user_id' });
    }

    // Add items to inventory
    const itemDetails: any[] = [];
    for (const item of itemsToAdd) {
      // Get reward type details
      const { data: rewardType } = await supabaseClient
        .from('reward_types')
        .select('*')
        .eq('id', item.rewardTypeId)
        .single();

      if (rewardType) {
        itemDetails.push({
          rewardTypeId: item.rewardTypeId,
          name: rewardType.name,
          imageUrl: rewardType.image_url,
          quantity: item.quantity,
          rarity: rewardType.rarity
        });

        // Handle fragments separately
        if (rewardType.category === 'fragment') {
          const { data: fragments } = await supabaseClient
            .from('gem_fragments')
            .select('fragment_count')
            .eq('user_id', user.id)
            .single();

          if (fragments) {
            await supabaseClient
              .from('gem_fragments')
              .update({ fragment_count: fragments.fragment_count + item.quantity })
              .eq('user_id', user.id);
          } else {
            await supabaseClient
              .from('gem_fragments')
              .insert({ user_id: user.id, fragment_count: item.quantity });
          }
        } else {
          // Regular inventory item
          const { data: existing } = await supabaseClient
            .from('user_inventory')
            .select('quantity')
            .eq('user_id', user.id)
            .eq('reward_type_id', item.rewardTypeId)
            .single();

          if (existing) {
            await supabaseClient
              .from('user_inventory')
              .update({ quantity: existing.quantity + item.quantity })
              .eq('user_id', user.id)
              .eq('reward_type_id', item.rewardTypeId);
          } else {
            await supabaseClient
              .from('user_inventory')
              .insert({
                user_id: user.id,
                reward_type_id: item.rewardTypeId,
                quantity: item.quantity
              });
          }
        }
      }
    }

    // Delete pending rewards
    const pendingIds = pendingRewards.map(p => p.id);
    await supabaseClient
      .from('pending_level_rewards')
      .delete()
      .in('id', pendingIds);

    console.log(`[claim-level-rewards] Successfully claimed rewards for levels: ${levels.join(', ')}`);

    return new Response(JSON.stringify({
      success: true,
      rewards: {
        levels,
        totalOrydors,
        totalXp,
        totalPremiumDays,
        items: itemDetails
      }
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error: unknown) {
    console.error("[claim-level-rewards] Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
