
import React from 'react';
import { ShopItem } from '@/types/ShopItem';
import { ShopItemCard } from '@/components/ShopItemCard';
import { useResponsive } from '@/hooks/useResponsive';

interface ShopItemGridProps {
  items: ShopItem[];
}

export const ShopItemGrid: React.FC<ShopItemGridProps> = ({ items }) => {
  const { isMobile, isTablet } = useResponsive();

  const getGridCols = () => {
    if (isMobile) return 'grid-cols-1';
    if (isTablet) return 'grid-cols-2';
    return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';
  };

  if (items.length === 0) {
    return (
      <div className="text-center py-16">
        <div className={`bg-slate-800/50 border border-slate-600 rounded-lg max-w-md mx-auto ${
          isMobile ? 'p-6' : 'p-8'
        }`}>
          <div className={`mb-4 ${isMobile ? 'text-4xl' : 'text-6xl'}`}>🏺</div>
          <p className={`text-slate-300 ${isMobile ? 'text-base' : 'text-lg'}`}>
            Les étagères du marchand sont vides...
          </p>
          <p className={`text-slate-400 mt-2 ${isMobile ? 'text-sm' : 'text-base'}`}>
            Aucun objet ne correspond à vos filtres. Essayez de les modifier !
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`grid gap-4 ${getGridCols()} ${
      isMobile ? 'gap-3' : isTablet ? 'gap-4' : 'gap-6'
    }`}>
      {items.map((item) => (
        <ShopItemCard key={item.id} item={item} />
      ))}
    </div>
  );
};
