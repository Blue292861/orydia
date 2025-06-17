
import React from 'react';
import { useUserStats } from '@/contexts/UserStatsContext';
import { BuyTensensDialog } from '@/components/BuyTensensDialog';
import { useResponsive } from '@/hooks/useResponsive';

export const PointsDisplay: React.FC = () => {
  const { userStats } = useUserStats();
  const { isMobile } = useResponsive();

  return (
    <BuyTensensDialog 
      trigger={
        <div className="flex items-center space-x-1 bg-wood-800 border-2 border-gold-400 rounded-lg px-2 py-1 cursor-pointer hover:bg-wood-700 hover:border-gold-300 transition-all duration-300 shadow-lg hover:shadow-gold-400/30 group max-w-full">
          <img 
            src="/lovable-uploads/4a891ef6-ff72-4b5a-b33c-0dc33dd3aa26.png" 
            alt="Icône Tensens" 
            className={`group-hover:scale-110 transition-transform flex-shrink-0 ${
              isMobile ? 'h-4 w-4' : 'h-5 w-5 sm:h-6 sm:w-6'
            }`} 
          />
          <span className={`font-bold text-gold-400 group-hover:text-gold-300 transition-colors flex-shrink-0 ${
            isMobile ? 'text-xs' : 'text-sm sm:text-base'
          }`}>
            {userStats.totalPoints}
          </span>
          {!isMobile && (
            <span className="text-gold-500 font-medieval text-xs sm:text-sm flex-shrink-0">
              Tensens
            </span>
          )}
        </div>
      }
    />
  );
};
