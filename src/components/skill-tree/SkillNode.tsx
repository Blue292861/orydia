import React from 'react';
import { Skill, formatBonusDescription } from '@/types/Skill';
import { cn } from '@/lib/utils';
import { Lock, Check, Sparkles } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface SkillNodeProps {
  skill: Skill;
  isUnlocked: boolean;
  canUnlock: boolean;
  userSkillPoints: number;
  onUnlock: (skill: Skill) => void;
  isLoading?: boolean;
}

export const SkillNode: React.FC<SkillNodeProps> = ({
  skill,
  isUnlocked,
  canUnlock,
  userSkillPoints,
  onUnlock,
  isLoading = false
}) => {
  const hasEnoughPoints = userSkillPoints >= skill.skill_point_cost;
  const canBeUnlocked = canUnlock && hasEnoughPoints && !isUnlocked;

  const handleClick = () => {
    if (canBeUnlocked && !isLoading) {
      onUnlock(skill);
    }
  };

  const bonusText = formatBonusDescription(skill.bonus_type, skill.bonus_config);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={handleClick}
            disabled={!canBeUnlocked || isLoading}
            className={cn(
              'relative flex flex-col items-center justify-center',
              'w-20 h-20 rounded-xl border-2 transition-all duration-300',
              'focus:outline-none focus:ring-2 focus:ring-primary/50',
              isUnlocked && [
                'bg-gradient-to-br from-emerald-500/20 to-emerald-600/30',
                'border-emerald-500 shadow-lg shadow-emerald-500/20'
              ],
              !isUnlocked && canBeUnlocked && [
                'bg-gradient-to-br from-amber-500/20 to-amber-600/30',
                'border-amber-500 cursor-pointer hover:scale-105',
                'hover:shadow-lg hover:shadow-amber-500/30'
              ],
              !isUnlocked && !canBeUnlocked && [
                'bg-muted/30 border-muted-foreground/30',
                'opacity-60 cursor-not-allowed'
              ]
            )}
          >
            {/* Icon */}
            <span className="text-2xl mb-1">{skill.icon}</span>
            
            {/* Status indicator */}
            <div className="absolute -top-2 -right-2">
              {isUnlocked ? (
                <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
                  <Check className="w-4 h-4 text-white" />
                </div>
              ) : canBeUnlocked ? (
                <div className="w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center animate-pulse">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
              ) : (
                <div className="w-6 h-6 rounded-full bg-muted-foreground/50 flex items-center justify-center">
                  <Lock className="w-3 h-3 text-white" />
                </div>
              )}
            </div>

            {/* Cost */}
            <div className={cn(
              'absolute -bottom-2 left-1/2 -translate-x-1/2',
              'px-2 py-0.5 rounded-full text-xs font-bold',
              isUnlocked && 'bg-emerald-500/80 text-white',
              !isUnlocked && hasEnoughPoints && 'bg-amber-500/80 text-white',
              !isUnlocked && !hasEnoughPoints && 'bg-muted-foreground/50 text-muted-foreground'
            )}>
              {skill.skill_point_cost} pts
            </div>
          </button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-xs">
          <div className="space-y-2">
            <p className="font-bold text-foreground">{skill.name}</p>
            {skill.description && (
              <p className="text-sm text-muted-foreground">{skill.description}</p>
            )}
            <p className="text-sm font-medium text-primary">{bonusText}</p>
            {!isUnlocked && (
              <p className="text-xs text-muted-foreground">
                Coût: {skill.skill_point_cost} point{skill.skill_point_cost > 1 ? 's' : ''} de compétence
              </p>
            )}
            {!canBeUnlocked && !isUnlocked && canUnlock && !hasEnoughPoints && (
              <p className="text-xs text-destructive">Points insuffisants</p>
            )}
            {!canBeUnlocked && !isUnlocked && !canUnlock && (
              <p className="text-xs text-destructive">Débloquez d'abord la compétence précédente</p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
