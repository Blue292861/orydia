
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { UserStats, Achievement } from '@/types/UserStats';
import { SoundEffects } from '@/utils/soundEffects';
import { toast } from '@/components/ui/use-toast';

interface UserStatsContextType {
  userStats: UserStats;
  addPointsForBook: (bookId: string, points: number) => void;
  spendPoints: (amount: number) => void;
  unlockPremium: () => void;
  addAchievement: (achievement: Achievement) => void;
  updateAchievement: (achievement: Achievement) => void;
  deleteAchievement: (id: string) => void;
}

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

const initialAchievements: Achievement[] = [
  {
    id: 'first-book',
    name: 'Premier Livre',
    description: 'Lisez votre premier livre',
    points: 25,
    unlocked: false,
    icon: '📖',
    rarity: 'common'
  },
  {
    id: 'bookworm',
    name: 'Rat de Bibliothèque',
    description: 'Lisez 5 livres',
    points: 100,
    unlocked: false,
    icon: '🐛',
    rarity: 'rare'
  },
  {
    id: 'scholar',
    name: 'Érudit',
    description: 'Lisez 10 livres',
    points: 200,
    unlocked: false,
    icon: '🎓',
    rarity: 'epic'
  },
  {
    id: 'master-reader',
    name: 'Maître Lecteur',
    description: 'Lisez 20 livres',
    points: 500,
    unlocked: false,
    icon: '👑',
    rarity: 'legendary'
  },
  {
    id: 'point-collector',
    name: 'Collectionneur de Points',
    description: 'Gagnez 500 points',
    points: 50,
    unlocked: false,
    icon: '💰',
    rarity: 'common'
  },
  {
    id: 'point-master',
    name: 'Maître des Points',
    description: 'Gagnez 1000 points',
    points: 150,
    unlocked: false,
    icon: '💎',
    rarity: 'rare'
  },
  {
    id: 'premium-member',
    name: 'Membre Premium',
    description: 'Devenez membre premium',
    points: 300,
    unlocked: false,
    icon: '⭐',
    rarity: 'epic'
  },
  {
    id: 'dedicated-reader',
    name: 'Lecteur Dévoué',
    description: 'Lisez pendant 7 jours consécutifs',
    points: 175,
    unlocked: false,
    icon: '🔥',
    rarity: 'rare'
  },
  {
    id: 'speed-reader',
    name: 'Lecteur Rapide',
    description: 'Lisez 3 livres en une journée',
    points: 150,
    unlocked: false,
    icon: '⚡',
    rarity: 'rare'
  },
  {
    id: 'night-owl',
    name: 'Oiseau de Nuit',
    description: 'Lisez après minuit',
    points: 75,
    unlocked: false,
    icon: '🦉',
    rarity: 'common'
  },
  {
    id: 'genre-explorer',
    name: 'Explorateur de Genres',
    description: 'Lisez des livres de 5 genres différents',
    points: 250,
    unlocked: false,
    icon: '🗺️',
    rarity: 'epic'
  },
  {
    id: 'marathon-reader',
    name: 'Lecteur Marathon',
    description: 'Lisez 50 livres',
    points: 1000,
    unlocked: false,
    icon: '🏃‍♂️',
    rarity: 'legendary'
  }
];

export const UserStatsProvider: React.FC<UserStatsProviderProps> = ({ children }) => {
  const [userStats, setUserStats] = useState<UserStats>({
    totalPoints: 0,
    booksRead: [],
    achievements: initialAchievements,
    isPremium: false,
    level: 1,
    experiencePoints: 0
  });

  const checkAndUnlockAchievements = (newStats: UserStats) => {
    const updatedAchievements = newStats.achievements.map(achievement => {
      if (achievement.unlocked) return achievement;

      let shouldUnlock = false;
      
      switch (achievement.id) {
        case 'first-book':
          shouldUnlock = newStats.booksRead.length >= 1;
          break;
        case 'bookworm':
          shouldUnlock = newStats.booksRead.length >= 5;
          break;
        case 'scholar':
          shouldUnlock = newStats.booksRead.length >= 10;
          break;
        case 'master-reader':
          shouldUnlock = newStats.booksRead.length >= 20;
          break;
        case 'marathon-reader':
          shouldUnlock = newStats.booksRead.length >= 50;
          break;
        case 'point-collector':
          shouldUnlock = newStats.totalPoints >= 500;
          break;
        case 'point-master':
          shouldUnlock = newStats.totalPoints >= 1000;
          break;
        case 'premium-member':
          shouldUnlock = newStats.isPremium;
          break;
        case 'dedicated-reader':
        case 'speed-reader':
        case 'night-owl':
        case 'genre-explorer':
          // For now, we'll unlock these randomly as we don't track these specific metrics
          shouldUnlock = newStats.booksRead.length >= 3;
          break;
      }

      if (shouldUnlock) {
        return { ...achievement, unlocked: true };
      }
      return achievement;
    });

    // Calculate bonus points from newly unlocked achievements
    const newlyUnlocked = updatedAchievements.filter((ach, index) => 
      ach.unlocked && !newStats.achievements[index].unlocked
    );
    
    const bonusPoints = newlyUnlocked.reduce((total, ach) => total + ach.points, 0);

    // Play sound and show toast for new achievements
    if (newlyUnlocked.length > 0) {
      SoundEffects.playAchievement();
      newlyUnlocked.forEach(achievement => {
        toast({
          title: `🏆 Achievement Unlocked!`,
          description: `${achievement.icon} ${achievement.name} - +${achievement.points} points!`,
        });
      });
    }

    // Calculate level and experience
    const totalPoints = newStats.totalPoints + bonusPoints;
    const level = Math.floor(totalPoints / 100) + 1;
    const experiencePoints = totalPoints % 100;

    return {
      ...newStats,
      achievements: updatedAchievements,
      totalPoints,
      level,
      experiencePoints
    };
  };

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

  const unlockPremium = () => {
    setUserStats(prev => {
      const newStats = { ...prev, isPremium: true };
      return checkAndUnlockAchievements(newStats);
    });
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

  return (
    <UserStatsContext.Provider value={{ 
      userStats, 
      addPointsForBook, 
      spendPoints, 
      unlockPremium,
      addAchievement,
      updateAchievement,
      deleteAchievement
    }}>
      {children}
    </UserStatsContext.Provider>
  );
};
