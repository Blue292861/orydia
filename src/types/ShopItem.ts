
export type ShopType = 'internal' | 'external';

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  content?: string;
  price: number;
  imageUrl: string;
  category: string;
  seller: string;
  requiredLevel?: number; // Niveau minimum requis pour acheter l'article
  shopType: ShopType; // Type de boutique : 'internal' (Orydia) ou 'external' (Oryshop)
}
