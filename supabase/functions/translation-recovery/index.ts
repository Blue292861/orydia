import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TranslationJob {
  id: string;
  book_id: string;
  status: string;
  total_chapters: number;
  completed_chapters: number;
  failed_chapters: number;
  target_languages: string[];
  started_at: string;
  updated_at: string;
  metadata: any;
}

interface StuckTranslation {
  id: string;
  chapter_id: string;
  language: string;
  status: string;
  updated_at: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const now = new Date();
    const fifteenMinutesAgo = new Date(now.getTime() - 15 * 60 * 1000);
    
    console.log(JSON.stringify({
      timestamp: now.toISOString(),
      level: 'info',
      event: 'recovery_started',
      threshold: fifteenMinutesAgo.toISOString(),
    }));

    const results = {
      stuck_translations_cleaned: 0,
      stuck_translations_retried: 0,
      abandoned_jobs_cleaned: 0,
      errors: [] as string[],
    };

    // 1. Find and handle stuck translations (processing for >15 minutes)
    const { data: stuckTranslations, error: stuckError } = await supabase
      .from('chapter_translations')
      .select('id, chapter_id, language, status, updated_at')
      .eq('status', 'processing')
      .lt('updated_at', fifteenMinutesAgo.toISOString());

    if (stuckError) {
      console.error('Error fetching stuck translations:', stuckError);
      results.errors.push(`Stuck translations fetch error: ${stuckError.message}`);
    } else if (stuckTranslations && stuckTranslations.length > 0) {
      console.log(`Found ${stuckTranslations.length} stuck translations`);

      for (const translation of stuckTranslations as StuckTranslation[]) {
        const metadata = await getTranslationMetadata(supabase, translation.id);
        const retryCount = metadata?.retry_count || 0;

        if (retryCount >= 3) {
          // Max retries reached, mark as failed
          const { error: updateError } = await supabase
            .from('chapter_translations')
            .update({
              status: 'failed',
              error_message: 'Max retries reached - translation abandoned',
              updated_at: now.toISOString(),
            })
            .eq('id', translation.id);

          if (updateError) {
            results.errors.push(`Failed to mark ${translation.id} as failed: ${updateError.message}`);
          } else {
            results.stuck_translations_cleaned++;
            console.log(JSON.stringify({
              level: 'info',
              event: 'translation_marked_failed',
              translation_id: translation.id,
              retry_count: retryCount,
            }));
          }
        } else {
          // Reset to pending for retry
          const { error: resetError } = await supabase
            .from('chapter_translations')
            .update({
              status: 'pending',
              updated_at: now.toISOString(),
              translated_content: {
                ...metadata,
                retry_count: retryCount + 1,
                last_retry_at: now.toISOString(),
              },
            })
            .eq('id', translation.id);

          if (resetError) {
            results.errors.push(`Failed to reset ${translation.id}: ${resetError.message}`);
          } else {
            results.stuck_translations_retried++;
            console.log(JSON.stringify({
              level: 'info',
              event: 'translation_reset_for_retry',
              translation_id: translation.id,
              retry_count: retryCount + 1,
            }));
          }
        }
      }
    }

    // 2. Find and clean abandoned translation jobs (processing for >30 minutes)
    const thirtyMinutesAgo = new Date(now.getTime() - 30 * 60 * 1000);
    const { data: abandonedJobs, error: jobsError } = await supabase
      .from('translation_jobs')
      .select('*')
      .eq('status', 'processing')
      .lt('updated_at', thirtyMinutesAgo.toISOString());

    if (jobsError) {
      console.error('Error fetching abandoned jobs:', jobsError);
      results.errors.push(`Abandoned jobs fetch error: ${jobsError.message}`);
    } else if (abandonedJobs && abandonedJobs.length > 0) {
      console.log(`Found ${abandonedJobs.length} abandoned jobs`);

      for (const job of abandonedJobs as TranslationJob[]) {
        // Check if job actually has pending/processing translations
        const { data: activeTranslations } = await supabase
          .from('chapter_translations')
          .select('id')
          .in('status', ['pending', 'processing'])
          .eq('chapter_id', job.book_id);

        if (!activeTranslations || activeTranslations.length === 0) {
          // No active translations, mark job as failed
          const { error: updateJobError } = await supabase
            .from('translation_jobs')
            .update({
              status: 'failed',
              error_message: 'Job abandoned - no active translations found',
              completed_at: now.toISOString(),
              updated_at: now.toISOString(),
            })
            .eq('id', job.id);

          if (updateJobError) {
            results.errors.push(`Failed to update job ${job.id}: ${updateJobError.message}`);
          } else {
            results.abandoned_jobs_cleaned++;
            console.log(JSON.stringify({
              level: 'info',
              event: 'job_marked_abandoned',
              job_id: job.id,
              book_id: job.book_id,
            }));
          }
        }
      }
    }

    console.log(JSON.stringify({
      timestamp: new Date().toISOString(),
      level: 'info',
      event: 'recovery_completed',
      results,
    }));

    return new Response(
      JSON.stringify({
        success: true,
        ...results,
        timestamp: now.toISOString(),
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Recovery error:', error);
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

async function getTranslationMetadata(supabase: any, translationId: string): Promise<any> {
  const { data } = await supabase
    .from('chapter_translations')
    .select('translated_content')
    .eq('id', translationId)
    .single();

  return data?.translated_content || {};
}
