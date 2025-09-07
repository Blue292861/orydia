import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    const formData = await req.formData();
    const pdfFile = formData.get('pdf') as File;

    if (!pdfFile) {
      throw new Error('No PDF file provided');
    }

    console.log(`Processing PDF: ${pdfFile.name}, size: ${pdfFile.size} bytes`);

    // Convert file to ArrayBuffer
    const arrayBuffer = await pdfFile.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    
    // Check if this is actually a PDF file
    const pdfHeader = String.fromCharCode(...uint8Array.slice(0, 4));
    if (pdfHeader !== '%PDF') {
      throw new Error('File is not a valid PDF');
    }
    
    // Convert to string for text extraction
    let pdfContent = '';
    for (let i = 0; i < uint8Array.length; i++) {
      const byte = uint8Array[i];
      if (byte >= 32 && byte <= 126) { // Only printable ASCII
        pdfContent += String.fromCharCode(byte);
      } else if (byte === 10 || byte === 13 || byte === 9) { // Allow line breaks and tabs
        pdfContent += String.fromCharCode(byte);
      } else {
        pdfContent += ' '; // Replace non-printable with space
      }
    }
    
    let extractedText = '';
    const foundTexts = new Set<string>(); // Avoid duplicates
    
    // Method 1: Extract text from parentheses (most common in PDFs)
    const parenthesesMatches = pdfContent.match(/\([^)]+\)/g) || [];
    for (const match of parenthesesMatches) {
      let text = match.slice(1, -1) // Remove parentheses
        .replace(/\\n/g, '\n')
        .replace(/\\r/g, '\r')
        .replace(/\\t/g, '\t')
        .replace(/\\(.)/g, '$1') // Remove escape characters
        .trim();
      
      // Only keep meaningful text (at least 2 chars, contains letters)
      if (text.length >= 2 && /[a-zA-ZÀ-ÿ]/.test(text) && !foundTexts.has(text)) {
        foundTexts.add(text);
        extractedText += text + ' ';
      }
    }
    
    // Method 2: Look for text commands in PDF streams
    const streamMatches = pdfContent.match(/BT\s+.*?ET/gs) || [];
    for (const stream of streamMatches) {
      const textCommands = stream.match(/\([^)]+\)\s*Tj/g) || [];
      for (const cmd of textCommands) {
        let text = cmd.replace(/\([^)]+\)/, (match) => match.slice(1, -1))
          .replace(/\s*Tj.*/, '')
          .replace(/\\n/g, '\n')
          .replace(/\\(.)/g, '$1')
          .trim();
        
        if (text.length >= 2 && /[a-zA-ZÀ-ÿ]/.test(text) && !foundTexts.has(text)) {
          foundTexts.add(text);
          extractedText += text + ' ';
        }
      }
    }
    
    // Method 3: Extract from square brackets (array format text)
    const bracketMatches = pdfContent.match(/\[([^\]]+)\]/g) || [];
    for (const match of bracketMatches) {
      const content = match.slice(1, -1);
      const texts = content.match(/\([^)]+\)/g) || [];
      for (const textMatch of texts) {
        let text = textMatch.slice(1, -1)
          .replace(/\\(.)/g, '$1')
          .trim();
        
        if (text.length >= 2 && /[a-zA-ZÀ-ÿ]/.test(text) && !foundTexts.has(text)) {
          foundTexts.add(text);
          extractedText += text + ' ';
        }
      }
    }
    
    // Clean up the final text
    extractedText = extractedText
      .replace(/\s+/g, ' ') // Normalize whitespace
      .replace(/([.!?])\s*([A-ZÀÁÂÃÄÅÆÇÈÉÊË])/g, '$1\n\n$2') // Add paragraphs after sentences
      .trim();
    
    // Ensure we have meaningful content
    if (!extractedText || extractedText.length < 20) {
      // Try one more simple extraction method
      const simpleText = pdfContent
        .replace(/[^\x20-\x7E\u00A0-\uFFFF]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      
      if (simpleText.length > 100) {
        extractedText = simpleText.substring(0, 2000) + '...';
      } else {
        throw new Error('Aucun texte lisible n\'a pu être extrait de ce PDF. Il pourrait s\'agir d\'un PDF scanné ou basé sur des images.');
      }
    }
    
    console.log(`Successfully extracted ${extractedText.length} characters`);

    return new Response(
      JSON.stringify({
        text: extractedText,
        pageCount: Math.max(1, streamMatches.length),
        method: 'server',
        success: true
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in extract-pdf-text function:', error);
    
    return new Response(
      JSON.stringify({
        text: '',
        pageCount: 0,
        method: 'server',
        success: false,
        error: error.message || 'Erreur lors de l\'extraction du PDF'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
