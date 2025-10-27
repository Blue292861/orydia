export interface ChapterEpub {
  id: string;
  book_id: string;
  chapter_number: number;
  title: string;
  description?: string;
  illustration_url?: string;
  epub_url: string;
  opf_url?: string;
  position: number;
  created_at: string;
  updated_at: string;
}

export interface ChapterProgress {
  chapter_id: string;
  progress: number;
  is_completed: boolean;
  last_location?: string;
}
