import * as pdfjsLib from 'pdfjs-dist';
import { createWorker } from 'tesseract.js';
import { supabase } from '@/integrations/supabase/client';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/4.0.269/pdf.worker.min.js`;

export interface ExtractionResult {
  text: string;
  pageCount: number;
  method: 'pdfjs' | 'ocr' | 'server';
  success: boolean;
  error?: string;
}

export class PDFExtractionService {
  /**
   * Clean extracted text from binary/invalid characters
   */
  static cleanExtractedText(text: string): string {
    if (!text) return '';
    
    return text
      // Remove null bytes and control characters
      .replace(/\x00/g, '')
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
      // Keep only printable ASCII and UTF-8 characters
      .replace(/[^\x20-\x7E\u00A0-\uFFFF]/g, '')
      // Normalize whitespace
      .replace(/\s+/g, ' ')
      .replace(/\n\s*\n/g, '\n\n')
      .trim();
  }

  /**
   * Extract text from PDF using multiple methods in cascade
   */
  static async extractText(
    pdfFile: File | string,
    onProgress?: (progress: number, status: string) => void
  ): Promise<ExtractionResult> {
    try {
      // Method 1: Try PDF.js first (fastest for text-based PDFs)
      onProgress?.(10, 'Tentative d\'extraction avec PDF.js...');
      const pdfJsResult = await this.extractWithPDFJS(pdfFile, onProgress);
      if (pdfJsResult.success && pdfJsResult.text.trim().length > 50) {
        const cleanedText = this.cleanExtractedText(pdfJsResult.text);
        return { ...pdfJsResult, text: cleanedText };
      }

      // Method 2: Try server-side extraction
      onProgress?.(40, 'Tentative d\'extraction côté serveur...');
      if (pdfFile instanceof File) {
        const serverResult = await this.extractWithServer(pdfFile, onProgress);
        if (serverResult.success && serverResult.text.trim().length > 50) {
          const cleanedText = this.cleanExtractedText(serverResult.text);
          return { ...serverResult, text: cleanedText };
        }
      }

      // Method 3: OCR as last resort (slower but works for scanned PDFs)
      onProgress?.(70, 'Tentative d\'extraction par OCR...');
      const ocrResult = await this.extractWithOCR(pdfFile, onProgress);
      if (ocrResult.success) {
        const cleanedText = this.cleanExtractedText(ocrResult.text);
        return { ...ocrResult, text: cleanedText };
      }
      
      return ocrResult;

    } catch (error) {
      console.error('PDF extraction failed:', error);
      return {
        text: '',
        pageCount: 0,
        method: 'pdfjs',
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  }

  /**
   * Extract text using PDF.js (client-side)
   */
  private static async extractWithPDFJS(
    pdfFile: File | string,
    onProgress?: (progress: number, status: string) => void
  ): Promise<ExtractionResult> {
    try {
      let arrayBuffer: ArrayBuffer;

      if (pdfFile instanceof File) {
        arrayBuffer = await pdfFile.arrayBuffer();
      } else {
        // URL case - fetch the PDF
        const response = await fetch(pdfFile);
        if (!response.ok) throw new Error('Impossible de télécharger le PDF');
        arrayBuffer = await response.arrayBuffer();
      }

      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const pageCount = pdf.numPages;
      let fullText = '';

      onProgress?.(20, `Extraction du texte (${pageCount} pages)...`);

      for (let pageNum = 1; pageNum <= pageCount; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(' ')
          .replace(/\s+/g, ' ')
          .trim();
        
        if (pageText) {
          fullText += `\n\n=== Page ${pageNum} ===\n\n${pageText}`;
        }

        const progress = 20 + (pageNum / pageCount) * 15;
        onProgress?.(progress, `Page ${pageNum}/${pageCount} extraite...`);
      }

      return {
        text: fullText.trim(),
        pageCount,
        method: 'pdfjs',
        success: true
      };

    } catch (error) {
      console.error('PDF.js extraction failed:', error);
      return {
        text: '',
        pageCount: 0,
        method: 'pdfjs',
        success: false,
        error: error instanceof Error ? error.message : 'Erreur PDF.js'
      };
    }
  }

  /**
   * Extract text using server-side edge function
   */
  private static async extractWithServer(
    pdfFile: File,
    onProgress?: (progress: number, status: string) => void
  ): Promise<ExtractionResult> {
    try {
      const formData = new FormData();
      formData.append('pdf', pdfFile);

      onProgress?.(45, 'Envoi du fichier au serveur...');

      const { data, error } = await supabase.functions.invoke('extract-pdf-text', {
        body: formData,
      });

      if (error) throw error;

      onProgress?.(60, 'Texte extrait par le serveur...');

      return {
        text: data.text || '',
        pageCount: data.pageCount || 0,
        method: 'server',
        success: true
      };

    } catch (error) {
      console.error('Server extraction failed:', error);
      return {
        text: '',
        pageCount: 0,
        method: 'server',
        success: false,
        error: error instanceof Error ? error.message : 'Erreur serveur'
      };
    }
  }

  /**
   * Extract text using OCR (Tesseract.js)
   */
  private static async extractWithOCR(
    pdfFile: File | string,
    onProgress?: (progress: number, status: string) => void
  ): Promise<ExtractionResult> {
    try {
      onProgress?.(75, 'Initialisation de l\'OCR...');

      // Convert PDF pages to images first
      let arrayBuffer: ArrayBuffer;

      if (pdfFile instanceof File) {
        arrayBuffer = await pdfFile.arrayBuffer();
      } else {
        const response = await fetch(pdfFile);
        if (!response.ok) throw new Error('Impossible de télécharger le PDF');
        arrayBuffer = await response.arrayBuffer();
      }

      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const pageCount = pdf.numPages;
      let fullText = '';

      const worker = await createWorker('fra', 1, {
        logger: m => onProgress?.(75 + (m.progress || 0) * 20, `OCR en cours: ${Math.round((m.progress || 0) * 100)}%`)
      });

      onProgress?.(80, `Reconnaissance OCR (${pageCount} pages)...`);

      for (let pageNum = 1; pageNum <= pageCount; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const scale = 2.0;
        const viewport = page.getViewport({ scale });

        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d')!;
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        await page.render({
          canvasContext: context,
          viewport: viewport,
          canvas: canvas
        }).promise;

        // Convert canvas to image for OCR
        const imageData = canvas.toDataURL('image/png');
        
        const { data: { text } } = await worker.recognize(imageData);
        
        if (text.trim()) {
          fullText += `\n\n=== Page ${pageNum} (OCR) ===\n\n${text.trim()}`;
        }

        const progress = 80 + (pageNum / pageCount) * 15;
        onProgress?.(progress, `OCR page ${pageNum}/${pageCount}...`);
      }

      await worker.terminate();

      return {
        text: fullText.trim(),
        pageCount,
        method: 'ocr',
        success: true
      };

    } catch (error) {
      console.error('OCR extraction failed:', error);
      return {
        text: '',
        pageCount: 0,
        method: 'ocr',
        success: false,
        error: error instanceof Error ? error.message : 'Erreur OCR'
      };
    }
  }

  /**
   * Save extracted text to database
   */
  static async saveExtractedText(bookId: string, extractedText: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('books')
        .update({ 
          content: extractedText,
          updated_at: new Date().toISOString()
        })
        .eq('id', bookId);

      return !error;
    } catch (error) {
      console.error('Failed to save extracted text:', error);
      return false;
    }
  }
}