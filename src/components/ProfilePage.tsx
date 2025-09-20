import React from 'react';
import { useUserStats } from '@/contexts/UserStatsContext';
import { useAuth } from '@/contexts/AuthContext';
import { EditProfileForm } from '@/components/EditProfileForm';
import { PlayerCard } from '@/components/PlayerCard';
import { PremiumStatusCard } from '@/components/PremiumStatusCard';
import { AchievementInventory } from '@/components/AchievementInventory';
import { StatsSummary } from '@/components/StatsSummary';
import { LevelProgressBar } from '@/components/LevelProgressBar';
import { SubscriptionManagement } from '@/components/SubscriptionManagement';
import { useResponsive } from '@/hooks/useResponsive';
import { TutorialPopup } from '@/components/TutorialPopup';

export const ProfilePage: React.FC = () => {
  const { userStats } = useUserStats();
  const { subscription, checkSubscriptionStatus } = useAuth();
  const { isMobile, isTablet } = useResponsive();

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
        levelInfo={userStats.levelInfo}
      />

      {/* Level Progress */}
      {userStats.levelInfo && (
        <LevelProgressBar levelInfo={userStats.levelInfo} />
      )}

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
        playerLevel={userStats.levelInfo?.level || 1}
      />

      {/* Subscription Management - Only for Premium Users */}
      {subscription.isPremium && (
        <SubscriptionManagement 
          subscription={subscription}
          onSubscriptionUpdate={checkSubscriptionStatus}
        />
      )}

      {/* Pop-up du tutoriel de profil */}
      <TutorialPopup 
        tutorialId="profile"
        title="Tes statistiques, lecteur !"
        description="Nous répertorions tes statistiques en cet endroit, lecteur. Plus tu liras, plus ta puissance de lecture augmentera ! Deviens un lecteur influant dans le monde d'Orydia pour gagner encore plus de récompenses ! Les lecteurs de Prestiges gagnent plus vite en puissance, ne l'oublie pas !"
      />
    </div>
  );
};
