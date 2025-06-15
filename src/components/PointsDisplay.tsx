
import React from 'react';
import { useUserStats } from '@/contexts/UserStatsContext';

export const PointsDisplay: React.FC = () => {
  const { userStats } = useUserStats();

  return (
    <div className="flex items-center gap-2 bg-wood-800 px-3 py-2 rounded-lg">
      <img src="/lovable-uploads/4a891ef6-ff72-4b5a-b33c-0dc33dd3aa26.png" alt="Tensens Icon" className="h-6 w-6" />
      <span className="font-semibold">{userStats.totalPoints} Tensens</span>
    </div>
  );
};
