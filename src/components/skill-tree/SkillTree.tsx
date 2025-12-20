import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { SkillPathComponent } from './SkillPath';
import { ActiveBonusesList } from './ActiveBonusesList';
import { 
  SkillPath, 
  Skill, 
  ActiveSkillBonus, 
  UserSkillStats 
} from '@/types/Skill';
import { 
  getSkillPathsWithSkills, 
  getUserSkills, 
  getUserSkillStats, 
  unlockSkill, 
  getActiveSkillBonuses 
} from '@/services/skillService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Zap, TreeDeciduous } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

export const SkillTree: React.FC = () => {
  const { user } = useAuth();
  const [skillPaths, setSkillPaths] = useState<SkillPath[]>([]);
  const [unlockedSkillIds, setUnlockedSkillIds] = useState<Set<string>>(new Set());
  const [userStats, setUserStats] = useState<UserSkillStats | null>(null);
  const [activeBonuses, setActiveBonuses] = useState<ActiveSkillBonus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUnlocking, setIsUnlocking] = useState(false);

  const loadData = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const [paths, userSkills, stats, bonuses] = await Promise.all([
        getSkillPathsWithSkills(),
        getUserSkills(user.id),
        getUserSkillStats(user.id),
        getActiveSkillBonuses(user.id)
      ]);

      setSkillPaths(paths);
      setUnlockedSkillIds(new Set(userSkills.map(us => us.skill_id)));
      setUserStats(stats);
      setActiveBonuses(bonuses);
    } catch (error) {
      console.error('Error loading skill tree data:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger l\'arbre de compétences',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleUnlockSkill = async (skill: Skill) => {
    if (!user || isUnlocking) return;

    setIsUnlocking(true);
    try {
      const result = await unlockSkill(user.id, skill.id);

      if (result.success) {
        toast({
          title: '🎉 Compétence débloquée !',
          description: `${skill.name} - ${result.remaining_points} points restants`
        });
        
        // Reload data
        await loadData();
      } else {
        toast({
          title: 'Erreur',
          description: result.error || 'Impossible de débloquer la compétence',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error unlocking skill:', error);
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue',
        variant: 'destructive'
      });
    } finally {
      setIsUnlocking(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with skill points */}
      <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2">
            <TreeDeciduous className="w-6 h-6 text-primary" />
            Arbre de Compétences
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <span className="text-2xl font-bold text-amber-500">
                  {userStats?.skill_points ?? 0}
                </span>
                <span className="text-muted-foreground">
                  point{(userStats?.skill_points ?? 0) > 1 ? 's' : ''} de compétence
                </span>
              </div>
            </div>
            <Badge variant="outline" className="text-sm">
              <Zap className="w-4 h-4 mr-1" />
              {userStats?.unlocked_skills ?? 0} / {userStats?.total_skills ?? 0} compétences
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Gagnez des points de compétence en montant de niveau. 
            Niveau N = N points de compétence gagnés.
          </p>
        </CardContent>
      </Card>

      {/* Active bonuses */}
      {activeBonuses.length > 0 && (
        <ActiveBonusesList bonuses={activeBonuses} />
      )}

      {/* Skill paths */}
      <div className="space-y-4">
        {skillPaths.length === 0 ? (
          <Card className="bg-card/50">
            <CardContent className="py-8 text-center">
              <TreeDeciduous className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                Aucun chemin de compétences disponible pour le moment.
              </p>
            </CardContent>
          </Card>
        ) : (
          skillPaths.map(path => (
            <SkillPathComponent
              key={path.id}
              path={path}
              unlockedSkillIds={unlockedSkillIds}
              userSkillPoints={userStats?.skill_points ?? 0}
              onUnlockSkill={handleUnlockSkill}
              isLoading={isUnlocking}
            />
          ))
        )}
      </div>
    </div>
  );
};
