
import React from 'react';
import { ShopItem } from '@/types/ShopItem';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Shield } from 'lucide-react';

interface ShopItemBasicFieldsProps {
  formData: ShopItem;
  onFieldChange: (field: keyof ShopItem, value: string | number) => void;
}

export const ShopItemBasicFields: React.FC<ShopItemBasicFieldsProps> = ({ formData, onFieldChange }) => {
  return (
    <>
      <div>
        <Label htmlFor="name">Nom de l'objet</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => onFieldChange('name', e.target.value)}
          maxLength={100}
          required
        />
      </div>

      <div>
        <Label htmlFor="seller">Nom du vendeur</Label>
        <Input
          id="seller"
          value={formData.seller}
          onChange={(e) => onFieldChange('seller', e.target.value)}
          maxLength={100}
          required
        />
      </div>

      <div>
        <Label htmlFor="category">Catégorie</Label>
        <Input
          id="category"
          value={formData.category}
          onChange={(e) => onFieldChange('category', e.target.value)}
          maxLength={50}
          required
        />
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => onFieldChange('description', e.target.value)}
          maxLength={500}
          required
          rows={3}
        />
      </div>

      <div>
        <Label htmlFor="content">Contenu détaillé</Label>
        <Textarea
          id="content"
          value={formData.content || ''}
          onChange={(e) => onFieldChange('content', e.target.value)}
          maxLength={2000}
          placeholder="Contenu détaillé de l'objet (optionnel)"
          rows={5}
        />
      </div>

      <div>
        <Label htmlFor="price">Prix (Points)</Label>
        <Input
          id="price"
          type="number"
          min="1"
          max="1000000"
          value={formData.price}
          onChange={(e) => onFieldChange('price', parseInt(e.target.value) || 0)}
          required
        />
      </div>

      <div>
        <Label htmlFor="requiredLevel" className="flex items-center gap-2">
          <Shield className="h-4 w-4" />
          Niveau requis (optionnel)
        </Label>
        <Input
          id="requiredLevel"
          type="number"
          min="1"
          max="50"
          placeholder="1"
          value={formData.requiredLevel || ''}
          onChange={(e) => onFieldChange('requiredLevel', e.target.value ? parseInt(e.target.value) : undefined)}
        />
        <p className="text-xs text-muted-foreground mt-1">
          Niveau minimum pour acheter cet article (1-50)
        </p>
      </div>
    </>
  );
};
