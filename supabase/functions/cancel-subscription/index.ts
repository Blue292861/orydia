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

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );
      
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: req.headers.get("Authorization")! } } }
    );

    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) throw new Error("User not found");

    // Log security event for cancellation request
    await supabaseAdmin.rpc('log_security_event', {
      event_type: 'subscription_cancellation_request',
      user_id: user.id,
      details: { 
        timestamp: new Date().toISOString(),
        ip: req.headers.get("x-forwarded-for") || 'unknown'
      }
    });

    const { data: subscriber } = await supabaseAdmin
      .from('subscribers')
      .select('stripe_customer_id, subscription_tier, subscription_end')
      .eq('user_id', user.id)
      .single();

    if (!subscriber?.stripe_customer_id) {
      throw new Error("No active subscription found");
    }

    // Handle manual premium subscriptions
    if (subscriber.subscription_tier === 'Premium Manual') {
      // For manual subscriptions, just mark as cancelled
      const cancellationDate = subscriber.subscription_end || new Date().toISOString();
      
      await supabaseAdmin
        .from('subscribers')
        .update({
          cancel_at_period_end: true,
          cancellation_date: cancellationDate,
          cancelled_by_user: true,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      return new Response(JSON.stringify({ 
        success: true,
        message: "Subscription will end on " + new Date(cancellationDate).toLocaleDateString('fr-FR'),
        end_date: cancellationDate
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, { apiVersion: "2023-10-16" });

    // Get active subscriptions for this customer
    const subscriptions = await stripe.subscriptions.list({
      customer: subscriber.stripe_customer_id,
      status: "active",
      limit: 1,
    });

    if (subscriptions.data.length === 0) {
      throw new Error("No active subscription found");
    }

    const subscription = subscriptions.data[0];

    // Cancel the subscription at period end
    const updatedSubscription = await stripe.subscriptions.update(subscription.id, {
      cancel_at_period_end: true,
    });

    const endDate = new Date(updatedSubscription.current_period_end * 1000);

    // Update the subscriber record
    await supabaseAdmin
      .from('subscribers')
      .update({
        cancel_at_period_end: true,
        cancellation_date: endDate.toISOString(),
        cancelled_by_user: true,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id);

    // Log successful cancellation
    await supabaseAdmin.rpc('log_security_event', {
      event_type: 'subscription_cancelled',
      user_id: user.id,
      details: { 
        timestamp: new Date().toISOString(),
        end_date: endDate.toISOString(),
        subscription_id: subscription.id
      }
    });

    return new Response(JSON.stringify({ 
      success: true,
      message: `Votre abonnement se terminera le ${endDate.toLocaleDateString('fr-FR')}. Vous conservez l'accès premium jusqu'à cette date.`,
      end_date: endDate.toISOString()
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("Cancellation error:", error);
    return new Response(JSON.stringify({ 
      error: error.message || "Erreur lors de la résiliation" 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});