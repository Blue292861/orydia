
import React from 'react';
import { Button } from '@/components/ui/button';

type AdminPage = 'admin' | 'shop-admin' | 'achievement-admin' | 'orders-admin' | 'reading-stats-admin' | 'audiobook-admin';

interface AdminNavProps {
  currentPage: AdminPage;
  onNavigate: (page: AdminPage) => void;
}

const navItems: { id: AdminPage; label: string }[] = [
  { id: 'admin', label: 'Gestion Livres' },
  { id: 'audiobook-admin', label: 'Gestion Audiobooks' },
  { id: 'shop-admin', label: 'Gestion Boutique' },
  { id: 'achievement-admin', label: 'Gestion Succès' },
  { id: 'orders-admin', label: 'Commandes' },
  { id: 'reading-stats-admin', label: 'Statistiques Lecture' },
];

export const AdminNav: React.FC<AdminNavProps> = ({ currentPage, onNavigate }) => {
  return (
    <div className="flex flex-wrap gap-2 mb-6 border-b pb-4">
      {navItems.map((item) => (
        <Button
          key={item.id}
          variant={currentPage === item.id ? 'default' : 'outline'}
          onClick={() => onNavigate(item.id)}
        >
          {item.label}
        </Button>
      ))}
    </div>
  );
};
