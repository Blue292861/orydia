
import React from 'react';
import { Coins, Crown, Shield, Sword } from 'lucide-react';
import { TensensPack } from '@/types/TensensPack';

export const TENSENS_PACKS: TensensPack[] = [
  { 
    id: 'pack-small', 
    name: 'Pack Starter', 
    tensens: 8300, 
    price: 500,
    description: '8 300 Tensens',
    icon: <Coins className="h-8 w-8" />
  },
  { 
    id: 'pack-medium', 
    name: 'Pack Standard', 
    tensens: 18260, 
    price: 1000,
    description: '18 260 Tensens', 
    popular: true,
    savings: '10% d\'économie',
    icon: <Shield className="h-8 w-8" />
  },
  { 
    id: 'pack-large', 
    name: 'Pack Premium', 
    tensens: 39840, 
    price: 2000,
    description: '39 840 Tensens',
    savings: '15% d\'économie',
    icon: <Sword className="h-8 w-8" />
  },
  { 
    id: 'pack-mega', 
    name: 'Pack Ultimate', 
    tensens: 74700, 
    price: 3500,
    description: '74 700 Tensens', 
    savings: '25% d\'économie',
    icon: <Crown className="h-8 w-8" />
  },
];
