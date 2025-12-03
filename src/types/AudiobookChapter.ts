export interface AudiobookChapter {
  id: string;
  audiobook_id: string;
  title: string;
  audio_url: string;
  chapter_number: number;
  duration_seconds: number;
  is_interactive: boolean;
  is_ending: boolean;
  ending_reward_points: number;
  created_at?: string;
  updated_at?: string;
}

export interface AudiobookProgress {
  id: string;
  user_id: string;
  audiobook_id: string;
  chapter_id: string;
  current_time_seconds: number;
  is_completed: boolean;
  last_played_at: string;
  created_at?: string;
  updated_at?: string;
}

export interface AudiobookWithProgress extends AudiobookChapter {
  progress?: AudiobookProgress;
}