import React from 'react';
import { SkillPath as SkillPathType, Skill } from '@/types/Skill';
import { SkillNode } from './SkillNode';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronRight } from 'lucide-react';

interface SkillPathProps {
  path: SkillPathType;
  unlockedSkillIds: Set<string>;
  userSkillPoints: number;
  onUnlockSkill: (skill: Skill) => void;
  isLoading?: boolean;
}

export const SkillPathComponent: React.FC<SkillPathProps> = ({
  path,
  unlockedSkillIds,
  userSkillPoints,
  onUnlockSkill,
  isLoading = false
}) => {
  const skills = path.skills || [];
  const sortedSkills = [...skills].sort((a, b) => a.position - b.position);

  // Determine which skills can be unlocked
  const canUnlockSkill = (skill: Skill): boolean => {
    // Already unlocked
    if (unlockedSkillIds.has(skill.id)) return false;
    
    // First skill in path can always be unlocked
    if (skill.position === 1) return true;
    
    // Check if previous skill is unlocked
    const previousSkill = sortedSkills.find(s => s.position === skill.position - 1);
    if (!previousSkill) return true;
    
    return unlockedSkillIds.has(previousSkill.id);
  };

  // Calculate path progress
  const unlockedCount = sortedSkills.filter(s => unlockedSkillIds.has(s.id)).length;
  const progressPercentage = sortedSkills.length > 0 
    ? Math.round((unlockedCount / sortedSkills.length) * 100) 
    : 0;

  return (
    <Card className="bg-card/50 backdrop-blur border-border/50">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <span className="text-2xl">{path.icon}</span>
            <span>{path.name}</span>
          </CardTitle>
          <div className="text-sm text-muted-foreground">
            {unlockedCount}/{sortedSkills.length}
          </div>
        </div>
        {path.description && (
          <p className="text-sm text-muted-foreground">{path.description}</p>
        )}
        {/* Progress bar */}
        <div className="w-full h-2 bg-muted rounded-full overflow-hidden mt-2">
          <div 
            className="h-full bg-gradient-to-r from-primary to-primary/70 transition-all duration-500"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2 overflow-x-auto py-4 px-2">
          {sortedSkills.map((skill, index) => (
            <React.Fragment key={skill.id}>
              <SkillNode
                skill={skill}
                isUnlocked={unlockedSkillIds.has(skill.id)}
                canUnlock={canUnlockSkill(skill)}
                userSkillPoints={userSkillPoints}
                onUnlock={onUnlockSkill}
                isLoading={isLoading}
              />
              {index < sortedSkills.length - 1 && (
                <ChevronRight className="w-6 h-6 text-muted-foreground/50 flex-shrink-0" />
              )}
            </React.Fragment>
          ))}
          {sortedSkills.length === 0 && (
            <p className="text-muted-foreground text-sm italic">
              Aucune compétence dans ce chemin
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
