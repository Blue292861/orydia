import React, { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, ChevronRight } from 'lucide-react';

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
    // Split on our chapter markers added during EPUB extraction
    const rawPages = content
      .split(/\n?\s*===\s*Chapitre\s+\d+\s*===\s*\n?/g)
      .map(p => p.trim())
      .filter(p => p.length > 0);
    return rawPages.length > 0 ? rawPages : [content];
  }, [content]);

  const [current, setCurrent] = useState(0);
  const total = pages.length;
  const atStart = current === 0;
  const atEnd = current === total - 1;
  const progress = total > 1 ? Math.round(((current + 1) / total) * 100) : 100;

  const goPrev = () => setCurrent(c => (c > 0 ? c - 1 : c));
  const goNext = () => setCurrent(c => (c < total - 1 ? c + 1 : c));

  return (
    <div className="flex flex-col gap-4">
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
      <article
        aria-label={`Contenu de la page ${current + 1}`}
        className={`whitespace-pre-wrap leading-relaxed ${highContrast ? 'text-white' : 'text-foreground'}`}
        style={{ fontSize: `${fontSize}px` }}
      >
        {pages[current]}
      </article>

      {/* Footer controls */}
      <div className="flex items-center justify-between mt-2">
        <Button variant="outline" onClick={goPrev} disabled={atStart} className="flex items-center gap-1">
          <ChevronLeft className="h-4 w-4" />
          Précédent
        </Button>
        <div className="text-xs text-muted-foreground">{progress}% lu</div>
        {!atEnd ? (
          <Button onClick={goNext} disabled={atEnd} className="flex items-center gap-1">
            Suivant
            <ChevronRight className="h-4 w-4" />
          </Button>
        ) : (
          <div className="text-center">
            {isAlreadyRead ? (
              <div className={`${highContrast ? 'text-gray-300' : 'text-muted-foreground'}`}>
                <img src="/lovable-uploads/4a891ef6-ff72-4b5a-b33c-0dc33dd3aa26.png" alt="Icône Tensens" className="h-6 w-6 mx-auto mb-2" />
                <p>Vous avez déjà gagné des Tensens pour ce livre</p>
              </div>
            ) : hasFinished ? (
              <div className="text-green-600">
                <img src="/lovable-uploads/4a891ef6-ff72-4b5a-b33c-0dc33dd3aa26.png" alt="Icône Tensens" className="h-6 w-6 mx-auto mb-2" />
                <p>Tensens accordés ! Bien joué !</p>
              </div>
            ) : (
              <Button onClick={onFinish} className="flex items-center gap-2">
                <img src="/lovable-uploads/4a891ef6-ff72-4b5a-b33c-0dc33dd3aa26.png" alt="Icône Tensens" className="h-4 w-4" />
                {isPremium ? `Terminer la lecture & Gagner ${pointsToWin} Tensens` : `Regarder une publicité & Gagner ${pointsToWin} Tensens`}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
