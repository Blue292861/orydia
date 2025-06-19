
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useResponsive } from '@/hooks/useResponsive';

interface ShopFiltersProps {
  filters: {
    seller: string;
    category: string;
    affordable: boolean;
  };
  uniqueSellers: string[];
  uniqueCategories: string[];
  onFiltersChange: (filters: { seller?: string; category?: string; affordable?: boolean }) => void;
}

export const ShopFilters: React.FC<ShopFiltersProps> = ({
  filters,
  uniqueSellers,
  uniqueCategories,
  onFiltersChange,
}) => {
  const { isMobile, isTablet } = useResponsive();

  return (
    <div className={`bg-slate-800/50 border border-slate-700 rounded-lg mb-8 ${
      isMobile ? 'p-3' : 'p-4'
    }`}>
      <h3 className={`font-semibold text-amber-200 mb-3 ${
        isMobile ? 'text-base' : 'text-lg'
      }`}>
        Filtres :
      </h3>
      <div className={`grid gap-3 ${
        isMobile ? 'grid-cols-1' : isTablet ? 'grid-cols-2' : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3'
      }`}>
        <div>
          <Label htmlFor="seller-filter" className={`font-medium text-slate-300 ${
            isMobile ? 'text-xs' : 'text-sm'
          }`}>
            Vendeur
          </Label>
          <Select 
            value={filters.seller} 
            onValueChange={seller => onFiltersChange({ seller })}
          >
            <SelectTrigger id="seller-filter" className={`bg-slate-700 border-slate-600 text-white ${
              isMobile ? 'text-xs h-8' : 'text-sm'
            }`}>
              <SelectValue placeholder="Choisir un vendeur" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-600 text-white">
              {uniqueSellers.map(seller => (
                <SelectItem key={seller} value={seller}>{seller}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="category-filter" className={`font-medium text-slate-300 ${
            isMobile ? 'text-xs' : 'text-sm'
          }`}>
            Catégorie
          </Label>
          <Select 
            value={filters.category} 
            onValueChange={category => onFiltersChange({ category })}
          >
            <SelectTrigger id="category-filter" className={`bg-slate-700 border-slate-600 text-white ${
              isMobile ? 'text-xs h-8' : 'text-sm'
            }`}>
              <SelectValue placeholder="Choisir une catégorie" />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-600 text-white">
              {uniqueCategories.map(cat => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className={`flex items-center space-x-2 ${
          isMobile ? 'pt-2' : isTablet ? 'pt-4' : 'pt-6'
        }`}>
          <Switch 
            id="affordable-filter" 
            checked={filters.affordable}
            onCheckedChange={checked => onFiltersChange({ affordable: checked })}
          />
          <Label htmlFor="affordable-filter" className={`text-slate-300 ${
            isMobile ? 'text-xs' : 'text-sm'
          }`}>
            Abordables seulement
          </Label>
        </div>
      </div>
    </div>
  );
};
