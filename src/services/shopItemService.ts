
import { supabase } from '@/integrations/supabase/client';
import { ShopItem } from '@/types/ShopItem';

export const fetchShopItemsFromDB = async (shopType?: 'internal' | 'external'): Promise<ShopItem[]> => {
  let query = supabase
    .from('shop_items')
    .select('*')
    .order('created_at', { ascending: false });

  // Filter by shop type if specified
  if (shopType) {
    query = query.eq('shop_type', shopType);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Database error:', error.code);
    throw new Error('Erreur de base de données');
  }

  const mappedItems: ShopItem[] = (data || []).map(item => ({
    id: item.id,
    name: item.name,
    description: item.description,
    content: item.content || '',
    price: item.price,
    imageUrl: item.image_url,
    category: item.category,
    seller: item.seller,
    requiredLevel: item.required_level,
    shopType: item.shop_type,
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
      required_level: item.requiredLevel,
      shop_type: item.shopType,
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
      required_level: item.requiredLevel,
      shop_type: item.shopType,
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
