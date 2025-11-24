import { Coins, Gem, Crown, Sparkles, Trophy, Zap } from 'lucide-react';
import { OrydorsPack } from '@/types/OrydorsPack';

export const ORYDORS_PACKS: OrydorsPack[] = [
  {
    id: 'starter',
    name: 'Débutant',
    orydors: 100,
    price: 99, // 0.99€
    icon: <Coins className="h-12 w-12" />,
  },
  {
    id: 'apprentice',
    name: 'Apprenti',
    orydors: 500,
    price: 449, // 4.49€
    originalPrice: 495,
    savings: 'Économisez 10%',
    icon: <Sparkles className="h-12 w-12" />,
  },
  {
    id: 'adventurer',
    name: 'Aventurier',
    orydors: 1200,
    price: 999, // 9.99€
    originalPrice: 1188,
    bonus: '+200 Orydors bonus',
    savings: 'Économisez 16%',
    popular: true,
    icon: <Gem className="h-12 w-12" />,
  },
  {
    id: 'hero',
    name: 'Héros',
    orydors: 2500,
    price: 1999, // 19.99€
    originalPrice: 2475,
    bonus: '+500 Orydors bonus',
    savings: 'Économisez 19%',
    icon: <Trophy className="h-12 w-12" />,
  },
  {
    id: 'legend',
    name: 'Légende',
    orydors: 5500,
    price: 3999, // 39.99€
    originalPrice: 4950,
    bonus: '+1500 Orydors bonus',
    savings: 'Économisez 21%',
    icon: <Crown className="h-12 w-12" />,
  },
  {
    id: 'titan',
    name: 'Titan',
    orydors: 12000,
    price: 7999, // 79.99€
    originalPrice: 9900,
    bonus: '+4000 Orydors bonus',
    savings: 'Économisez 24%',
    icon: <Zap className="h-12 w-12" />,
  },
];
