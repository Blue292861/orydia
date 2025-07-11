
import React from 'react';
import { ShopItem } from '@/types/ShopItem';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileImport } from '@/components/FileImport';

interface ShopItemImageFieldProps {
  formData: ShopItem;
  onFieldChange: (field: keyof ShopItem, value: string | number) => void;
}

export const ShopItemImageField: React.FC<ShopItemImageFieldProps> = ({ formData, onFieldChange }) => {
  return (
    <div>
      <Label htmlFor="imageUrl">Image de l'objet</Label>
      <div className="space-y-2">
        <Input
          id="imageUrl"
          type="text"
          value={formData.imageUrl}
          onChange={(e) => onFieldChange('imageUrl', e.target.value)}
          placeholder="URL de l'image ou importer un fichier"
          required
        />
        <FileImport type="image" onFileImport={(dataUrl) => onFieldChange('imageUrl', dataUrl)} />
      </div>
      {formData.imageUrl && (
        <img src={formData.imageUrl} alt="Aperçu" className="mt-2 h-20 w-20 object-cover rounded-md" />
      )}
    </div>
  );
};
