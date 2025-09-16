import JSZip from 'jszip';

export interface EPUBExtractionResult {
  text: string;
  chapterCount: number;
  title?: string;
  author?: string;
  success: boolean;
  error?: string;
}

export class EPUBService {
  /**
   * Extract text from EPUB file
   */
  static async extractText(
    epubFile: File,
    onProgress?: (progress: number, status: string) => void
  ): Promise<EPUBExtractionResult> {
    try {
      onProgress?.(10, 'Lecture du fichier EPUB...');
      
      const zip = new JSZip();
      const zipContent = await zip.loadAsync(epubFile);
      
      onProgress?.(30, 'Analyse de la structure EPUB...');
      
      // Find OPF file for metadata and chapter order
      let opfContent = '';
      let opfFileName = '';
      
      // Look for container.xml first
      const containerFile = zipContent.file('META-INF/container.xml');
      if (containerFile) {
        const containerXml = await containerFile.async('text');
        const opfMatch = containerXml.match(/full-path=\"([^\"]+)\"/);
        if (opfMatch) {
          opfFileName = opfMatch[1];
        }
      }
      
      // Fallback to common OPF locations
      if (!opfFileName) {
        const possibleOpfFiles = ['content.opf', 'package.opf', 'book.opf', 'OEBPS/content.opf'];
        for (const fileName of possibleOpfFiles) {
          if (zipContent.file(fileName)) {
            opfFileName = fileName;
            break;
          }
        }
      }
      
      let title = '';
      let author = '';
      let chapterFiles: string[] = [];
      
      if (opfFileName) {
        const opfFile = zipContent.file(opfFileName);
        if (opfFile) {
          opfContent = await opfFile.async('text');
          
          // Extract metadata
          const decode = (s: string) => {
            const el = document.createElement('textarea');
            el.innerHTML = s;
            return el.value;
          };
          const titleMatch = opfContent.match(/<dc:title[^>]*>([^<]+)<\/dc:title>/i);
          if (titleMatch) title = decode(titleMatch[1].trim());
          
          const authorMatch = opfContent.match(/<dc:creator[^>]*>([^<]+)<\/dc:creator>/i);
          if (authorMatch) author = decode(authorMatch[1].trim());
          
          // Extract chapter order from spine
          const spineMatch = opfContent.match(/<spine[^>]*>(.*?)<\/spine>/s);
          if (spineMatch) {
            const itemrefs = spineMatch[1].match(/<itemref[^>]*idref=\"([^\"]+)\"/g) || [];
            for (const itemref of itemrefs) {
              const idMatch = itemref.match(/idref=\"([^\"]+)\"/);
              if (idMatch) {
                const id = idMatch[1];
                const manifestMatch = opfContent.match(new RegExp(`<item[^>]*id="${id}"[^>]*href="([^"]+)"`, 'i'));
                if (manifestMatch) {
                  const basePath = opfFileName.includes('/') ? opfFileName.substring(0, opfFileName.lastIndexOf('/') + 1) : '';
                  chapterFiles.push(basePath + manifestMatch[1]);
                }
              }
            }
          }
        }
      }
      
      // If no chapters found in OPF, find all HTML/XHTML files
      if (chapterFiles.length === 0) {
        zipContent.forEach((relativePath, file) => {
          if (relativePath.match(/\.(x?html?)$/i) && !file.dir) {
            chapterFiles.push(relativePath);
          }
        });
        chapterFiles.sort();
      }
      
      onProgress?.(50, `Extraction du texte (${chapterFiles.length} chapitres)...`);
      
      let fullHtml = '';
      let processedChapters = 0;
      
      for (const chapterPath of chapterFiles) {
        const chapterFile = zipContent.file(chapterPath);
        if (chapterFile) {
          try {
            const chapterContent = await chapterFile.async('text');
            const chapterHtml = await this.extractHtmlFromHTML(chapterContent, zipContent, chapterPath);
            
            if (chapterHtml.trim()) {
              fullHtml += `\n<hr class="chapter-sep" data-chapter="${processedChapters + 1}"/>\n${chapterHtml}`;
              processedChapters++;
            }
          } catch (error) {
            console.warn(`Could not process chapter ${chapterPath}:`, error);
          }
        }
        
        const progress = 50 + (processedChapters / chapterFiles.length) * 45;
        onProgress?.(progress, `Chapitre ${processedChapters}/${chapterFiles.length} traité...`);
      }
      
      onProgress?.(100, 'Extraction terminée!');
      
      return {
        text: fullHtml.trim(),
        chapterCount: processedChapters,
        title,
        author,
        success: true
      };
      
    } catch (error) {
      console.error('EPUB extraction failed:', error);
      return {
        text: '',
        chapterCount: 0,
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue lors de l\'extraction EPUB'
      };
    }
  }
  
  /**
   * Extract text content from HTML/XHTML while preserving formatting
   */
  private static extractTextFromHTML(htmlContent: string): string {
    // Create a temporary div to parse HTML
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');
    
    // Remove script and style tags
    const scripts = doc.querySelectorAll('script, style');
    scripts.forEach(el => el.remove());
    
    // Convert HTML structure to formatted text
    const body = doc.body || doc.documentElement;
    return this.convertElementToText(body);
  }
  
  /**
   * Convert HTML element to formatted text with preserved structure
   */
  private static convertElementToText(element: Element): string {
    let result = '';
    
    for (const node of element.childNodes) {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent || '';
        // Clean up but preserve meaningful whitespace
        result += text.replace(/[ \t]+/g, ' ');
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const el = node as Element;
        const tagName = el.tagName.toLowerCase();
        
        // Add appropriate formatting based on HTML tags
        switch (tagName) {
          case 'p':
          case 'div':
            result += '\n\n' + this.convertElementToText(el) + '\n\n';
            break;
          case 'br':
            result += '\n';
            break;
          case 'h1':
          case 'h2':
          case 'h3':
          case 'h4':
          case 'h5':
          case 'h6':
            result += '\n\n## ' + this.convertElementToText(el) + ' ##\n\n';
            break;
          case 'strong':
          case 'b':
            result += '**' + this.convertElementToText(el) + '**';
            break;
          case 'em':
          case 'i':
            result += '*' + this.convertElementToText(el) + '*';
            break;
          case 'li':
            result += '\n• ' + this.convertElementToText(el);
            break;
          case 'ul':
          case 'ol':
            result += '\n' + this.convertElementToText(el) + '\n';
            break;
          case 'blockquote':
            result += '\n> ' + this.convertElementToText(el) + '\n';
            break;
          default:
            result += this.convertElementToText(el);
        }
      }
    }
    
    // Clean up excessive whitespace while preserving paragraph structure
    return result
      .replace(/[ \t]+/g, ' ') // Normalize spaces and tabs
      .replace(/\n[ \t]+/g, '\n') // Remove trailing spaces from lines
      .replace(/\n{3,}/g, '\n\n') // Limit consecutive line breaks to 2
      .trim();
  }
  
  /**
   * Clean extracted EPUB HTML while preserving tags and line breaks
   */
  static cleanExtractedHtml(html: string): string {
    if (!html) return '';
    return html
      .replace(/\x00/g, '')
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
      .trim();
  }

  /**
   * Convert a chapter HTML to sanitized HTML and inline EPUB image resources as data URIs
   */
  private static async extractHtmlFromHTML(htmlContent: string, zip: JSZip, chapterPath: string): Promise<string> {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');

    // Get the base directory for resolving relative paths
    const baseDir = chapterPath.split('/').slice(0, -1).join('/');

    // Process and inline CSS styles
    const styleSheets = doc.querySelectorAll('link[rel="stylesheet"], style');
    for (const styleElement of styleSheets) {
      if (styleElement.tagName === 'LINK') {
        const href = styleElement.getAttribute('href');
        if (href && !href.startsWith('http')) {
          try {
            const cssPath = this.resolvePath(baseDir, href);
            const cssFile = zip.file(cssPath);
            if (cssFile) {
              const cssContent = await cssFile.async('string');
              // Process CSS to inline fonts and preserve formatting
              const processedCSS = await this.processCSSContent(cssContent, zip, baseDir);
              // Create a new style element with the processed CSS content
              const newStyle = doc.createElement('style');
              newStyle.textContent = processedCSS;
              doc.head?.appendChild(newStyle);
            }
          } catch (error) {
            console.warn(`Failed to load CSS ${href}:`, error);
          }
        }
      } else if (styleElement.tagName === 'STYLE') {
        // Process existing style tags
        const cssContent = styleElement.textContent || '';
        const processedCSS = await this.processCSSContent(cssContent, zip, baseDir);
        styleElement.textContent = processedCSS;
      }
    }

    // Process all images in the HTML
    const images = doc.querySelectorAll('img');
    for (const img of images) {
      const src = img.getAttribute('src');
      if (src && !src.startsWith('data:') && !src.startsWith('http')) {
        try {
          // Resolve the relative path
          const imagePath = this.resolvePath(baseDir, src);
          
          // Get the image file from the ZIP
          const imageFile = zip.file(imagePath);
          if (imageFile) {
            const imageData = await imageFile.async('uint8array');
            const mimeType = this.getMimeTypeByExt(imagePath);
            
            // Convert to base64 and create data URI
            const base64 = btoa(String.fromCharCode(...imageData));
            const dataUri = `data:${mimeType};base64,${base64}`;
            
            // Update the img src
            img.setAttribute('src', dataUri);
            img.setAttribute('loading', 'lazy');
            img.setAttribute('style', 'max-width: 100%; height: auto; display: block; margin: 1em auto;');
          }
        } catch (error) {
          console.warn(`Failed to process image ${src}:`, error);
          // Remove broken image
          img.remove();
        }
      }
    }

    // Clean up HTML entities that cause display issues
    let htmlResult = doc.documentElement.outerHTML;
    htmlResult = htmlResult
      .replace(/&nbsp;/g, ' ')
      .replace(/&#160;/g, ' ')
      .replace(/\u00A0/g, ' ')
      .replace(/&rsquo;/g, "'")
      .replace(/&lsquo;/g, "'")
      .replace(/&rdquo;/g, '"')
      .replace(/&ldquo;/g, '"')
      .replace(/&mdash;/g, '—')
      .replace(/&ndash;/g, '–');

    return htmlResult;
  }

  /**
   * Process CSS content to inline fonts and preserve formatting
   */
  private static async processCSSContent(cssContent: string, zip: JSZip, baseDir: string): Promise<string> {
    let processedCSS = cssContent;

    // Handle @font-face rules
    const fontFaceRegex = /@font-face\s*{[^}]*}/g;
    const fontFaces = cssContent.match(fontFaceRegex) || [];
    
    for (const fontFace of fontFaces) {
      const urlMatches = fontFace.match(/url\(['"]?([^'"]+)['"]?\)/g) || [];
      
      for (const urlMatch of urlMatches) {
        const urlPath = urlMatch.match(/url\(['"]?([^'"]+)['"]?\)/)?.[1];
        if (urlPath && !urlPath.startsWith('http') && !urlPath.startsWith('data:')) {
          try {
            const fontPath = this.resolvePath(baseDir, urlPath);
            const fontFile = zip.file(fontPath);
            if (fontFile) {
              const fontData = await fontFile.async('uint8array');
              const mimeType = this.getFontMimeType(fontPath);
              const base64 = btoa(String.fromCharCode(...fontData));
              const dataUri = `data:${mimeType};base64,${base64}`;
              
              processedCSS = processedCSS.replace(urlMatch, `url('${dataUri}')`);
            }
          } catch (error) {
            console.warn(`Failed to inline font ${urlPath}:`, error);
          }
        }
      }
    }

    return processedCSS;
  }

  /**
   * Get MIME type for fonts
   */
  private static getFontMimeType(path: string): string {
    const ext = (path.split('.').pop() || '').toLowerCase();
    switch (ext) {
      case 'woff':
        return 'font/woff';
      case 'woff2':
        return 'font/woff2';
      case 'ttf':
        return 'font/truetype';
      case 'otf':
        return 'font/opentype';
      case 'eot':
        return 'application/vnd.ms-fontobject';
      default:
        return 'application/octet-stream';
    }
  }

  private static resolvePath(baseDir: string, relative: string): string {
    if (/^\//.test(relative)) return relative.replace(/^\//, '');
    const stack = baseDir.split('/').filter(Boolean);
    const parts = relative.split('/');
    for (const part of parts) {
      if (part === '.' || part === '') continue;
      if (part === '..') stack.pop();
      else stack.push(part);
    }
    return stack.join('/');
  }

  private static getMimeTypeByExt(path: string): string {
    const ext = (path.split('.').pop() || '').toLowerCase();
    switch (ext) {
      case 'jpg':
      case 'jpeg':
        return 'image/jpeg';
      case 'png':
        return 'image/png';
      case 'gif':
        return 'image/gif';
      case 'svg':
        return 'image/svg+xml';
      case 'webp':
        return 'image/webp';
      default:
        return 'application/octet-stream';
    }
  }
}

