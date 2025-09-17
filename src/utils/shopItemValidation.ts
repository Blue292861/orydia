
import { ShopItem } from '@/types/ShopItem';
import { sanitizeText, validateTextLength, validateUrl, validatePrice } from '@/utils/security';

export const validateShopItem = (item: ShopItem): string[] => {
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

  if (item.requiredLevel && (item.requiredLevel < 1 || item.requiredLevel > 50)) {
    errors.push('Le niveau requis doit être entre 1 et 50');
  }

  if (!item.shopType || !['internal', 'external'].includes(item.shopType)) {
    errors.push('Le type de boutique doit être spécifié (internal ou external)');
  }

  return errors;
};

export const sanitizeShopItem = (item: ShopItem): ShopItem => ({
  ...item,
  name: sanitizeText(item.name),
  description: sanitizeText(item.description),
  category: sanitizeText(item.category),
  seller: sanitizeText(item.seller),
  shopType: item.shopType, // No sanitization needed for enum
});
