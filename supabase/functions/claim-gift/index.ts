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

interface ClaimResult {
  orydorsAwarded: number;
  xpAwarded: number;
  itemsAwarded: { reward_type_id: string; quantity: number; success: boolean; error?: string }[];
  errors: string[];
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

    // Check if gift is expired (skip for persistent gifts)
    if (!gift.is_persistent && gift.expires_at && new Date(gift.expires_at) < new Date()) {
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
    console.log('Processing rewards:', JSON.stringify(rewards));

    const result: ClaimResult = {
      orydorsAwarded: 0,
      xpAwarded: 0,
      itemsAwarded: [],
      errors: []
    };

    // Get current user stats first
    const { data: userStats, error: statsError } = await supabase
      .from('user_stats')
      .select('total_points, experience_points, level')
      .eq('user_id', user.id)
      .single();

    if (statsError && statsError.code !== 'PGRST116') {
      console.error('Error fetching user stats:', statsError);
    }

    const currentPoints = userStats?.total_points || 0;
    const currentXp = userStats?.experience_points || 0;
    let newPoints = currentPoints;
    let newXp = currentXp;

    // Award Orydors if any - DIRECTLY without calling award-points
    if (rewards.orydors && rewards.orydors > 0) {
      console.log(`Awarding ${rewards.orydors} Orydors to user ${user.id} (current: ${currentPoints})`);
      
      newPoints = currentPoints + rewards.orydors;
      result.orydorsAwarded = rewards.orydors;
      
      // Record the transaction
      const { error: transactionError } = await supabase
        .from('point_transactions')
        .insert({
          user_id: user.id,
          points: rewards.orydors,
          transaction_type: 'gift_claim',
          reference_id: gift_id,
          description: `Cadeau: ${gift.title}`
        });

      if (transactionError) {
        console.error('Error recording Orydors transaction:', transactionError);
        result.errors.push(`Erreur enregistrement transaction Orydors: ${transactionError.message}`);
      } else {
        console.log(`Orydors transaction recorded successfully`);
      }
    }

    // Award XP if any
    if (rewards.xp && rewards.xp > 0) {
      console.log(`Awarding ${rewards.xp} XP to user ${user.id} (current: ${currentXp})`);
      newXp = currentXp + rewards.xp;
      result.xpAwarded = rewards.xp;
    }

    // Update user stats if Orydors or XP were awarded
    if (result.orydorsAwarded > 0 || result.xpAwarded > 0) {
      // Calculate new level based on new XP
      let newLevel = userStats?.level || 1;
      
      if (result.xpAwarded > 0) {
        const { data: levelData, error: levelError } = await supabase.rpc('calculate_level', {
          experience_points: newXp
        });
        
        if (levelError) {
          console.error('Error calculating level:', levelError);
        } else {
          newLevel = levelData || newLevel;
        }
      }

      const { error: updateError } = await supabase
        .from('user_stats')
        .upsert({
          user_id: user.id,
          total_points: newPoints,
          experience_points: newXp,
          level: newLevel
        }, { onConflict: 'user_id' });

      if (updateError) {
        console.error('Error updating user stats:', updateError);
        result.errors.push(`Erreur mise à jour stats: ${updateError.message}`);
      } else {
        console.log(`User stats updated: points=${newPoints}, xp=${newXp}, level=${newLevel}`);
      }
    }

    // Award items if any
    if (rewards.items && rewards.items.length > 0) {
      for (const item of rewards.items) {
        console.log(`Processing item ${item.reward_type_id} x${item.quantity}`);
        
        // Verify reward_type exists
        const { data: rewardType, error: rewardTypeError } = await supabase
          .from('reward_types')
          .select('id, name')
          .eq('id', item.reward_type_id)
          .single();

        if (rewardTypeError || !rewardType) {
          console.error(`Reward type ${item.reward_type_id} not found:`, rewardTypeError);
          result.itemsAwarded.push({
            reward_type_id: item.reward_type_id,
            quantity: item.quantity,
            success: false,
            error: `Type de récompense non trouvé: ${item.reward_type_id}`
          });
          result.errors.push(`Item ${item.name || item.reward_type_id} non trouvé dans reward_types`);
          continue;
        }

        console.log(`Adding item "${rewardType.name}" (${item.reward_type_id}) x${item.quantity} to inventory`);
        
        // Check if user already has this item
        const { data: existingItem, error: existingError } = await supabase
          .from('user_inventory')
          .select('quantity')
          .eq('user_id', user.id)
          .eq('reward_type_id', item.reward_type_id)
          .single();

        if (existingError && existingError.code !== 'PGRST116') {
          console.error(`Error checking existing inventory for ${item.reward_type_id}:`, existingError);
        }

        let itemSuccess = false;
        let itemError: string | undefined;

        if (existingItem) {
          // Update quantity
          const newQuantity = existingItem.quantity + item.quantity;
          const { error: updateError } = await supabase
            .from('user_inventory')
            .update({ quantity: newQuantity, updated_at: new Date().toISOString() })
            .eq('user_id', user.id)
            .eq('reward_type_id', item.reward_type_id);

          if (updateError) {
            console.error(`Error updating inventory for ${item.reward_type_id}:`, updateError);
            itemError = updateError.message;
          } else {
            console.log(`Updated inventory: ${item.reward_type_id} quantity ${existingItem.quantity} -> ${newQuantity}`);
            itemSuccess = true;
          }
        } else {
          // Insert new item
          const { error: insertError } = await supabase
            .from('user_inventory')
            .insert({
              user_id: user.id,
              reward_type_id: item.reward_type_id,
              quantity: item.quantity
            });

          if (insertError) {
            console.error(`Error inserting inventory for ${item.reward_type_id}:`, insertError);
            itemError = insertError.message;
          } else {
            console.log(`Inserted new inventory item: ${item.reward_type_id} x${item.quantity}`);
            itemSuccess = true;
          }
        }

        result.itemsAwarded.push({
          reward_type_id: item.reward_type_id,
          quantity: item.quantity,
          success: itemSuccess,
          error: itemError
        });

        if (!itemSuccess && itemError) {
          result.errors.push(`Erreur ajout item ${rewardType.name}: ${itemError}`);
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
    console.log('Claim result:', JSON.stringify(result));

    // Return success with detailed result
    const hasErrors = result.errors.length > 0;
    
    return new Response(
      JSON.stringify({ 
        success: true,
        partial_errors: hasErrors,
        rewards: rewards,
        awarded: {
          orydors: result.orydorsAwarded,
          xp: result.xpAwarded,
          items: result.itemsAwarded
        },
        errors: hasErrors ? result.errors : undefined
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'Internal server error', details: String(error) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
