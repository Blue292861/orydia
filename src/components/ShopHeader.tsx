
import React from 'react';
import { useUserStats } from '@/contexts/UserStatsContext';
import { useResponsive } from '@/hooks/useResponsive';

export const ShopHeader: React.FC = () => {
  const { userStats } = useUserStats();
  const { isMobile, isTablet } = useResponsive();

  const getHeaderPadding = () => {
    if (isMobile) return 'py-4 px-2';
    if (isTablet) return 'py-6 px-4';
    return 'py-8 px-4';
  };

  return (
    <div className="relative bg-gradient-to-r from-amber-900 via-yellow-800 to-amber-900 border-b-4 border-amber-600">
      <div className="absolute inset-0 bg-black/20"></div>
      <div className={`relative text-center ${getHeaderPadding()}`}>
        <h1 className={`font-bold text-amber-200 mb-2 font-serif drop-shadow-lg ${
          isMobile ? 'text-2xl' : isTablet ? 'text-3xl' : 'text-5xl'
        }`}>
          🏪 L'Emporium du Marchand
        </h1>
        <p className={`text-amber-100 ${
          isMobile ? 'text-sm' : isTablet ? 'text-base' : 'text-lg'
        }`}>
          Échangez vos Tensens durement gagnés contre des objets légendaires !
        </p>
        
        <div className={`mt-4 inline-flex items-center gap-2 bg-black/40 rounded-full border border-amber-600 ${
          isMobile ? 'px-4 py-2' : 'px-6 py-3'
        }`}>
          <img src="/lovable-uploads/4a891ef6-ff72-4b5a-b33c-0dc33dd3aa26.png" alt="Icône Tensens" className={`${
            isMobile ? 'h-4 w-4' : 'h-6 w-6'
          }`} />
          <span className={`font-bold text-amber-200 ${
            isMobile ? 'text-lg' : 'text-2xl'
          }`}>
            {userStats.totalPoints}
          </span>
          <span className={`text-amber-300 ${
            isMobile ? 'text-sm' : 'text-base'
          }`}>
            Tensens
          </span>
        </div>
      </div>
    </div>
  );
};
