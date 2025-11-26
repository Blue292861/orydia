
export type ShopType = 'internal' | 'external';
export type PaymentType = 'orydors' | 'real_money';

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  content?: string;
  price: number;
  realPriceCents?: number;
  paymentType: PaymentType;
  rewardTypeId?: string;
  imageUrl: string;
  category: string;
  seller: string;
  requiredLevel?: number;
  shopType: ShopType;
}
