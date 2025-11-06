import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

const languageNames: Record<string, string> = {
  'en': 'English',
  'es': 'Spanish (Español)',
  'de': 'German (Deutsch)',
  'ru': 'Russian (Русский)',
  'zh': 'Chinese (中文)',
  'ja': 'Japanese (日本語)',
  'fr': 'French (Français)',
  'ar': 'Arabic (العربية)',
  'it': 'Italian (Italiano)',
  'pt': 'Portuguese (Português)',
  'nl': 'Dutch (Nederlands)',
  'pl': 'Polish (Polski)',
  'tr': 'Turkish (Türkçe)',
  'ko': 'Korean (한국어)',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { content, targetLanguage, sourceLanguage = 'fr' } = await req.json();

    // Validate inputs
    if (!content || typeof content !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Content is required and must be a string' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!targetLanguage || !languageNames[targetLanguage]) {
      return new Response(
        JSON.stringify({ error: 'Invalid target language' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Don't translate if already in target language
    if (sourceLanguage === targetLanguage) {
      return new Response(
        JSON.stringify({ translatedContent: content }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'AI service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // System prompt to ensure HTML structure is preserved
    const systemPrompt = `You are a professional translator specializing in literary content. Translate the following HTML content from ${languageNames[sourceLanguage]} to ${languageNames[targetLanguage]}.

CRITICAL RULES:
1. Preserve ALL HTML tags, attributes, classes, IDs, and structure EXACTLY as they are
2. Only translate the text content between tags and within text nodes
3. Do NOT translate HTML attributes (class, id, style, data-*, etc.)
4. Do NOT translate CSS classes or inline styles
5. Do NOT add or remove any HTML elements
6. Maintain the exact same formatting, whitespace, and line breaks
7. Keep all special characters, entities, and symbols as they are
8. Return ONLY the translated HTML with no explanations, no markdown formatting, no code blocks
9. The translation should be natural, fluent, and contextually appropriate for literary/narrative content
10. Preserve any special formatting like <em>, <strong>, <i>, <b>, etc.

IMPORTANT: Your response must be ONLY the translated HTML content, nothing else.`;

    // Call Lovable AI
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: content }
        ],
        temperature: 0.3, // Lower temperature for more consistent translations
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Lovable AI error:', response.status, errorText);
      return new Response(
        JSON.stringify({ error: 'Translation service error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const translatedContent = data.choices?.[0]?.message?.content;

    if (!translatedContent) {
      return new Response(
        JSON.stringify({ error: 'No translation received' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ translatedContent }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Translation error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
