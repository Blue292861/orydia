import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const STREAK_RECOVERY_COST = 1650;

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
    console.log(`[recover-streak] User ${userId} attempting streak recovery`);

    // Get user's streak
    const { data: streak } = await supabase
      .from('wheel_streaks')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (!streak || !streak.streak_broken_at) {
      console.log(`[recover-streak] No broken streak to recover for user ${userId}`);
      return new Response(JSON.stringify({ 
        error: 'Aucune série à récupérer',
        noStreakToRecover: true
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Get user's Orydors
    const { data: userStats } = await supabase
      .from('user_stats')
      .select('total_points')
      .eq('user_id', userId)
      .maybeSingle();

    const currentPoints = userStats?.total_points || 0;

    if (currentPoints < STREAK_RECOVERY_COST) {
      console.log(`[recover-streak] User ${userId} has insufficient funds: ${currentPoints} < ${STREAK_RECOVERY_COST}`);
      return new Response(JSON.stringify({ 
        error: `Orydors insuffisants. Vous avez ${currentPoints} Orydors, il en faut ${STREAK_RECOVERY_COST}.`,
        insufficientFunds: true,
        required: STREAK_RECOVERY_COST,
        current: currentPoints
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Deduct Orydors
    const newPoints = currentPoints - STREAK_RECOVERY_COST;
    await supabase
      .from('user_stats')
      .update({ total_points: newPoints, updated_at: new Date().toISOString() })
      .eq('user_id', userId);

    // Restore streak
    const restoredStreak = streak.streak_broken_at;
    await supabase
      .from('wheel_streaks')
      .update({ 
        current_streak: restoredStreak,
        streak_broken_at: null,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);

    // Log transaction
    await supabase
      .from('point_transactions')
      .insert({
        user_id: userId,
        points: -STREAK_RECOVERY_COST,
        transaction_type: 'streak_recovery',
        description: `Récupération de série (${restoredStreak} jours)`,
      });

    console.log(`[recover-streak] Success! User ${userId} recovered streak of ${restoredStreak} days for ${STREAK_RECOVERY_COST} Orydors`);

    return new Response(JSON.stringify({
      success: true,
      restoredStreak,
      cost: STREAK_RECOVERY_COST,
      newBalance: newPoints
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('[recover-streak] Error:', error);
    return new Response(JSON.stringify({ error: 'Erreur serveur' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
