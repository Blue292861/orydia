import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Card } from '@/components/ui/card';
import { Loader2, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import { useTranslationProgress } from '@/hooks/useTranslationProgress';

interface TranslationProgressProps {
  bookId: string | undefined;
  language: string;
  className?: string;
}

export const TranslationProgress: React.FC<TranslationProgressProps> = ({
  bookId,
  language,
  className = '',
}) => {
  const progress = useTranslationProgress(bookId, language);

  if (!progress || !progress.isTranslating) {
    return null;
  }

  const formatTime = (minutes: number | null) => {
    if (minutes === null) return 'Calcul en cours...';
    if (minutes < 1) return 'Moins d\'une minute';
    if (minutes === 1) return '1 minute';
    if (minutes < 60) return `${minutes} minutes`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins > 0 ? mins + 'min' : ''}`;
  };

  return (
    <Card className={`p-4 border-primary/20 bg-primary/5 ${className}`}>
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          <span className="text-sm font-medium">Traduction en cours</span>
        </div>

        <Progress value={progress.percentage} className="h-2" />

        <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-3 w-3 text-green-500" />
            <span>
              {progress.completedChapters}/{progress.totalChapters} chapitres
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Clock className="h-3 w-3 text-blue-500" />
            <span>{formatTime(progress.estimatedTimeMinutes)}</span>
          </div>
        </div>

        {progress.failedChapters > 0 && (
          <div className="flex items-center gap-2 text-xs text-orange-500">
            <AlertCircle className="h-3 w-3" />
            <span>{progress.failedChapters} chapitre(s) en erreur</span>
          </div>
        )}

        <div className="text-xs text-muted-foreground">
          {progress.percentage}% terminé
        </div>
      </div>
    </Card>
  );
};
