
import React from 'react';
import { Button } from '@/components/ui/button';

interface NavigationFooterProps {
  onNavigate: (page: 'library' | 'search' | 'shop' | 'profile' | 'premium') => void;
}

export const NavigationFooter: React.FC<NavigationFooterProps> = ({ onNavigate }) => {
  const navItems = [
    { id: 'library' as const, icon: '/lovable-uploads/b50e70c6-4063-405e-8340-84ade6817368.png', label: 'Accueil' },
    { id: 'search' as const, icon: '/lovable-uploads/912c9a06-adc9-4d07-ae4d-d05115270e97.png', label: 'Recherche' },
    { id: 'shop' as const, icon: '/lovable-uploads/9318a8b9-7fe4-43c9-8aea-a49486e5baac.png', label: 'Boutique' },
    { id: 'profile' as const, icon: '/lovable-uploads/fcea3651-a91a-445a-b535-d6b02cde2864.png', label: 'Profil' },
    { id: 'premium' as const, icon: '/lovable-uploads/4cdcc1d9-fc57-4952-8ec9-3648454f9852.png', label: 'Premium' },
  ];

  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-background border-t border-border">
      <div className="container mx-auto px-4">
        <div className="flex justify-around items-center py-2">
          {navItems.map((item) => {
            return (
              <Button
                key={item.id}
                variant="ghost"
                size="sm"
                onClick={() => onNavigate(item.id)}
                className="flex flex-col items-center gap-1 h-auto py-2 px-3 text-muted-foreground hover:text-primary"
              >
                <img src={item.icon} alt={item.label} className="h-5 w-5 object-contain" />
                <span className="text-xs">{item.label}</span>
              </Button>
            );
          })}
        </div>
      </div>
    </footer>
  );
};
