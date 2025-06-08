
import React from 'react';
import { useUserStats } from '@/contexts/UserStatsContext';
import { Coins } from 'lucide-react';

export const PointsDisplay: React.FC = () => {
  const { userStats } = useUserStats();

  return (
    <div className="flex items-center gap-2 bg-secondary/50 px-3 py-2 rounded-lg">
      <Coins className="h-5 w-5 text-primary" />
      <span className="font-semibold">{userStats.totalPoints} Points</span>
    </div>
  );
};
