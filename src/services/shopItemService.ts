
import { supabase } from '@/integrations/supabase/client';
import { ShopItem } from '@/types/ShopItem';

export const fetchShopItemsFromDB = async (): Promise<ShopItem[]> => {
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
    content: item.content,
    price: item.price,
    imageUrl: item.image_url,
    category: item.category,
    seller: item.seller,
  }));

  return mappedItems;
};

export const addShopItemToDB = async (item: ShopItem): Promise<void> => {
  const { error } = await supabase
    .from('shop_items')
    .insert({
      name: item.name,
      description: item.description,
      content: item.content,
      price: item.price,
      image_url: item.imageUrl,
      category: item.category,
      seller: item.seller,
    });

  if (error) {
    console.error('Database error:', error.code);
    throw new Error('Erreur de base de données');
  }
};

export const updateShopItemInDB = async (item: ShopItem): Promise<void> => {
  const { error } = await supabase
    .from('shop_items')
    .update({
      name: item.name,
      description: item.description,
      content: item.content,
      price: item.price,
      image_url: item.imageUrl,
      category: item.category,
      seller: item.seller,
    })
    .eq('id', item.id);

  if (error) {
    console.error('Database error:', error.code);
    throw new Error('Erreur de base de données');
  }
};

export const deleteShopItemFromDB = async (id: string): Promise<void> => {
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
};
