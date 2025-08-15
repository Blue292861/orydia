
import React from 'react';
import { useUserStats } from '@/contexts/UserStatsContext';
import { BuyTensensDialog } from '@/components/BuyTensensDialog';
import { useResponsive } from '@/hooks/useResponsive';

export const PointsDisplay: React.FC = () => {
  const { userStats } = useUserStats();
  const { isMobile, isTablet } = useResponsive();

  const getIconSize = () => {
    if (isMobile) return 'h-2.5 w-2.5';
    if (isTablet) return 'h-3 w-3';
    return 'h-3.5 w-3.5';
  };

  const getTextSize = () => {
    if (isMobile) return 'text-xs';
    if (isTablet) return 'text-xs';
    return 'text-sm';
  };

  const getPadding = () => {
    if (isMobile) return 'px-1 py-0.5';
    if (isTablet) return 'px-1.5 py-0.5';
    return 'px-2 py-1';
  };

  return (
    <BuyTensensDialog 
      trigger={
        <div className={`flex items-center space-x-1 bg-wood-800 border border-gold-400 rounded-md cursor-pointer hover:bg-wood-700 hover:border-gold-300 transition-all duration-300 shadow-sm hover:shadow-gold-400/20 group max-w-fit min-w-0 ${getPadding()}`}>
          <img 
            src="/lovable-uploads/4a891ef6-ff72-4b5a-b33c-0dc33dd3aa26.png" 
            alt="Icône Tensens" 
            className={`group-hover:scale-110 transition-transform flex-shrink-0 ${getIconSize()}`} 
          />
          <span className={`font-bold text-gold-400 group-hover:text-gold-300 transition-colors flex-shrink-0 ${getTextSize()}`}>
            {userStats.totalPoints}
          </span>
          {!isMobile && (
            <span className="text-gold-500 font-medieval flex-shrink-0 text-xs">
              Tensens
            </span>
          )}
        </div>
      }
    />
  );
};
