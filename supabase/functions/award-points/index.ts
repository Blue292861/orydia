import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-api-key",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    const { user_id, points, transaction_type, reference_id, description, source_app = 'main_app' } = await req.json();
    
    // Vérifier l'authentification
    const apiKey = req.headers.get("x-api-key");
    const authHeader = req.headers.get("Authorization");
    
    let isAuthenticated = false;
    
    if (apiKey) {
      // Authentification par clé API pour applications externes
      const encoder = new TextEncoder();
      const data = encoder.encode(apiKey);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const keyHash = Array.from(new Uint8Array(hashBuffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
      const { data: apiKeyData, error: apiKeyError } = await supabaseClient
        .from("api_keys")
        .select("*")
        .eq("key_hash", keyHash)
        .eq("is_active", true)
        .single();
      
      if (apiKeyData && apiKeyData.permissions.includes('award_points')) {
        isAuthenticated = true;
        // Mettre à jour les stats d'utilisation
        await supabaseClient
          .from("api_keys")
          .update({ 
            last_used_at: new Date().toISOString(),
            usage_count: apiKeyData.usage_count + 1
          })
          .eq("id", apiKeyData.id);
      }
    } else if (authHeader) {
      // Authentification par token Supabase
      const token = authHeader.replace("Bearer ", "");
      const { data: userData } = await supabaseClient.auth.getUser(token);
      if (userData.user) {
        isAuthenticated = true;
      }
    }
    
    if (!isAuthenticated) {
      throw new Error("Authentication required");
    }

    if (!user_id || typeof points !== 'number' || !transaction_type) {
      throw new Error("Missing required fields: user_id, points, transaction_type");
    }

    // Récupérer ou créer les stats de l'utilisateur
    let { data: userStats, error: statsError } = await supabaseClient
      .from("user_stats")
      .select("*")
      .eq("user_id", user_id)
      .single();

    if (statsError && statsError.code === 'PGRST116') {
      // L'utilisateur n'existe pas, créer un nouveau profil
      const { data: newStats, error: createError } = await supabaseClient
        .from("user_stats")
        .insert({ user_id })
        .select("*")
        .single();
      
      if (createError) throw createError;
      userStats = newStats;
    } else if (statsError) {
      throw statsError;
    }

    // Calculer les nouveaux totaux
    const newTotalPoints = Math.max(0, userStats.total_points + points);
    const newExperiencePoints = userStats.experience_points + Math.abs(points);
    const newLevel = await supabaseClient.rpc('calculate_level', { experience_points: newExperiencePoints });

    // Mettre à jour les stats de l'utilisateur
    const { error: updateError } = await supabaseClient
      .from("user_stats")
      .update({
        total_points: newTotalPoints,
        experience_points: newExperiencePoints,
        level: newLevel.data
      })
      .eq("user_id", user_id);

    if (updateError) throw updateError;

    // Enregistrer la transaction
    const { error: transactionError } = await supabaseClient
      .from("point_transactions")
      .insert({
        user_id,
        points,
        transaction_type,
        reference_id,
        description,
        source_app
      });

    if (transactionError) throw transactionError;

    return new Response(JSON.stringify({
      success: true,
      new_total_points: newTotalPoints,
      new_level: newLevel.data,
      transaction_id: crypto.randomUUID()
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("Error in award-points function:", error);
    return new Response(JSON.stringify({ 
      error: error.message || "Internal server error" 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});