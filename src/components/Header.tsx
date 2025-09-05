
import React from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useResponsive } from '@/hooks/useResponsive';
import { PointsDisplay } from '@/components/PointsDisplay';
import { LogOut, Settings } from 'lucide-react';

type Page = 'library' | 'reader' | 'admin' | 'shop-admin' | 'achievement-admin' | 'orders-admin' | 'reading-stats-admin' | 'audiobook-admin' | 'game-admin' | 'points-admin' | 'api-keys-admin' | 'shop' | 'search' | 'profile' | 'premium' | 'video-ad' | 'game-reader';

interface HeaderProps {
  onNavigate: (page: Page) => void;
  currentPage: Page;
}

export const Header: React.FC<HeaderProps> = ({ onNavigate, currentPage }) => {
  const { user, subscription, isAdmin } = useAuth();
  const { isMobile, isTablet } = useResponsive();

  const handleLogout = async () => {
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      // Force la déconnexion côté client même si le serveur renvoie une erreur
      const { supabase } = await import('@/integrations/supabase/client');
      // Clear la session locale
      await supabase.auth.signOut({ scope: 'local' });
      // Actualiser la page pour s'assurer que l'état est correctement réinitialisé
      window.location.reload();
    }
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

  const getInstagramContainerSize = () => {
    if (isMobile) return 'h-14 w-14';
    if (isTablet) return 'h-16 w-16';
    return 'h-20 w-20';
  };

  const getInstagramImageSize = () => {
    if (isMobile) return 'h-12 w-12';
    if (isTablet) return 'h-14 w-14';
    return 'h-18 w-18';
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
            <PointsDisplay />
          </div>

          {/* Center - Instagram image with bandeau style (no longer clickable) */}
          <div className="absolute left-1/2 transform -translate-x-1/2 -top-2 z-10">
            <div className="bg-gradient-to-r from-wood-200 via-wood-100 to-wood-200 rounded-full p-2 border-2 border-wood-400 shadow-xl">
              <div className={`${getInstagramContainerSize()} rounded-full overflow-hidden bg-wood-100 shadow-lg flex items-center justify-center`}>
                <img 
                  src="/lovable-uploads/f08448a1-fba4-4f9f-926d-515ddd185b17.png" 
                  alt="Instagram La Toison d'Or" 
                  className={`${getInstagramImageSize()} object-cover rounded-full`}
                />
              </div>
            </div>
          </div>

          {/* Right side - Premium status and Logout */}
          <div className="flex items-center space-x-2 flex-1 justify-end">
            {subscription?.isPremium && (
              <div className="text-sm text-green-500 font-semibold">Premium</div>
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
