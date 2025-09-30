
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

const extractFilePathFromUrl = (url: string): string | null => {
  if (!url) return null;
  const match = url.match(/\/storage\/v1\/object\/public\/[^\/]+\/(.+)$/);
  return match ? match[1] : null;
};

export const deleteShopItemFromDB = async (id: string): Promise<void> => {
  if (!id || typeof id !== 'string') {
    throw new Error('ID invalide');
  }

  // Récupérer les données de l'item avant suppression pour nettoyer les fichiers
  const { data: item, error: fetchError } = await supabase
    .from('shop_items')
    .select('image_url, additional_images')
    .eq('id', id)
    .single();

  if (fetchError) {
    console.error('Error fetching shop item:', fetchError.code);
    throw new Error('Erreur lors de la récupération de l\'item');
  }

  // Supprimer les fichiers associés dans Storage
  const filesToDelete: string[] = [];

  if (item?.image_url) {
    const imagePath = extractFilePathFromUrl(item.image_url);
    if (imagePath) {
      filesToDelete.push(imagePath);
    }
  }

  if (item?.additional_images && Array.isArray(item.additional_images)) {
    item.additional_images.forEach((imageUrl: string) => {
      const imagePath = extractFilePathFromUrl(imageUrl);
      if (imagePath) {
        filesToDelete.push(imagePath);
      }
    });
  }

  // Supprimer les fichiers de Storage
  if (filesToDelete.length > 0) {
    try {
      const { error: storageError } = await supabase.storage
        .from('book-covers')
        .remove(filesToDelete);
      
      if (storageError) {
        console.warn('Failed to delete some files:', storageError);
      }
    } catch (error) {
      console.warn('Error deleting files:', error);
    }
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
