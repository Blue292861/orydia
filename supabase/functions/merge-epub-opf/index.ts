import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import * as zip from "https://deno.land/x/zipjs@v2.7.34/index.js";

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
    const { epubUrl, opfUrl } = await req.json();

    console.log('Merging EPUB with custom OPF:', { epubUrl, opfUrl });

    if (!epubUrl || !opfUrl) {
      return new Response(
        JSON.stringify({ error: 'epubUrl and opfUrl are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 1. Download EPUB
    console.log('Downloading EPUB...');
    const epubResponse = await fetch(epubUrl);
    if (!epubResponse.ok) {
      throw new Error(`Failed to download EPUB: ${epubResponse.statusText}`);
    }
    const epubBlob = await epubResponse.blob();
    
    // 2. Download custom OPF
    console.log('Downloading custom OPF...');
    const opfResponse = await fetch(opfUrl);
    if (!opfResponse.ok) {
      throw new Error(`Failed to download OPF: ${opfResponse.statusText}`);
    }
    const customOpf = await opfResponse.text();
    
    // 3. Extract EPUB (ZIP) contents
    console.log('Extracting EPUB...');
    const blobReader = new zip.BlobReader(epubBlob);
    const zipReader = new zip.ZipReader(blobReader);
    const entries = await zipReader.getEntries();
    
    // 4. Find and replace the OPF file
    console.log('Processing entries...');
    const modifiedEntries = [];
    let opfReplaced = false;
    
    for (const entry of entries) {
      if (entry.filename.endsWith('.opf')) {
        console.log('Replacing OPF file:', entry.filename);
        // Replace with custom OPF
        modifiedEntries.push({
          filename: entry.filename,
          content: new TextEncoder().encode(customOpf),
        });
        opfReplaced = true;
      } else if (!entry.directory) {
        // Keep other files as-is
        const writer = new zip.Uint8ArrayWriter();
        const content = await entry.getData(writer);
        modifiedEntries.push({
          filename: entry.filename,
          content: content,
        });
      } else {
        // Keep directories
        modifiedEntries.push({
          filename: entry.filename,
          directory: true,
        });
      }
    }
    
    await zipReader.close();
    
    if (!opfReplaced) {
      throw new Error('No OPF file found in EPUB');
    }
    
    // 5. Re-compress as new EPUB
    console.log('Creating new EPUB...');
    const blobWriter = new zip.BlobWriter('application/epub+zip');
    const zipWriter = new zip.ZipWriter(blobWriter);
    
    for (const entry of modifiedEntries) {
      if (entry.directory) {
        await zipWriter.add(entry.filename);
      } else {
        const reader = new zip.Uint8ArrayReader(entry.content);
        await zipWriter.add(entry.filename, reader);
      }
    }
    
    const newEpubBlob = await zipWriter.close();
    
    console.log('EPUB merge successful, size:', newEpubBlob.size);
    
    // 6. Return the modified EPUB
    return new Response(newEpubBlob, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/epub+zip',
        'Content-Disposition': 'attachment; filename="merged.epub"',
      },
    });
    
  } catch (error) {
    console.error('Error merging EPUB with OPF:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

