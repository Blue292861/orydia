
import React from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useResponsive } from '@/hooks/useResponsive';
import { useContrast } from '@/contexts/ContrastContext';
import { PointsDisplay } from '@/components/PointsDisplay';
import { LogOut, Settings, Contrast, LogIn } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

type Page = 'library' | 'reader' | 'admin' | 'shop-admin' | 'achievement-admin' | 'orders-admin' | 'reading-stats-admin' | 'audiobook-admin' | 'game-admin' | 'points-admin' | 'api-keys-admin' | 'shop' | 'search' | 'profile' | 'premium' | 'video-ad' | 'game-reader';

interface HeaderProps {
  onNavigate: (page: Page) => void;
  currentPage: Page;
}

export const Header: React.FC<HeaderProps> = ({ onNavigate, currentPage }) => {
  const { user, subscription, isAdmin } = useAuth();
  const { isMobile, isTablet } = useResponsive();
  const { isHighContrast, toggleContrast } = useContrast();
  const isReader = currentPage === 'reader' || currentPage === 'game-reader';
  const navigate = useNavigate();

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
    if (isReader) return 'py-1 px-2';
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
    <header className="relative overflow-hidden">
      {/* Background with nature gradient and organic elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-forest-600 via-forest-700 to-forest-800"></div>
      <div className="absolute inset-0 wood-texture opacity-30"></div>
      
      {/* Decorative vine elements - hidden on mobile for cleaner look */}
      {!isMobile && (
        <>
          <div className="absolute top-0 left-0 w-16 h-full opacity-20">
            <div className="w-2 h-full bg-gradient-to-b from-forest-400 to-forest-600 rounded-full transform -rotate-12 vine-grow"></div>
          </div>
          <div className="absolute top-0 right-0 w-16 h-full opacity-20">
            <div className="w-2 h-full bg-gradient-to-b from-forest-400 to-forest-600 rounded-full transform rotate-12 vine-grow"></div>
          </div>
        </>
      )}
      
      <div className={`relative z-10 w-full max-w-full ${getHeaderPadding()}`}>
        <div className="flex items-center justify-between">
          {/* Left side - Admin and Tensens counter */}
          <div className="flex items-center space-x-2 flex-1">
            {isAdmin && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onNavigate('admin')}
                className={`bg-wood-100/90 hover:bg-wood-200/90 text-forest-800 border-gold-400 hover:border-gold-300 backdrop-blur-sm golden-border shadow-md ${
                  isMobile ? 'text-xs px-2 py-1' : 'text-sm'
                }`}
              >
                <Settings className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'} mr-1`} />
                {!isMobile && 'Admin'}
              </Button>
            )}
            
            {/* Tensens Counter - uniquement si connecté */}
            {user && <PointsDisplay />}
            
            {/* Contrast Toggle Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleContrast}
              className={`${isHighContrast ? 'bg-gold-400/20 text-gold-200' : 'text-wood-100'} hover:text-gold-300 hover:bg-gold-400/20 backdrop-blur-sm border border-transparent hover:border-gold-400/30 transition-all duration-300 ${
                isMobile ? 'px-2 py-1' : 'px-3 py-2'
              }`}
              title={isHighContrast ? "Désactiver le contraste élevé" : "Activer le contraste élevé"}
            >
              <Contrast className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'} ${isHighContrast ? 'text-gold-300' : ''}`} />
              {!isMobile && (
                <span className="ml-1 font-medium text-xs">
                  {isHighContrast ? 'Contraste' : 'Contraste'}
                </span>
              )}
            </Button>
          </div>

          {/* Center - Logo with luxury frame (hidden in reader mode) */}
          {!isReader && (
            <div className="absolute left-1/2 transform -translate-x-1/2 -top-3 z-20">
              <div className="relative">
                {/* Golden luxury frame */}
                <div className="bg-gradient-to-br from-gold-300 via-gold-400 to-gold-500 rounded-full p-1 shadow-lg">
                  <div className="bg-gradient-to-br from-wood-100 via-wood-50 to-gold-50 rounded-full p-2 border border-gold-300">
                    <div className={`${getInstagramContainerSize()} rounded-full overflow-hidden bg-wood-100 organic-shadow flex items-center justify-center relative`}>
                      <img 
                        src="/lovable-uploads/f08448a1-fba4-4f9f-926d-515ddd185b17.png" 
                        alt="La Toison d'Or" 
                        className={`${getInstagramImageSize()} object-cover rounded-full`}
                      />
                      {/* Subtle golden shimmer effect */}
                      <div className="absolute inset-0 rounded-full golden-shimmer pointer-events-none"></div>
                    </div>
                  </div>
                </div>
                
                {/* Decorative elements around logo */}
                <div className="absolute -top-1 -left-1 w-3 h-3 bg-gold-400 rounded-full opacity-60 gentle-float"></div>
                <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-gold-300 rounded-full opacity-70 leaf-dance"></div>
              </div>
            </div>
          )}

          {/* Right side - Premium status and Login/Logout */}
          <div className="flex items-center space-x-2 flex-1 justify-end">
            {user && subscription?.isPremium && (
              <div className="bg-gradient-to-r from-gold-400 to-gold-500 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-md">
                Premium
              </div>
            )}
            
            {/* Login or Logout Button */}
            {user ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className={`text-wood-100 hover:text-red-400 hover:bg-red-900/20 backdrop-blur-sm border border-transparent hover:border-red-400/30 ${
                  isMobile ? 'px-2' : 'px-3'
                }`}
                title="Se déconnecter"
              >
                <LogOut className={`${isMobile ? 'h-4 w-4' : 'h-4 w-4'}`} />
                {!isMobile && <span className="ml-1 font-medium">Déconnexion</span>}
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/auth')}
                className={`bg-gold-400/90 hover:bg-gold-500/90 text-forest-800 border-gold-500 backdrop-blur-sm ${
                  isMobile ? 'px-2' : 'px-3'
                }`}
                title="Se connecter"
              >
                <LogIn className={`${isMobile ? 'h-4 w-4' : 'h-4 w-4'}`} />
                {!isMobile && <span className="ml-1 font-medium">Connexion</span>}
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
