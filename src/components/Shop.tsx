import React, { useState } from 'react';
import { ShopItem } from '@/types/ShopItem';
import { ShopHeader } from '@/components/ShopHeader';
import { ShopFilters } from '@/components/ShopFilters';
import { ShopItemGrid } from '@/components/ShopItemGrid';
import { ShopItemDetail } from '@/components/ShopItemDetail';
import { Button } from '@/components/ui/button';
import { ShoppingBag } from 'lucide-react';

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
      
      {/* Bouton Oryshop */}
      <div className="px-4">
        <Button
          onClick={() => window.open('https://oryshop.neptune-group.fr/', '_blank', 'noopener,noreferrer')}
          className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-bold py-6 px-8 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 flex items-center justify-center gap-3 text-lg"
        >
          <ShoppingBag className="w-6 h-6" />
          <span>Ouvrir l'Oryshop</span>
          <span className="text-xs bg-white/20 px-2 py-1 rounded-full">Nouveau !</span>
        </Button>
      </div>
      
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
