
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { ShopItem } from '@/types/ShopItem';
import { validateShopItem, sanitizeShopItem } from '@/utils/shopItemValidation';
import { fetchShopItemsFromDB, addShopItemToDB, updateShopItemInDB, deleteShopItemFromDB } from '@/services/shopItemService';

export const useShopItems = () => {
  const [shopItems, setShopItems] = useState<ShopItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchShopItems = async () => {
    try {
      setLoading(true);
      const mappedItems = await fetchShopItemsFromDB();
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

      await addShopItemToDB(sanitizedItem);
      
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

      await updateShopItemInDB(sanitizedItem);
      
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
      await deleteShopItemFromDB(id);
      
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
