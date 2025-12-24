import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WheelSegment {
  id: string;
  type: 'orydors' | 'xp' | 'item';
  value?: number;
  rewardTypeId?: string;
  quantity?: number;
  probability: number;
  color: string;
  label: string;
}

interface StreakBonus {
  streak_level: number;
  bonus_type: string;
  bonus_value: number;
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
    const { spinType = 'free' } = await req.json().catch(() => ({}));

    console.log(`[spin-wheel] User ${userId} attempting ${spinType} spin for ${today}`);

    // For free spins, check if already claimed today
    if (spinType === 'free') {
      const { data: existingClaim } = await supabase
        .from('daily_chest_claims')
        .select('id')
        .eq('user_id', userId)
        .eq('claim_date', today)
        .eq('spin_type', 'free')
        .maybeSingle();

      if (existingClaim) {
        console.log(`[spin-wheel] User ${userId} already has free spin today`);
        return new Response(JSON.stringify({ 
          error: 'Vous avez déjà utilisé votre tour gratuit aujourd\'hui',
          alreadySpun: true
        }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    // Get active wheel config
    const { data: config } = await supabase
      .from('daily_chest_configs')
      .select('*')
      .eq('is_active', true)
      .lte('start_date', today)
      .gte('end_date', today)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    // Default segments if no config
    const defaultSegments: WheelSegment[] = [
      { id: 'seg1', type: 'orydors', value: 200, probability: 50, color: '#FFD700', label: '200 Orydors' },
      { id: 'seg2', type: 'orydors', value: 1000, probability: 5, color: '#FF6B00', label: '1000 Orydors' },
      { id: 'seg3', type: 'item', rewardTypeId: '550e8400-e29b-41d4-a716-446655440000', quantity: 1, probability: 1, color: '#8B5CF6', label: "Clé d'Aildor" },
      { id: 'seg4', type: 'item', rewardTypeId: 'a1b2c3d4-5678-9012-3456-789012345678', quantity: 1, probability: 1, color: '#06B6D4', label: 'Fragment' },
      { id: 'seg5', type: 'xp', value: 40, probability: 43, color: '#10B981', label: '40 XP' },
    ];

    const segments: WheelSegment[] = config?.wheel_segments && Array.isArray(config.wheel_segments) && config.wheel_segments.length > 0
      ? config.wheel_segments as WheelSegment[]
      : defaultSegments;

    console.log(`[spin-wheel] Using ${segments.length} segments`);

    // Get user's streak
    let { data: streak } = await supabase
      .from('wheel_streaks')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    let newStreak = 1;
    let streakBrokenAt: number | null = null;

    if (streak) {
      if (streak.last_spin_date === yesterdayStr) {
        // Consecutive day - increment streak
        newStreak = streak.current_streak + 1;
      } else if (streak.last_spin_date === today) {
        // Same day - keep same streak (for paid spins)
        newStreak = streak.current_streak;
      } else if (streak.current_streak > 0) {
        // Streak broken - save it for recovery
        streakBrokenAt = streak.current_streak;
        newStreak = 1;
      }
    }

    // Get applicable streak bonuses
    const { data: bonuses } = await supabase
      .from('streak_bonuses')
      .select('*')
      .eq('is_active', true)
      .lte('streak_level', newStreak)
      .order('streak_level', { ascending: false })
      .limit(1);

    const activeBonus: StreakBonus | null = bonuses && bonuses.length > 0 ? bonuses[0] : null;
    console.log(`[spin-wheel] Streak: ${newStreak}, Active bonus:`, activeBonus);

    // Calculate probabilities with bonus
    let adjustedSegments = [...segments];
    if (activeBonus && activeBonus.bonus_type === 'probability_boost') {
      // Boost probability of rare items (items and high orydors)
      adjustedSegments = segments.map(seg => {
        if (seg.type === 'item' || (seg.type === 'orydors' && seg.value && seg.value >= 500)) {
          return { ...seg, probability: seg.probability * activeBonus.bonus_value };
        }
        return seg;
      });
    }

    // Roll the wheel
    const totalProbability = adjustedSegments.reduce((sum, seg) => sum + seg.probability, 0);
    const roll = Math.random() * totalProbability;
    let cumulative = 0;
    let winningIndex = 0;
    let winningSegment = adjustedSegments[0];

    for (let i = 0; i < adjustedSegments.length; i++) {
      cumulative += adjustedSegments[i].probability;
      if (roll <= cumulative) {
        winningIndex = i;
        winningSegment = segments[i]; // Use original segment for reward
        break;
      }
    }

    console.log(`[spin-wheel] Rolled ${roll.toFixed(2)}/${totalProbability}, won segment ${winningIndex}: ${winningSegment.label}`);

    // Calculate quantity with bonus
    let quantity = winningSegment.quantity || 1;
    let value = winningSegment.value || 0;
    if (activeBonus && activeBonus.bonus_type === 'quantity_boost') {
      if (winningSegment.type === 'item') {
        quantity = Math.ceil(quantity * activeBonus.bonus_value);
      } else {
        value = Math.ceil(value * activeBonus.bonus_value);
      }
    }

    // Get user stats
    const { data: userStats } = await supabase
      .from('user_stats')
      .select('total_points, experience_points')
      .eq('user_id', userId)
      .maybeSingle();

    const currentPoints = userStats?.total_points || 0;
    const currentXp = userStats?.experience_points || 0;
    let newPoints = currentPoints;
    let newXp = currentXp;
    let itemDetails: { id: string; name: string; imageUrl: string; rarity: string; quantity: number } | null = null;

    // Apply reward
    if (winningSegment.type === 'orydors') {
      newPoints = currentPoints + value;
    } else if (winningSegment.type === 'xp') {
      newXp = currentXp + value;
    } else if (winningSegment.type === 'item' && winningSegment.rewardTypeId) {
      // Fetch item details
      const { data: rewardType } = await supabase
        .from('reward_types')
        .select('id, name, image_url, rarity')
        .eq('id', winningSegment.rewardTypeId)
        .single();

      if (rewardType) {
        itemDetails = {
          id: rewardType.id,
          name: rewardType.name,
          imageUrl: rewardType.image_url,
          rarity: rewardType.rarity,
          quantity
        };

        // Add to inventory
        const { data: existingInventory } = await supabase
          .from('user_inventory')
          .select('id, quantity')
          .eq('user_id', userId)
          .eq('reward_type_id', winningSegment.rewardTypeId)
          .maybeSingle();

        if (existingInventory) {
          await supabase
            .from('user_inventory')
            .update({ quantity: existingInventory.quantity + quantity })
            .eq('id', existingInventory.id);
        } else {
          await supabase
            .from('user_inventory')
            .insert({
              user_id: userId,
              reward_type_id: winningSegment.rewardTypeId,
              quantity
            });
        }
      }
    }

    // Update user stats
    await supabase
      .from('user_stats')
      .upsert({
        user_id: userId,
        total_points: newPoints,
        experience_points: newXp,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' });

    // Record the spin
    await supabase
      .from('daily_chest_claims')
      .insert({
        user_id: userId,
        config_id: config?.id || null,
        orydors_won: winningSegment.type === 'orydors' ? value : 0,
        xp_won: winningSegment.type === 'xp' ? value : 0,
        item_won_id: winningSegment.type === 'item' ? winningSegment.rewardTypeId : null,
        item_quantity: quantity,
        spin_type: spinType,
        reward_type: winningSegment.type,
        claim_date: today
      });

    // Update streak
    const newMaxStreak = Math.max(streak?.max_streak || 0, newStreak);
    await supabase
      .from('wheel_streaks')
      .upsert({
        user_id: userId,
        current_streak: newStreak,
        max_streak: newMaxStreak,
        last_spin_date: today,
        streak_broken_at: streakBrokenAt,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' });

    // Calculate level data for XP
    let xpData = null;
    if (winningSegment.type === 'xp') {
      const { data: levelData } = await supabase.rpc('calculate_exponential_level', { xp_points: currentXp });
      const { data: newLevelData } = await supabase.rpc('calculate_exponential_level', { xp_points: newXp });
      
      if (levelData && newLevelData) {
        const levelBefore = levelData[0]?.level || 1;
        const levelAfter = newLevelData[0]?.level || 1;
        const newLevels: number[] = [];
        for (let i = levelBefore + 1; i <= levelAfter; i++) {
          newLevels.push(i);
        }
        xpData = {
          xpBefore: currentXp,
          xpAfter: newXp,
          xpGained: value,
          levelBefore,
          levelAfter,
          didLevelUp: levelAfter > levelBefore,
          newLevels
        };
      }
    }

    console.log(`[spin-wheel] Success! Streak: ${newStreak}, Reward: ${winningSegment.label}`);

    return new Response(JSON.stringify({
      success: true,
      segmentIndex: winningIndex,
      reward: {
        type: winningSegment.type,
        value: winningSegment.type === 'item' ? undefined : value,
        label: winningSegment.label,
        item: itemDetails
      },
      newStreak,
      bonusApplied: activeBonus ? activeBonus.bonus_type : null,
      xpData
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('[spin-wheel] Error:', error);
    return new Response(JSON.stringify({ error: 'Erreur serveur' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
