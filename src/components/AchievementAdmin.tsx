
import React, { useState } from 'react';
import { Achievement } from '@/types/UserStats';
import { Button } from '@/components/ui/button';
import { Plus, Trophy } from 'lucide-react';
import { AchievementGrid } from './AchievementGrid';
import { AchievementDialog } from './AchievementDialog';
import { useResponsive } from '@/hooks/useResponsive';

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
  const { isMobile, isTablet } = useResponsive();

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
      <div className={`flex ${isMobile ? 'flex-col gap-4' : 'justify-between items-center'}`}>
        <h2 className={`font-bold flex items-center gap-2 ${isMobile ? 'text-2xl' : isTablet ? 'text-3xl' : 'text-3xl'}`}>
          <Trophy className={`text-amber-500 ${isMobile ? 'h-6 w-6' : 'h-8 w-8'}`} />
          {isMobile ? 'Succès' : 'Gestion des Succès'}
        </h2>
        <Button 
          onClick={handleOpenAdd} 
          className={`flex items-center gap-2 ${isMobile ? 'w-full justify-center' : ''}`}
        >
          <Plus className="h-4 w-4" /> 
          {isMobile ? 'Ajouter' : 'Ajouter un Succès'}
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
