
import React from 'react';
import { Achievement } from '@/types/UserStats';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, Crown } from 'lucide-react';

interface AchievementCardProps {
  achievement: Achievement;
  onEdit: (achievement: Achievement) => void;
  onDelete: (id: string) => void;
}

export const AchievementCard: React.FC<AchievementCardProps> = ({
  achievement,
  onEdit,
  onDelete
}) => {
  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-500';
      case 'rare': return 'bg-blue-500';
      case 'epic': return 'bg-purple-500';
      case 'legendary': return 'bg-yellow-500';
      case 'ultra-legendary': return 'bg-gradient-to-r from-pink-500 via-purple-500 to-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this achievement?')) {
      onDelete(achievement.id);
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{achievement.icon}</span>
            <CardTitle className="text-lg">{achievement.name}</CardTitle>
          </div>
          <Badge className={`${getRarityColor(achievement.rarity)} text-white border-0`}>
            {achievement.rarity === 'ultra-legendary' ? (
              <span className="flex items-center gap-1">
                <Crown className="h-3 w-3" />
                Ultra-Legendary
              </span>
            ) : (
              achievement.rarity
            )}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">{achievement.description}</p>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-medium text-primary">{achievement.points} points</span>
          </div>
          {achievement.premiumMonths && achievement.premiumMonths > 0 && (
            <div className="flex items-center gap-1 text-sm text-amber-600">
              <Crown className="h-4 w-4" />
              <span>{achievement.premiumMonths} mois premium offert{achievement.premiumMonths > 1 ? 's' : ''}</span>
            </div>
          )}
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => onEdit(achievement)}>
              <Pencil className="h-4 w-4" />
            </Button>
            <Button variant="destructive" size="sm" onClick={handleDelete}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
