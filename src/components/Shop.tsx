import React, { useState } from 'react';
import { ShopItem } from '@/types/ShopItem';
import { ShopHeader } from '@/components/ShopHeader';
import { ShopFilters } from '@/components/ShopFilters';
import { ShopItemGrid } from '@/components/ShopItemGrid';
import { ShopItemDetail } from '@/components/ShopItemDetail';
import { TutorialPopup } from '@/components/TutorialPopup';
import { AuthRequiredDialog } from '@/components/AuthRequiredDialog';
import { useAuth } from '@/contexts/AuthContext';

interface ShopProps {
  shopItems: ShopItem[];
}

export const Shop: React.FC<ShopProps> = ({ shopItems }) => {
  const [selectedItem, setSelectedItem] = useState<ShopItem | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const { user } = useAuth();

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
    if (!user) {
      setShowAuthDialog(true);
      return;
    }
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

      {/* Pop-up du tutoriel de la boutique */}
      <TutorialPopup 
        tutorialId="shop"
        title="Bienvenue dans l'emporium du marchand !"
        description="Dépenses tes Tensens honorablement gagnés pour t'offrir de magnifiques cadeaux ou en faire don à une association !"
      />

      {/* Dialog d'authentification requise */}
      <AuthRequiredDialog
        open={showAuthDialog}
        onOpenChange={setShowAuthDialog}
        message="Pour accéder à la boutique, vous devez vous connecter."
      />
    </div>
  );
};
