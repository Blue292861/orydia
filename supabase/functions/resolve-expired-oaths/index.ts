import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('[resolve-expired-oaths] Starting expired oaths resolution...');

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);

    // Récupérer tous les serments expirés non résolus
    const { data: expiredOaths, error: fetchError } = await supabaseClient
      .from('reader_oaths')
      .select('id, user_id, book_id, book_title, stake_amount, deadline')
      .eq('status', 'active')
      .lt('deadline', new Date().toISOString());

    if (fetchError) {
      console.error('[resolve-expired-oaths] Error fetching expired oaths:', fetchError);
      throw fetchError;
    }

    console.log(`[resolve-expired-oaths] Found ${expiredOaths?.length || 0} expired oaths`);

    const results = {
      processed: 0,
      won: 0,
      lost: 0,
      errors: 0,
      details: [] as any[],
    };

    // Résoudre chaque serment expiré
    for (const oath of expiredOaths || []) {
      try {
        console.log(`[resolve-expired-oaths] Processing oath ${oath.id} for book "${oath.book_title}"`);

        const { data: result, error: resolveError } = await supabaseClient
          .rpc('resolve_reader_oath', { p_oath_id: oath.id });

        if (resolveError) {
          console.error(`[resolve-expired-oaths] Error resolving oath ${oath.id}:`, resolveError);
          results.errors++;
          results.details.push({
            oath_id: oath.id,
            status: 'error',
            error: resolveError.message,
          });
          continue;
        }

        results.processed++;
        
        let xpAwarded = 0;
        if (result?.status === 'won') {
          results.won++;
          
          // Award XP based on stake amount (stake / 10)
          xpAwarded = Math.floor(oath.stake_amount / 10);
          if (xpAwarded > 0) {
            const { error: xpError } = await supabaseClient
              .from('user_stats')
              .update({ 
                total_points: supabaseClient.rpc('increment_points', { amount: xpAwarded }),
              })
              .eq('user_id', oath.user_id);
            
            // Use direct SQL increment for reliability
            const { error: updateError } = await supabaseClient.rpc('add_user_xp', {
              p_user_id: oath.user_id,
              p_xp_amount: xpAwarded
            });
            
            if (updateError) {
              // Fallback: direct update
              await supabaseClient
                .from('user_stats')
                .update({ 
                  total_points: oath.stake_amount / 10 
                })
                .eq('user_id', oath.user_id);
              console.log(`[resolve-expired-oaths] Fallback XP update for user ${oath.user_id}`);
            } else {
              console.log(`[resolve-expired-oaths] Awarded ${xpAwarded} XP to user ${oath.user_id}`);
            }
          }
        } else if (result?.status === 'lost') {
          results.lost++;
        }

        results.details.push({
          oath_id: oath.id,
          book_title: oath.book_title,
          status: result?.status,
          payout: result?.payout_amount,
          xp_awarded: xpAwarded,
        });

        console.log(`[resolve-expired-oaths] Oath ${oath.id} resolved: ${result?.status}, payout: ${result?.payout_amount}`);
      } catch (oathError) {
        console.error(`[resolve-expired-oaths] Exception for oath ${oath.id}:`, oathError);
        results.errors++;
      }
    }

    console.log(`[resolve-expired-oaths] Completed. Processed: ${results.processed}, Won: ${results.won}, Lost: ${results.lost}, Errors: ${results.errors}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Processed ${results.processed} expired oaths`,
        results,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('[resolve-expired-oaths] Critical error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
