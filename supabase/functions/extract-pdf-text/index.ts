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
    
    // Use pdf-parse library for server-side extraction
    // Note: In a real implementation, you would install pdf-parse via npm
    // For this example, we'll use a basic text extraction approach
    
    const response = await fetch('https://api.pdf.co/v1/pdf/convert/to/text', {
      method: 'POST',
      headers: {
        'x-api-key': Deno.env.get('PDF_CO_API_KEY') || '', // You would need to add this secret
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: '', // Would need to upload to temp storage first
        async: false
      })
    });

    // Fallback: Basic text extraction using simple patterns
    // This is a simplified version - in production you'd use a proper PDF library
    const uint8Array = new Uint8Array(arrayBuffer);
    const decoder = new TextDecoder();
    const pdfContent = decoder.decode(uint8Array);
    
    // Extract text between stream objects (very basic approach)
    const textRegex = /BT\s*.*?ET/gs;
    const matches = pdfContent.match(textRegex) || [];
    
    let extractedText = '';
    let pageCount = 0;
    
    for (const match of matches) {
      // Remove PDF commands and extract readable text
      const cleaned = match
        .replace(/BT|ET|Tf|TD|Td|Tj|TJ|'|"/g, ' ')
        .replace(/\d+\.\d+|\d+/g, ' ')
        .replace(/[()[\]<>]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      
      if (cleaned.length > 10) {
        extractedText += cleaned + '\n\n';
        pageCount++;
      }
    }

    // If no text found with basic extraction, return error
    if (!extractedText.trim()) {
      throw new Error('No text could be extracted from this PDF. It might be scanned or image-based.');
    }

    console.log(`Extracted ${extractedText.length} characters from ${pageCount} sections`);

    return new Response(
      JSON.stringify({
        text: extractedText.trim(),
        pageCount: pageCount,
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