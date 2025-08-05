export type UITheme = 
  | 'medieval_fantasy'
  | 'science_fiction'
  | 'slice_of_life'
  | 'romance'
  | 'western'
  | 'default';

export interface ThemeConfig {
  id: string;
  theme_key: UITheme;
  name: string;
  description?: string;
  primary_color: string;
  secondary_color: string;
  accent_color: string;
  background_color: string;
  text_color: string;
  font_family: string;
  vocabulary: {
    greeting: string;
    welcome: string;
    continue_reading: string;
    [key: string]: string;
  };
  created_at: string;
  updated_at: string;
}

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

export interface UserThemePreference {
  id: string;
  user_id: string;
  current_theme: UITheme;
  auto_theme_enabled: boolean;
  admin_override_theme?: UITheme;
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