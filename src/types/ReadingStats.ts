
import { Book } from '@/types/Book';

export interface BookCompletion {
  book_id: string;
  completed_at: string;
  user_id: string;
  book?: Book;
}

export interface ReadingStatsAdminProps {
  books: Book[];
}

export interface BookReadCount {
  book: Book;
  count: number;
}
