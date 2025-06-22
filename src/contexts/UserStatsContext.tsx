
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { UserStats, Achievement } from '@/types/UserStats';
import { UserStatsContextType } from '@/types/UserStatsContext';
import { SoundEffects } from '@/utils/soundEffects';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from './AuthContext';
import { initialAchievements } from '@/data/initialAchievements';
import { checkAndUnlockAchievements } from '@/utils/achievementChecker';

const UserStatsContext = createContext<UserStatsContextType | undefined>(undefined);

export const useUserStats = () => {
  const context = useContext(UserStatsContext);
  if (!context) {
    throw new Error('useUserStats must be used within a UserStatsProvider');
  }
  return context;
};

interface UserStatsProviderProps {
  children: ReactNode;
}

export const UserStatsProvider: React.FC<UserStatsProviderProps> = ({ children }) => {
  const { subscription } = useAuth();
  const [userStats, setUserStats] = useState<UserStats>({
    totalPoints: 0,
    booksRead: [],
    achievements: initialAchievements,
    isPremium: false,
    level: 1,
    experiencePoints: 0,
    pendingPremiumMonths: 0
  });

  useEffect(() => {
    if (userStats.isPremium !== subscription.isPremium) {
      setUserStats(prev => checkAndUnlockAchievements({ ...prev, isPremium: subscription.isPremium }));
    }
  }, [subscription.isPremium]);

  const addPointsForBook = (bookId: string, points: number) => {
    setUserStats(prev => {
      if (prev.booksRead.includes(bookId)) {
        return prev; // Already read this book
      }
      
      SoundEffects.playPoints();
      
      const newStats = {
        ...prev,
        totalPoints: prev.totalPoints + points,
        booksRead: [...prev.booksRead, bookId]
      };

      return checkAndUnlockAchievements(newStats);
    });
  };

  const spendPoints = (amount: number) => {
    setUserStats(prev => ({
      ...prev,
      totalPoints: Math.max(0, prev.totalPoints - amount)
    }));
  };

  const addAchievement = (achievement: Achievement) => {
    setUserStats(prev => ({
      ...prev,
      achievements: [...prev.achievements, achievement]
    }));
  };

  const updateAchievement = (updatedAchievement: Achievement) => {
    setUserStats(prev => ({
      ...prev,
      achievements: prev.achievements.map(ach => 
        ach.id === updatedAchievement.id ? updatedAchievement : ach
      )
    }));
  };

  const deleteAchievement = (id: string) => {
    setUserStats(prev => ({
      ...prev,
      achievements: prev.achievements.filter(ach => ach.id !== id)
    }));
  };

  const applyPendingPremiumMonths = () => {
    if (userStats.pendingPremiumMonths && userStats.pendingPremiumMonths > 0) {
      // This would integrate with subscription management to pause payments
      // For now, we'll just clear the pending months and show a notification
      toast({
        title: '🎉 Premium Extended!',
        description: `${userStats.pendingPremiumMonths} mois de premium ont été ajoutés à votre compte.`,
      });
      
      setUserStats(prev => ({
        ...prev,
        pendingPremiumMonths: 0
      }));
    }
  };

  return (
    <UserStatsContext.Provider value={{ 
      userStats, 
      addPointsForBook, 
      spendPoints, 
      addAchievement,
      updateAchievement,
      deleteAchievement,
      applyPendingPremiumMonths
    }}>
      {children}
    </UserStatsContext.Provider>
  );
};
