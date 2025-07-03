
import { Book } from '@/types/Book';
import { BookCompletion, BookReadCount } from '@/types/ReadingStats';

export const enrichCompletionsWithBooks = (
  completions: BookCompletion[],
  books: Book[]
): BookCompletion[] => {
  return completions?.map(completion => ({
    ...completion,
    book: books.find(book => book.id === completion.book_id)
  })) || [];
};

export const calculateBookReadCounts = (
  enrichedCompletions: BookCompletion[]
): Record<string, number> => {
  return enrichedCompletions.reduce((acc, completion) => {
    if (completion.book) {
      const key = completion.book_id;
      acc[key] = (acc[key] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);
};

export const calculateMonthlyReadCounts = (
  enrichedCompletions: BookCompletion[],
  thisMonth: Date
): Record<string, number> => {
  return enrichedCompletions
    .filter(c => new Date(c.completed_at) >= thisMonth)
    .reduce((acc, completion) => {
      if (completion.book) {
        const key = completion.book_id;
        acc[key] = (acc[key] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);
};

export const getTopBooks = (
  bookReadCounts: Record<string, number>,
  books: Book[]
): BookReadCount[] => {
  return Object.entries(bookReadCounts)
    .map(([bookId, count]) => ({
      book: books.find(b => b.id === bookId)!,
      count
    }))
    .filter(item => item.book)
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
};

export const getRecentReads = (
  enrichedCompletions: BookCompletion[]
): BookCompletion[] => {
  return enrichedCompletions
    .filter(c => c.book)
    .slice(0, 20);
};
