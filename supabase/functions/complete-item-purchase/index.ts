import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Starting complete-item-purchase function");

    const { session_id } = await req.json();

    if (!session_id) {
      throw new Error("Missing session_id");
    }

    console.log("Verifying session:", session_id);

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // Retrieve the checkout session
    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (session.payment_status !== "paid") {
      throw new Error("Payment not completed");
    }

    console.log("Payment verified for session:", session_id);

    // Get metadata
    const { user_id, item_id, reward_type_id, quantity } = session.metadata || {};

    if (!user_id || !reward_type_id) {
      throw new Error("Missing metadata: user_id or reward_type_id");
    }

    const itemQuantity = parseInt(quantity || "1", 10);

    console.log("Adding item to inventory:", { user_id, reward_type_id, quantity: itemQuantity });

    // Create Supabase admin client
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Check if user already has this item in inventory
    const { data: existingItem, error: fetchError } = await supabaseAdmin
      .from("user_inventory")
      .select("id, quantity")
      .eq("user_id", user_id)
      .eq("reward_type_id", reward_type_id)
      .maybeSingle();

    if (fetchError) {
      console.error("Error fetching inventory:", fetchError);
      throw new Error("Failed to check inventory");
    }

    if (existingItem) {
      // Update existing quantity
      const { error: updateError } = await supabaseAdmin
        .from("user_inventory")
        .update({ 
          quantity: existingItem.quantity + itemQuantity,
          updated_at: new Date().toISOString()
        })
        .eq("id", existingItem.id);

      if (updateError) {
        console.error("Error updating inventory:", updateError);
        throw new Error("Failed to update inventory");
      }

      console.log("Updated inventory item, new quantity:", existingItem.quantity + itemQuantity);
    } else {
      // Insert new inventory item
      const { error: insertError } = await supabaseAdmin
        .from("user_inventory")
        .insert({
          user_id: user_id,
          reward_type_id: reward_type_id,
          quantity: itemQuantity,
        });

      if (insertError) {
        console.error("Error inserting inventory:", insertError);
        throw new Error("Failed to add to inventory");
      }

      console.log("Created new inventory item with quantity:", itemQuantity);
    }

    // Get item details for response
    const { data: rewardType } = await supabaseAdmin
      .from("reward_types")
      .select("name, image_url")
      .eq("id", reward_type_id)
      .single();

    return new Response(
      JSON.stringify({ 
        success: true, 
        item_name: rewardType?.name || "Item",
        item_image: rewardType?.image_url || "",
        quantity: itemQuantity
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error in complete-item-purchase:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
