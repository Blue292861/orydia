import React, { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import DOMPurify from 'dompurify';

interface EpubPageReaderProps {
  content: string;
  fontSize: number;
  highContrast: boolean;
  isPremium: boolean;
  isAlreadyRead: boolean;
  hasFinished: boolean;
  pointsToWin: number;
  onFinish: () => void;
}

export const EpubPageReader: React.FC<EpubPageReaderProps> = ({
  content,
  fontSize,
  highContrast,
  isPremium,
  isAlreadyRead,
  hasFinished,
  pointsToWin,
  onFinish,
}) => {
  const pages = useMemo(() => {
    if (!content) return [''];
    
    // Check if content contains HTML chapter separators
    if (content.includes('<hr class="chapter-sep"')) {
      // Split on HTML chapter separators
      const rawPages = content
        .split(/<hr class="chapter-sep"[^>]*\/?>/)
        .map(p => p.trim())
        .filter(p => p.length > 0);
      return rawPages.length > 0 ? rawPages : [content];
    } else {
      // Fallback to old text-based format
      const rawPages = content
        .split(/\n?\s*===\s*Chapitre\s+\d+\s*===\s*\n?/g)
        .map(p => p.trim())
        .filter(p => p.length > 0);
      return rawPages.length > 0 ? rawPages : [content];
    }
  }, [content]);

  const [current, setCurrent] = useState(0);
  const total = pages.length;
  const atStart = current === 0;
  const atEnd = current === total - 1;
  const progress = total > 1 ? Math.round(((current + 1) / total) * 100) : 100;

  const isHtmlContent = content.includes('<hr class="chapter-sep"') || content.includes('<p>') || content.includes('<div>');

  // Ensure embedded EPUB fonts are respected in fast mode by collecting inline <style> rules
  // and placing them before the body content. This preserves @font-face with data URIs.
  const sanitizedPages = useMemo(() => {
    const allowedTags = ['html', 'head', 'body', 'p', 'div', 'span', 'br', 'strong', 'b', 'em', 'i', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'img', 'ul', 'ol', 'li', 'blockquote', 'a', 'style', 'link'];
    const allowedAttrs = ['src', 'alt', 'href', 'class', 'id', 'loading', 'decoding', 'style', 'rel', 'type', 'face', 'size'];

    return pages.map((raw) => {
      if (!raw) return '';
      try {
        const parser = new DOMParser();
        const doc = parser.parseFromString(raw, 'text/html');

        // Collect CSS from <style> tags (already processed to inline fonts in epubService when possible)
        const styleTags = Array.from(doc.querySelectorAll('style'));
        const cssText = styleTags.map(s => s.textContent || '').join('\n');
        // Remove link tags that won't resolve (fonts/CSS are typically inlined already)
        const linkTags = Array.from(doc.querySelectorAll('link[rel="stylesheet"]'));
        linkTags.forEach(l => l.remove());

        const bodyHtml = (doc.body ? doc.body.innerHTML : raw) || '';
        const combined = `${cssText ? `<style>${cssText}</style>` : ''}${bodyHtml}`;

        return DOMPurify.sanitize(combined, {
          ALLOWED_TAGS: allowedTags,
          ALLOWED_ATTR: allowedAttrs,
          ALLOW_DATA_ATTR: true,
          ALLOW_UNKNOWN_PROTOCOLS: true,
          ADD_ATTR: ['target']
        });
      } catch {
        return DOMPurify.sanitize(raw, {
          ALLOWED_TAGS: allowedTags,
          ALLOWED_ATTR: allowedAttrs,
          ALLOW_DATA_ATTR: true,
          ALLOW_UNKNOWN_PROTOCOLS: true,
          ADD_ATTR: ['target']
        });
      }
    });
  }, [pages]);

  const goPrev = () => setCurrent(c => (c > 0 ? c - 1 : c));
  const goNext = () => setCurrent(c => (c < total - 1 ? c + 1 : c));

  return (
    <div className="flex flex-col gap-4 w-full max-w-none px-2 sm:px-4 lg:px-6">
      {/* Navigation header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={goPrev} disabled={atStart} className="flex items-center gap-1">
          <ChevronLeft className="h-4 w-4" />
          Page précédente
        </Button>
        <div className="text-sm text-muted-foreground">
          Page {current + 1} / {total}
        </div>
        <Button variant="ghost" size="sm" onClick={goNext} disabled={atEnd} className="flex items-center gap-1">
          Page suivante
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <Progress value={progress} />

      {/* Page content */}
      {isHtmlContent ? (
        <div
          className="epub-content max-w-none"
          style={{
            fontSize: `${fontSize}px`,
            lineHeight: 1.6,
            wordWrap: 'break-word',
            overflowWrap: 'break-word',
            hyphens: 'auto',
            ...(highContrast && {
              filter: 'invert(1)',
              backgroundColor: '#000000',
              color: '#ffffff'
            })
          }}
          dangerouslySetInnerHTML={{
            __html: sanitizedPages[current]
          }}
        />
      ) : (
        <article
          aria-label={`Contenu de la page ${current + 1}`}
          className={`whitespace-pre-wrap leading-relaxed ${highContrast ? 'text-white' : 'text-foreground'}`}
          style={{ fontSize: `${fontSize}px` }}
        >
          {pages[current]}
        </article>
      )}

      {/* Footer controls */}
      <div className="flex items-center justify-between mt-2">
        <Button variant="outline" onClick={goPrev} disabled={atStart} className="flex items-center gap-1">
          <ChevronLeft className="h-4 w-4" />
          Précédent
        </Button>
        <div className="text-xs text-muted-foreground">{progress}% lu</div>
        <Button 
          onClick={onFinish} 
          className="flex items-center gap-2"
          disabled={!atEnd || hasFinished || isAlreadyRead}
        >
          <img src="/lovable-uploads/4a891ef6-ff72-4b5a-b33c-0dc33dd3aa26.png" alt="Icône Tensens" className="h-4 w-4" />
          {isPremium ? `Terminer la lecture & Gagner ${pointsToWin} Tensens` : `Regarder une publicité & Gagner ${pointsToWin} Tensens`}
        </Button>
      </div>
    </div>
  );
};
