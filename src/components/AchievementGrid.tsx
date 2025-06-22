
import React from 'react';
import { Achievement } from '@/types/UserStats';
import { AchievementCard } from './AchievementCard';

interface AchievementGridProps {
  achievements: Achievement[];
  onEditAchievement: (achievement: Achievement) => void;
  onDeleteAchievement: (id: string) => void;
}

export const AchievementGrid: React.FC<AchievementGridProps> = ({
  achievements,
  onEditAchievement,
  onDeleteAchievement
}) => {
  if (achievements.length === 0) {
    return (
      <div className="text-center py-12 border rounded-lg">
        <p className="text-muted-foreground">No achievements yet. Add your first achievement!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {achievements.map((achievement) => (
        <AchievementCard
          key={achievement.id}
          achievement={achievement}
          onEdit={onEditAchievement}
          onDelete={onDeleteAchievement}
        />
      ))}
    </div>
  );
};
