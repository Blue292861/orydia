
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import Stripe from "https://esm.sh/stripe@14.21.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Security logging function
async function logSecurityEvent(supabase: any, eventType: string, details: any) {
  try {
    await supabase.rpc('log_security_event', {
      event_type: eventType,
      details: details
    });
  } catch (error) {
    console.error('Failed to log security event:', error);
  }
}

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
    if (!user) {
      await logSecurityEvent(supabaseAdmin, 'unauthorized_subscription_check', {
        ip: req.headers.get("x-forwarded-for") || 'unknown',
        user_agent: req.headers.get("user-agent")
      });
      throw new Error("User not found");
    }
    
    // Log legitimate access
    await logSecurityEvent(supabaseAdmin, 'subscription_check', {
      user_id: user.id,
      ip: req.headers.get("x-forwarded-for") || 'unknown'
    });

    // Log security event for subscription check
    await supabaseAdmin.rpc('log_security_event', {
      event_type: 'subscription_check',
      user_id: user.id,
      details: { timestamp: new Date().toISOString() }
    });

    await supabaseAdmin
      .from('subscribers')
      .upsert({ user_id: user.id, email: user.email! }, { onConflict: 'user_id' });

    const { data: subscriber } = await supabaseAdmin
      .from('subscribers')
      .select('stripe_customer_id, subscribed, subscription_tier, subscription_end, cancel_at_period_end, cancellation_date, cancelled_by_user')
      .eq('user_id', user.id)
      .single();
    
    // Check for manual premium subscription first
    if (subscriber?.subscribed && subscriber?.subscription_tier === 'Premium Manual') {
      // Check if manual subscription is still valid
      const subscriptionEnd = subscriber.subscription_end;
      const now = new Date();
      const endDate = subscriptionEnd ? new Date(subscriptionEnd) : null;
      const isValidManualSub = !endDate || endDate > now;
      
      // Check if subscription was cancelled and is past expiration
      if (subscriber.cancel_at_period_end && endDate && endDate <= now) {
        await supabaseAdmin
          .from('subscribers')
          .update({
            subscribed: false,
            subscription_tier: null,
            subscription_end: null,
          })
          .eq('user_id', user.id);
        
        return new Response(JSON.stringify({ 
          subscribed: false, 
          subscription_tier: null, 
          subscription_end: null,
          cancelled: true
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }
      
      if (isValidManualSub) {
        return new Response(JSON.stringify({ 
          subscribed: true, 
          subscription_tier: subscriber.subscription_tier, 
          subscription_end: subscriptionEnd,
          cancel_at_period_end: subscriber.cancel_at_period_end || false,
          cancellation_date: subscriber.cancellation_date
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      } else {
        // Manual subscription expired, update the record
        await supabaseAdmin
          .from('subscribers')
          .update({
            subscribed: false,
            subscription_tier: null,
            subscription_end: null,
          })
          .eq('user_id', user.id);
        
        return new Response(JSON.stringify({ 
          subscribed: false, 
          subscription_tier: null, 
          subscription_end: null 
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }
    }
    
    if (!subscriber?.stripe_customer_id) {
       return new Response(JSON.stringify({ subscribed: false, subscription_tier: null, subscription_end: null }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }
    
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, { apiVersion: "2023-10-16" });

    const subscriptions = await stripe.subscriptions.list({
      customer: subscriber.stripe_customer_id,
      status: "all",
      limit: 10,
    });

    // Find active or cancelling subscription
    const activeOrCancelledSub = subscriptions.data.find((sub: any) => 
      sub.status === "active" || (sub.status === "canceled" && sub.canceled_at && sub.canceled_at * 1000 > Date.now())
    );

    const hasActiveSub = activeOrCancelledSub?.status === "active";
    const subscription = activeOrCancelledSub;
    const subscriptionEnd = subscription ? new Date(subscription.current_period_end * 1000).toISOString() : null;
    const subscriptionTier = hasActiveSub ? "Premium" : null;
    const cancelAtPeriodEnd = subscription?.cancel_at_period_end || false;

    // Check if cancelled subscription has expired
    if (subscription?.cancel_at_period_end && subscriptionEnd && new Date(subscriptionEnd) <= new Date()) {
      await supabaseAdmin
        .from('subscribers')
        .update({
          subscribed: false,
          subscription_tier: null,
          subscription_end: null,
        })
        .eq('user_id', user.id);

      return new Response(JSON.stringify({ 
        subscribed: false,
        subscription_tier: null,
        subscription_end: null,
        cancelled: true
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    await supabaseAdmin
      .from('subscribers')
      .update({
        subscribed: hasActiveSub,
        subscription_tier: subscriptionTier,
        subscription_end: subscriptionEnd,
        cancel_at_period_end: cancelAtPeriodEnd,
        cancellation_date: cancelAtPeriodEnd ? subscriptionEnd : null,
      })
      .eq('user_id', user.id);

    return new Response(JSON.stringify({ 
      subscribed: hasActiveSub,
      subscription_tier: subscriptionTier,
      subscription_end: subscriptionEnd,
      cancel_at_period_end: cancelAtPeriodEnd,
      cancellation_date: cancelAtPeriodEnd ? subscriptionEnd : null,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error: unknown) {
    console.error(error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
