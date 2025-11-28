export type WaypointType = 'text' | 'image' | 'audio' | 'link';

export interface Waypoint {
  id: string;
  chapter_id: string;
  cfi_range: string;
  word_text: string;
  word_index?: number;
  waypoint_type: WaypointType;
  content_text?: string;
  content_image_url?: string;
  content_audio_url?: string;
  content_link_url?: string;
  content_link_label?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface WaypointFormData {
  chapter_id: string;
  word_text: string;
  cfi_range: string;
  word_index?: number;
  waypoint_type: WaypointType;
  content_text?: string;
  content_image_url?: string;
  content_audio_url?: string;
  content_link_url?: string;
  content_link_label?: string;
}
