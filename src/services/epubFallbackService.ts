import { EPUBService } from './epubService';

export interface EPUBFallbackResult {
  success: boolean;
  pages: string[];
  title?: string;
  author?: string;
  error?: string;
}

export class EPUBFallbackService {
  /**
   * Extract EPUB content from URL and convert to paginated HTML
   */
  static async extractFromUrl(url: string, onProgress?: (progress: number, status: string) => void): Promise<EPUBFallbackResult> {
    try {
      onProgress?.(10, 'Téléchargement du fichier EPUB...');
      
      // Download EPUB file
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch EPUB: ${response.statusText}`);
      }
      
      onProgress?.(30, 'Conversion en fichier...');
      const arrayBuffer = await response.arrayBuffer();
      const file = new File([arrayBuffer], 'epub-fallback.epub', { type: 'application/epub+zip' });
      
      onProgress?.(50, 'Extraction du contenu...');
      
      // Extract using existing EPUB service
      const result = await EPUBService.extractText(file, (progress, status) => {
        onProgress?.(50 + (progress * 0.4), status);
      });
      
      if (!result.success || !result.text) {
        throw new Error(result.error || 'Failed to extract EPUB content');
      }
      
      onProgress?.(90, 'Création des pages...');
      
      // Split content into pages (simple text-based pagination)
      const pages = this.paginateContent(result.text);
      
      onProgress?.(100, 'Terminé !');
      
      return {
        success: true,
        pages,
        title: result.title,
        author: result.author
      };
    } catch (error) {
      console.error('EPUB fallback extraction error:', error);
      return {
        success: false,
        pages: [],
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
  
  /**
   * Split content into readable pages
   */
  private static paginateContent(content: string): string[] {
    // If the content contains chapter separators, split by them to preserve HTML and images
    if (content.includes('class="chapter-sep"')) {
      const rawParts = content.split(/<hr[^>]*class=["']chapter-sep["'][^>]*>/i);
      const pages: string[] = [];
      for (const part of rawParts) {
        const trimmed = (part || '').trim();
        if (!trimmed) continue;
        // Extract only the body content if a full HTML document is present
        const bodyMatch = trimmed.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
        const html = bodyMatch ? bodyMatch[1] : trimmed;
        if (html.trim()) pages.push(html.trim());
      }
      return pages;
    }

    // Fallback: simple text-based pagination
    const pages: string[] = [];
    const wordsPerPage = 300; // Approximately 300 words per page
    const paragraphs = content.split(/\n\s*\n/);
    let currentPage = '';
    let currentWordCount = 0;
    
    for (const paragraph of paragraphs) {
      const words = paragraph.trim().split(/\s+/);
      if (currentWordCount + words.length > wordsPerPage && currentPage.trim()) {
        pages.push(currentPage.trim());
        currentPage = paragraph + '\n\n';
        currentWordCount = words.length;
      } else {
        currentPage += paragraph + '\n\n';
        currentWordCount += words.length;
      }
    }
    if (currentPage.trim()) {
      pages.push(currentPage.trim());
    }
    return pages;
  }
  
  /**
   * Check if content appears to be rendering properly
   */
  static checkContentVisibility(container: HTMLElement): boolean {
    try {
      // Check if there's any visible text content
      const textContent = container.textContent || container.innerText;
      if (!textContent.trim()) {
        return false;
      }
      
      // Check if there are any visible elements with reasonable size
      const visibleElements = container.querySelectorAll('*');
      for (const element of visibleElements) {
        const rect = element.getBoundingClientRect();
        if (rect.width > 100 && rect.height > 20) {
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.warn('Content visibility check failed:', error);
      return false;
    }
  }
}