
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useResponsive } from '@/hooks/useResponsive';
import { useAuth } from '@/contexts/AuthContext';
import { AuthRequiredDialog } from './AuthRequiredDialog';
import { cn } from '@/lib/utils';
import { hasUnclaimedGifts } from '@/services/giftService';

interface NavigationFooterProps {
  onNavigate: (page: 'library' | 'search' | 'guild' | 'shop' | 'profile') => void;
  highlightedTab?: 'library' | 'search' | 'guild' | 'shop' | 'profile' | null;
}

export const NavigationFooter: React.FC<NavigationFooterProps> = ({ onNavigate, highlightedTab }) => {
  const { isMobile, isTablet } = useResponsive();
  const { user } = useAuth();
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [authMessage, setAuthMessage] = useState('');
  const [hasGifts, setHasGifts] = useState(false);

  useEffect(() => {
    if (user) {
      hasUnclaimedGifts().then(setHasGifts).catch(() => setHasGifts(false));
    } else {
      setHasGifts(false);
    }
  }, [user]);
  
  const navItems = [
    { id: 'library' as const, icon: '/lovable-uploads/b50e70c6-4063-405e-8340-84ade6817368.png', label: 'Bibliothèque' },
    { id: 'search' as const, icon: '/lovable-uploads/912c9a06-adc9-4d07-ae4d-d05115270e97.png', label: 'Rechercher' },
    { id: 'guild' as const, icon: '/lovable-uploads/e4ca1c2e-eeba-4149-b13f-50ac08071650.png', label: 'Guilde' },
    { id: 'shop' as const, icon: '/lovable-uploads/9318a8b9-7fe4-43c9-8aea-a49486e5baac.png', label: 'Boutique' },
    { id: 'profile' as const, icon: '/lovable-uploads/fcea3651-a91a-445a-b535-d6b02cde2864.png', label: 'Mon Profil' },
  ];

  const getIconSize = () => {
    if (isMobile) return 'h-5 w-5';
    if (isTablet) return 'h-6 w-6';
    return 'h-6 w-6 sm:h-7 sm:w-7';
  };

  const getTextSize = () => {
    if (isMobile) return 'text-[7px]';
    if (isTablet) return 'text-[8px]';
    return 'text-[8px] sm:text-[9px] md:text-[10px]';
  };

  const getPadding = () => {
    if (isMobile) return 'px-1 py-1';
    if (isTablet) return 'px-1 py-1';
    return 'px-1 py-1';
  };

  const handleNavigation = (page: 'library' | 'search' | 'guild' | 'shop' | 'profile') => {
    // Vérifier si l'authentification est requise
    if (!user && (page === 'profile' || page === 'guild')) {
      setAuthMessage(page === 'profile' 
        ? "Pour accéder à votre profil, vous devez vous connecter."
        : "Pour accéder aux guildes, vous devez vous connecter.");
      setShowAuthDialog(true);
      return;
    }
    onNavigate(page);
  };

  return (
    <>
    <footer className="fixed bottom-0 left-0 right-0 z-40 pb-safe-bottom">
      {/* Nature background with organic elements */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-t from-forest-700 via-forest-600 to-forest-500"></div>
        <div className="absolute inset-0 wood-texture opacity-20"></div>
        
        {/* Decorative natural border */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold-400 to-transparent"></div>
        
        <div className="relative z-10 w-full max-w-full overflow-hidden">
          <div className={`flex justify-around items-center backdrop-blur-sm ${getPadding()}`}>
            {navItems.map((item, index) => {
              return (
                <Button
                  key={item.id}
                  variant="ghost"
                  size="sm"
                  onClick={() => handleNavigation(item.id)}
                  className={cn(
                    "group flex flex-col items-center justify-center gap-0.5 h-auto py-2 px-1 text-wood-100 hover:text-gold-300 hover:bg-forest-800/50 min-w-0 flex-1 max-w-none transition-all duration-300 rounded-lg relative overflow-hidden",
                    highlightedTab === item.id && "ring-4 ring-gold-400 shadow-2xl scale-110 z-[10000] bg-forest-700/80"
                  )}
                >
                  {/* Hover effect background */}
                  <div className="absolute inset-0 bg-gradient-to-t from-gold-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  <div className="relative z-10 flex flex-col items-center gap-0.5">
                    <div className={`relative rounded-lg p-1 group-hover:bg-gold-400/20 transition-colors duration-300 ${
                      index % 2 === 0 ? 'gentle-float' : 'leaf-dance'
                    }`}>
                      <img 
                        src={item.icon} 
                        alt={item.label} 
                        className={`object-contain filter brightness-90 group-hover:brightness-110 transition-all duration-300 ${getIconSize()}`}
                      />
                      {/* Red dot for unclaimed gifts on profile tab */}
                      {item.id === 'profile' && hasGifts && (
                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse border-2 border-forest-600" />
                      )}
                    </div>
                    <span className={`font-nature font-medium leading-none text-center truncate max-w-full transition-colors duration-300 group-hover:text-gold-200 ${getTextSize()}`}>
                      {isMobile && item.label.length > 8 ? item.label.substring(0, 8) + '...' : item.label}
                    </span>
                  </div>
                  
                  {/* Decorative elements */}
                  <div className="absolute top-1 right-1 w-1 h-1 bg-gold-400 rounded-full opacity-0 group-hover:opacity-60 transition-opacity duration-300"></div>
                </Button>
              );
            })}
          </div>
        </div>
      </div>
    </footer>

    {/* Dialog d'authentification requise */}
    <AuthRequiredDialog
      open={showAuthDialog}
      onOpenChange={setShowAuthDialog}
      message={authMessage}
    />
    </>
  );
};
