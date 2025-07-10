
import React, { useState } from 'react';
import { ShopItem } from '@/types/ShopItem';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { FileImport } from '@/components/FileImport';
import { sanitizeText, validateTextLength, validateUrl, validatePrice } from '@/utils/security';
import { useToast } from '@/hooks/use-toast';

interface ShopItemFormProps {
  initialItem: ShopItem;
  onSubmit: (item: ShopItem) => void;
}

export const ShopItemForm: React.FC<ShopItemFormProps> = ({ initialItem, onSubmit }) => {
  const [formData, setFormData] = useState<ShopItem>(initialItem);
  const { toast } = useToast();

  const handleChange = (field: keyof ShopItem, value: string | number) => {
    // Validate text length for string fields
    if (typeof value === 'string') {
      let maxLength = 500; // default for description
      if (field === 'name') maxLength = 100;
      else if (field === 'category') maxLength = 50;
      else if (field === 'seller') maxLength = 100;
      else if (field === 'content') maxLength = 2000; // larger limit for content
      
      if (!validateTextLength(value, maxLength)) {
        toast({
          title: "Input too long",
          description: `${field} must be less than ${maxLength} characters.`,
          variant: "destructive"
        });
        return;
      }
    }

    // Validate price
    if (field === 'price' && typeof value === 'number') {
      if (!validatePrice(value)) {
        toast({
          title: "Invalid price",
          description: "Price must be a positive integer up to 1,000,000.",
          variant: "destructive"
        });
        return;
      }
    }

    // Validate URL
    if (field === 'imageUrl' && typeof value === 'string' && value) {
      if (!validateUrl(value)) {
        toast({
          title: "Invalid URL",
          description: "Please enter a valid image URL.",
          variant: "destructive"
        });
        return;
      }
    }

    const sanitizedValue = typeof value === 'string' ? sanitizeText(value) : value;
    
    setFormData(prev => ({
      ...prev,
      [field]: sanitizedValue
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.name?.trim()) {
      toast({
        title: "Validation Error",
        description: "Item name is required.",
        variant: "destructive"
      });
      return false;
    }

    if (!formData.seller?.trim()) {
      toast({
        title: "Validation Error",
        description: "Seller name is required.",
        variant: "destructive"
      });
      return false;
    }

    if (!formData.category?.trim()) {
      toast({
        title: "Validation Error",
        description: "Category is required.",
        variant: "destructive"
      });
      return false;
    }

    if (!formData.description?.trim()) {
      toast({
        title: "Validation Error",
        description: "Description is required.",
        variant: "destructive"
      });
      return false;
    }

    if (!formData.imageUrl?.trim()) {
      toast({
        title: "Validation Error",
        description: "Image URL is required.",
        variant: "destructive"
      });
      return false;
    }

    if (formData.price <= 0) {
      toast({
        title: "Validation Error",
        description: "Price must be greater than 0.",
        variant: "destructive"
      });
      return false;
    }

    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
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
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Nom de l'objet</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          maxLength={100}
          required
        />
      </div>

      <div>
        <Label htmlFor="seller">Nom du vendeur</Label>
        <Input
          id="seller"
          value={formData.seller}
          onChange={(e) => handleChange('seller', e.target.value)}
          maxLength={100}
          required
        />
      </div>

      <div>
        <Label htmlFor="category">Catégorie</Label>
        <Input
          id="category"
          value={formData.category}
          onChange={(e) => handleChange('category', e.target.value)}
          maxLength={50}
          required
        />
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
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
          onChange={(e) => handleChange('content', e.target.value)}
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
