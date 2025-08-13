
export interface Audiobook {
  id: string;
  name: string;
  author: string;
  description?: string;
  cover_url: string;
  audio_url: string; // Maintenant utilisé seulement pour la rétrocompatibilité
  genre?: string;
  tags: string[];
  points: number;
  is_premium: boolean;
  is_month_success: boolean;
  is_paco_favourite: boolean;
  is_paco_chronicle: boolean;
  is_featured: boolean;
  created_at?: string;
  updated_at?: string;
}
