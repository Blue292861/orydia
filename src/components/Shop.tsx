
import React, { useState, useMemo } from 'react';
import { ShopItem } from '@/types/ShopItem';
import { useUserStats } from '@/contexts/UserStatsContext';
import { ShopHeader } from '@/components/ShopHeader';
import { ShopFilters } from '@/components/ShopFilters';
import { ShopItemGrid } from '@/components/ShopItemGrid';
import { useResponsive } from '@/hooks/useResponsive';

interface ShopProps {
  shopItems: ShopItem[];
}

export const Shop: React.FC<ShopProps> = ({ shopItems }) => {
  const { userStats } = useUserStats();
  const { isMobile, isTablet } = useResponsive();
  const [filters, setFilters] = useState({
    seller: 'Tous',
    category: 'Toutes',
    affordable: false,
  });

  const handleFiltersChange = (newFilters: { seller?: string; category?: string; affordable?: boolean }) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const { uniqueSellers, uniqueCategories, filteredItems } = useMemo(() => {
    const sellers = ['Tous', ...Array.from(new Set(shopItems.map(item => item.seller)))];
    const categories = ['Toutes', ...Array.from(new Set(shopItems.map(item => item.category)))];

    let items = shopItems;

    if (filters.seller !== 'Tous') {
      items = items.filter(item => item.seller === filters.seller);
    }
    if (filters.category !== 'Toutes') {
      items = items.filter(item => item.category === filters.category);
    }
    if (filters.affordable) {
      items = items.filter(item => userStats.totalPoints >= item.price);
    }

    return { uniqueSellers: sellers, uniqueCategories: categories, filteredItems: items };
  }, [shopItems, filters, userStats.totalPoints]);

  const getContainerPadding = () => {
    if (isMobile) return 'px-2 py-4';
    if (isTablet) return 'px-4 py-6';
    return 'px-4 py-8';
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white max-w-full overflow-x-hidden">
      <ShopHeader />
      
      <div className={`container mx-auto max-w-full ${getContainerPadding()}`}>
        <ShopFilters
          filters={filters}
          uniqueSellers={uniqueSellers}
          uniqueCategories={uniqueCategories}
          onFiltersChange={handleFiltersChange}
        />
        
        <ShopItemGrid items={filteredItems} />
      </div>
    </div>
  );
};
