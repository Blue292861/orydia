
import React, { useState } from 'react';
import { Achievement } from '@/types/UserStats';
import { Button } from '@/components/ui/button';
import { Plus, Trophy } from 'lucide-react';
import { AchievementGrid } from './AchievementGrid';
import { AchievementDialog } from './AchievementDialog';

interface AchievementAdminProps {
  achievements: Achievement[];
  onAddAchievement: (achievement: Achievement) => void;
  onUpdateAchievement: (achievement: Achievement) => void;
  onDeleteAchievement: (id: string) => void;
}

export const AchievementAdmin: React.FC<AchievementAdminProps> = ({ 
  achievements, 
  onAddAchievement,
  onUpdateAchievement,
  onDeleteAchievement
}) => {
  const [showDialog, setShowDialog] = useState(false);
  const [editingAchievement, setEditingAchievement] = useState<Achievement | null>(null);

  const handleOpenAdd = () => {
    setEditingAchievement(null);
    setShowDialog(true);
  };

  const handleOpenEdit = (achievement: Achievement) => {
    setEditingAchievement(achievement);
    setShowDialog(true);
  };

  const handleSubmit = (achievementData: Achievement) => {
    if (editingAchievement) {
      onUpdateAchievement(achievementData);
    } else {
      onAddAchievement(achievementData);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold flex items-center gap-2">
          <Trophy className="h-8 w-8 text-amber-500" />
          Achievement Management
        </h2>
        <Button onClick={handleOpenAdd} className="flex items-center gap-2">
          <Plus className="h-4 w-4" /> Add Achievement
        </Button>
      </div>

      <AchievementGrid
        achievements={achievements}
        onEditAchievement={handleOpenEdit}
        onDeleteAchievement={onDeleteAchievement}
      />

      <AchievementDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        editingAchievement={editingAchievement}
        onSubmit={handleSubmit}
      />
    </div>
  );
};
