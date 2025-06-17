
import React from 'react';
import { Button } from '@/components/ui/button';
import { useResponsive } from '@/hooks/useResponsive';

interface NavigationFooterProps {
  onNavigate: (page: 'library' | 'search' | 'shop' | 'profile') => void;
}

export const NavigationFooter: React.FC<NavigationFooterProps> = ({ onNavigate }) => {
  const { isMobile } = useResponsive();
  
  const navItems = [
    { id: 'library' as const, icon: '/lovable-uploads/b50e70c6-4063-405e-8340-84ade6817368.png', label: 'Bibliothèque' },
    { id: 'search' as const, icon: '/lovable-uploads/912c9a06-adc9-4d07-ae4d-d05115270e97.png', label: 'Rechercher' },
    { id: 'shop' as const, icon: '/lovable-uploads/9318a8b9-7fe4-43c9-8aea-a49486e5baac.png', label: 'Boutique' },
    { id: 'profile' as const, icon: '/lovable-uploads/fcea3651-a91a-445a-b535-d6b02cde2864.png', label: 'Mon Profil' },
  ];

  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-wood-300 border-t border-wood-400 shadow-lg z-40 pb-safe-bottom">
      <div className="w-full max-w-full overflow-hidden">
        <div className="flex justify-around items-center px-1 py-1">
          {navItems.map((item) => {
            return (
              <Button
                key={item.id}
                variant="ghost"
                size="sm"
                onClick={() => onNavigate(item.id)}
                className="flex flex-col items-center justify-center gap-0.5 h-auto py-1 px-0.5 text-wood-800 hover:text-primary hover:bg-wood-400/50 min-w-0 flex-1 max-w-none"
              >
                <img 
                  src={item.icon} 
                  alt={item.label} 
                  className={`object-contain ${isMobile ? 'h-5 w-5' : 'h-6 w-6 sm:h-7 sm:w-7'}`}
                />
                <span className={`font-medium leading-none text-center truncate max-w-full ${
                  isMobile ? 'text-[7px]' : 'text-[8px] sm:text-[9px] md:text-[10px]'
                }`}>
                  {isMobile && item.label.length > 8 ? item.label.substring(0, 8) + '...' : item.label}
                </span>
              </Button>
            );
          })}
        </div>
      </div>
    </footer>
  );
};
