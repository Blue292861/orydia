
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { UserStats } from '@/types/UserStats';

interface UserStatsContextType {
  userStats: UserStats;
  addPointsForBook: (bookId: string, points: number) => void;
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

export const UserStatsProvider: React.FC<UserStatsProviderProps> = ({ children }) => {
  const [userStats, setUserStats] = useState<UserStats>({
    totalPoints: 0,
    booksRead: []
  });

  const addPointsForBook = (bookId: string, points: number) => {
    setUserStats(prev => {
      if (prev.booksRead.includes(bookId)) {
        return prev; // Already read this book
      }
      
      return {
        totalPoints: prev.totalPoints + points,
        booksRead: [...prev.booksRead, bookId]
      };
    });
  };

  return (
    <UserStatsContext.Provider value={{ userStats, addPointsForBook }}>
      {children}
    </UserStatsContext.Provider>
  );
};
