import { LevelInfo } from '@/types/UserStats';

// Table de correspondance des niveaux et XP (progression exponentielle)
const LEVEL_THRESHOLDS = [
  0,     // Niveau 1 : 0 XP
  100,   // Niveau 2 : 100 XP
  250,   // Niveau 3 : 250 XP
  450,   // Niveau 4 : 450 XP
  700,   // Niveau 5 : 700 XP
  1000,  // Niveau 6 : 1000 XP
  1350,  // Niveau 7 : 1350 XP
  1750,  // Niveau 8 : 1750 XP
  2200,  // Niveau 9 : 2200 XP
  2700,  // Niveau 10 : 2700 XP
  3250,  // Niveau 11 : 3250 XP
  3850,  // Niveau 12 : 3850 XP
  4500,  // Niveau 13 : 4500 XP
  5200,  // Niveau 14 : 5200 XP
  5950,  // Niveau 15 : 5950 XP
  6750,  // Niveau 16 : 6750 XP
  7600,  // Niveau 17 : 7600 XP
  8500,  // Niveau 18 : 8500 XP
  9450,  // Niveau 19 : 9450 XP
  10450, // Niveau 20 : 10450 XP
];

const LEVEL_TITLES = [
  'Apprenti Lecteur',         // Niveau 1
  'Lecteur Novice',           // Niveau 2
  'Lecteur en Herbe',         // Niveau 3
  'Passionné de Lecture',     // Niveau 4
  'Dévoreur de Livres',       // Niveau 5
  'Rat de Bibliothèque',      // Niveau 6
  'Érudit Littéraire',        // Niveau 7
  'Maître Lecteur',           // Niveau 8
  'Sage des Mots',            // Niveau 9
  'Bibliothécaire',           // Niveau 10
  'Gardien du Savoir',        // Niveau 11
  'Archiviste Légendaire',    // Niveau 12
  'Maître des Récits',        // Niveau 13
  'Oracle Littéraire',        // Niveau 14
  'Seigneur des Livres',      // Niveau 15
  'Titan de la Lecture',      // Niveau 16
  'Légende Vivante',          // Niveau 17
  'Divinité Littéraire',      // Niveau 18
  'Empereur des Mots',        // Niveau 19
  'Maître Absolu',            // Niveau 20+
];

export const calculateLevelInfo = (experiencePoints: number): LevelInfo => {
  let level = 1;
  let currentLevelStart = 0;
  let nextLevelStart = LEVEL_THRESHOLDS[1];

  // Trouver le niveau actuel
  for (let i = 0; i < LEVEL_THRESHOLDS.length - 1; i++) {
    if (experiencePoints >= LEVEL_THRESHOLDS[i] && experiencePoints < LEVEL_THRESHOLDS[i + 1]) {
      level = i + 1;
      currentLevelStart = LEVEL_THRESHOLDS[i];
      nextLevelStart = LEVEL_THRESHOLDS[i + 1];
      break;
    }
  }

  // Pour les niveaux au-delà de 20, progression de 1000 XP par niveau
  if (experiencePoints >= LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1]) {
    const extraXp = experiencePoints - LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1];
    const extraLevels = Math.floor(extraXp / 1000);
    level = 20 + extraLevels;
    currentLevelStart = LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1] + (extraLevels * 1000);
    nextLevelStart = currentLevelStart + 1000;
  }

  const currentXp = experiencePoints - currentLevelStart;
  const nextLevelXp = nextLevelStart - currentLevelStart;
  const progressPercentage = Math.round((currentXp / nextLevelXp) * 100);

  const levelTitle = level <= LEVEL_TITLES.length 
    ? LEVEL_TITLES[level - 1] 
    : LEVEL_TITLES[LEVEL_TITLES.length - 1];

  return {
    level,
    currentXp,
    nextLevelXp,
    levelTitle,
    progressPercentage
  };
};

export const getXpRequiredForLevel = (targetLevel: number): number => {
  if (targetLevel <= 0) return 0;
  if (targetLevel <= LEVEL_THRESHOLDS.length) {
    return LEVEL_THRESHOLDS[targetLevel - 1];
  }
  // Pour les niveaux au-delà de 20
  const extraLevels = targetLevel - 20;
  return LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1] + (extraLevels * 1000);
};

export const getLevelTitle = (level: number): string => {
  if (level <= 0) return LEVEL_TITLES[0];
  if (level <= LEVEL_TITLES.length) {
    return LEVEL_TITLES[level - 1];
  }
  return LEVEL_TITLES[LEVEL_TITLES.length - 1];
};