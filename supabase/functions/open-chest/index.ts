import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ChestReward {
  type: string;
  name: string;
  quantity: number;
  imageUrl: string;
  rarity: string;
  rewardTypeId: string;
}

interface XPData {
  xpBefore: number;
  xpAfter: number;
  xpGained: number;
  levelBefore: number;
  levelAfter: number;
  didLevelUp: boolean;
  newLevels: number[];
}

interface SkillBonus {
  pathName: string;
  skillName: string;
  bonusType: string;
  description: string;
}

interface ChestRollResult {
  chestType: 'silver' | 'gold';
  orydors: number;
  orydorsVariation: number;
  orydorsMultiplier: number;
  additionalRewards: ChestReward[];
  xpData: XPData;
  appliedBonuses: SkillBonus[];
}

// Level calculation (matching src/utils/levelCalculations.ts)
const LEVEL_THRESHOLDS = [
  0, 100, 250, 450, 700, 1000, 1350, 1750, 2200, 2700,
  3250, 3850, 4500, 5200, 5950, 6750, 7600, 8500, 9450, 10450
];

function calculateLevel(experiencePoints: number): number {
  for (let i = 0; i < LEVEL_THRESHOLDS.length - 1; i++) {
    if (experiencePoints >= LEVEL_THRESHOLDS[i] && experiencePoints < LEVEL_THRESHOLDS[i + 1]) {
      return i + 1;
    }
  }
  if (experiencePoints >= LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1]) {
    const extraXp = experiencePoints - LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1];
    return 20 + Math.floor(extraXp / 1000);
  }
  return 1;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Missing authorization header");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError || !userData.user) {
      throw new Error("Invalid token");
    }

    const userId = userData.user.id;
    const { bookId, useChestKey } = await req.json();

    if (!bookId) {
      throw new Error("Missing bookId");
    }

    // ========== ADMIN CHECK ==========
    const { data: isAdmin } = await supabaseClient.rpc('is_admin', { p_user_id: userId });
    
    if (isAdmin) {
      console.log(`Admin user ${userId} opening chest - bypassing all restrictions`);
    }

    // Get current month-year for monthly reclaim system
    const currentMonthYear = new Date().toISOString().slice(0, 7);

    // Check if chest already opened for this book this month (SAUF pour les admins)
    if (!isAdmin) {
      const { data: existingChest } = await supabaseClient
        .from('chest_openings')
        .select('id')
        .eq('user_id', userId)
        .eq('book_id', bookId)
        .eq('month_year', currentMonthYear)
        .single();

      if (existingChest) {
        if (useChestKey) {
          const CHEST_KEY_ID = '550e8400-e29b-41d4-a716-446655440000';
          
          const { data: keyItem } = await supabaseClient
            .from('user_inventory')
            .select('quantity')
            .eq('user_id', userId)
            .eq('reward_type_id', CHEST_KEY_ID)
            .single();

          if (!keyItem || keyItem.quantity <= 0) {
            throw new Error("Vous n'avez pas de Clé de Coffre Magique");
          }

          await supabaseClient
            .from('user_inventory')
            .update({ quantity: keyItem.quantity - 1 })
            .eq('user_id', userId)
            .eq('reward_type_id', CHEST_KEY_ID);
          
          console.log('Chest key consumed, allowing chest to be re-opened');
        } else {
          throw new Error("Chest already opened this month");
        }
      }
    }

    // Get book points and genres
    const { data: book } = await supabaseClient
      .from('books')
      .select('points, genres')
      .eq('id', bookId)
      .single();

    if (!book) {
      throw new Error("Book not found");
    }

    const bookGenres: string[] = book.genres || [];
    const basePoints = book.points || 0;

    // ========== GET USER STATS BEFORE CHEST OPENING ==========
    const { data: userStatsBefore } = await supabaseClient
      .from('user_stats')
      .select('experience_points')
      .eq('user_id', userId)
      .single();
    
    const xpBefore = userStatsBefore?.experience_points || 0;
    const levelBefore = calculateLevel(xpBefore);

    // ========== GET ACTIVE SKILL BONUSES ==========
    const { data: activeBonuses } = await supabaseClient
      .rpc('get_user_active_skill_bonuses', { p_user_id: userId });
    
    console.log(`[open-chest] Active skill bonuses: ${JSON.stringify(activeBonuses)}`);

    // ========== CALCULATE ORYDORS MULTIPLIER FROM SKILL BONUSES ==========
    let orydorsMultiplier = 1;
    const appliedBonuses: SkillBonus[] = [];
    const today = new Date().getDay(); // 0 = Sunday, 6 = Saturday

    for (const bonus of activeBonuses || []) {
      if (bonus.bonus_type === 'day_orydors') {
        const config = bonus.bonus_config as { days: number[]; percentage: number };
        if (config.days?.includes(today)) {
          orydorsMultiplier += config.percentage / 100;
          appliedBonuses.push({
            pathName: bonus.path_name,
            skillName: bonus.skill_name,
            bonusType: 'day_orydors',
            description: `+${config.percentage}% Orydors (jour de la semaine)`
          });
          console.log(`[open-chest] Day bonus applied: +${config.percentage}%`);
        }
      }
      
      if (bonus.bonus_type === 'genre_orydors') {
        const config = bonus.bonus_config as { genre: string; percentage: number };
        if (bookGenres.includes(config.genre)) {
          orydorsMultiplier += config.percentage / 100;
          appliedBonuses.push({
            pathName: bonus.path_name,
            skillName: bonus.skill_name,
            bonusType: 'genre_orydors',
            description: `+${config.percentage}% Orydors (genre ${config.genre})`
          });
          console.log(`[open-chest] Genre bonus applied: +${config.percentage}% for ${config.genre}`);
        }
      }
    }

    // ========== ADMIN PRIVILEGES: ALWAYS GOLD CHEST WITH MAX MULTIPLIER ==========
    let chestType: 'silver' | 'gold';
    let selectedVariation: number;

    if (isAdmin) {
      chestType = 'gold';
      selectedVariation = 210;
      console.log(`Admin chest: gold chest with 210% multiplier`);
    } else {
      const { data: subscription } = await supabaseClient
        .from('subscribers')
        .select('subscribed, subscription_end')
        .eq('user_id', userId)
        .single();

      const isPremium = subscription?.subscribed && 
        subscription.subscription_end && 
        new Date(subscription.subscription_end) > new Date();

      chestType = isPremium ? 'gold' : 'silver';
      
      const variations = isPremium ? [190, 200, 210] : [95, 100, 105];
      const random = Math.random();
      
      if (random < 0.25) {
        selectedVariation = variations[0];
      } else if (random < 0.75) {
        selectedVariation = variations[1];
      } else {
        selectedVariation = variations[2];
      }
    }
    
    // Apply skill bonus multiplier to orydors
    const baseOrydors = Math.floor((basePoints * selectedVariation) / 100);
    const orydors = Math.floor(baseOrydors * orydorsMultiplier);
    
    if (orydorsMultiplier > 1) {
      console.log(`[open-chest] Orydors with skill bonus: ${baseOrydors} * ${orydorsMultiplier} = ${orydors}`);
    }

    // ========== FETCH LOOT TABLES ==========
    const { data: globalLoot } = await supabaseClient
      .from('loot_tables')
      .select(`*, reward_types (*)`)
      .is('book_id', null)
      .is('genre', null)
      .eq('chest_type', chestType);

    let genreLoot: any[] = [];
    if (bookGenres.length > 0) {
      const { data } = await supabaseClient
        .from('loot_tables')
        .select(`*, reward_types (*)`)
        .is('book_id', null)
        .in('genre', bookGenres)
        .eq('chest_type', chestType);
      
      genreLoot = data || [];
      console.log(`Fetched ${genreLoot.length} genre-specific loot items for genres: ${bookGenres.join(', ')}`);
    }

    const { data: bookLoot } = await supabaseClient
      .from('loot_tables')
      .select(`*, reward_types (*)`)
      .eq('book_id', bookId)
      .eq('chest_type', chestType);

    const lootTable = [...(globalLoot || []), ...genreLoot, ...(bookLoot || [])];
    console.log(`Total loot table entries: ${lootTable.length}`);

    // ========== ROLL ADDITIONAL REWARDS WITH SKILL DROP BONUSES ==========
    const additionalRewards: ChestReward[] = [];
    
    // Build a map of drop chance bonuses from skills
    const dropBonusMap: Record<string, number> = {};
    for (const bonus of activeBonuses || []) {
      if (bonus.bonus_type === 'chest_drop') {
        const config = bonus.bonus_config as { reward_type_id: string; percentage: number };
        if (config.reward_type_id) {
          dropBonusMap[config.reward_type_id] = (dropBonusMap[config.reward_type_id] || 0) + config.percentage;
        }
      }
    }

    if (lootTable) {
      for (const entry of lootTable) {
        // Calculate modified drop chance with skill bonuses
        let modifiedDropChance = entry.drop_chance_percentage;
        
        if (entry.reward_type_id && dropBonusMap[entry.reward_type_id]) {
          const bonusPercentage = dropBonusMap[entry.reward_type_id];
          modifiedDropChance += bonusPercentage;
          console.log(`[open-chest] Drop bonus for ${entry.reward_types?.name}: +${bonusPercentage}% (total: ${modifiedDropChance}%)`);
          
          // Add to applied bonuses if not already there
          const existingBonus = appliedBonuses.find(b => 
            b.bonusType === 'chest_drop' && b.description.includes(entry.reward_types?.name)
          );
          if (!existingBonus && entry.reward_types) {
            appliedBonuses.push({
              pathName: 'Compétence',
              skillName: 'Bonus de drop',
              bonusType: 'chest_drop',
              description: `+${bonusPercentage}% chance de drop: ${entry.reward_types.name}`
            });
          }
        }
        
        const dropRoll = Math.random() * 100;
        
        if (dropRoll <= modifiedDropChance && entry.reward_types) {
          const quantity = Math.floor(
            Math.random() * (entry.max_quantity - entry.min_quantity + 1) + entry.min_quantity
          );
          
          additionalRewards.push({
            type: entry.reward_types.category,
            name: entry.reward_types.name,
            quantity,
            imageUrl: entry.reward_types.image_url,
            rarity: entry.reward_types.rarity,
            rewardTypeId: entry.reward_types.id
          });
        }
      }
    }

    // ========== SAVE CHEST OPENING ==========
    const { error: chestError } = await supabaseClient
      .from('chest_openings')
      .insert({
        user_id: userId,
        book_id: bookId,
        chest_type: chestType,
        month_year: currentMonthYear,
        rewards_obtained: [...additionalRewards, {
          type: 'currency',
          name: 'Orydors',
          quantity: orydors,
          imageUrl: '/lovable-uploads/c831f469-03da-458d-8428-2f156b930e87.png',
          rarity: 'common',
          rewardTypeId: 'orydors'
        }]
      });

    if (chestError) {
      console.error('Error saving chest opening:', chestError);
      throw chestError;
    }

    // ========== ADD REWARDS TO INVENTORY ==========
    for (const reward of additionalRewards) {
      await supabaseClient
        .from('user_inventory')
        .upsert({
          user_id: userId,
          reward_type_id: reward.rewardTypeId,
          quantity: reward.quantity
        }, {
          onConflict: 'user_id,reward_type_id'
        });

      if (reward.type === 'fragment') {
        const { data: existingGems } = await supabaseClient
          .from('gem_fragments')
          .select('fragment_count')
          .eq('user_id', userId)
          .single();

        const newCount = (existingGems?.fragment_count || 0) + reward.quantity;

        await supabaseClient
          .from('gem_fragments')
          .upsert({
            user_id: userId,
            fragment_count: newCount
          }, {
            onConflict: 'user_id'
          });
      }
    }

    // ========== AWARD ORYDORS ==========
    await supabaseClient.functions.invoke('award-points', {
      body: {
        user_id: userId,
        points: orydors,
        transaction_type: 'book_completion',
        reference_id: bookId,
        description: `Coffre ${chestType === 'gold' ? 'doré' : 'argenté'} - ${selectedVariation}%${orydorsMultiplier > 1 ? ` (x${orydorsMultiplier.toFixed(2)} bonus)` : ''}`
      }
    });

    // ========== GET USER STATS AFTER CHEST OPENING ==========
    const { data: userStatsAfter } = await supabaseClient
      .from('user_stats')
      .select('experience_points')
      .eq('user_id', userId)
      .single();
    
    const xpAfter = userStatsAfter?.experience_points || xpBefore + orydors;
    const xpGained = xpAfter - xpBefore;
    const levelAfter = calculateLevel(xpAfter);
    const didLevelUp = levelAfter > levelBefore;
    
    const newLevels: number[] = [];
    for (let l = levelBefore + 1; l <= levelAfter; l++) {
      newLevels.push(l);
    }

    const xpData: XPData = {
      xpBefore,
      xpAfter,
      xpGained,
      levelBefore,
      levelAfter,
      didLevelUp,
      newLevels,
    };

    // ========== UPDATE CHALLENGE PROGRESS ==========
    for (const reward of additionalRewards) {
      if (reward.rewardTypeId) {
        const { data: objectives } = await supabaseClient
          .from('challenge_objectives')
          .select(`
            id,
            challenge_id,
            challenges!inner (
              id,
              is_active,
              start_date,
              end_date
            )
          `)
          .eq('objective_type', 'collect_item')
          .eq('target_reward_type_id', reward.rewardTypeId);

        if (objectives) {
          const now = new Date().toISOString();
          for (const obj of objectives) {
            const challenge = (obj as any).challenges;
            if (challenge?.is_active && challenge.start_date <= now && challenge.end_date >= now) {
              const { data: existingProgress } = await supabaseClient
                .from('user_challenge_progress')
                .select('*')
                .eq('user_id', userId)
                .eq('objective_id', obj.id)
                .single();

              const { data: objective } = await supabaseClient
                .from('challenge_objectives')
                .select('target_count')
                .eq('id', obj.id)
                .single();

              const targetCount = objective?.target_count || 1;
              const newProgress = (existingProgress?.current_progress || 0) + reward.quantity;
              const isCompleted = newProgress >= targetCount;

              if (existingProgress) {
                await supabaseClient
                  .from('user_challenge_progress')
                  .update({
                    current_progress: Math.min(newProgress, targetCount),
                    is_completed: isCompleted,
                    completed_at: isCompleted && !existingProgress.is_completed ? now : existingProgress.completed_at,
                  })
                  .eq('id', existingProgress.id);
              } else {
                await supabaseClient
                  .from('user_challenge_progress')
                  .insert({
                    user_id: userId,
                    challenge_id: obj.challenge_id,
                    objective_id: obj.id,
                    current_progress: Math.min(newProgress, targetCount),
                    is_completed: isCompleted,
                    completed_at: isCompleted ? now : null,
                  });
              }
            }
          }
        }
      }
    }

    // ========== CHECK AND RESOLVE READER OATH ==========
    let oathResult: { hasOath: boolean; result?: any } = { hasOath: false };
    try {
      const { data: oathData, error: oathError } = await supabaseClient
        .rpc('check_reader_oath_on_completion', {
          p_user_id: userId,
          p_book_id: bookId
        });
      
      if (!oathError && oathData) {
        oathResult = oathData as { hasOath: boolean; result?: any };
        if (oathResult.hasOath) {
          console.log('[open-chest] Reader oath resolved:', oathResult.result);
        }
      }
    } catch (oathErr) {
      console.error('[open-chest] Error checking reader oath:', oathErr);
    }

    // ========== BUILD FINAL RESULT ==========
    const result: ChestRollResult & { oathResult?: any } = {
      chestType,
      orydors,
      orydorsVariation: selectedVariation,
      orydorsMultiplier,
      additionalRewards,
      xpData,
      appliedBonuses,
      ...(oathResult.hasOath && { oathResult: oathResult.result }),
    };

    console.log('Chest opened successfully:', { 
      chestType, 
      orydors,
      orydorsMultiplier,
      appliedBonusesCount: appliedBonuses.length,
      xpBefore: xpData.xpBefore, 
      xpAfter: xpData.xpAfter, 
      didLevelUp: xpData.didLevelUp,
      newLevels: xpData.newLevels,
      oathResolved: oathResult.hasOath
    });

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("Error in open-chest function:", error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Internal server error" 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
