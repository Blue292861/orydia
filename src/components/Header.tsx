
import React from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useUserStats } from '@/contexts/UserStatsContext';
import { useResponsive } from '@/hooks/useResponsive';
import { BuyTensensDialog } from '@/components/BuyTensensDialog';
import { LogOut, Settings } from 'lucide-react';

type Page = 'library' | 'reader' | 'admin' | 'shop-admin' | 'achievement-admin' | 'orders-admin' | 'reading-stats-admin' | 'audiobook-admin' | 'shop' | 'search' | 'profile' | 'video-ad';

interface HeaderProps {
  onNavigate: (page: Page) => void;
  currentPage: Page;
}

export const Header: React.FC<HeaderProps> = ({ onNavigate, currentPage }) => {
  const { user, subscription, isAdmin } = useAuth();
  const { userStats } = useUserStats();
  const { isMobile, isTablet } = useResponsive();

  const handleInstagramClick = () => {
    window.open('https://www.instagram.com/la_toison_d_or_sarl?igsh=N2NjcGV1bWVuMTAy', '_blank');
  };

  const handleLogout = async () => {
    const { supabase } = await import('@/integrations/supabase/client');
    await supabase.auth.signOut();
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

  const getInstagramButtonSize = () => {
    if (isMobile) return 'h-14 w-14';
    if (isTablet) return 'h-16 w-16';
    return 'h-20 w-20';
  };

  const getInstagramImageSize = () => {
    if (isMobile) return 'h-8 w-8';
    if (isTablet) return 'h-10 w-10';
    return 'h-12 w-12';
  };

  return (
    <header className="bg-wood-300 border-b border-wood-400 shadow-lg sticky top-0 z-50 relative">
      <div className={`w-full max-w-full ${getHeaderPadding()}`}>
        <div className="flex items-center justify-between">
          {/* Left side - Admin and Tensens counter */}
          <div className="flex items-center space-x-2 flex-1">
            {isAdmin && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onNavigate('admin')}
                className={`bg-wood-100 hover:bg-wood-200 text-wood-800 border-wood-400 ${
                  isMobile ? 'text-xs px-2 py-1' : 'text-sm'
                }`}
              >
                <Settings className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'} mr-1`} />
                {!isMobile && 'Admin'}
              </Button>
            )}
            
            {/* Tensens Counter */}
            <BuyTensensDialog
              trigger={
                <Button
                  variant="outline"
                  size="sm"
                  className={`bg-gradient-to-r from-amber-800 to-amber-900 hover:from-amber-700 hover:to-amber-800 text-amber-100 border-amber-600 shadow-lg ${
                    isMobile ? 'text-xs px-2 py-1' : 'text-sm'
                  }`}
                >
                  <img 
                    src="/lovable-uploads/c831f469-03da-458d-8428-2f156b930e87.png" 
                    alt="Tensens" 
                    className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'} mr-1`}
                  />
                  {userStats.totalPoints} Tensens
                </Button>
              }
            />
          </div>

          {/* Center - Instagram button with bandeau style */}
          <div className="absolute left-1/2 transform -translate-x-1/2 -top-2 z-10">
            <div className="bg-gradient-to-r from-wood-200 via-wood-100 to-wood-200 rounded-full p-2 border-2 border-wood-400 shadow-xl">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleInstagramClick}
                className={`${getInstagramButtonSize()} rounded-full overflow-hidden p-0 border-3 border-wood-500/50 hover:border-wood-600 transition-all duration-300 hover:scale-110 bg-gradient-to-br from-pink-400 via-purple-500 to-orange-400 hover:from-pink-500 hover:via-purple-600 hover:to-orange-500 shadow-lg hover:shadow-xl`}
                title="Suivez-nous sur Instagram"
              >
                <img 
                  src="/lovable-uploads/f08448a1-fba4-4f9f-926d-515ddd185b17.png" 
                  alt="Instagram La Toison d'Or" 
                  className={`${getInstagramImageSize()} object-cover rounded-full`}
                />
              </Button>
            </div>
          </div>

          {/* Right side - Premium status and Logout */}
          <div className="flex items-center space-x-2 flex-1 justify-end">
            {subscription?.isPremium ? (
              <div className="text-sm text-green-500 font-semibold">Premium</div>
            ) : (
              userStats.totalPoints > 0 && currentPage !== 'shop' && (
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
            
            {/* Logout Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className={`text-wood-700 hover:text-red-600 hover:bg-red-50 ${
                isMobile ? 'px-2' : 'px-3'
              }`}
              title="Se déconnecter"
            >
              <LogOut className={`${isMobile ? 'h-4 w-4' : 'h-4 w-4'}`} />
              {!isMobile && <span className="ml-1">Déconnexion</span>}
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};
