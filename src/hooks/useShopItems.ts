
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ShopItem } from '@/types/ShopItem';
import { sanitizeText, validateTextLength, validateUrl, validatePrice } from '@/utils/security';

export const useShopItems = () => {
  const [shopItems, setShopItems] = useState<ShopItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const validateShopItem = (item: ShopItem): string[] => {
    const errors: string[] = [];

    if (!item.name || !validateTextLength(item.name, 100)) {
      errors.push('Le nom est requis et doit faire moins de 100 caractères');
    }

    if (!item.description || !validateTextLength(item.description, 500)) {
      errors.push('La description est requise et doit faire moins de 500 caractères');
    }

    if (!validatePrice(item.price)) {
      errors.push('Le prix doit être un nombre entier positif');
    }

    if (!item.imageUrl || !validateUrl(item.imageUrl)) {
      errors.push('URL d\'image invalide');
    }

    if (!item.category || !validateTextLength(item.category, 50)) {
      errors.push('La catégorie est requise et doit faire moins de 50 caractères');
    }

    if (!item.seller || !validateTextLength(item.seller, 100)) {
      errors.push('Le vendeur est requis et doit faire moins de 100 caractères');
    }

    return errors;
  };

  const sanitizeShopItem = (item: ShopItem): ShopItem => ({
    ...item,
    name: sanitizeText(item.name),
    description: sanitizeText(item.description),
    category: sanitizeText(item.category),
    seller: sanitizeText(item.seller),
  });

  const fetchShopItems = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('shop_items')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Database error:', error.code);
        throw new Error('Erreur de base de données');
      }

      const mappedItems: ShopItem[] = (data || []).map(item => ({
        id: item.id,
        name: item.name,
        description: item.description,
        price: item.price,
        imageUrl: item.image_url,
        category: item.category,
        seller: item.seller,
      }));

      setShopItems(mappedItems);
    } catch (error) {
      console.error('Error fetching shop items:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les articles de la boutique",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addShopItem = async (item: ShopItem) => {
    try {
      const sanitizedItem = sanitizeShopItem(item);
      const validationErrors = validateShopItem(sanitizedItem);

      if (validationErrors.length > 0) {
        toast({
          title: "Erreur de validation",
          description: validationErrors.join(', '),
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('shop_items')
        .insert({
          name: sanitizedItem.name,
          description: sanitizedItem.description,
          price: sanitizedItem.price,
          image_url: sanitizedItem.imageUrl,
          category: sanitizedItem.category,
          seller: sanitizedItem.seller,
        });

      if (error) {
        console.error('Database error:', error.code);
        throw new Error('Erreur de base de données');
      }
      
      toast({
        title: "Succès",
        description: "Article ajouté avec succès",
      });
      
      fetchShopItems();
    } catch (error) {
      console.error('Error adding shop item:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter l'article",
        variant: "destructive",
      });
    }
  };

  const updateShopItem = async (item: ShopItem) => {
    try {
      const sanitizedItem = sanitizeShopItem(item);
      const validationErrors = validateShopItem(sanitizedItem);

      if (validationErrors.length > 0) {
        toast({
          title: "Erreur de validation",
          description: validationErrors.join(', '),
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase
        .from('shop_items')
        .update({
          name: sanitizedItem.name,
          description: sanitizedItem.description,
          price: sanitizedItem.price,
          image_url: sanitizedItem.imageUrl,
          category: sanitizedItem.category,
          seller: sanitizedItem.seller,
        })
        .eq('id', sanitizedItem.id);

      if (error) {
        console.error('Database error:', error.code);
        throw new Error('Erreur de base de données');
      }
      
      toast({
        title: "Succès",
        description: "Article mis à jour avec succès",
      });
      
      fetchShopItems();
    } catch (error) {
      console.error('Error updating shop item:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour l'article",
        variant: "destructive",
      });
    }
  };

  const deleteShopItem = async (id: string) => {
    try {
      if (!id || typeof id !== 'string') {
        throw new Error('ID invalide');
      }

      const { error } = await supabase
        .from('shop_items')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Database error:', error.code);
        throw new Error('Erreur de base de données');
      }
      
      toast({
        title: "Succès",
        description: "Article supprimé avec succès",
      });
      
      fetchShopItems();
    } catch (error) {
      console.error('Error deleting shop item:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'article",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchShopItems();
  }, []);

  return {
    shopItems,
    loading,
    addShopItem,
    updateShopItem,
    deleteShopItem,
    refetch: fetchShopItems,
  };
};
