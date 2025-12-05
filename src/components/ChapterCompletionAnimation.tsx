import React from 'react';
import { CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ChapterCompletionAnimationProps {
  isOpen: boolean;
  currentChapter: number;
  totalChapters: number;
  bookTitle: string;
  onContinue: () => void;
}

export const ChapterCompletionAnimation: React.FC<ChapterCompletionAnimationProps> = ({
  isOpen,
  currentChapter,
  totalChapters,
  bookTitle,
  onContinue,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-6 p-8 max-w-md mx-4">
        {/* Halo lumineux */}
        <div className="relative">
          {/* Outer glow pulse */}
          <div className="absolute inset-0 -m-8 rounded-full bg-emerald-500/30 animate-chapter-glow blur-xl" />
          <div className="absolute inset-0 -m-4 rounded-full bg-emerald-400/40 animate-chapter-glow-inner blur-md" />
          
          {/* Shield badge */}
          <div className="relative animate-chapter-spin-in">
            <svg 
              viewBox="0 0 100 120" 
              className="w-28 h-32 md:w-32 md:h-36 drop-shadow-2xl"
            >
              {/* Shield shape */}
              <defs>
                <linearGradient id="shieldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="50%" stopColor="#059669" />
                  <stop offset="100%" stopColor="#047857" />
                </linearGradient>
                <linearGradient id="shieldBorder" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#34d399" />
                  <stop offset="100%" stopColor="#059669" />
                </linearGradient>
                <filter id="innerShadow">
                  <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.3"/>
                </filter>
              </defs>
              
              {/* Shield outline */}
              <path
                d="M50 5 L90 20 L90 55 Q90 90 50 115 Q10 90 10 55 L10 20 Z"
                fill="url(#shieldBorder)"
                filter="url(#innerShadow)"
              />
              
              {/* Shield inner */}
              <path
                d="M50 10 L85 23 L85 55 Q85 85 50 108 Q15 85 15 55 L15 23 Z"
                fill="url(#shieldGradient)"
              />
              
              {/* Shine effect */}
              <path
                d="M50 10 L85 23 L85 40 Q60 45 35 25 Z"
                fill="rgba(255,255,255,0.2)"
              />
            </svg>
            
            {/* Checkmark icon */}
            <div className="absolute inset-0 flex items-center justify-center pt-2">
              <CheckCircle className="w-12 h-12 md:w-14 md:h-14 text-white drop-shadow-lg" strokeWidth={2.5} />
            </div>
          </div>
        </div>

        {/* Text content */}
        <div className="text-center space-y-3 animate-chapter-text-bounce">
          <h2 className="text-2xl md:text-3xl font-bold text-white">
            Félicitations !
          </h2>
          <p className="text-emerald-100 text-base md:text-lg leading-relaxed">
            Vous avez terminé le chapitre{' '}
            <span className="font-semibold text-emerald-300">{currentChapter}</span>{' '}
            sur{' '}
            <span className="font-semibold text-emerald-300">{totalChapters}</span>
          </p>
          <p className="text-emerald-200/80 text-sm md:text-base italic">
            de « {bookTitle} »
          </p>
        </div>

        {/* Continue button */}
        <Button
          onClick={onContinue}
          size="lg"
          className="mt-4 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold px-8 py-3 rounded-full shadow-lg shadow-emerald-500/30 transition-all hover:scale-105 animate-chapter-button-appear"
        >
          Continuer
        </Button>
      </div>
    </div>
  );
};
