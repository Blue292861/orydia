
import React from 'react';
import { Button } from '@/components/ui/button';
import { Home, Search, ShoppingCart, User, Star } from 'lucide-react';

interface NavigationFooterProps {
  currentView: 'home' | 'search' | 'shop' | 'profile' | 'premium';
  onNavigate: (view: 'home' | 'search' | 'shop' | 'profile' | 'premium') => void;
  isAdmin: boolean;
}

export const NavigationFooter: React.FC<NavigationFooterProps> = ({ 
  currentView, 
  onNavigate,
  isAdmin 
}) => {
  if (isAdmin) return null; // Don't show footer for admin view

  const navItems = [
    { id: 'home' as const, icon: Home, label: 'Accueil' },
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
            const isActive = currentView === item.id;
            
            return (
              <Button
                key={item.id}
                variant="ghost"
                size="sm"
                onClick={() => onNavigate(item.id)}
                className={`flex flex-col items-center gap-1 h-auto py-2 px-3 ${
                  isActive ? 'text-primary' : 'text-muted-foreground'
                }`}
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
