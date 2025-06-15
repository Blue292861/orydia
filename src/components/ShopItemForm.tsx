
import React, { useState } from 'react';
import { ShopItem } from '@/types/ShopItem';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { FileImport } from '@/components/FileImport';

interface ShopItemFormProps {
  initialItem: ShopItem;
  onSubmit: (item: ShopItem) => void;
}

export const ShopItemForm: React.FC<ShopItemFormProps> = ({ initialItem, onSubmit }) => {
  const [formData, setFormData] = useState<ShopItem>(initialItem);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (field: keyof ShopItem, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Nom de l'objet</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          required
        />
      </div>

      <div>
        <Label htmlFor="seller">Nom du vendeur</Label>
        <Input
          id="seller"
          value={formData.seller}
          onChange={(e) => handleChange('seller', e.target.value)}
          required
        />
      </div>

      <div>
        <Label htmlFor="category">Catégorie</Label>
        <Input
          id="category"
          value={formData.category}
          onChange={(e) => handleChange('category', e.target.value)}
          required
        />
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          required
          rows={3}
        />
      </div>

      <div>
        <Label htmlFor="price">Prix (Points)</Label>
        <Input
          id="price"
          type="number"
          min="1"
          value={formData.price}
          onChange={(e) => handleChange('price', parseInt(e.target.value) || 0)}
          required
        />
      </div>

      <div>
        <Label htmlFor="imageUrl">Image de l'objet</Label>
        <div className="space-y-2">
            <Input
              id="imageUrl"
              type="text"
              value={formData.imageUrl}
              onChange={(e) => handleChange('imageUrl', e.target.value)}
              placeholder="URL de l'image ou importer un fichier"
              required
            />
            <FileImport type="image" onFileImport={(dataUrl) => handleChange('imageUrl', dataUrl)} />
        </div>
        {formData.imageUrl && (
          <img src={formData.imageUrl} alt="Aperçu" className="mt-2 h-20 w-20 object-cover rounded-md" />
        )}
      </div>

      <Button type="submit" className="w-full">
        {initialItem.id ? "Mettre à jour l'objet" : "Ajouter l'objet"}
      </Button>
    </form>
  );
};
