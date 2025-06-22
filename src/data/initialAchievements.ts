
import { Achievement } from '@/types/UserStats';

export const initialAchievements: Achievement[] = [
  {
    id: 'first-book',
    name: 'Premier Livre',
    description: 'Lisez votre premier livre',
    points: 25,
    unlocked: false,
    icon: '📖',
    rarity: 'common'
  },
  {
    id: 'bookworm',
    name: 'Rat de Bibliothèque',
    description: 'Lisez 5 livres',
    points: 100,
    unlocked: false,
    icon: '🐛',
    rarity: 'rare'
  },
  {
    id: 'scholar',
    name: 'Érudit',
    description: 'Lisez 10 livres',
    points: 200,
    unlocked: false,
    icon: '🎓',
    rarity: 'epic'
  },
  {
    id: 'master-reader',
    name: 'Maître Lecteur',
    description: 'Lisez 20 livres',
    points: 500,
    unlocked: false,
    icon: '👑',
    rarity: 'legendary'
  },
  {
    id: 'ultimate-scholar',
    name: 'Érudit Ultime',
    description: 'Lisez 100 livres et devenez une légende',
    points: 2000,
    unlocked: false,
    icon: '🌟',
    rarity: 'ultra-legendary',
    premiumMonths: 3
  },
  {
    id: 'point-collector',
    name: 'Collectionneur de Points',
    description: 'Gagnez 500 points',
    points: 50,
    unlocked: false,
    icon: '💰',
    rarity: 'common'
  },
  {
    id: 'point-master',
    name: 'Maître des Points',
    description: 'Gagnez 1000 points',
    points: 150,
    unlocked: false,
    icon: '💎',
    rarity: 'rare'
  },
  {
    id: 'premium-member',
    name: 'Membre Premium',
    description: 'Devenez membre premium',
    points: 300,
    unlocked: false,
    icon: '⭐',
    rarity: 'epic'
  },
  {
    id: 'legendary-supporter',
    name: 'Supporter Légendaire',
    description: 'Restez premium pendant 12 mois consécutifs',
    points: 1000,
    unlocked: false,
    icon: '👑',
    rarity: 'ultra-legendary',
    premiumMonths: 1
  },
  {
    id: 'dedicated-reader',
    name: 'Lecteur Dévoué',
    description: 'Lisez pendant 7 jours consécutifs',
    points: 175,
    unlocked: false,
    icon: '🔥',
    rarity: 'rare'
  },
  {
    id: 'speed-reader',
    name: 'Lecteur Rapide',
    description: 'Lisez 3 livres en une journée',
    points: 150,
    unlocked: false,
    icon: '⚡',
    rarity: 'rare'
  },
  {
    id: 'night-owl',
    name: 'Oiseau de Nuit',
    description: 'Lisez après minuit',
    points: 75,
    unlocked: false,
    icon: '🦉',
    rarity: 'common'
  },
  {
    id: 'genre-explorer',
    name: 'Explorateur de Genres',
    description: 'Lisez des livres de 5 genres différents',
    points: 250,
    unlocked: false,
    icon: '🗺️',
    rarity: 'epic'
  },
  {
    id: 'marathon-reader',
    name: 'Lecteur Marathon',
    description: 'Lisez 50 livres',
    points: 1000,
    unlocked: false,
    icon: '🏃‍♂️',
    rarity: 'legendary'
  }
];
