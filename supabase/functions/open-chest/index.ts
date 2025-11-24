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
    const { bookId } = await req.json();

    if (!bookId) {
      throw new Error("Missing bookId");
    }

    // Check if chest already opened for this book
    const { data: existingChest } = await supabaseClient
      .from('chest_openings')
      .select('id')
      .eq('user_id', userId)
      .eq('book_id', bookId)
      .single();

    if (existingChest) {
      throw new Error("Chest already opened for this book");
    }

    // Get book points
    const { data: book } = await supabaseClient
      .from('books')
      .select('points')
      .eq('id', bookId)
      .single();

    if (!book) {
      throw new Error("Book not found");
    }

    // Check premium status
    const { data: subscription } = await supabaseClient
      .from('subscribers')
      .select('subscribed, subscription_end')
      .eq('user_id', userId)
      .single();

    const isPremium = subscription?.subscribed && 
      subscription.subscription_end && 
      new Date(subscription.subscription_end) > new Date();

    const chestType = isPremium ? 'gold' : 'silver';
    const basePoints = book.points || 0;

    // Calculate Orydors with variation
    const variations = isPremium ? [190, 200, 210] : [95, 100, 105];
    const random = Math.random();
    let selectedVariation: number;
    
    if (random < 0.25) {
      selectedVariation = variations[0];
    } else if (random < 0.75) {
      selectedVariation = variations[1];
    } else {
      selectedVariation = variations[2];
    }
    
    const orydors = Math.floor((basePoints * selectedVariation) / 100);

    // Fetch loot table
    const { data: lootTable } = await supabaseClient
      .from('loot_tables')
      .select(`
        *,
        reward_types (*)
      `)
      .eq('book_id', bookId)
      .eq('chest_type', chestType);

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

    // Save chest opening
    const { error: chestError } = await supabaseClient
      .from('chest_openings')
      .insert({
        user_id: userId,
        book_id: bookId,
        chest_type: chestType,
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
