
import React from 'react';
import { useUserStats } from '@/contexts/UserStatsContext';
import { EditProfileForm } from '@/components/EditProfileForm';
import { PlayerCard } from '@/components/PlayerCard';
import { PremiumStatusCard } from '@/components/PremiumStatusCard';
import { AchievementInventory } from '@/components/AchievementInventory';
import { StatsSummary } from '@/components/StatsSummary';
import { useResponsive } from '@/hooks/useResponsive';

export const ProfilePage: React.FC = () => {
  const { userStats } = useUserStats();
  const { isMobile, isTablet } = useResponsive();

  const getPlayerLevel = () => {
    if (userStats.booksRead.length < 5) return { level: 1, title: 'Apprenti Lecteur' };
    if (userStats.booksRead.length < 15) return { level: 2, title: 'Lecteur Confirmé' };
    if (userStats.booksRead.length < 30) return { level: 3, title: 'Maître Lecteur' };
    return { level: 4, title: 'Grand Maître' };
  };

  const playerLevel = getPlayerLevel();
  const unlockedAchievements = userStats.achievements.filter(a => a.unlocked);
  const totalAchievementPoints = unlockedAchievements.reduce((sum, a) => sum + a.points, 0);

  const getSpacing = () => {
    if (isMobile) return 'space-y-4 pb-20';
    if (isTablet) return 'space-y-5 pb-20';
    return 'space-y-6 pb-20';
  };

  const getPadding = () => {
    if (isMobile) return 'p-2';
    if (isTablet) return 'p-3';
    return 'p-4';
  };

  return (
    <div className={`${getSpacing()} bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 min-h-screen text-white ${getPadding()} max-w-full overflow-x-hidden`}>
      {/* Edit Profile Button */}
      <div className="flex justify-end mb-4">
        <EditProfileForm />
      </div>

      {/* Player Card */}
      <PlayerCard
        totalPoints={userStats.totalPoints}
        booksReadCount={userStats.booksRead.length}
        unlockedAchievementsCount={unlockedAchievements.length}
        totalAchievementsCount={userStats.achievements.length}
        playerLevel={playerLevel}
      />

      {/* Premium Status */}
      <PremiumStatusCard isPremium={userStats.isPremium} />

      {/* Achievements Inventory */}
      <AchievementInventory
        achievements={userStats.achievements}
        totalAchievementPoints={totalAchievementPoints}
      />

      {/* Stats Summary */}
      <StatsSummary
        totalPoints={userStats.totalPoints}
        totalAchievementPoints={totalAchievementPoints}
        unlockedAchievementsCount={unlockedAchievements.length}
        playerLevel={playerLevel.level}
      />
    </div>
  );
};
