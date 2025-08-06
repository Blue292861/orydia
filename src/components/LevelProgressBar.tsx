import React from 'react';
import { Progress } from '@/components/ui/progress';
import { LevelInfo } from '@/types/UserStats';
import { Star, Trophy } from 'lucide-react';
import { useResponsive } from '@/hooks/useResponsive';

interface LevelProgressBarProps {
  levelInfo: LevelInfo;
  className?: string;
}

export const LevelProgressBar: React.FC<LevelProgressBarProps> = ({ 
  levelInfo, 
  className = '' 
}) => {
  const { isMobile, isTablet } = useResponsive();

  const getIconSize = () => {
    if (isMobile) return 'h-5 w-5';
    if (isTablet) return 'h-6 w-6';
    return 'h-7 w-7';
  };

  const getTitleSize = () => {
    if (isMobile) return 'text-lg';
    if (isTablet) return 'text-xl';
    return 'text-2xl';
  };

  const getSubtitleSize = () => {
    if (isMobile) return 'text-sm';
    if (isTablet) return 'text-base';
    return 'text-lg';
  };

  const getSpacing = () => {
    if (isMobile) return 'space-y-2';
    if (isTablet) return 'space-y-3';
    return 'space-y-4';
  };

  const getPadding = () => {
    if (isMobile) return 'p-4';
    if (isTablet) return 'p-5';
    return 'p-6';
  };

  return (
    <div className={`bg-card rounded-lg border ${getPadding()} ${getSpacing()} ${className}`}>
      {/* Titre et niveau */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy className={`text-primary ${getIconSize()}`} />
          <h3 className={`font-bold text-foreground ${getTitleSize()}`}>
            Niveau {levelInfo.level}
          </h3>
        </div>
        <Star className={`text-amber-500 ${getIconSize()}`} />
      </div>

      {/* Titre du niveau */}
      <div className="text-center">
        <p className={`text-muted-foreground font-medium ${getSubtitleSize()}`}>
          {levelInfo.levelTitle}
        </p>
      </div>

      {/* Barre de progression */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-foreground">
            Progression
          </span>
          <span className="text-sm text-muted-foreground">
            {levelInfo.progressPercentage}%
          </span>
        </div>
        
        <Progress 
          value={levelInfo.progressPercentage} 
          className="h-3 bg-secondary"
        />
        
        <div className="flex justify-between items-center text-xs text-muted-foreground">
          <span>{levelInfo.currentXp} XP</span>
          <span>/ {levelInfo.nextLevelXp} XP</span>
        </div>
      </div>

      {/* Informations sur le prochain niveau */}
      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          <span className="font-medium text-primary">
            {levelInfo.nextLevelXp - levelInfo.currentXp} XP
          </span>
          {' '}restants pour passer au niveau {levelInfo.level + 1}
        </p>
      </div>
    </div>
  );
};