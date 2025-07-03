
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { FileDown } from 'lucide-react';
import { ReadingStatsAdminProps } from '@/types/ReadingStats';
import { fetchBookCompletions } from '@/services/readingStatsService';
import { generateMonthlyReport } from '@/utils/excelReportUtils';
import {
  enrichCompletionsWithBooks,
  calculateBookReadCounts,
  calculateMonthlyReadCounts,
  getTopBooks,
  getRecentReads
} from '@/utils/readingStatsCalculations';
import { ReadingStatsCards } from './ReadingStatsCards';
import { TopBooksTable } from './TopBooksTable';
import { RecentReadsTable } from './RecentReadsTable';

export const ReadingStatsAdmin: React.FC<ReadingStatsAdminProps> = ({ books }) => {
  const { data: completions, isLoading, error } = useQuery({
    queryKey: ['book-completions'],
    queryFn: fetchBookCompletions
  });

  if (isLoading) return <div>Chargement des statistiques...</div>;
  if (error) return <div>Erreur lors du chargement des statistiques</div>;

  // Enrichir les complétions avec les données des livres
  const enrichedCompletions = enrichCompletionsWithBooks(completions || [], books);

  // Statistiques globales
  const totalReads = enrichedCompletions.length;
  const thisMonth = new Date();
  thisMonth.setDate(1);
  const monthlyReads = enrichedCompletions.filter(
    c => new Date(c.completed_at) >= thisMonth
  ).length;

  // Calculs des statistiques
  const bookReadCounts = calculateBookReadCounts(enrichedCompletions);
  const monthlyBookReadCounts = calculateMonthlyReadCounts(enrichedCompletions, thisMonth);
  const topBooks = getTopBooks(bookReadCounts, books);
  const recentReads = getRecentReads(enrichedCompletions);

  const handleGenerateMonthlyReport = () => {
    generateMonthlyReport(books, monthlyBookReadCounts, bookReadCounts);
  };

  const maxReadCount = Math.max(...Object.values(bookReadCounts));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Statistiques de lecture</h2>
        <Button onClick={handleGenerateMonthlyReport} className="flex items-center gap-2">
          <FileDown className="h-4 w-4" />
          Générer la fin de mois
        </Button>
      </div>
      
      <ReadingStatsCards
        totalReads={totalReads}
        monthlyReads={monthlyReads}
        totalBooks={books.length}
      />

      <TopBooksTable
        topBooks={topBooks}
        maxReadCount={maxReadCount}
      />

      <RecentReadsTable
        recentReads={recentReads}
      />
    </div>
  );
};
