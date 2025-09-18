export interface UserGenrePreference {
  id: string;
  user_id: string;
  genre: string;
  read_count: number;
  total_time_minutes: number;
  last_read_at?: string;
  preference_score: number;
  created_at: string;
  updated_at: string;
}

export interface GenreAnalytics {
  genre: string;
  read_count: number;
  total_time_minutes: number;
  preference_score: number;
  last_read_at?: string;
}