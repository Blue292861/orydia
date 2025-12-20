import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
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
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header provided");

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError || !userData.user) throw new Error("Authentication failed");

    const userId = userData.user.id;

    // ========== VÉRIFIER SI L'UTILISATEUR EST ADMIN ==========
    const { data: isAdmin } = await supabaseClient.rpc('is_admin', { p_user_id: userId });

    // Récupérer ou créer les stats de l'utilisateur avec les informations de niveau
    let { data: userStats, error: statsError } = await supabaseClient
      .from("user_level_info")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (statsError && statsError.code === 'PGRST116') {
      // L'utilisateur n'existe pas, créer un nouveau profil
      const { data: newStats, error: createError } = await supabaseClient
        .from("user_stats")
        .insert({ user_id: userId })
        .select("*")
        .single();
      
      if (createError) throw createError;
      
      // Récupérer les données avec les infos de niveau
      const { data: levelStats, error: levelError } = await supabaseClient
        .from("user_level_info")
        .select("*")
        .eq("user_id", userId)
        .single();
      
      if (levelError) throw levelError;
      userStats = levelStats;
    } else if (statsError) {
      throw statsError;
    }

    // Récupérer les achievements de l'utilisateur
    const { data: achievements, error: achievementsError } = await supabaseClient
      .from("user_achievements")
      .select("*")
      .eq("user_id", userId)
      .order("unlocked_at", { ascending: false });

    if (achievementsError) throw achievementsError;

    // Récupérer les transactions récentes
    const { data: recentTransactions, error: transactionsError } = await supabaseClient
      .from("point_transactions")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(10);

    if (transactionsError) throw transactionsError;

    // Récupérer les tutoriels vus depuis le profil
    const { data: profile, error: profileError } = await supabaseClient
      .from("profiles")
      .select("tutorials_seen")
      .eq("id", userId)
      .single();

    // Parser tutorials_seen (c'est un champ text en DB, on doit le parser en JSON)
    let tutorialsSeen = [];
    if (profile?.tutorials_seen) {
      try {
        tutorialsSeen = JSON.parse(profile.tutorials_seen);
      } catch (e) {
        console.error("Error parsing tutorials_seen:", e);
        tutorialsSeen = [];
      }
    }

    return new Response(JSON.stringify({
      user_stats: { 
        ...userStats, 
        tutorials_seen: tutorialsSeen,
        is_admin: isAdmin || false  // Ajouter le flag admin
      },
      achievements: achievements || [],
      recent_transactions: recentTransactions || []
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error: unknown) {
    console.error("Error in get-user-stats function:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    return new Response(JSON.stringify({ 
      error: errorMessage 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
