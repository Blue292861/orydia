
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import Stripe from "https://esm.sh/stripe@14.21.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  console.log(`[${Date.now() - startTime}ms] create-checkout function started`);

  try {
    // Parse request body to get plan type
    const body = await req.json().catch(() => ({}));
    const planType = body.planType || 'monthly';
    console.log(`[${Date.now() - startTime}ms] Plan type: ${planType}`);

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: req.headers.get("Authorization")! } } }
    );
    
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );
    
    console.log(`[${Date.now() - startTime}ms] Authenticating user...`);
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) throw new Error("User not found");
    console.log(`[${Date.now() - startTime}ms] User authenticated: ${user.id}`);

    console.log(`[${Date.now() - startTime}ms] Fetching subscriber data...`);
    const { data: subscriber } = await supabaseAdmin.from('subscribers').select('stripe_customer_id').eq('user_id', user.id).maybeSingle();
    console.log(`[${Date.now() - startTime}ms] Subscriber data fetched.`);

    let customerId = subscriber?.stripe_customer_id;
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, { apiVersion: "2023-10-16" });

    // Validate existing customer ID with Stripe
    if (customerId) {
      console.log(`[${Date.now() - startTime}ms] Validating existing Stripe customer: ${customerId}`);
      try {
        await stripe.customers.retrieve(customerId);
        console.log(`[${Date.now() - startTime}ms] Stripe customer validated: ${customerId}`);
      } catch (stripeError: any) {
        console.log(`[${Date.now() - startTime}ms] Invalid Stripe customer ${customerId}, creating new one. Error: ${stripeError.message}`);
        customerId = null;
        // Clean up invalid customer ID from database
        await supabaseAdmin
          .from('subscribers')
          .upsert({ 
            user_id: user.id, 
            email: user.email!, 
            stripe_customer_id: null,
            updated_at: new Date().toISOString()
          }, { onConflict: 'user_id' });
      }
    }

    if (!customerId) {
      console.log(`[${Date.now() - startTime}ms] Creating new Stripe customer...`);
      const customer = await stripe.customers.create({
        email: user.email!,
        metadata: { user_id: user.id },
      });
      customerId = customer.id;
      console.log(`[${Date.now() - startTime}ms] Stripe customer created: ${customerId}`);
      
      console.log(`[${Date.now() - startTime}ms] Upserting subscriber in DB...`);
      await supabaseAdmin
        .from('subscribers')
        .upsert({ 
          user_id: user.id, 
          email: user.email!, 
          stripe_customer_id: customerId,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });
      console.log(`[${Date.now() - startTime}ms] Subscriber upserted.`);
    }

    // Configure pricing based on plan type
    const priceConfig = planType === 'yearly' ? {
      unit_amount: 10000, // 100.00 EUR
      recurring: { interval: "year" as const },
      product_data: {
        name: "Abonnement Premium Annuel",
        description: "Accès à toutes les fonctionnalités premium de l'application pour un an."
      }
    } : {
      unit_amount: 999, // 9.99 EUR
      recurring: { interval: "month" as const },
      product_data: {
        name: "Abonnement Premium Mensuel",
        description: "Accès à toutes les fonctionnalités premium de l'application."
      }
    };

    console.log(`[${Date.now() - startTime}ms] Creating Stripe checkout session for ${planType} plan...`);
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      customer: customerId,
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: priceConfig.product_data,
            unit_amount: priceConfig.unit_amount,
            recurring: priceConfig.recurring,
          },
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${req.headers.get("origin")}/`,
      cancel_url: `${req.headers.get("origin")}/premium`,
      allow_promotion_codes: true,
      metadata: {
        user_id: user.id,
        plan_type: planType
      }
    });
    console.log(`[${Date.now() - startTime}ms] Stripe checkout session created successfully: ${session.id}`);

    return new Response(JSON.stringify({ 
      url: session.url,
      sessionId: session.id 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error(`[${Date.now() - startTime}ms] Critical error in create-checkout:`, error);
    
    // Provide user-friendly error messages
    let errorMessage = "Une erreur inattendue s'est produite. Veuillez réessayer.";
    
    if (error instanceof Error) {
      if (error.message.includes("Customer")) {
        errorMessage = "Erreur de configuration du compte client. Veuillez contacter le support.";
      } else if (error.message.includes("User not found")) {
        errorMessage = "Session expirée. Veuillez vous reconnecter.";
      } else if (error.message.includes("Stripe")) {
        errorMessage = "Erreur du service de paiement. Veuillez réessayer dans quelques instants.";
      }
      
      console.log(`[${Date.now() - startTime}ms] Error in create-checkout: ${error.message}`);
    }

    return new Response(JSON.stringify({ 
      error: errorMessage,
      details: error instanceof Error ? error.message : "Unknown error"
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
