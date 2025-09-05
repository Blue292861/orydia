import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

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

// Rate limiting check
async function checkRateLimit(supabase: any, userId: string, action: string): Promise<boolean> {
  try {
    const { data } = await supabase.rpc('check_rate_limit', {
      p_user_id: userId,
      p_action_type: action,
      p_max_attempts: 3, // Strict limit for API key creation
      p_window_minutes: 60 // 1 hour window
    });
    return data;
  } catch (error) {
    console.error('Rate limit check failed:', error);
    return false; // Fail safe - deny if we can't check
  }
}

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

    // Check rate limit for API key creation
    const { data: rateLimitOk } = await supabaseClient.rpc('check_rate_limit', {
      p_user_id: userData.user.id,
      p_action_type: 'api_key_creation',
      p_max_attempts: 3,
      p_window_minutes: 60
    });

    if (!rateLimitOk) {
      await supabaseClient.rpc('log_security_event', {
        event_type: 'rate_limit_exceeded',
        user_id: userData.user.id,
        details: { action: 'api_key_creation' }
      });
      throw new Error("Rate limit exceeded for API key creation");
    }

    // Vérifier que l'utilisateur est admin avec validation renforcée
    const { data: isAdmin, error: roleError } = await supabaseClient
      .rpc('user_has_role', { 
        p_user_id: userData.user.id, 
        p_role: 'admin' 
      });

    if (roleError) {
      console.error("Role check error:", roleError);
      await supabaseClient.rpc('log_security_event', {
        event_type: 'role_check_failed',
        user_id: userData.user.id,
        details: { error: roleError.message }
      });
      throw new Error("Failed to verify admin privileges");
    }

    if (!isAdmin) {
      console.warn("Unauthorized API key creation attempt:", userData.user.id);
      await supabaseClient.rpc('log_security_event', {
        event_type: 'unauthorized_api_key_attempt',
        user_id: userData.user.id,
        details: { timestamp: new Date().toISOString() }
      });
      throw new Error("Admin access required");
    }

    const body = await req.json();
    const { key_name, app_name, permissions = ['award_points'] } = body;

    // Enhanced input validation
    if (!key_name || typeof key_name !== 'string' || key_name.trim().length === 0) {
      throw new Error("key_name is required and must be a non-empty string");
    }
    
    if (!app_name || typeof app_name !== 'string' || app_name.trim().length === 0) {
      throw new Error("app_name is required and must be a non-empty string");
    }

    if (key_name.length > 100 || app_name.length > 100) {
      throw new Error("key_name and app_name must be less than 100 characters");
    }

    // Validate permissions array
    if (!Array.isArray(permissions) || permissions.length === 0) {
      throw new Error("permissions must be a non-empty array");
    }

    const validPermissions = ['award_points', 'read_stats', 'manage_content'];
    if (!permissions.every(p => validPermissions.includes(p))) {
      throw new Error(`Invalid permissions. Valid options: ${validPermissions.join(', ')}`);
    }

    // Générer une clé API unique
    const apiKey = `pk_${crypto.randomUUID().replace(/-/g, '')}_${Date.now()}`;
    const encoder = new TextEncoder();
    const data = encoder.encode(apiKey);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const keyHash = Array.from(new Uint8Array(hashBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    // Insérer la clé API dans la base de données
    const { data: newApiKey, error: insertError } = await supabaseClient
      .from("api_keys")
      .insert({
        key_name,
        key_hash: keyHash,
        app_name,
        permissions
      })
      .select("*")
      .single();

    if (insertError) throw insertError;

    // Log successful API key creation
    await supabaseClient.rpc('log_security_event', {
      event_type: 'api_key_created',
      user_id: userData.user.id,
      details: { 
        key_name, 
        app_name, 
        permissions,
        key_id: newApiKey.id
      }
    });

    return new Response(JSON.stringify({
      success: true,
      api_key: apiKey, // Retourner la clé en clair uniquement à la création
      key_info: {
        id: newApiKey.id,
        key_name: newApiKey.key_name,
        app_name: newApiKey.app_name,
        permissions: newApiKey.permissions,
        created_at: newApiKey.created_at
      }
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("Error in create-api-key function:", error);
    return new Response(JSON.stringify({ 
      error: error.message || "Internal server error" 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});