import React from 'react';
import { ActiveSkillBonus, formatBonusDescription } from '@/types/Skill';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Zap, Calendar, BookOpen, Gift } from 'lucide-react';

interface ActiveBonusesListProps {
  bonuses: ActiveSkillBonus[];
}

export const ActiveBonusesList: React.FC<ActiveBonusesListProps> = ({ bonuses }) => {
  if (bonuses.length === 0) return null;

  const getBonusIcon = (bonusType: string) => {
    switch (bonusType) {
      case 'day_orydors':
        return <Calendar className="w-4 h-4" />;
      case 'genre_orydors':
        return <BookOpen className="w-4 h-4" />;
      case 'chest_drop':
        return <Gift className="w-4 h-4" />;
      default:
        return <Zap className="w-4 h-4" />;
    }
  };

  return (
    <Card className="bg-emerald-500/10 border-emerald-500/30">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Zap className="w-5 h-5 text-emerald-500" />
          Bonus Actifs
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {bonuses.map((bonus) => (
            <Badge 
              key={bonus.path_id}
              variant="outline"
              className="bg-emerald-500/20 border-emerald-500/50 text-emerald-300 py-1.5 px-3"
            >
              <span className="mr-2">{getBonusIcon(bonus.bonus_type)}</span>
              <span className="font-normal">
                {formatBonusDescription(bonus.bonus_type, bonus.bonus_config)}
              </span>
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
