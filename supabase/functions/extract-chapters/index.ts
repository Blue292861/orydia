
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ChapterExtraction {
  title: string;
  content: string;
  chapterNumber: number;
  isInteractive: boolean;
}

// Enhanced patterns for chapter detection
const CHAPTER_PATTERNS = [
  /^(chapitre|chapter)\s*(\d+|\w+)[\s:.-]*(.*)$/im,
  /^(\d+)[\s.-]+(.*)$/m,
  /^(partie|part)\s*(\d+|\w+)[\s:.-]*(.*)$/im,
  /^(section)\s*(\d+|\w+)[\s:.-]*(.*)$/im,
  // Add patterns for PDF-extracted content
  /^Page\s+\d+:\s*(chapitre|chapter)\s*(\d+|\w+)[\s:.-]*(.*)$/im,
];

// Enhanced patterns for interactivity detection
const INTERACTIVE_PATTERNS = [
  /que\s+(feriez-vous|choisissez-vous|voulez-vous)/i,
  /comment\s+(réagir|procéder)/i,
  /votre\s+choix/i,
  /décidez\s+de/i,
  /option\s*[ab12]/i,
  /\bchoix\b.*[12ab]/i,
  /(a\)|b\)|1\)|2\))/i,
  /choisir\s+entre/i,
];

function cleanPDFContent(content: string): string {
  // Clean up PDF-extracted content
  return content
    // Remove page markers
    .replace(/^Page\s+\d+:\s*/gm, '')
    // Clean up excessive whitespace
    .replace(/\s{3,}/g, ' ')
    // Fix line breaks
    .replace(/\n{3,}/g, '\n\n')
    // Remove weird characters that PDFs sometimes have
    .replace(/[^\x20-\x7E\n\r\t\u00A0-\u017F\u0100-\u024F]/g, ' ')
    .trim();
}

function extractChapters(content: string): ChapterExtraction[] {
  // Clean PDF content first
  const cleanedContent = cleanPDFContent(content);
  
  const chapters: ChapterExtraction[] = [];
  const lines = cleanedContent.split('\n');
  let currentChapter: ChapterExtraction | null = null;
  let chapterNumber = 1;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    if (!line) continue;

    // Try to detect a new chapter
    let isChapterStart = false;
    let chapterTitle = '';
    
    for (const pattern of CHAPTER_PATTERNS) {
      const match = line.match(pattern);
      if (match) {
        isChapterStart = true;
        chapterTitle = match[3] || match[2] || `Chapitre ${chapterNumber}`;
        console.log(`Found chapter: ${chapterTitle}`);
        break;
      }
    }

    // If we find a new chapter, finalize the previous one
    if (isChapterStart) {
      if (currentChapter && currentChapter.content.trim()) {
        chapters.push(currentChapter);
      }
      
      currentChapter = {
        title: chapterTitle.trim(),
        content: '',
        chapterNumber: chapterNumber++,
        isInteractive: false,
      };
      continue;
    }

    // Add content to current chapter
    if (currentChapter) {
      currentChapter.content += line + '\n';
      
      // Check if content is interactive
      if (!currentChapter.isInteractive) {
        for (const pattern of INTERACTIVE_PATTERNS) {
          if (pattern.test(line)) {
            currentChapter.isInteractive = true;
            console.log(`Interactive content detected in chapter: ${currentChapter.title}`);
            break;
          }
        }
      }
    } else {
      // First content without chapter title detected
      currentChapter = {
        title: `Chapitre ${chapterNumber}`,
        content: line + '\n',
        chapterNumber: chapterNumber++,
        isInteractive: false,
      };
    }
  }

  // Add the last chapter
  if (currentChapter && currentChapter.content.trim()) {
    chapters.push(currentChapter);
  }

  // If no chapters detected, create a single chapter
  if (chapters.length === 0) {
    const isInteractive = INTERACTIVE_PATTERNS.some(pattern => pattern.test(cleanedContent));
    return [{
      title: "Chapitre 1",
      content: cleanedContent,
      chapterNumber: 1,
      isInteractive,
    }];
  }

  // Clean up chapter content
  return chapters.map(chapter => ({
    ...chapter,
    content: chapter.content.trim(),
  }));
}

function splitContentIntoChapters(content: string, targetLength: number = 3000): ChapterExtraction[] {
  const cleanedContent = cleanPDFContent(content);
  const paragraphs = cleanedContent.split('\n\n').filter(p => p.trim());
  const chapters: ChapterExtraction[] = [];
  let currentChapter = '';
  let chapterNumber = 1;

  for (const paragraph of paragraphs) {
    if (currentChapter.length + paragraph.length > targetLength && currentChapter.length > 500) {
      const isInteractive = INTERACTIVE_PATTERNS.some(pattern => pattern.test(currentChapter));
      chapters.push({
        title: `Chapitre ${chapterNumber}`,
        content: currentChapter.trim(),
        chapterNumber: chapterNumber++,
        isInteractive,
      });
      currentChapter = paragraph + '\n\n';
    } else {
      currentChapter += paragraph + '\n\n';
    }
  }

  // Add the last chapter
  if (currentChapter.trim()) {
    const isInteractive = INTERACTIVE_PATTERNS.some(pattern => pattern.test(currentChapter));
    chapters.push({
      title: `Chapitre ${chapterNumber}`,
      content: currentChapter.trim(),
      chapterNumber: chapterNumber,
      isInteractive,
    });
  }

  return chapters;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { bookId, content, autoSplit = false } = await req.json();

    if (!bookId || !content) {
      return new Response(
        JSON.stringify({ error: 'bookId et content sont requis' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    console.log(`Processing content for book ${bookId}, autoSplit: ${autoSplit}`);
    console.log(`Content length: ${content.length} characters`);

    // Extract chapters from content
    let chapters: ChapterExtraction[];
    
    if (autoSplit) {
      // Automatic division into similar-sized chapters
      chapters = splitContentIntoChapters(content);
      console.log(`Auto-split created ${chapters.length} chapters`);
    } else {
      // Intelligent chapter detection
      chapters = extractChapters(content);
      console.log(`Smart detection found ${chapters.length} chapters`);
    }

    // Log chapter info
    chapters.forEach((chapter, index) => {
      console.log(`Chapter ${index + 1}: "${chapter.title}" (${chapter.content.length} chars, interactive: ${chapter.isInteractive})`);
    });

    // Save chapters to database
    const chapterInserts = chapters.map(chapter => ({
      book_id: bookId,
      chapter_number: chapter.chapterNumber,
      title: chapter.title,
      content: chapter.content,
      is_interactive: chapter.isInteractive,
    }));

    const { data: insertedChapters, error: insertError } = await supabaseClient
      .from('book_chapters')
      .insert(chapterInserts)
      .select();

    if (insertError) {
      console.error('Insert error:', insertError);
      throw insertError;
    }

    // Update book to indicate it has chapters
    const { error: updateError } = await supabaseClient
      .from('books')
      .update({ 
        has_chapters: true,
        is_interactive: chapters.some(c => c.isInteractive)
      })
      .eq('id', bookId);

    if (updateError) {
      console.error('Update error:', updateError);
      throw updateError;
    }

    const interactiveCount = chapters.filter(c => c.isInteractive).length;
    console.log(`Successfully processed ${chapters.length} chapters, ${interactiveCount} interactive`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        chapters: insertedChapters,
        totalChapters: chapters.length,
        interactiveChapters: interactiveCount
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );

  } catch (error) {
    console.error('Chapter extraction error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.stack 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});
