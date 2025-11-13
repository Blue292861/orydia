import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { book_id } = await req.json();

    if (!book_id) {
      return new Response(
        JSON.stringify({ error: 'book_id is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Translation kickoff for book: ${book_id}`);

    // Initialize Supabase client with service role
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Start background translation task
    const backgroundTask = async () => {
      try {
        console.log(`Background: Starting translation for book ${book_id}`);
        console.log(`Background: About to invoke translate-book-chapters...`);
        
        const { data, error } = await supabaseAdmin.functions.invoke(
          'translate-book-chapters',
          {
            body: { book_id }
          }
        );

        if (error) {
          console.error(`Background: Translation error for book ${book_id}:`, error);
        } else {
          console.log(`Background: Translation completed for book ${book_id}`, data);
        }
      } catch (err) {
        console.error(`Background: Unhandled error for book ${book_id}:`, err);
      }
    };

    // Queue the background task with fallback
    if (typeof EdgeRuntime !== 'undefined' && EdgeRuntime.waitUntil) {
      EdgeRuntime.waitUntil(backgroundTask());
    } else {
      backgroundTask();
    }

    // Respond immediately
    return new Response(
      JSON.stringify({ 
        started: true, 
        book_id,
        message: 'Translation started in background' 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Kickoff error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
