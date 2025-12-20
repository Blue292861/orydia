// Types for Skill Tree System

export type BonusType = 'day_orydors' | 'genre_orydors' | 'chest_drop';

export interface DayOrydorsBonusConfig {
  days: number[]; // 0 = Sunday, 6 = Saturday
  percentage: number;
}

export interface GenreOrydorsBonusConfig {
  genre: string;
  percentage: number;
}

export interface ChestDropBonusConfig {
  reward_type_id: string;
  reward_type_name?: string;
  percentage: number;
}

export type BonusConfig = DayOrydorsBonusConfig | GenreOrydorsBonusConfig | ChestDropBonusConfig;

export interface Skill {
  id: string;
  path_id: string;
  name: string;
  description: string | null;
  icon: string;
  position: number;
  skill_point_cost: number;
  bonus_type: BonusType;
  bonus_config: BonusConfig;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SkillPath {
  id: string;
  name: string;
  description: string | null;
  icon: string;
  position: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  skills?: Skill[];
}

export interface UserSkill {
  id: string;
  user_id: string;
  skill_id: string;
  unlocked_at: string;
}

export interface UserSkillStats {
  skill_points: number;
  unlocked_skills: number;
  total_skills: number;
}

export interface ActiveSkillBonus {
  path_id: string;
  path_name: string;
  skill_name: string;
  skill_position: number;
  bonus_type: BonusType;
  bonus_config: BonusConfig;
}

export interface UnlockSkillResult {
  success: boolean;
  error?: string;
  skill_name?: string;
  skill_cost?: number;
  remaining_points?: number;
  bonus?: {
    bonus_type: BonusType;
    bonus_config: BonusConfig;
  };
}

// Helper functions for bonus display
export function formatBonusDescription(bonusType: BonusType, bonusConfig: BonusConfig): string {
  switch (bonusType) {
    case 'day_orydors': {
      const config = bonusConfig as DayOrydorsBonusConfig;
      const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
      const daysText = config.days.map(d => dayNames[d]).join(', ');
      return `+${config.percentage}% Orydors le ${daysText}`;
    }
    case 'genre_orydors': {
      const config = bonusConfig as GenreOrydorsBonusConfig;
      return `+${config.percentage}% Orydors sur le genre ${config.genre}`;
    }
    case 'chest_drop': {
      const config = bonusConfig as ChestDropBonusConfig;
      const itemName = config.reward_type_name || 'item';
      return `+${config.percentage}% de chance de drop: ${itemName}`;
    }
    default:
      return 'Bonus inconnu';
  }
}

export function getDayNames(): string[] {
  return ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
}
