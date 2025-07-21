
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
import { useResponsive } from '@/hooks/useResponsive';

export const ReadingStatsAdmin: React.FC<ReadingStatsAdminProps> = ({ books }) => {
  const { data: completions, isLoading, error } = useQuery({
    queryKey: ['book-completions'],
    queryFn: fetchBookCompletions
  });
  const { isMobile, isTablet } = useResponsive();

  if (isLoading) return <div className="text-center py-12">Chargement des statistiques...</div>;
  if (error) return <div className="text-center py-12 text-red-500">Erreur lors du chargement des statistiques</div>;

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
    <div className="h-full max-h-screen overflow-y-auto space-y-6 pr-2">
      <div className={`flex ${isMobile ? 'flex-col gap-4' : 'justify-between items-center'}`}>
        <h2 className={`font-bold ${isMobile ? 'text-2xl' : isTablet ? 'text-3xl' : 'text-3xl'}`}>
          Statistiques de lecture
        </h2>
        <div className={`flex gap-2 ${isMobile ? 'flex-col' : ''}`}>
          <Button 
            onClick={handleGenerateMonthlyReport} 
            className={`flex items-center gap-2 ${isMobile ? 'w-full justify-center' : ''}`}
          >
            <FileDown className="h-4 w-4" />
            {isMobile ? 'Rapport mensuel' : 'Générer la fin de mois'}
          </Button>
        </div>
      </div>
      
      <ReadingStatsCards
        totalReads={totalReads}
        monthlyReads={monthlyReads}
        totalBooks={books.length}
      />

      <div className={`space-y-6 ${isMobile ? 'space-y-4' : ''}`}>
        <TopBooksTable
          topBooks={topBooks}
          maxReadCount={maxReadCount}
        />

        <RecentReadsTable
          recentReads={recentReads}
        />
      </div>
    </div>
  );
};
