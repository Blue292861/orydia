
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Crown, Trophy } from 'lucide-react';
import { useResponsive } from '@/hooks/useResponsive';
import { LevelInfo } from '@/types/UserStats';

interface PlayerCardProps {
  totalPoints: number;
  booksReadCount: number;
  unlockedAchievementsCount: number;
  totalAchievementsCount: number;
  levelInfo?: LevelInfo;
}

export const PlayerCard: React.FC<PlayerCardProps> = ({
  totalPoints,
  booksReadCount,
  unlockedAchievementsCount,
  totalAchievementsCount,
  levelInfo
}) => {
  const { isMobile, isTablet } = useResponsive();

  const getGridCols = () => {
    if (isMobile) return 'grid-cols-1';
    if (isTablet) return 'grid-cols-1 md:grid-cols-2';
    return 'grid-cols-1 md:grid-cols-3';
  };

  return (
    <Card className="bg-gradient-to-r from-amber-700 to-amber-900 border-2 border-amber-400 shadow-xl">
      <CardHeader className={`text-center ${isMobile ? 'pb-1' : 'pb-2'}`}>
        <div className={`flex items-center justify-center gap-3 mb-2 ${
          isMobile ? 'flex-col gap-2' : ''
        }`}>
          <Crown className={`text-amber-300 ${isMobile ? 'h-6 w-6' : 'h-8 w-8'}`} />
          <CardTitle className={`font-bold text-amber-100 ${
            isMobile ? 'text-lg' : isTablet ? 'text-xl' : 'text-2xl'
          }`}>
            Profil du Joueur
          </CardTitle>
          {!isMobile && <Crown className="h-8 w-8 text-amber-300" />}
        </div>
        <div className={`flex items-center justify-center gap-2 ${
          isMobile ? 'flex-col gap-1' : ''
        }`}>
          <Badge className={`bg-amber-600 text-amber-100 ${
            isMobile ? 'text-sm px-3 py-1' : 'text-lg px-4 py-1'
          }`}>
            Niveau {levelInfo?.level || 1}
          </Badge>
          <Badge className={`bg-purple-600 text-purple-100 ${
            isMobile ? 'text-sm px-3 py-1' : 'text-lg px-4 py-1'
          }`}>
            {levelInfo?.levelTitle || 'Apprenti Lecteur'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className={`grid gap-4 ${getGridCols()}`}>
          <div className={`bg-amber-800/50 rounded-lg border border-amber-600 ${
            isMobile ? 'p-3' : 'p-4'
          }`}>
            <div className={`flex items-center gap-2 mb-2 ${
              isMobile ? 'flex-col text-center gap-1' : ''
            }`}>
              <img src="/lovable-uploads/4a891ef6-ff72-4b5a-b33c-0dc33dd3aa26.png" alt="Tensens Icon" className={`${
                isMobile ? 'h-4 w-4' : 'h-5 w-5'
              }`} />
              <span className={`text-amber-200 font-medium ${
                isMobile ? 'text-sm' : 'text-base'
              }`}>
                Tensens Totaux
              </span>
            </div>
            <div className={`font-bold text-amber-100 ${
              isMobile ? 'text-2xl' : 'text-3xl'
            }`}>
              {totalPoints}
            </div>
          </div>
          
          <div className={`bg-amber-800/50 rounded-lg border border-amber-600 ${
            isMobile ? 'p-3' : 'p-4'
          }`}>
            <div className={`flex items-center gap-2 mb-2 ${
              isMobile ? 'flex-col text-center gap-1' : ''
            }`}>
              <BookOpen className={`text-amber-300 ${
                isMobile ? 'h-4 w-4' : 'h-5 w-5'
              }`} />
              <span className={`text-amber-200 font-medium ${
                isMobile ? 'text-sm' : 'text-base'
              }`}>
                Livres Lus
              </span>
            </div>
            <div className={`font-bold text-amber-100 ${
              isMobile ? 'text-2xl' : 'text-3xl'
            }`}>
              {booksReadCount}
            </div>
          </div>
          
          <div className={`bg-amber-800/50 rounded-lg border border-amber-600 ${
            isMobile ? 'p-3' : 'p-4'
          }`}>
            <div className={`flex items-center gap-2 mb-2 ${
              isMobile ? 'flex-col text-center gap-1' : ''
            }`}>
              <Trophy className={`text-amber-300 ${
                isMobile ? 'h-4 w-4' : 'h-5 w-5'
              }`} />
              <span className={`text-amber-200 font-medium ${
                isMobile ? 'text-sm' : 'text-base'
              }`}>
                Succès
              </span>
            </div>
            <div className={`font-bold text-amber-100 ${
              isMobile ? 'text-2xl' : 'text-3xl'
            }`}>
              {unlockedAchievementsCount}/{totalAchievementsCount}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
