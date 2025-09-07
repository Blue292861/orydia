import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Helper function to clean text
function cleanText(text: string): string {
  return text
    .replace(/\\n/g, '\n')
    .replace(/\\t/g, '\t')
    .replace(/\\r/g, '\r')
    .replace(/\\([()])/g, '$1')
    .replace(/\\\\/g, '\\')
    .replace(/\s+/g, ' ')
    .trim();
}

// Function to extract text from PDF content string
function extractTextFromPDF(pdfContent: string): string {
  const extractedTexts = new Set<string>();
  
  // Method 1: Extract text from parentheses (most reliable)
  const parenthesesRegex = /\(([^)]+)\)/g;
  let match;
  while ((match = parenthesesRegex.exec(pdfContent)) !== null) {
    const text = cleanText(match[1]);
    if (text.length > 1 && /[a-zA-ZÀ-ÿ0-9]/.test(text)) {
      extractedTexts.add(text);
    }
  }
  
  // Method 2: Extract from Tj commands
  const tjRegex = /\(([^)]+)\)\s*Tj/g;
  while ((match = tjRegex.exec(pdfContent)) !== null) {
    const text = cleanText(match[1]);
    if (text.length > 1 && /[a-zA-ZÀ-ÿ0-9]/.test(text)) {
      extractedTexts.add(text);
    }
  }
  
  // Method 3: Extract from TJ arrays
  const tjArrayRegex = /\[\s*(?:\([^)]*\)[^[\]]*)+\s*\]\s*TJ/g;
  while ((match = tjArrayRegex.exec(pdfContent)) !== null) {
    const arrayContent = match[0];
    const innerParentheses = /\(([^)]+)\)/g;
    let innerMatch;
    while ((innerMatch = innerParentheses.exec(arrayContent)) !== null) {
      const text = cleanText(innerMatch[1]);
      if (text.length > 1 && /[a-zA-ZÀ-ÿ0-9]/.test(text)) {
        extractedTexts.add(text);
      }
    }
  }
  
  // Convert Set to Array and join with spaces
  const textsArray = Array.from(extractedTexts);
  let result = textsArray.join(' ');
  
  // Add some basic sentence structure
  result = result
    .replace(/([.!?])\s*([A-ZÀÁÂÃÄÅÆÇÈÉÊË])/g, '$1\n\n$2')
    .replace(/\s+/g, ' ')
    .trim();
  
  return result;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const formData = await req.formData();
    const pdfFile = formData.get('pdf') as File;

    if (!pdfFile) {
      throw new Error('Aucun fichier PDF fourni');
    }

    console.log(`Traitement du PDF: ${pdfFile.name}, taille: ${pdfFile.size} octets`);

    // Convert file to ArrayBuffer
    const arrayBuffer = await pdfFile.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    
    // Verify this is a PDF file
    const pdfSignature = new TextDecoder('latin1').decode(uint8Array.slice(0, 4));
    if (pdfSignature !== '%PDF') {
      throw new Error('Le fichier n\'est pas un PDF valide');
    }
    
    // Convert to string using latin1 encoding to preserve all bytes
    const pdfContent = new TextDecoder('latin1').decode(uint8Array);
    
    // Extract text using our improved method
    const extractedText = extractTextFromPDF(pdfContent);
    
    if (!extractedText || extractedText.length < 10) {
      throw new Error('Aucun texte lisible n\'a pu être extrait de ce PDF. Il pourrait s\'agir d\'un PDF scanné ou protégé.');
    }
    
    console.log(`Extraction réussie: ${extractedText.length} caractères`);
    
    // Final cleanup to ensure database compatibility
    const finalText = extractedText
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // Remove control characters
      .replace(/\uFEFF/g, '') // Remove BOM
      .replace(/[^\x20-\x7E\u00A0-\uFFFF]/g, ' ') // Keep only valid characters
      .trim();

    return new Response(
      JSON.stringify({
        text: finalText,
        pageCount: (pdfContent.match(/\/Page\s/g) || []).length || 1,
        method: 'server',
        success: true
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Erreur dans extract-pdf-text:', error);
    
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