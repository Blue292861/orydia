
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { UserStats, Achievement } from '@/types/UserStats';

interface UserStatsContextType {
  userStats: UserStats;
  addPointsForBook: (bookId: string, points: number) => void;
  spendPoints: (amount: number) => void;
  unlockPremium: () => void;
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
  }
];

export const UserStatsProvider: React.FC<UserStatsProviderProps> = ({ children }) => {
  const [userStats, setUserStats] = useState<UserStats>({
    totalPoints: 0,
    booksRead: [],
    achievements: initialAchievements,
    isPremium: false
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
          // For now, we'll unlock this randomly as we don't track reading streaks
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

    return {
      ...newStats,
      achievements: updatedAchievements,
      totalPoints: newStats.totalPoints + bonusPoints
    };
  };

  const addPointsForBook = (bookId: string, points: number) => {
    setUserStats(prev => {
      if (prev.booksRead.includes(bookId)) {
        return prev; // Already read this book
      }
      
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

  return (
    <UserStatsContext.Provider value={{ userStats, addPointsForBook, spendPoints, unlockPremium }}>
      {children}
    </UserStatsContext.Provider>
  );
};
