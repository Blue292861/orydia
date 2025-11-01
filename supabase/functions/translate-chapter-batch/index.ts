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

    console.log(`Translating ${sections.length} sections into ${validLanguages.length} languages`);

    // Translate into each language with retry logic
    for (let langIndex = 0; langIndex < validLanguages.length; langIndex++) {
      const targetLanguage = validLanguages[langIndex];
      
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

          // Create pending record
          await supabaseAdmin
            .from('chapter_translations')
            .upsert({
              chapter_id,
              language: targetLanguage,
              translated_content: { sections: [] },
              status: 'processing',
              error_message: null,
            }, {
              onConflict: 'chapter_id,language'
            });

          // Call Lovable AI for translation
          const translationResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${LOVABLE_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'google/gemini-2.5-flash',
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

        // Store completed translation
        await supabaseAdmin
          .from('chapter_translations')
          .update({
            translated_content: {
              sections: translatedContent,
              metadata: {
                total_sections: translatedContent.length,
                translated_at: new Date().toISOString(),
                model: 'google/gemini-2.5-flash',
              }
            },
            status: 'completed',
            error_message: null,
          })
          .eq('chapter_id', chapter_id)
          .eq('language', targetLanguage);

        console.log(`Successfully translated chapter ${chapter_id} to ${targetLanguage}`);
        success = true;
      } catch (error) {
        attempt++;
        console.error(`Failed to translate to ${targetLanguage} (attempt ${attempt}):`, error);
        
        // If we've exhausted retries, mark as failed
        if (attempt > maxRetries) {
          await supabaseAdmin
            .from('chapter_translations')
            .update({
              status: 'failed',
              error_message: error instanceof Error ? error.message : 'Unknown error',
            })
            .eq('chapter_id', chapter_id)
            .eq('language', targetLanguage);
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
