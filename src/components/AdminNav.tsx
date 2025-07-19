
import React from 'react';
import { Button } from '@/components/ui/button';
import { useResponsive } from '@/hooks/useResponsive';
import { BookOpen, BarChart, Package, Trophy, ShoppingCart, Headphones, Coins, Key, Gamepad2 } from 'lucide-react';

type AdminPage = 'admin' | 'shop-admin' | 'achievement-admin' | 'orders-admin' | 'reading-stats-admin' | 'audiobook-admin' | 'game-admin' | 'points-admin' | 'api-keys-admin';

interface AdminNavProps {
  currentPage: AdminPage;
  onNavigate: (page: AdminPage) => void;
}

const navItems: { id: AdminPage; label: string; shortLabel?: string }[] = [
  { id: 'admin', label: 'Gestion Livres', shortLabel: 'Livres' },
  { id: 'audiobook-admin', label: 'Gestion Audiobooks', shortLabel: 'Audio' },
  { id: 'game-admin', label: 'Gestion Jeux', shortLabel: 'Jeux' },
  { id: 'shop-admin', label: 'Gestion Boutique', shortLabel: 'Boutique' },
  { id: 'achievement-admin', label: 'Gestion Succès', shortLabel: 'Succès' },
  { id: 'orders-admin', label: 'Commandes', shortLabel: 'Commandes' },
  { id: 'reading-stats-admin', label: 'Statistiques Lecture', shortLabel: 'Stats' },
  { id: 'points-admin', label: 'Attribution Points', shortLabel: 'Points' },
  { id: 'api-keys-admin', label: 'Clés API', shortLabel: 'API' },
];

export const AdminNav: React.FC<AdminNavProps> = ({ currentPage, onNavigate }) => {
  const { isMobile, isTablet } = useResponsive();

  return (
    <div className={`${isMobile ? 'mb-4 pb-3' : 'mb-6 pb-4'} border-b`}>
      <div className={`${
        isMobile 
          ? 'grid grid-cols-2 gap-2' 
          : isTablet 
            ? 'flex flex-wrap gap-2' 
            : 'flex flex-wrap gap-2'
      }`}>
        {navItems.map((item) => (
          <Button
            key={item.id}
            variant={currentPage === item.id ? 'default' : 'outline'}
            onClick={() => onNavigate(item.id)}
            className={`${
              isMobile 
                ? 'text-xs px-2 py-1 h-auto min-h-[32px]' 
                : isTablet 
                  ? 'text-sm' 
                  : ''
            }`}
          >
            {isMobile && item.shortLabel ? item.shortLabel : item.label}
          </Button>
        ))}
      </div>
    </div>
  );
};
