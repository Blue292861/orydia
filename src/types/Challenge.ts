export type ChallengeObjectiveType = 
  | 'read_book'       // Lire un livre spécifique
  | 'read_genre'      // Lire X livres d'un genre
  | 'collect_item'    // Obtenir un item spécifique
  | 'read_any_books'; // Lire X livres (n'importe lesquels)

export interface ChallengeObjective {
  id: string;
  challengeId: string;
  objectiveType: ChallengeObjectiveType;
  objectiveName: string;
  targetCount: number;
  targetBookId?: string;
  targetGenre?: string;
  targetRewardTypeId?: string;
  position: number;
  // Données jointes pour l'affichage
  targetBook?: { id: string; title: string; coverUrl: string };
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
}

export interface ObjectiveFormData {
  objectiveType: ChallengeObjectiveType;
  objectiveName: string;
  targetCount: number;
  targetBookId?: string;
  targetGenre?: string;
  targetRewardTypeId?: string;
}
