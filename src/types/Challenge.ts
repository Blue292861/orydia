export type ChallengeObjectiveType = 
  | 'read_book'              // Lire un livre spécifique
  | 'read_genre'             // Lire X livres d'un genre
  | 'collect_item'           // Obtenir un item spécifique
  | 'read_any_books'         // Lire X livres (n'importe lesquels)
  | 'read_saga_book'         // Lire un livre parmi une saga (au choix)
  | 'read_chapters_book'     // Lire X chapitres d'un livre spécifique
  | 'read_chapters_genre'    // Lire X chapitres de livres d'un genre
  | 'read_chapters_selection'; // Lire X chapitres parmi une sélection de livres

export interface ChallengeObjective {
  id: string;
  challengeId: string;
  objectiveType: ChallengeObjectiveType;
  objectiveName: string;
  targetCount: number;
  targetBookId?: string;
  targetBookIds?: string[]; // For saga objectives - multiple books to choose from
  targetGenre?: string;
  targetRewardTypeId?: string;
  position: number;
  // Données jointes pour l'affichage
  targetBook?: { id: string; title: string; coverUrl: string };
  targetBooks?: { id: string; title: string; coverUrl: string }[]; // For saga objectives
  targetRewardType?: { id: string; name: string; imageUrl: string };
}

export interface ItemRewardConfig {
  rewardTypeId: string;
  quantity: number;
}

export interface Challenge {
  id: string;
  name: string;
  description: string;
  icon: string;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  orydorsReward: number;
  xpReward: number;
  itemRewards: ItemRewardConfig[];
  premiumMonthsReward: number;
  isGuildChallenge: boolean;
  objectives: ChallengeObjective[];
  createdAt: Date;
}

export interface UserChallengeProgress {
  objectiveId: string;
  currentProgress: number;
  targetCount: number;
  isCompleted: boolean;
  completedAt?: Date;
}

export interface UserChallengeStatus {
  challenge: Challenge;
  progress: UserChallengeProgress[];
  overallProgress: number;
  isFullyCompleted: boolean;
  rewardsClaimed: boolean;
}

export interface ChallengeFormData {
  name: string;
  description: string;
  icon: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  orydorsReward: number;
  xpReward: number;
  itemRewards: ItemRewardConfig[];
  premiumMonthsReward: number;
  isGuildChallenge: boolean;
}

export interface ObjectiveFormData {
  objectiveType: ChallengeObjectiveType;
  objectiveName: string;
  targetCount: number;
  targetBookId?: string;
  targetBookIds?: string[]; // For saga objectives
  targetGenre?: string;
  targetRewardTypeId?: string;
}
