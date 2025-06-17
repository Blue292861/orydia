
import React from 'react';
import { Button } from '@/components/ui/button';

interface NavigationFooterProps {
  onNavigate: (page: 'library' | 'search' | 'shop' | 'profile') => void;
}

export const NavigationFooter: React.FC<NavigationFooterProps> = ({ onNavigate }) => {
  const navItems = [
    { id: 'library' as const, icon: '/lovable-uploads/b50e70c6-4063-405e-8340-84ade6817368.png', label: 'Bibliothèque' },
    { id: 'search' as const, icon: '/lovable-uploads/912c9a06-adc9-4d07-ae4d-d05115270e97.png', label: 'Rechercher' },
    { id: 'shop' as const, icon: '/lovable-uploads/9318a8b9-7fe4-43c9-8aea-a49486e5baac.png', label: 'Boutique' },
    { id: 'profile' as const, icon: '/lovable-uploads/fcea3651-a91a-445a-b535-d6b02cde2864.png', label: 'Mon Profil' },
  ];

  return (
    <footer className="fixed bottom-2 left-2 right-2 bg-wood-300 border border-wood-400 rounded-xl shadow-lg transition-all duration-300 z-40">
      <div className="mx-auto px-1">
        <div className="flex justify-around items-center py-1">
          {navItems.map((item) => {
            return (
              <Button
                key={item.id}
                variant="ghost"
                size="sm"
                onClick={() => onNavigate(item.id)}
                className="flex flex-col items-center gap-1 h-auto py-1.5 px-2 text-wood-800 hover:text-primary hover:bg-wood-400/50 min-w-0"
              >
                <img src={item.icon} alt={item.label} className="h-8 w-8 sm:h-10 sm:w-10 object-contain" />
                <span className="text-[10px] sm:text-xs font-medium leading-none text-center">{item.label}</span>
              </Button>
            );
          })}
        </div>
      </div>
    </footer>
  );
};
