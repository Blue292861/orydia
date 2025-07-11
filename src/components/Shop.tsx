
import React, { useState } from 'react';
import { ShopItem } from '@/types/ShopItem';
import { ShopHeader } from '@/components/ShopHeader';
import { ShopFilters } from '@/components/ShopFilters';
import { ShopItemGrid } from '@/components/ShopItemGrid';
import { ShopItemDetail } from '@/components/ShopItemDetail';

interface ShopProps {
  shopItems: ShopItem[];
}

export const Shop: React.FC<ShopProps> = ({ shopItems }) => {
  const [selectedItem, setSelectedItem] = useState<ShopItem | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('name');

  const categories = Array.from(new Set(shopItems.map(item => item.category)));

  const filteredItems = shopItems
    .filter(item => 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.seller.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(item => selectedCategory === 'all' || item.category === selectedCategory)
    .sort((a, b) => {
      switch (sortBy) {
        case 'price-asc':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        case 'name':
        default:
          return a.name.localeCompare(b.name);
      }
    });

  const handleItemClick = (item: ShopItem) => {
    setSelectedItem(item);
  };

  const handleCloseDetail = () => {
    setSelectedItem(null);
  };

  return (
    <div className="space-y-6">
      <ShopHeader />
      
      <ShopFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        categories={categories}
        sortBy={sortBy}
        onSortChange={setSortBy}
      />

      <ShopItemGrid items={filteredItems} onItemClick={handleItemClick} />

      {selectedItem && (
        <ShopItemDetail item={selectedItem} onClose={handleCloseDetail} />
      )}
    </div>
  );
};
