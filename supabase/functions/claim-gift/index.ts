import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GiftRewardItem {
  reward_type_id: string;
  quantity: number;
  name?: string;
  image_url?: string;
}

interface GiftRewards {
  orydors?: number;
  xp?: number;
  items?: GiftRewardItem[];
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: 'Not authenticated' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { gift_id } = await req.json();

    if (!gift_id) {
      return new Response(
        JSON.stringify({ success: false, error: 'gift_id is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`User ${user.id} attempting to claim gift ${gift_id}`);

    // Fetch the gift
    const { data: gift, error: giftError } = await supabase
      .from('admin_gifts')
      .select('*')
      .eq('id', gift_id)
      .single();

    if (giftError || !gift) {
      console.error('Gift not found:', giftError);
      return new Response(
        JSON.stringify({ success: false, error: 'Gift not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if gift is expired
    if (new Date(gift.expires_at) < new Date()) {
      return new Response(
        JSON.stringify({ success: false, error: 'Gift has expired' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user is eligible for this gift
    let isEligible = false;
    
    if (gift.recipient_type === 'all') {
      isEligible = true;
    } else if (gift.recipient_type === 'premium') {
      const { data: subscriber } = await supabase
        .from('subscribers')
        .select('subscribed')
        .eq('user_id', user.id)
        .single();
      isEligible = subscriber?.subscribed === true;
    } else if (gift.recipient_type === 'specific') {
      isEligible = gift.recipient_user_ids?.includes(user.id);
    }

    if (!isEligible) {
      return new Response(
        JSON.stringify({ success: false, error: 'You are not eligible for this gift' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if already claimed
    const { data: existingClaim } = await supabase
      .from('user_gift_claims')
      .select('id')
      .eq('user_id', user.id)
      .eq('gift_id', gift_id)
      .single();

    if (existingClaim) {
      return new Response(
        JSON.stringify({ success: false, error: 'Gift already claimed' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const rewards = gift.rewards as GiftRewards;
    console.log('Processing rewards:', rewards);

    // Award Orydors if any
    if (rewards.orydors && rewards.orydors > 0) {
      console.log(`Awarding ${rewards.orydors} Orydors to user ${user.id}`);
      const { error: pointsError } = await supabase.functions.invoke('award-points', {
        body: {
          user_id: user.id,
          points: rewards.orydors,
          transaction_type: 'gift_claim',
          reference_id: gift_id,
          description: `Cadeau: ${gift.title}`
        }
      });

      if (pointsError) {
        console.error('Error awarding Orydors:', pointsError);
      }
    }

    // Award XP if any
    if (rewards.xp && rewards.xp > 0) {
      console.log(`Awarding ${rewards.xp} XP to user ${user.id}`);
      
      // Get current user stats
      const { data: userStats } = await supabase
        .from('user_stats')
        .select('experience_points')
        .eq('user_id', user.id)
        .single();

      const newXp = (userStats?.experience_points || 0) + rewards.xp;

      // Calculate new level
      const { data: levelData } = await supabase.rpc('calculate_level', {
        experience_points: newXp
      });

      await supabase
        .from('user_stats')
        .upsert({
          user_id: user.id,
          experience_points: newXp,
          level: levelData || 1
        }, { onConflict: 'user_id' });
    }

    // Award items if any
    if (rewards.items && rewards.items.length > 0) {
      for (const item of rewards.items) {
        console.log(`Adding item ${item.reward_type_id} x${item.quantity} to inventory`);
        
        // Check if user already has this item
        const { data: existingItem } = await supabase
          .from('user_inventory')
          .select('quantity')
          .eq('user_id', user.id)
          .eq('reward_type_id', item.reward_type_id)
          .single();

        if (existingItem) {
          // Update quantity
          await supabase
            .from('user_inventory')
            .update({ quantity: existingItem.quantity + item.quantity })
            .eq('user_id', user.id)
            .eq('reward_type_id', item.reward_type_id);
        } else {
          // Insert new item
          await supabase
            .from('user_inventory')
            .insert({
              user_id: user.id,
              reward_type_id: item.reward_type_id,
              quantity: item.quantity
            });
        }
      }
    }

    // Record the claim
    const { error: claimError } = await supabase
      .from('user_gift_claims')
      .insert({
        user_id: user.id,
        gift_id: gift_id
      });

    if (claimError) {
      console.error('Error recording claim:', claimError);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to record claim' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Gift ${gift_id} successfully claimed by user ${user.id}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        rewards: rewards
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
