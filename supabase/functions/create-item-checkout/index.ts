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
    console.log("Starting create-item-checkout function");
    
    // Get auth token from request
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    // Get authenticated user
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      console.error("Auth error:", userError);
      throw new Error("User not authenticated");
    }

    console.log("User authenticated:", user.id);

    // Parse request body
    const { item_id, item_name, item_description, real_price_cents, reward_type_id, quantity = 1 } = await req.json();

    if (!item_id || !item_name || !real_price_cents) {
      throw new Error("Missing required fields: item_id, item_name, real_price_cents");
    }

    console.log("Creating checkout for item:", item_name, "price:", real_price_cents, "cents");

    // Initialize Stripe
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // Check if customer already exists
    const customers = await stripe.customers.list({
      email: user.email,
      limit: 1,
    });

    let customerId: string;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      console.log("Found existing customer:", customerId);
    } else {
      // Create new customer
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          supabase_user_id: user.id,
        },
      });
      customerId = customer.id;
      console.log("Created new customer:", customerId);
    }

    // Get origin for redirect URLs
    const origin = req.headers.get("origin") || "https://orydia.netlify.app";

    // Create Stripe Checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: item_name,
              description: item_description || `Achat de ${item_name}`,
            },
            unit_amount: real_price_cents,
          },
          quantity: quantity,
        },
      ],
      mode: "payment",
      success_url: `${origin}/item-purchase-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/?tab=shop`,
      metadata: {
        user_id: user.id,
        item_id: item_id,
        reward_type_id: reward_type_id || "",
        quantity: String(quantity),
        purchase_type: "shop_item",
      },
    });

    console.log("Checkout session created:", session.id);

    return new Response(
      JSON.stringify({ url: session.url, sessionId: session.id }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error in create-item-checkout:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
