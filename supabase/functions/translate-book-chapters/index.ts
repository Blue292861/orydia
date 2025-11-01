import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { book_id } = await req.json();
    
    if (!book_id) {
      throw new Error('book_id is required');
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Get book info
    const { data: book, error: bookError } = await supabaseAdmin
      .from('books')
      .select('id, title, author')
      .eq('id', book_id)
      .single();

    if (bookError) throw bookError;

    console.log(`Starting translation for book: ${book.title} by ${book.author}`);

    // Get all chapters for this book
    const { data: chapters, error: chaptersError } = await supabaseAdmin
      .from('book_chapter_epubs')
      .select('id, title, chapter_number')
      .eq('book_id', book_id)
      .order('chapter_number', { ascending: true });

    if (chaptersError) throw chaptersError;

    console.log(`Found ${chapters.length} chapters to translate`);

    const languagesToTranslate = ['en', 'es', 'de', 'ru', 'zh', 'ja'];
    let successCount = 0;
    let failCount = 0;
    const failedChapters = [];

    // Process in batches of 2 chapters to reduce concurrency
    const batchSize = 2;
    for (let i = 0; i < chapters.length; i += batchSize) {
      const batch = chapters.slice(i, i + batchSize);
      
      console.log(`Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(chapters.length / batchSize)}`);

      // Process batch in parallel
      const batchPromises = batch.map(async (chapter) => {
        try {
          console.log(`  Translating chapter ${chapter.chapter_number}: ${chapter.title}`);
          
          const { error: translateError } = await supabaseAdmin.functions.invoke(
            'translate-chapter-batch',
            {
              body: {
                chapter_id: chapter.id,
                languages: languagesToTranslate,
              }
            }
          );

          if (translateError) {
            console.error(`  ❌ Failed chapter ${chapter.chapter_number}:`, translateError);
            failCount++;
            failedChapters.push({ chapter_number: chapter.chapter_number, title: chapter.title });
            return { success: false, chapter };
          }

          console.log(`  ✅ Successfully translated chapter ${chapter.chapter_number}`);
          successCount++;
          return { success: true, chapter };
        } catch (error) {
          console.error(`  ❌ Error chapter ${chapter.chapter_number}:`, error);
          failCount++;
          failedChapters.push({ chapter_number: chapter.chapter_number, title: chapter.title });
          return { success: false, chapter };
        }
      });

      await Promise.all(batchPromises);

      // Wait 5 seconds between batches to avoid rate limiting
      if (i + batchSize < chapters.length) {
        console.log(`  Waiting 5 seconds before next batch...`);
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }

    const result = {
      success: true,
      book: {
        id: book.id,
        title: book.title,
        author: book.author,
      },
      total_chapters: chapters.length,
      succeeded: successCount,
      failed: failCount,
      failed_chapters: failedChapters,
    };

    console.log(`Translation complete for "${book.title}":`, result);

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Book translation error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
