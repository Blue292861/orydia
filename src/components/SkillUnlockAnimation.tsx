import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Zap } from 'lucide-react';
import { Skill } from '@/types/Skill';

interface SkillUnlockAnimationProps {
  isOpen: boolean;
  skill: Skill | null;
  onContinue: () => void;
}

export const SkillUnlockAnimation: React.FC<SkillUnlockAnimationProps> = ({
  isOpen,
  skill,
  onContinue,
}) => {
  const [showRings, setShowRings] = useState(false);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShowRings(false);
      setShowContent(false);
      
      // Flash then rings
      setTimeout(() => setShowRings(true), 200);
      // Content appears after rings
      setTimeout(() => setShowContent(true), 600);
    }
  }, [isOpen]);

  if (!isOpen || !skill) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Initial flash */}
      <div className="absolute inset-0 bg-primary/30 animate-skill-flash" />
      
      {/* Dark backdrop */}
      <div className="absolute inset-0 bg-black/80 animate-fade-in" />
      
      <div className="relative flex flex-col items-center gap-6 p-8 max-w-md mx-4">
        {/* Energy rings */}
        {showRings && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="absolute w-48 h-48 rounded-full border-2 border-primary/60 animate-skill-ring-1" />
            <div className="absolute w-64 h-64 rounded-full border border-primary/40 animate-skill-ring-2" />
            <div className="absolute w-80 h-80 rounded-full border border-primary/20 animate-skill-ring-3" />
          </div>
        )}

        {/* Central skill icon */}
        {showContent && (
          <>
            <div className="relative animate-skill-icon-appear">
              {/* Glow */}
              <div className="absolute inset-0 -m-4 rounded-full bg-primary/40 blur-xl animate-pulse" />
              
              {/* Icon container */}
              <div className="relative w-28 h-28 md:w-36 md:h-36 rounded-full bg-gradient-to-br from-primary via-primary to-primary/80 flex items-center justify-center shadow-2xl shadow-primary/50 border-4 border-primary/50">
                <span className="text-4xl md:text-5xl">{skill.icon}</span>
              </div>
              
              {/* Zap badge */}
              <div className="absolute -top-1 -right-1 w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center shadow-lg animate-bounce">
                <Zap className="w-5 h-5 text-white" fill="white" />
              </div>
            </div>

            {/* Text content */}
            <div className="text-center space-y-3 animate-skill-text-appear">
              <h2 className="text-2xl md:text-3xl font-bold text-white">
                Compétence Débloquée !
              </h2>
              <p className="text-xl md:text-2xl text-primary font-semibold">
                {skill.name}
              </p>
              <p className="text-muted-foreground text-sm md:text-base max-w-xs mx-auto">
                {skill.description}
              </p>
            </div>

            {/* Continue button */}
            <Button
              onClick={onContinue}
              size="lg"
              className="mt-4 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground font-semibold px-10 py-4 rounded-full shadow-lg shadow-primary/30 transition-all hover:scale-105 animate-skill-button-appear"
            >
              Continuer
            </Button>
          </>
        )}
      </div>
    </div>
  );
};
