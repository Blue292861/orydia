
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useResponsive } from '@/hooks/useResponsive';

interface ShopFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedCategory: string;
  onCategoryChange: (value: string) => void;
  categories: string[];
  sortBy: string;
  onSortChange: (value: string) => void;
}

export const ShopFilters: React.FC<ShopFiltersProps> = ({
  searchTerm,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  categories,
  sortBy,
  onSortChange,
}) => {
  const { isMobile, isTablet } = useResponsive();

  return (
    <div className={`bg-slate-800/50 border border-slate-700 rounded-lg mb-8 ${
      isMobile ? 'p-3' : 'p-4'
    }`}>
      <h3 className={`font-semibold text-amber-200 mb-3 ${
        isMobile ? 'text-base' : 'text-lg'
      }`}>
        Filtres et recherche :
      </h3>
      <div className={`grid gap-3 ${
        isMobile ? 'grid-cols-1' : isTablet ? 'grid-cols-2' : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-4'
      }`}>
        <div>
          <Label htmlFor="search" className={`font-medium text-slate-300 ${
            isMobile ? 'text-xs' : 'text-sm'
          }`}>
            Rechercher
          </Label>
          <Input
            id="search"
            type="text"
            placeholder="Nom, description, vendeur..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className={`bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 ${
              isMobile ? 'text-xs h-8' : 'text-sm'
            }`}
          />
        </div>
        
        <div>
          <Label htmlFor="category-filter" className={`font-medium text-slate-300 ${
            isMobile ? 'text-xs' : 'text-sm'
          }`}>
            Catégorie
          </Label>
          <Select value={selectedCategory} onValueChange={onCategoryChange}>
            <SelectTrigger id="category-filter" className={`bg-slate-700 border-slate-600 text-white ${
              isMobile ? 'text-xs h-8' : 'text-sm'
            }`}>
              <SelectValue placeholder="Toutes les catégories" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-600 text-white">
              <SelectItem value="all">Toutes les catégories</SelectItem>
              {categories.map(category => (
                <SelectItem key={category} value={category}>{category}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="sort-filter" className={`font-medium text-slate-300 ${
            isMobile ? 'text-xs' : 'text-sm'
          }`}>
            Trier par
          </Label>
          <Select value={sortBy} onValueChange={onSortChange}>
            <SelectTrigger id="sort-filter" className={`bg-slate-700 border-slate-600 text-white ${
              isMobile ? 'text-xs h-8' : 'text-sm'
            }`}>
              <SelectValue placeholder="Trier par" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-600 text-white">
              <SelectItem value="name">Nom (A-Z)</SelectItem>
              <SelectItem value="price-asc">Prix (croissant)</SelectItem>
              <SelectItem value="price-desc">Prix (décroissant)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};
