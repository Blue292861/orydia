
import React from 'react';
import { Button } from '@/components/ui/button';
import { Home, Search, ShoppingCart, User, Star } from 'lucide-react';

interface NavigationFooterProps {
  onNavigate: (page: 'library' | 'search' | 'shop' | 'profile' | 'premium') => void;
}

export const NavigationFooter: React.FC<NavigationFooterProps> = ({ onNavigate }) => {
  const navItems = [
    { id: 'library' as const, icon: Home, label: 'Accueil' },
    { id: 'search' as const, icon: Search, label: 'Recherche' },
    { id: 'shop' as const, icon: ShoppingCart, label: 'Boutique' },
    { id: 'profile' as const, icon: User, label: 'Profil' },
    { id: 'premium' as const, icon: Star, label: 'Premium' },
  ];

  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-background border-t border-border">
      <div className="container mx-auto px-4">
        <div className="flex justify-around items-center py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            
            return (
              <Button
                key={item.id}
                variant="ghost"
                size="sm"
                onClick={() => onNavigate(item.id)}
                className="flex flex-col items-center gap-1 h-auto py-2 px-3 text-muted-foreground hover:text-primary"
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs">{item.label}</span>
              </Button>
            );
          })}
        </div>
      </div>
    </footer>
  );
};
