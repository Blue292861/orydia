
import React from 'react';
import { Button } from '@/components/ui/button';
import { Book, ShoppingBag, Trophy, Package, BarChart3, Headphones, Settings } from 'lucide-react';

type AdminPage = 'admin' | 'shop-admin' | 'achievement-admin' | 'orders-admin' | 'reading-stats-admin' | 'audiobook-admin' | 'form-config-admin';

interface AdminNavProps {
  currentPage: AdminPage;
  onNavigate: (page: AdminPage) => void;
}

export const AdminNav: React.FC<AdminNavProps> = ({ currentPage, onNavigate }) => {
  return (
    <div className="bg-muted/20 p-4 rounded-lg mb-6">
      <div className="flex flex-wrap gap-2">
        <Button
          variant={currentPage === 'admin' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onNavigate('admin')}
          className="flex items-center gap-2"
        >
          <Book className="h-4 w-4" />
          Livres
        </Button>
        
        <Button
          variant={currentPage === 'audiobook-admin' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onNavigate('audiobook-admin')}
          className="flex items-center gap-2"
        >
          <Headphones className="h-4 w-4" />
          Livres Audio
        </Button>
        
        <Button
          variant={currentPage === 'shop-admin' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onNavigate('shop-admin')}
          className="flex items-center gap-2"
        >
          <ShoppingBag className="h-4 w-4" />
          Boutique
        </Button>
        
        <Button
          variant={currentPage === 'achievement-admin' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onNavigate('achievement-admin')}
          className="flex items-center gap-2"
        >
          <Trophy className="h-4 w-4" />
          Succès
        </Button>
        
        <Button
          variant={currentPage === 'orders-admin' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onNavigate('orders-admin')}
          className="flex items-center gap-2"
        >
          <Package className="h-4 w-4" />
          Commandes
        </Button>
        
        <Button
          variant={currentPage === 'reading-stats-admin' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onNavigate('reading-stats-admin')}
          className="flex items-center gap-2"
        >
          <BarChart3 className="h-4 w-4" />
          Statistiques
        </Button>

        <Button
          variant={currentPage === 'form-config-admin' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onNavigate('form-config-admin')}
          className="flex items-center gap-2"
        >
          <Settings className="h-4 w-4" />
          Formulaires
        </Button>
      </div>
    </div>
  );
};
