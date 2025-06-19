
import React from 'react';
import { useUserStats } from '@/contexts/UserStatsContext';
import { BuyTensensDialog } from '@/components/BuyTensensDialog';
import { useResponsive } from '@/hooks/useResponsive';

export const PointsDisplay: React.FC = () => {
  const { userStats } = useUserStats();
  const { isMobile, isTablet } = useResponsive();

  const getIconSize = () => {
    if (isMobile) return 'h-4 w-4';
    if (isTablet) return 'h-5 w-5';
    return 'h-5 w-5 sm:h-6 sm:w-6';
  };

  const getTextSize = () => {
    if (isMobile) return 'text-xs';
    if (isTablet) return 'text-sm';
    return 'text-sm sm:text-base';
  };

  const getPadding = () => {
    if (isMobile) return 'px-2 py-1';
    if (isTablet) return 'px-2 py-1';
    return 'px-2 py-1';
  };

  return (
    <BuyTensensDialog 
      trigger={
        <div className={`flex items-center space-x-1 bg-wood-800 border-2 border-gold-400 rounded-lg cursor-pointer hover:bg-wood-700 hover:border-gold-300 transition-all duration-300 shadow-lg hover:shadow-gold-400/30 group max-w-full ${getPadding()}`}>
          <img 
            src="/lovable-uploads/4a891ef6-ff72-4b5a-b33c-0dc33dd3aa26.png" 
            alt="Icône Tensens" 
            className={`group-hover:scale-110 transition-transform flex-shrink-0 ${getIconSize()}`} 
          />
          <span className={`font-bold text-gold-400 group-hover:text-gold-300 transition-colors flex-shrink-0 ${getTextSize()}`}>
            {userStats.totalPoints}
          </span>
          {!isMobile && (
            <span className={`text-gold-500 font-medieval flex-shrink-0 ${
              isTablet ? 'text-xs' : 'text-xs sm:text-sm'
            }`}>
              Tensens
            </span>
          )}
        </div>
      }
    />
  );
};
