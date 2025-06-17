
import React from 'react';
import { useUserStats } from '@/contexts/UserStatsContext';
import { BuyTensensDialog } from '@/components/BuyTensensDialog';

export const PointsDisplay: React.FC = () => {
  const { userStats } = useUserStats();

  return (
    <div className="flex items-center space-x-2">
      <img src="/lovable-uploads/4a891ef6-ff72-4b5a-b33c-0dc33dd3aa26.png" alt="Tensens Icon" className="h-6 w-6" />
      <span className="font-bold text-lg">{userStats.totalPoints} Tensens</span>
      <BuyTensensDialog />
    </div>
  );
};
