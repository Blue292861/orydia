import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "npm:resend@4.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WheelSegment {
  id: string;
  type: 'orydors' | 'xp' | 'item' | 'gift_card';
  value?: number;
  rewardTypeId?: string;
  quantity?: number;
  giftCardAmount?: number;
  probability: number;
  color: string;
  label: string;
}

interface StreakBonus {
  streak_level: number;
  bonus_type: string;
  bonus_value: number;
}

// Generate unique gift card code
function generateGiftCardCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'GIFT-';
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  code += '-';
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Send gift card email
async function sendGiftCardEmail(
  resend: Resend,
  email: string,
  code: string,
  amount: number,
  userName?: string
): Promise<boolean> {
  try {
    const { error } = await resend.emails.send({
      from: 'Orydia <noreply@orydia.fr>',
      to: [email],
      subject: '🎁 Vous avez gagné une Carte Cadeau Oryshop !',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5;">
          <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
            <div style="background: linear-gradient(135deg, #8B7355 0%, #A68B5B 100%); border-radius: 16px; padding: 40px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0 0 20px 0; font-size: 28px;">🎉 Félicitations${userName ? ` ${userName}` : ''} !</h1>
              <p style="color: #ffffff; margin: 0 0 30px 0; font-size: 16px; opacity: 0.9;">
                Vous avez gagné une carte cadeau sur la Roue de la Fortune !
              </p>
              
              <div style="background: #ffffff; border-radius: 12px; padding: 30px; margin: 20px 0;">
                <p style="color: #666; margin: 0 0 10px 0; font-size: 14px;">Votre code :</p>
                <p style="color: #8B7355; margin: 0 0 20px 0; font-size: 32px; font-weight: bold; letter-spacing: 4px;">
                  ${code}
                </p>
                <p style="color: #22c55e; margin: 0; font-size: 36px; font-weight: bold;">
                  ${amount}€
                </p>
              </div>
              
              <a href="https://oryshop.neptune-group.fr/" 
                 style="display: inline-block; background: #ffffff; color: #8B7355; padding: 14px 32px; 
                        border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;
                        margin-top: 20px;">
                Utiliser sur Oryshop →
              </a>
              
              <p style="color: #ffffff; margin: 30px 0 0 0; font-size: 12px; opacity: 0.7;">
                Cette carte est valable 1 an à partir de la date d'émission.
              </p>
            </div>
            
            <p style="text-align: center; color: #999; font-size: 12px; margin-top: 20px;">
              Orydia - La lecture gamifiée<br>
              <a href="https://orydia.fr" style="color: #8B7355;">orydia.fr</a>
            </p>
          </div>
        </body>
        </html>
      `,
    });

    if (error) {
      console.error('[spin-wheel] Email send error:', error);
      return false;
    }
    return true;
  } catch (error) {
    console.error('[spin-wheel] Email exception:', error);
    return false;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
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
    const userEmail = user.email;
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

    // Check premium status
    const { data: subscriber } = await supabase
      .from('subscribers')
      .select('subscribed, subscription_end')
      .eq('user_id', userId)
      .maybeSingle();
    
    const isPremium = subscriber?.subscribed && 
      (!subscriber.subscription_end || new Date(subscriber.subscription_end) > new Date());

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

    // Check if wheel is premium-only
    if (config?.is_premium_only && !isPremium) {
      console.log(`[spin-wheel] Premium-only wheel, user ${userId} is not premium`);
      return new Response(JSON.stringify({ 
        error: 'Cette roue est réservée aux membres Premium',
        premiumRequired: true
      }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

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
      // Boost probability of rare items (items, gift cards, and high orydors)
      adjustedSegments = segments.map(seg => {
        if (seg.type === 'item' || seg.type === 'gift_card' || (seg.type === 'orydors' && seg.value && seg.value >= 500)) {
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
      } else if (winningSegment.type !== 'gift_card') {
        value = Math.ceil(value * activeBonus.bonus_value);
      }
    }

    // Get user stats
    const { data: userStats } = await supabase
      .from('user_stats')
      .select('total_points, experience_points')
      .eq('user_id', userId)
      .maybeSingle();

    // Get user profile for name
    const { data: userProfile } = await supabase
      .from('profiles')
      .select('username, first_name')
      .eq('id', userId)
      .maybeSingle();

    const currentPoints = userStats?.total_points || 0;
    const currentXp = userStats?.experience_points || 0;
    let newPoints = currentPoints;
    let newXp = currentXp;
    let itemDetails: { id: string; name: string; imageUrl: string; rarity: string; quantity: number } | null = null;
    let giftCardDetails: { code: string; amount: number; emailSent: boolean } | null = null;

    // Apply reward
    if (winningSegment.type === 'orydors') {
      newPoints = currentPoints + value;
    } else if (winningSegment.type === 'xp') {
      newXp = currentXp + value;
    } else if (winningSegment.type === 'gift_card' && winningSegment.giftCardAmount) {
      // Generate gift card
      const giftCardCode = generateGiftCardCode();
      const giftCardAmount = winningSegment.giftCardAmount;
      const expiresAt = new Date();
      expiresAt.setFullYear(expiresAt.getFullYear() + 1);

      // Create gift card in database
      const { error: giftCardError } = await supabase
        .from('gift_cards')
        .insert({
          code: giftCardCode,
          initial_amount: giftCardAmount,
          current_balance: giftCardAmount,
          recipient_email: userEmail,
          recipient_name: userProfile?.username || userProfile?.first_name || null,
          personal_message: 'Félicitations ! Vous avez gagné cette carte sur la Roue de la Fortune Orydia !',
          is_active: true,
          expires_at: expiresAt.toISOString()
        });

      if (giftCardError) {
        console.error('[spin-wheel] Error creating gift card:', giftCardError);
      } else {
        console.log(`[spin-wheel] Gift card ${giftCardCode} created for ${userEmail}`);

        // Send email
        let emailSent = false;
        if (resendApiKey && userEmail) {
          const resend = new Resend(resendApiKey);
          emailSent = await sendGiftCardEmail(
            resend,
            userEmail,
            giftCardCode,
            giftCardAmount,
            userProfile?.username || userProfile?.first_name
          );
          console.log(`[spin-wheel] Gift card email sent: ${emailSent}`);
        }

        giftCardDetails = {
          code: giftCardCode,
          amount: giftCardAmount,
          emailSent
        };
      }
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
        value: winningSegment.type === 'item' || winningSegment.type === 'gift_card' ? undefined : value,
        label: winningSegment.label,
        item: itemDetails,
        giftCard: giftCardDetails
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
