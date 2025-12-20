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

interface ChestRollResult {
  chestType: 'silver' | 'gold';
  orydors: number;
  orydorsVariation: number;
  additionalRewards: ChestReward[];
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
    // Vérifier si l'utilisateur est admin pour outrepasser toutes les règles
    const { data: isAdmin } = await supabaseClient.rpc('is_admin', { p_user_id: userId });
    
    if (isAdmin) {
      console.log(`Admin user ${userId} opening chest - bypassing all restrictions`);
    }

    // Get current month-year for monthly reclaim system
    const currentMonthYear = new Date().toISOString().slice(0, 7); // "2025-11"

    // Check if chest already opened for this book this month (SAUF pour les admins)
    if (!isAdmin) {
      const { data: existingChest } = await supabaseClient
        .from('chest_openings')
        .select('id')
        .eq('user_id', userId)
        .eq('book_id', bookId)
        .eq('month_year', currentMonthYear)
        .single();

      // If chest already opened this month, check if user wants to use a Chest Key
      if (existingChest) {
        if (useChestKey) {
          const CHEST_KEY_ID = '550e8400-e29b-41d4-a716-446655440000';
          
          // Check if user has a Chest Key
          const { data: keyItem } = await supabaseClient
            .from('user_inventory')
            .select('quantity')
            .eq('user_id', userId)
            .eq('reward_type_id', CHEST_KEY_ID)
            .single();

          if (!keyItem || keyItem.quantity <= 0) {
            throw new Error("Vous n'avez pas de Clé de Coffre Magique");
          }

          // Consume one key
          await supabaseClient
            .from('user_inventory')
            .update({ quantity: keyItem.quantity - 1 })
            .eq('user_id', userId)
            .eq('reward_type_id', CHEST_KEY_ID);
          
          console.log('Chest key consumed, allowing chest to be re-opened');
          // Allow the chest opening to proceed
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

    // ========== ADMIN PRIVILEGES: ALWAYS GOLD CHEST WITH MAX MULTIPLIER ==========
    let chestType: 'silver' | 'gold';
    let selectedVariation: number;

    if (isAdmin) {
      // Admin: toujours coffre doré avec multiplicateur maximum (210%)
      chestType = 'gold';
      selectedVariation = 210;
      console.log(`Admin chest: gold chest with 210% multiplier`);
    } else {
      // Check premium status for non-admin users
      const { data: subscription } = await supabaseClient
        .from('subscribers')
        .select('subscribed, subscription_end')
        .eq('user_id', userId)
        .single();

      const isPremium = subscription?.subscribed && 
        subscription.subscription_end && 
        new Date(subscription.subscription_end) > new Date();

      chestType = isPremium ? 'gold' : 'silver';
      
      // Calculate Orydors with variation
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
    
    const orydors = Math.floor((basePoints * selectedVariation) / 100);

    // Fetch GLOBAL loot table (book_id IS NULL AND genre IS NULL)
    const { data: globalLoot } = await supabaseClient
      .from('loot_tables')
      .select(`
        *,
        reward_types (*)
      `)
      .is('book_id', null)
      .is('genre', null)
      .eq('chest_type', chestType);

    // Fetch GENRE-SPECIFIC loot tables (for all genres of the book)
    let genreLoot: any[] = [];
    if (bookGenres.length > 0) {
      const { data } = await supabaseClient
        .from('loot_tables')
        .select(`
          *,
          reward_types (*)
        `)
        .is('book_id', null)
        .in('genre', bookGenres)
        .eq('chest_type', chestType);
      
      genreLoot = data || [];
      console.log(`Fetched ${genreLoot.length} genre-specific loot items for genres: ${bookGenres.join(', ')}`);
    }

    // Fetch BOOK-SPECIFIC loot table
    const { data: bookLoot } = await supabaseClient
      .from('loot_tables')
      .select(`
        *,
        reward_types (*)
      `)
      .eq('book_id', bookId)
      .eq('chest_type', chestType);

    // Merge ALL loot tables: global + genres + book-specific
    const lootTable = [...(globalLoot || []), ...genreLoot, ...(bookLoot || [])];
    console.log(`Total loot table entries: ${lootTable.length} (global: ${globalLoot?.length || 0}, genre: ${genreLoot.length}, book: ${bookLoot?.length || 0})`);

    // Roll additional rewards
    const additionalRewards: ChestReward[] = [];
    
    if (lootTable) {
      for (const entry of lootTable) {
        const dropRoll = Math.random() * 100;
        
        if (dropRoll <= entry.drop_chance_percentage && entry.reward_types) {
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

    const result: ChestRollResult = {
      chestType,
      orydors,
      orydorsVariation: selectedVariation,
      additionalRewards
    };

    // Save chest opening with month_year
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

    // Add rewards to inventory
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

      // Handle gem fragments
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

    // Award Orydors via existing award-points function
    await supabaseClient.functions.invoke('award-points', {
      body: {
        user_id: userId,
        points: orydors,
        transaction_type: 'book_completion',
        reference_id: bookId,
        description: `Coffre ${chestType === 'gold' ? 'doré' : 'argenté'} - ${selectedVariation}%`
      }
    });

    // Update challenge progress for collected items
    for (const reward of additionalRewards) {
      if (reward.rewardTypeId) {
        // Get active challenges with collect_item objectives for this reward type
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
              // Check/update user progress
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
