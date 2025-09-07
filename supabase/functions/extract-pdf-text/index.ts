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
    const pdfHeader = new TextDecoder().decode(uint8Array.slice(0, 4));
    if (pdfHeader !== '%PDF') {
      throw new Error('File is not a valid PDF');
    }
    
    // Simple text extraction from PDF
    // This is a basic approach - for better results, you'd use a proper PDF library
    const decoder = new TextDecoder('utf-8', { fatal: false });
    const pdfContent = decoder.decode(uint8Array);
    
    // Extract readable text using improved regex patterns
    let extractedText = '';
    
    // Method 1: Look for text between BT and ET commands
    const textBlocks = pdfContent.match(/BT\s*.*?ET/gs) || [];
    
    for (const block of textBlocks) {
      // Clean up the text block
      let cleanText = block
        .replace(/BT|ET/g, '') // Remove BT/ET markers
        .replace(/\/[A-Za-z]+\s+\d+(\.\d+)?\s+Tf/g, '') // Remove font definitions
        .replace(/\d+(\.\d+)?\s+\d+(\.\d+)?\s+Td/g, '') // Remove positioning
        .replace(/\d+(\.\d+)?\s+TL/g, '') // Remove leading
        .replace(/q|Q/g, '') // Remove graphics state
        .replace(/\[.*?\]\s*TJ/g, '') // Remove complex text positioning
        .replace(/\((.*?)\)\s*Tj/g, '$1') // Extract text from Tj commands
        .replace(/\((.*?)\)\s*'/g, '$1') // Extract text from ' commands
        .replace(/\\[rn]/g, '\n') // Convert escape sequences
        .replace(/\\t/g, '\t')
        .replace(/\\\\/g, '\\')
        .replace(/\\\(/g, '(')
        .replace(/\\\)/g, ')')
        .trim();
      
      if (cleanText.length > 3) {
        extractedText += cleanText + '\n';
      }
    }
    
    // Method 2: If no text found with BT/ET, try alternative patterns
    if (extractedText.length < 50) {
      // Look for parenthetical text patterns
      const textMatches = pdfContent.match(/\([^)]{3,}\)/g) || [];
      for (const match of textMatches) {
        const text = match.slice(1, -1).trim();
        if (text.length > 2 && /[a-zA-ZÀ-ÿ]/.test(text)) {
          extractedText += text + ' ';
        }
      }
    }
    
    // Clean up the final text
    extractedText = extractedText
      .replace(/\s+/g, ' ') // Normalize whitespace
      .replace(/\n\s*\n/g, '\n\n') // Normalize line breaks
      .trim();
    
    // Ensure we have some meaningful text
    if (!extractedText || extractedText.length < 10) {
      throw new Error('No readable text could be extracted from this PDF. It might be scanned or image-based.');
    }
    
    // Final validation - remove any null bytes or invalid characters
    extractedText = extractedText
      .replace(/\x00/g, '') // Remove null bytes
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // Remove control characters
      .replace(/[^\x20-\x7E\u00A0-\uFFFF]/g, ''); // Keep only printable characters
    
    console.log(`Successfully extracted ${extractedText.length} characters`);

    return new Response(
      JSON.stringify({
        text: extractedText,
        pageCount: Math.max(1, textBlocks.length),
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
        error: error.message
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});