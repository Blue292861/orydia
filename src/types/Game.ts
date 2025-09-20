export interface Game {
  id: string;
  name: string;
  author: string;
  description?: string;
  cover_url: string;
  genres: string[];
  is_featured: boolean;
  points_reward: number;
  created_at: string;
  updated_at: string;
}

export interface GameChapter {
  id: string;
  game_id: string;
  chapter_number: number;
  title: string;
  content: string;
  is_ending: boolean;
  ending_reward_points?: number;
  created_at: string;
  updated_at: string;
}

export interface GameChoice {
  id: string;
  chapter_id: string;
  choice_text: string;
  next_chapter_id?: string;
  points_reward: number;
  created_at: string;
}

export interface GameProgress {
  gameId: string;
  currentChapterId: string;
  completedChapters: string[];
  totalPointsEarned: number;
}