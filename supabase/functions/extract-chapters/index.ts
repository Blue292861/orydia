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

// Patterns pour détecter les chapitres
const CHAPTER_PATTERNS = [
  /^(chapitre|chapter)\s*(\d+|\w+)[\s:.-]*(.*)$/im,
  /^(\d+)[\s.-]+(.*)$/m,
  /^(partie|part)\s*(\d+|\w+)[\s:.-]*(.*)$/im,
  /^(section)\s*(\d+|\w+)[\s:.-]*(.*)$/im,
];

// Patterns pour détecter l'interactivité
const INTERACTIVE_PATTERNS = [
  /que\s+(feriez-vous|choisissez-vous|voulez-vous)/i,
  /comment\s+(réagir|procéder)/i,
  /votre\s+choix/i,
  /décidez\s+de/i,
  /option\s*[ab12]/i,
  /\bchoix\b.*[12ab]/i,
];

function extractChapters(content: string): ChapterExtraction[] {
  const chapters: ChapterExtraction[] = [];
  const lines = content.split('\n');
  let currentChapter: ChapterExtraction | null = null;
  let chapterNumber = 1;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    if (!line) continue;

    // Tenter de détecter un nouveau chapitre
    let isChapterStart = false;
    let chapterTitle = '';
    
    for (const pattern of CHAPTER_PATTERNS) {
      const match = line.match(pattern);
      if (match) {
        isChapterStart = true;
        chapterTitle = match[3] || match[2] || `Chapitre ${chapterNumber}`;
        break;
      }
    }

    // Si on trouve un nouveau chapitre, finaliser le précédent
    if (isChapterStart) {
      if (currentChapter) {
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

    // Ajouter le contenu au chapitre actuel
    if (currentChapter) {
      currentChapter.content += line + '\n';
      
      // Vérifier si le contenu est interactif
      if (!currentChapter.isInteractive) {
        for (const pattern of INTERACTIVE_PATTERNS) {
          if (pattern.test(line)) {
            currentChapter.isInteractive = true;
            break;
          }
        }
      }
    } else {
      // Premier contenu sans titre de chapitre détecté
      currentChapter = {
        title: `Chapitre ${chapterNumber}`,
        content: line + '\n',
        chapterNumber: chapterNumber++,
        isInteractive: false,
      };
    }
  }

  // Ajouter le dernier chapitre
  if (currentChapter) {
    chapters.push(currentChapter);
  }

  // Si aucun chapitre détecté, créer un chapitre unique
  if (chapters.length === 0) {
    return [{
      title: "Chapitre 1",
      content: content,
      chapterNumber: 1,
      isInteractive: INTERACTIVE_PATTERNS.some(pattern => pattern.test(content)),
    }];
  }

  return chapters;
}

function splitContentIntoChapters(content: string, targetLength: number = 3000): ChapterExtraction[] {
  const paragraphs = content.split('\n\n').filter(p => p.trim());
  const chapters: ChapterExtraction[] = [];
  let currentChapter = '';
  let chapterNumber = 1;

  for (const paragraph of paragraphs) {
    if (currentChapter.length + paragraph.length > targetLength && currentChapter.length > 500) {
      chapters.push({
        title: `Chapitre ${chapterNumber}`,
        content: currentChapter.trim(),
        chapterNumber: chapterNumber++,
        isInteractive: INTERACTIVE_PATTERNS.some(pattern => pattern.test(currentChapter)),
      });
      currentChapter = paragraph + '\n\n';
    } else {
      currentChapter += paragraph + '\n\n';
    }
  }

  // Ajouter le dernier chapitre
  if (currentChapter.trim()) {
    chapters.push({
      title: `Chapitre ${chapterNumber}`,
      content: currentChapter.trim(),
      chapterNumber: chapterNumber,
      isInteractive: INTERACTIVE_PATTERNS.some(pattern => pattern.test(currentChapter)),
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

    // Extraire les chapitres du contenu
    let chapters: ChapterExtraction[];
    
    if (autoSplit) {
      // Division automatique en chapitres de taille similaire
      chapters = splitContentIntoChapters(content);
    } else {
      // Détection intelligente des chapitres
      chapters = extractChapters(content);
    }

    // Sauvegarder les chapitres dans la base de données
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
      throw insertError;
    }

    // Mettre à jour le livre pour indiquer qu'il a des chapitres
    const { error: updateError } = await supabaseClient
      .from('books')
      .update({ 
        has_chapters: true,
        is_interactive: chapters.some(c => c.isInteractive)
      })
      .eq('id', bookId);

    if (updateError) {
      throw updateError;
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        chapters: insertedChapters,
        totalChapters: chapters.length,
        interactiveChapters: chapters.filter(c => c.isInteractive).length
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );

  } catch (error) {
    console.error('Erreur lors de l\'extraction des chapitres:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});