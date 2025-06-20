import React from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useUserStats } from '@/contexts/UserStatsContext';
import { useResponsive } from '@/hooks/useResponsive';

type Page = 'library' | 'reader' | 'admin' | 'shop-admin' | 'achievement-admin' | 'orders-admin' | 'reading-stats-admin' | 'audiobook-admin' | 'shop' | 'search' | 'profile' | 'video-ad';

interface HeaderProps {
  onNavigate: (page: Page) => void;
  currentPage: Page;
}

export const Header: React.FC<HeaderProps> = ({ onNavigate, currentPage }) => {
  const { user, subscription } = useAuth();
  const { userStats } = useUserStats();
  const { isMobile, isTablet } = useResponsive();

  const handleInstagramClick = () => {
    window.open('https://www.instagram.com/la_toison_d_or_sarl?igsh=N2NjcGV1bWVuMTAy', '_blank');
  };

  const getHeaderPadding = () => {
    if (isMobile) return 'py-2 px-2';
    if (isTablet) return 'py-3 px-4';
    return 'py-4 px-4 sm:px-6 lg:px-8';
  };

  const getButtonSize = () => {
    if (isMobile) return 'h-8 w-8';
    if (isTablet) return 'h-9 w-9';
    return 'h-10 w-10';
  };

  const getImageSize = () => {
    if (isMobile) return 'h-5 w-5';
    if (isTablet) return 'h-6 w-6';
    return 'h-7 w-7';
  };

  return (
    <header className="bg-wood-300 border-b border-wood-400 shadow-lg sticky top-0 z-50">
      <div className={`w-full max-w-full ${getHeaderPadding()}`}>
        <div className="flex items-center justify-between">
          {/* Left side - Admin buttons */}
          <div className="flex items-center space-x-2 flex-1">
            {user?.role === 'admin' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onNavigate('admin')}
                className={`bg-wood-100 hover:bg-wood-200 text-wood-800 border-wood-400 ${
                  isMobile ? 'text-xs px-2 py-1' : 'text-sm'
                }`}
              >
                Admin
              </Button>
            )}
          </div>

          {/* Center - Instagram button */}
          <div className="flex justify-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleInstagramClick}
              className={`${getButtonSize()} rounded-full bg-wood-200/50 hover:bg-wood-200 border border-wood-400 transition-all duration-200 hover:scale-105`}
              title="Suivez-nous sur Instagram"
            >
              <img 
                src="/lovable-uploads/f08448a1-fba4-4f9f-926d-515ddd185b17.png" 
                alt="Instagram La Toison d'Or" 
                className={`${getImageSize()} object-contain`}
              />
            </Button>
          </div>

          {/* Right side - User stats and Premium */}
          <div className="flex items-center space-x-2 flex-1 justify-end">
            {subscription?.isPremium ? (
              <div className="text-sm text-green-500 font-semibold">Premium</div>
            ) : (
              userStats.availablePoints > 0 && currentPage !== 'shop' && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => onNavigate('shop')}
                  className="bg-amber-500 hover:bg-amber-600 text-white"
                >
                  {isMobile ? 'Boutique' : '兑 Boutique'}
                </Button>
              )
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
