
import React from 'react';
import { Coins, Crown, Shield, Sword } from 'lucide-react';
import { TensensPack } from '@/types/TensensPack';

export const TENSENS_PACKS: TensensPack[] = [
  { 
    id: 'pack-small', 
    name: 'Pack Starter', 
    tensens: 331, 
    price: 199, 
    description: '331 Tensens',
    originalPrice: 249,
    icon: <Coins className="h-8 w-8" />
  },
  { 
    id: 'pack-medium', 
    name: 'Pack Standard', 
    tensens: 1494, 
    price: 899, 
    description: '1 494 Tensens', 
    popular: true,
    originalPrice: 1199,
    savings: '25% d\'économie',
    icon: <Shield className="h-8 w-8" />
  },
  { 
    id: 'pack-large', 
    name: 'Pack Premium', 
    tensens: 2656, 
    price: 1599, 
    description: '2 656 Tensens',
    originalPrice: 2199,
    savings: '27% d\'économie',
    icon: <Sword className="h-8 w-8" />
  },
  { 
    id: 'pack-mega', 
    name: 'Pack Ultimate', 
    tensens: 5810, 
    price: 3499, 
    description: '5 810 Tensens', 
    bonus: '+1 000 Tensens bonus',
    originalPrice: 4999,
    savings: '30% d\'économie',
    icon: <Crown className="h-8 w-8" />
  },
];
