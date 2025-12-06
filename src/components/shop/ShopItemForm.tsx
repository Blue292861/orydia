
import React, { useState } from 'react';
import { ShopItem } from '@/types/ShopItem';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ShopItemBasicFields } from './ShopItemBasicFields';
import { ShopItemImageField } from './ShopItemImageField';
import { validateShopItemForm } from './ShopItemFormValidation';
import { sanitizeText, sanitizeTextWithSpaces } from '@/utils/security';
import { useToast } from '@/hooks/use-toast';

interface ShopItemFormProps {
  initialItem: ShopItem;
  onSubmit: (item: ShopItem) => void;
}

export const ShopItemForm: React.FC<ShopItemFormProps> = ({ initialItem, onSubmit }) => {
  const [formData, setFormData] = useState<ShopItem>(initialItem);
  const { toast } = useToast();

  const handleChange = (field: keyof ShopItem, value: string | number | undefined) => {
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
        name: sanitizeTextWithSpaces(formData.name),
        seller: sanitizeTextWithSpaces(formData.seller),
        category: sanitizeTextWithSpaces(formData.category),
        description: sanitizeTextWithSpaces(formData.description),
        content: formData.content ? sanitizeTextWithSpaces(formData.content) : undefined,
        imageUrl: sanitizeText(formData.imageUrl),
        shopType: formData.shopType
      };

    onSubmit(sanitizedData);
  };

  return (
    <ScrollArea className="h-full max-h-[80vh]">
      <div className="pr-4">
        <form onSubmit={handleSubmit} className="space-y-4">
      <ShopItemBasicFields formData={formData} onFieldChange={handleChange} />
      <ShopItemImageField formData={formData} onFieldChange={handleChange} />

      <Button type="submit" className="w-full">
        {initialItem.id ? "Mettre à jour l'objet" : "Ajouter l'objet"}
        </Button>
        </form>
      </div>
    </ScrollArea>
  );
};
