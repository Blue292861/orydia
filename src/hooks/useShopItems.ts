
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ShopItem } from '@/types/ShopItem';

export const useShopItems = () => {
  const [shopItems, setShopItems] = useState<ShopItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchShopItems = async () => {
    try {
      const { data, error } = await supabase
        .from('shop_items')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

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
      const { error } = await supabase
        .from('shop_items')
        .insert({
          name: item.name,
          description: item.description,
          price: item.price,
          image_url: item.imageUrl,
          category: item.category,
          seller: item.seller,
        });

      if (error) throw error;
      
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
      const { error } = await supabase
        .from('shop_items')
        .update({
          name: item.name,
          description: item.description,
          price: item.price,
          image_url: item.imageUrl,
          category: item.category,
          seller: item.seller,
        })
        .eq('id', item.id);

      if (error) throw error;
      
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
      const { error } = await supabase
        .from('shop_items')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
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
