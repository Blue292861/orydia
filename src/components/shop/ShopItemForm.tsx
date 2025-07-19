
import React, { useState } from 'react';
import { ShopItem } from '@/types/ShopItem';
import { Button } from '@/components/ui/button';
import { ShopItemBasicFields } from './ShopItemBasicFields';
import { ShopItemImageField } from './ShopItemImageField';
import { validateShopItemForm } from './ShopItemFormValidation';
import { sanitizeText } from '@/utils/security';
import { useToast } from '@/hooks/use-toast';

interface ShopItemFormProps {
  initialItem: ShopItem;
  onSubmit: (item: ShopItem) => void;
}

export const ShopItemForm: React.FC<ShopItemFormProps> = ({ initialItem, onSubmit }) => {
  const [formData, setFormData] = useState<ShopItem>(initialItem);
  const { toast } = useToast();

  const handleChange = (field: keyof ShopItem, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationErrors = validateShopItemForm(formData);
    
    if (validationErrors.length > 0) {
      const firstError = validationErrors[0];
      toast({
        title: "Validation Error",
        description: firstError.message,
        variant: "destructive"
      });
      return;
    }

    // Final sanitization before submission
    const sanitizedData: ShopItem = {
      ...formData,
      name: sanitizeText(formData.name),
      seller: sanitizeText(formData.seller),
      category: sanitizeText(formData.category),
      description: sanitizeText(formData.description),
      content: formData.content ? sanitizeText(formData.content) : undefined,
      imageUrl: sanitizeText(formData.imageUrl)
    };

    onSubmit(sanitizedData);
  };

  return (
    <div className="h-full max-h-[80vh] overflow-y-auto pr-2">
      <form onSubmit={handleSubmit} className="space-y-4">
      <ShopItemBasicFields formData={formData} onFieldChange={handleChange} />
      <ShopItemImageField formData={formData} onFieldChange={handleChange} />

      <Button type="submit" className="w-full">
        {initialItem.id ? "Mettre à jour l'objet" : "Ajouter l'objet"}
      </Button>
      </form>
    </div>
  );
};
