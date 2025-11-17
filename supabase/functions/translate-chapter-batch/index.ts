import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';
import ePub from "https://esm.sh/epubjs@0.3.93";
import { DOMParser } from "https://deno.land/x/deno_dom@v0.1.45/deno-dom-wasm.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const SUPPORTED_LANGUAGES = ['en', 'es', 'de', 'ru', 'zh', 'ja', 'ar', 'pt', 'it', 'nl', 'pl', 'tr', 'ko', 'hi'];

// PHASE 4 OPTIMIZATION: Model selection and cost constants
const MAX_TOKENS_PER_REQUEST = 12000;
const CHARS_PER_TOKEN = 4;
const MODEL_LITE_THRESHOLD_TOKENS = 5000;
const MODEL_LITE = 'google/gemini-2.0-flash-lite';
const MODEL_STANDARD = 'google/gemini-2.5-flash';

// Rough cost estimates (USD per 1K tokens)
const COST_PER_1K_TOKENS = {
  [MODEL_LITE]: 0.0001,
  [MODEL_STANDARD]: 0.0002,
};

// Helper function to calculate SHA-256 hash for caching
async function calculateHash(content: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(content);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { chapter_id, languages } = await req.json();

    if (!chapter_id) {
      return new Response(JSON.stringify({ error: 'chapter_id is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!languages || !Array.isArray(languages) || languages.length === 0) {
      return new Response(JSON.stringify({ error: 'languages array is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Validate languages
    const validLanguages = languages.filter(lang => SUPPORTED_LANGUAGES.includes(lang));
    if (validLanguages.length === 0) {
      return new Response(JSON.stringify({ error: 'No valid languages provided' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get chapter info
    const { data: chapter, error: chapterError } = await supabaseAdmin
      .from('book_chapter_epubs')
      .select('epub_url')
      .eq('id', chapter_id)
      .single();

    if (chapterError || !chapter) {
      return new Response(JSON.stringify({ error: 'Chapter not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Download and extract EPUB content
    console.log('Downloading EPUB:', chapter.epub_url);
    const epubResponse = await fetch(chapter.epub_url);
    const epubArrayBuffer = await epubResponse.arrayBuffer();
    
    const book = ePub(epubArrayBuffer);
    await book.ready;

    // Extract all sections
    const sections: Array<{ id: string; html: string }> = [];
    
    for (let i = 0; i < book.spine.length; i++) {
      const spineItem = book.spine.get(i);
      if (!spineItem) continue;

      try {
        const doc = await spineItem.load(book.load.bind(book));
        const htmlContent = doc.body?.innerHTML || '';
        sections.push({
          id: spineItem.idref || `section-${i}`,
          html: htmlContent,
        });
      } catch (error) {
        console.error(`Failed to load section ${i}:`, error);
      }
    }

    if (sections.length === 0) {
      return new Response(JSON.stringify({ error: 'No content found in EPUB' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Combine all sections for translation
    const combinedContent = sections.map(s => 
      `<section data-id="${s.id}">${s.html}</section>`
    ).join('\n');

    // PHASE 4 OPTIMIZATION: Calculate content hash for caching
    const contentHash = await calculateHash(combinedContent);
    
    // PHASE 4 OPTIMIZATION: Estimate tokens and select model
    const estimatedTokens = Math.ceil(combinedContent.length / CHARS_PER_TOKEN);
    const selectedModel = estimatedTokens < MODEL_LITE_THRESHOLD_TOKENS ? MODEL_LITE : MODEL_STANDARD;
    
    console.log(JSON.stringify({
      timestamp: new Date().toISOString(),
      level: 'info',
      event: 'translation_prepared',
      chapter_id,
      sections_count: sections.length,
      languages_count: validLanguages.length,
      estimated_tokens: estimatedTokens,
      selected_model: selectedModel,
      content_hash: contentHash,
    }));

    // PHASE 4 OPTIMIZATION: Check budget before translating
    const { data: budgetData, error: budgetError } = await supabaseAdmin
      .rpc('get_current_month_budget');
    
    if (budgetError) {
      console.error('Budget check error:', budgetError);
    } else if (budgetData && budgetData.length > 0) {
      const budget = budgetData[0];
      if (budget.remaining_usd <= 0) {
        return new Response(JSON.stringify({ 
          error: 'Monthly translation budget exceeded',
          budget_info: budget 
        }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      if (budget.is_over_threshold) {
        console.warn(JSON.stringify({
          timestamp: new Date().toISOString(),
          level: 'warn',
          event: 'budget_threshold_exceeded',
          budget_info: budget,
        }));
      }
    }

    console.log(`Translating ${sections.length} sections into ${validLanguages.length} languages`);

    // Translate into each language with retry logic
    for (let langIndex = 0; langIndex < validLanguages.length; langIndex++) {
      const targetLanguage = validLanguages[langIndex];
      const translationStartTime = Date.now();
      
      // PHASE 4 OPTIMIZATION: Check cache first
      const { data: cachedTranslation } = await supabaseAdmin
        .from('chapter_translations')
        .select('*')
        .eq('content_hash', contentHash)
        .eq('language', targetLanguage)
        .eq('status', 'completed')
        .maybeSingle();
      
      if (cachedTranslation) {
        console.log(JSON.stringify({
          timestamp: new Date().toISOString(),
          level: 'info',
          event: 'translation_cache_hit',
          chapter_id,
          language: targetLanguage,
          content_hash: contentHash,
        }));
        
        // Reuse cached translation with new chapter_id
        await supabaseAdmin
          .from('chapter_translations')
          .upsert({
            chapter_id,
            language: targetLanguage,
            translated_content: cachedTranslation.translated_content,
            content_hash: contentHash,
            status: 'completed',
            error_message: null,
          }, {
            onConflict: 'chapter_id,language'
          });
        
        // Record metrics for cache hit (no cost)
        await supabaseAdmin
          .from('translation_metrics')
          .insert({
            chapter_id,
            language: targetLanguage,
            duration_ms: Date.now() - translationStartTime,
            tokens_used: 0,
            cost_usd: 0,
            retries: 0,
            status: 'success',
            metadata: { cache_hit: true },
          });
        
        continue; // Skip to next language
      }
      
      // Add 700ms delay between languages to reduce rate limiting
      if (langIndex > 0) {
        await new Promise(resolve => setTimeout(resolve, 700));
      }

      // Retry logic with exponential backoff
      let attempt = 0;
      const maxRetries = 2;
      let success = false;

      while (attempt <= maxRetries && !success) {
        try {
          if (attempt > 0) {
            const backoffMs = Math.pow(2, attempt) * 1000; // 2s, 4s
            console.log(`Retry ${attempt}/${maxRetries} for ${targetLanguage} after ${backoffMs}ms`);
            await new Promise(resolve => setTimeout(resolve, backoffMs));
          }

          // Create pending record with content hash
          await supabaseAdmin
            .from('chapter_translations')
            .upsert({
              chapter_id,
              language: targetLanguage,
              translated_content: { sections: [] },
              content_hash: contentHash,
              status: 'processing',
              error_message: null,
            }, {
              onConflict: 'chapter_id,language'
            });

          // PHASE 4 OPTIMIZATION: Call Lovable AI with selected model
          console.log(JSON.stringify({
            timestamp: new Date().toISOString(),
            level: 'info',
            event: 'translation_api_call',
            chapter_id,
            language: targetLanguage,
            model: selectedModel,
            estimated_tokens: estimatedTokens,
            attempt: attempt + 1,
          }));

          const translationResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${LOVABLE_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: selectedModel, // PHASE 4: Use selected model based on content size
            messages: [
              {
                role: 'system',
                content: `You are a professional literary translator. Translate the following HTML content from French to ${targetLanguage}. 
                
CRITICAL RULES:
- Preserve ALL HTML tags and structure exactly as they are
- Only translate the text content between tags
- Keep all attributes, classes, IDs unchanged
- Maintain line breaks and formatting
- Do not add or remove any HTML elements
- Each section has a data-id attribute - keep it unchanged
- Return ONLY the translated HTML without any explanations or comments`
              },
              {
                role: 'user',
                content: combinedContent
              }
            ],
            temperature: 0.3,
            max_tokens: 16000,
          }),
        });

        if (!translationResponse.ok) {
          const errorText = await translationResponse.text();
          
          // Check for rate limiting or payment errors
          if (translationResponse.status === 429 || translationResponse.status === 402) {
            console.error(`Rate limit/payment error for ${targetLanguage} (attempt ${attempt + 1}):`, errorText);
            throw new Error(`Retryable error: ${translationResponse.status}`);
          }
          
          console.error(`Translation failed for ${targetLanguage}:`, errorText);
          throw new Error(`Translation API error: ${translationResponse.status}`);
        }

        const translationData = await translationResponse.json();
        const translatedHTML = translationData.choices[0].message.content;

        // PHASE 4 OPTIMIZATION: Calculate actual tokens used and cost
        const tokensUsed = translationData.usage?.total_tokens || estimatedTokens;
        const estimatedCost = (tokensUsed / 1000) * (COST_PER_1K_TOKENS[selectedModel] || 0.0002);

        // Parse translated sections
        const parser = new DOMParser();
        const translatedDoc = parser.parseFromString(translatedHTML, 'text/html');
        const translatedSections = translatedDoc.querySelectorAll('section[data-id]');
        
        const translatedContent: Array<{ id: string; html: string }> = [];
        translatedSections.forEach((section) => {
          const id = section.getAttribute('data-id');
          if (id) {
            translatedContent.push({
              id,
              html: section.innerHTML,
            });
          }
        });

        // Store completed translation with content hash
        await supabaseAdmin
          .from('chapter_translations')
          .update({
            translated_content: {
              sections: translatedContent,
              metadata: {
                total_sections: translatedContent.length,
                translated_at: new Date().toISOString(),
                model: selectedModel,
                tokens_used: tokensUsed,
                cost_usd: estimatedCost,
              }
            },
            content_hash: contentHash,
            status: 'completed',
            error_message: null,
          })
          .eq('chapter_id', chapter_id)
          .eq('language', targetLanguage);

        // PHASE 4 OPTIMIZATION: Record metrics and update budget
        const translationDuration = Date.now() - translationStartTime;
        
        await supabaseAdmin
          .from('translation_metrics')
          .insert({
            chapter_id,
            language: targetLanguage,
            duration_ms: translationDuration,
            tokens_used: tokensUsed,
            cost_usd: estimatedCost,
            retries: attempt,
            status: 'success',
            metadata: {
              model: selectedModel,
              sections_count: translatedContent.length,
            },
          });

        // Update budget
        await supabaseAdmin.rpc('update_translation_budget_spent', {
          cost_amount: estimatedCost,
        });

        // Check and create budget alerts
        await supabaseAdmin.rpc('check_and_create_budget_alert');

        console.log(JSON.stringify({
          timestamp: new Date().toISOString(),
          level: 'info',
          event: 'translation_completed',
          chapter_id,
          language: targetLanguage,
          duration_ms: translationDuration,
          tokens_used: tokensUsed,
          cost_usd: estimatedCost,
          model: selectedModel,
        }));

        success = true;
      } catch (error) {
        attempt++;
        console.error(JSON.stringify({
          timestamp: new Date().toISOString(),
          level: 'error',
          event: 'translation_attempt_failed',
          chapter_id,
          language: targetLanguage,
          attempt,
          error: error instanceof Error ? error.message : 'Unknown error',
        }));
        
        // If we've exhausted retries, mark as failed and record metrics
        if (attempt > maxRetries) {
          const translationDuration = Date.now() - translationStartTime;
          
          await supabaseAdmin
            .from('chapter_translations')
            .update({
              status: 'failed',
              error_message: error instanceof Error ? error.message : 'Unknown error',
            })
            .eq('chapter_id', chapter_id)
            .eq('language', targetLanguage);

          // PHASE 4 OPTIMIZATION: Record failed translation metrics
          await supabaseAdmin
            .from('translation_metrics')
            .insert({
              chapter_id,
              language: targetLanguage,
              duration_ms: translationDuration,
              tokens_used: 0,
              cost_usd: 0,
              retries: attempt,
              status: 'failed',
              error_message: error instanceof Error ? error.message : 'Unknown error',
            });
        }
      }
    }
  }

    return new Response(
      JSON.stringify({ 
        success: true, 
        chapter_id,
        languages_processed: validLanguages.length 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Translation batch error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
