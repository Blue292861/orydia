
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Star } from 'lucide-react';
import { useResponsive } from '@/hooks/useResponsive';

interface StatsSummaryProps {
  totalPoints: number;
  totalAchievementPoints: number;
  unlockedAchievementsCount: number;
  playerLevel: number;
}

export const StatsSummary: React.FC<StatsSummaryProps> = ({
  totalPoints,
  totalAchievementPoints,
  unlockedAchievementsCount,
  playerLevel
}) => {
  const { isMobile, isTablet } = useResponsive();

  const getStatsGridCols = () => {
    if (isMobile) return 'grid-cols-2';
    if (isTablet) return 'grid-cols-2 md:grid-cols-4';
    return 'grid-cols-2 md:grid-cols-4';
  };

  return (
    <Card className="bg-slate-800 border-2 border-slate-600">
      <CardHeader>
        <CardTitle className={`text-slate-100 flex items-center gap-2 ${
          isMobile ? 'text-lg' : 'text-xl'
        }`}>
          <Star className={`text-yellow-400 ${
            isMobile ? 'h-4 w-4' : 'h-5 w-5'
          }`} />
          Statistiques Détaillées
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className={`grid gap-4 ${getStatsGridCols()}`}>
          <div className="text-center">
            <div className={`font-bold text-blue-400 ${
              isMobile ? 'text-xl' : 'text-2xl'
            }`}>
              {totalPoints}
            </div>
            <div className={`text-slate-400 ${
              isMobile ? 'text-xs' : 'text-sm'
            }`}>
              Tensens de Lecture
            </div>
          </div>
          <div className="text-center">
            <div className={`font-bold text-green-400 ${
              isMobile ? 'text-xl' : 'text-2xl'
            }`}>
              {totalAchievementPoints}
            </div>
            <div className={`text-slate-400 ${
              isMobile ? 'text-xs' : 'text-sm'
            }`}>
              Tensens de Succès
            </div>
          </div>
          <div className="text-center">
            <div className={`font-bold text-purple-400 ${
              isMobile ? 'text-xl' : 'text-2xl'
            }`}>
              {unlockedAchievementsCount}
            </div>
            <div className={`text-slate-400 ${
              isMobile ? 'text-xs' : 'text-sm'
            }`}>
              Succès Débloqués
            </div>
          </div>
          <div className="text-center">
            <div className={`font-bold text-amber-400 ${
              isMobile ? 'text-xl' : 'text-2xl'
            }`}>
              {playerLevel}
            </div>
            <div className={`text-slate-400 ${
              isMobile ? 'text-xs' : 'text-sm'
            }`}>
              Niveau Actuel
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
