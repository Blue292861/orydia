import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Helper function to clean and validate text
function cleanExtractedText(text: string): string {
  if (!text) return '';
  
  try {
    // Remove control characters and invalid UTF-8 sequences
    let cleaned = text
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, ' ')  // Remove control chars
      .replace(/\uFEFF/g, '')  // Remove BOM
      .replace(/\\n/g, '\n')   // Convert escaped newlines
      .replace(/\\t/g, ' ')    // Convert escaped tabs to spaces
      .replace(/\\r/g, '')     // Remove escaped carriage returns
      .replace(/\\([()])/g, '$1')  // Unescape parentheses
      .replace(/\\\\/g, '\\')  // Unescape backslashes
      .replace(/\s+/g, ' ')    // Normalize whitespace
      .trim();
    
    // Remove obvious PDF artifacts
    cleaned = cleaned
      .replace(/\(cid:\d+\)/g, ' ')  // Remove CID references
      .replace(/\/[A-Za-z]+\s+/g, ' ')  // Remove PDF commands
      .replace(/\d+\.\d+\s+/g, ' ')  // Remove floating point numbers (likely coordinates)
      .replace(/\b[A-Za-z]\s+[A-Za-z]\s+[A-Za-z]\b/g, ' ')  // Remove scattered single letters
      .replace(/\s+/g, ' ')
      .trim();
    
    return cleaned;
  } catch (error) {
    console.error('Error cleaning text:', error);
    return text.replace(/[^\x20-\x7E\u00A0-\uFFFF]/g, ' ').trim();
  }
}

// Extract readable text from PDF content
function extractTextFromPDF(pdfContent: string): string {
  const textChunks = new Set<string>();
  
  try {
    // Method 1: Extract text in parentheses (most common PDF text format)
    const parenthesesPattern = /\(([^)\\]*(?:\\.[^)\\]*)*)\)/g;
    let match;
    
    while ((match = parenthesesPattern.exec(pdfContent)) !== null) {
      const rawText = match[1];
      const cleaned = cleanExtractedText(rawText);
      
      // Only keep text that looks meaningful
      if (cleaned.length >= 2 && /[a-zA-ZÀ-ÿ]/.test(cleaned)) {
        textChunks.add(cleaned);
      }
    }
    
    // Method 2: Extract from text arrays [(...) ...] TJ
    const arrayPattern = /\[\s*(?:\([^)\\]*(?:\\.[^)\\]*)*\)[^[\]]*)+\s*\]\s*TJ/g;
    while ((match = arrayPattern.exec(pdfContent)) !== null) {
      const arrayContent = match[0];
      const innerParentheses = /\(([^)\\]*(?:\\.[^)\\]*)*)\)/g;
      let innerMatch;
      
      while ((innerMatch = innerParentheses.exec(arrayContent)) !== null) {
        const cleaned = cleanExtractedText(innerMatch[1]);
        if (cleaned.length >= 2 && /[a-zA-ZÀ-ÿ]/.test(cleaned)) {
          textChunks.add(cleaned);
        }
      }
    }
    
    // Method 3: Extract from Tj commands
    const tjPattern = /\(([^)\\]*(?:\\.[^)\\]*)*)\)\s*Tj/g;
    while ((match = tjPattern.exec(pdfContent)) !== null) {
      const cleaned = cleanExtractedText(match[1]);
      if (cleaned.length >= 2 && /[a-zA-ZÀ-ÿ]/.test(cleaned)) {
        textChunks.add(cleaned);
      }
    }
    
    // Convert to array and create readable text
    const textArray = Array.from(textChunks);
    
    if (textArray.length === 0) {
      return '';
    }
    
    // Join text chunks with appropriate spacing
    let result = textArray.join(' ');
    
    // Add paragraph breaks at sentence endings followed by capital letters
    result = result
      .replace(/([.!?])\s+([A-ZÀÁÂÃÄÅÆÇÈÉÊË])/g, '$1\n\n$2')
      .replace(/\n\s*\n\s*\n/g, '\n\n')  // Normalize multiple line breaks
      .replace(/\s+/g, ' ')  // Final whitespace cleanup
      .trim();
    
    return result;
    
  } catch (error) {
    console.error('Error in text extraction:', error);
    return '';
  }
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
    
    // Read PDF file
    const arrayBuffer = await pdfFile.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    
    // Verify PDF signature
    const pdfSignature = new TextDecoder('latin1').decode(uint8Array.slice(0, 5));
    if (!pdfSignature.startsWith('%PDF')) {
      throw new Error('Le fichier fourni n\'est pas un PDF valide');
    }
    
    // Convert to text while preserving encoding
    const pdfContent = new TextDecoder('latin1').decode(uint8Array);
    
    // Extract text using improved methods
    const extractedText = extractTextFromPDF(pdfContent);
    
    // Validate extraction result
    if (!extractedText || extractedText.length < 10) {
      throw new Error('Impossible d\'extraire le texte de ce PDF. Il pourrait s\'agir d\'un PDF scanné, protégé ou corrompu.');
    }
    
    // Count pages
    const pageMatches = pdfContent.match(/\/Type\s*\/Page(?![a-zA-Z])/g);
    const pageCount = pageMatches ? pageMatches.length : Math.max(1, Math.floor(arrayBuffer.byteLength / 50000));
    
    console.log(`Extraction réussie: ${extractedText.length} caractères, ${pageCount} pages`);
    
    // Final validation and cleanup
    const finalText = cleanExtractedText(extractedText);
    
    if (finalText.length < 10) {
      throw new Error('Le texte extrait est trop court ou invalide');
    }
    
    return new Response(
      JSON.stringify({
        text: finalText,
        pageCount: pageCount,
        method: 'server',
        success: true
      }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
    
  } catch (error) {
    console.error('Erreur dans extract-pdf-text:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Erreur lors de l\'extraction du PDF',
        success: false,
        text: '',
        pageCount: 0,
        method: 'server'
      }),
      { 
        status: 400,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  }
});
