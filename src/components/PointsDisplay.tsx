
import React from 'react';
import { useUserStats } from '@/contexts/UserStatsContext';
import { BuyTensensDialog } from '@/components/BuyTensensDialog';

export const PointsDisplay: React.FC = () => {
  const { userStats } = useUserStats();

  return (
    <BuyTensensDialog 
      trigger={
        <div className="flex items-center space-x-0.5 xs:space-x-1 sm:space-x-2 bg-wood-800 border-2 border-gold-400 rounded-lg px-1 xs:px-2 sm:px-4 py-0.5 xs:py-1 sm:py-2 cursor-pointer hover:bg-wood-700 hover:border-gold-300 transition-all duration-300 shadow-lg hover:shadow-gold-400/30 group">
          <img src="/lovable-uploads/4a891ef6-ff72-4b5a-b33c-0dc33dd3aa26.png" alt="Icône Tensens" className="h-3 w-3 xs:h-4 xs:w-4 sm:h-6 sm:w-6 group-hover:scale-110 transition-transform" />
          <span className="font-bold text-[10px] xs:text-xs sm:text-lg text-gold-400 group-hover:text-gold-300 transition-colors">{userStats.totalPoints}</span>
          <span className="text-gold-500 font-medieval text-[8px] xs:text-[9px] sm:text-sm hidden xs:inline">Tensens</span>
        </div>
      }
    />
  );
};
