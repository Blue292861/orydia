
import React from 'react';
import { ShopItem } from '@/types/ShopItem';
import { ShopItemCard } from '@/components/ShopItemCard';

interface ShopItemGridProps {
  items: ShopItem[];
  onItemClick: (item: ShopItem) => void;
}

export const ShopItemGrid: React.FC<ShopItemGridProps> = ({ items, onItemClick }) => {
  if (items.length === 0) {
    return (
      <div className="text-center py-12 border rounded-lg border-slate-600 bg-slate-900/30">
        <p className="text-slate-400 text-lg">Aucun objet trouvé</p>
        <p className="text-slate-500 text-sm mt-2">Essayez de modifier vos critères de recherche</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
      {items.map((item) => (
        <ShopItemCard key={item.id} item={item} onItemClick={onItemClick} />
      ))}
    </div>
  );
};
