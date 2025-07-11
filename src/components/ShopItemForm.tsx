
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
    // Simple update without immediate validation to allow typing
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = (): boolean => {
    // Validate text length for string fields
    if (typeof formData.name === 'string') {
      if (!validateTextLength(formData.name, 100)) {
        toast({
          title: "Input too long",
          description: "Le nom doit faire moins de 100 caractères.",
          variant: "destructive"
        });
        return false;
      }
    }

    if (typeof formData.seller === 'string') {
      if (!validateTextLength(formData.seller, 100)) {
        toast({
          title: "Input too long",
          description: "Le nom du vendeur doit faire moins de 100 caractères.",
          variant: "destructive"
        });
        return false;
      }
    }

    if (typeof formData.category === 'string') {
      if (!validateTextLength(formData.category, 50)) {
        toast({
          title: "Input too long",
          description: "La catégorie doit faire moins de 50 caractères.",
          variant: "destructive"
        });
        return false;
      }
    }

    if (typeof formData.description === 'string') {
      if (!validateTextLength(formData.description, 500)) {
        toast({
          title: "Input too long",
          description: "La description doit faire moins de 500 caractères.",
          variant: "destructive"
        });
        return false;
      }
    }

    if (typeof formData.content === 'string' && formData.content) {
      if (!validateTextLength(formData.content, 2000)) {
        toast({
          title: "Input too long",
          description: "Le contenu doit faire moins de 2000 caractères.",
          variant: "destructive"
        });
        return false;
      }
    }

    // Validate price
    if (typeof formData.price === 'number') {
      if (!validatePrice(formData.price)) {
        toast({
          title: "Invalid price",
          description: "Le prix doit être un nombre entier positif jusqu'à 1,000,000.",
          variant: "destructive"
        });
        return false;
      }
    }

    // Validate URL
    if (typeof formData.imageUrl === 'string' && formData.imageUrl) {
      if (!validateUrl(formData.imageUrl)) {
        toast({
          title: "Invalid URL",
          description: "Veuillez entrer une URL d'image valide.",
          variant: "destructive"
        });
        return false;
      }
    }

    if (!formData.name?.trim()) {
      toast({
        title: "Validation Error",
        description: "Le nom de l'objet est requis.",
        variant: "destructive"
      });
      return false;
    }

    if (!formData.seller?.trim()) {
      toast({
        title: "Validation Error",
        description: "Le nom du vendeur est requis.",
        variant: "destructive"
      });
      return false;
    }

    if (!formData.category?.trim()) {
      toast({
        title: "Validation Error",
        description: "La catégorie est requise.",
        variant: "destructive"
      });
      return false;
    }

    if (!formData.description?.trim()) {
      toast({
        title: "Validation Error",
        description: "La description est requise.",
        variant: "destructive"
      });
      return false;
    }

    if (!formData.imageUrl?.trim()) {
      toast({
        title: "Validation Error",
        description: "L'URL de l'image est requise.",
        variant: "destructive"
      });
      return false;
    }

    if (formData.price <= 0) {
      toast({
        title: "Validation Error",
        description: "Le prix doit être supérieur à 0.",
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
