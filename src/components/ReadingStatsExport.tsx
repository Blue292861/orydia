import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileDown, CalendarIcon, Download } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Book } from '@/types/Book';
import { fetchBookCompletions } from '@/services/readingStatsService';
import { generateCustomReport } from '@/utils/excelReportUtils';
import {
  enrichCompletionsWithBooks,
  calculateBookReadCounts,
  getTopBooks,
  getRecentReads
} from '@/utils/readingStatsCalculations';
import { ReadingStatsCards } from './ReadingStatsCards';
import { TopBooksTable } from './TopBooksTable';
import { RecentReadsTable } from './RecentReadsTable';
import { useResponsive } from '@/hooks/useResponsive';

interface ReadingStatsExportProps {
  books: Book[];
}

export const ReadingStatsExport: React.FC<ReadingStatsExportProps> = ({ books }) => {
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [quickPeriod, setQuickPeriod] = useState<string>('');
  const { isMobile, isTablet } = useResponsive();

  const { data: completions, isLoading, error } = useQuery({
    queryKey: ['book-completions'],
    queryFn: fetchBookCompletions
  });

  const handleQuickPeriodSelect = (period: string) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    switch (period) {
      case 'today':
        setStartDate(today);
        setEndDate(today);
        break;
      case 'this-week':
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        setStartDate(startOfWeek);
        setEndDate(today);
        break;
      case 'this-month':
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        setStartDate(startOfMonth);
        setEndDate(today);
        break;
      case 'last-month':
        const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
        setStartDate(lastMonthStart);
        setEndDate(lastMonthEnd);
        break;
      case 'this-year':
        const startOfYear = new Date(today.getFullYear(), 0, 1);
        setStartDate(startOfYear);
        setEndDate(today);
        break;
      case 'last-year':
        const lastYearStart = new Date(today.getFullYear() - 1, 0, 1);
        const lastYearEnd = new Date(today.getFullYear() - 1, 11, 31);
        setStartDate(lastYearStart);
        setEndDate(lastYearEnd);
        break;
    }
    setQuickPeriod(period);
  };

  const handleGenerateReport = () => {
    if (!startDate || !endDate) {
      alert('Veuillez sélectionner une période');
      return;
    }

    const enrichedCompletions = enrichCompletionsWithBooks(completions || [], books);
    const filteredCompletions = enrichedCompletions.filter(completion => {
      const completionDate = new Date(completion.completed_at);
      return completionDate >= startDate && completionDate <= endDate;
    });

    const periodReadCounts = calculateBookReadCounts(filteredCompletions);
    const totalReadCounts = calculateBookReadCounts(enrichedCompletions);

    generateCustomReport(books, periodReadCounts, totalReadCounts, startDate, endDate);
  };

  if (isLoading) return <div className="text-center py-12">Chargement des statistiques...</div>;
  if (error) return <div className="text-center py-12 text-red-500">Erreur lors du chargement des statistiques</div>;

  // Calculs pour l'aperçu des statistiques
  const enrichedCompletions = enrichCompletionsWithBooks(completions || [], books);
  const filteredCompletions = startDate && endDate 
    ? enrichedCompletions.filter(completion => {
        const completionDate = new Date(completion.completed_at);
        return completionDate >= startDate && completionDate <= endDate;
      })
    : [];

  const totalReads = filteredCompletions.length;
  const bookReadCounts = calculateBookReadCounts(filteredCompletions);
  const topBooks = getTopBooks(bookReadCounts, books);
  const recentReads = getRecentReads(filteredCompletions);
  const maxReadCount = Math.max(...Object.values(bookReadCounts), 1);

  return (
    <div className="h-full max-h-screen overflow-y-auto space-y-6 pr-2">
      <div className={`flex ${isMobile ? 'flex-col gap-4' : 'justify-between items-center'}`}>
        <h2 className={`font-bold ${isMobile ? 'text-2xl' : isTablet ? 'text-3xl' : 'text-3xl'}`}>
          Extraction des statistiques de lecture
        </h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Sélection de la période
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Sélection rapide */}
          <div className="space-y-2">
            <Label>Périodes prédéfinies</Label>
            <Select value={quickPeriod} onValueChange={handleQuickPeriodSelect}>
              <SelectTrigger>
                <SelectValue placeholder="Choisir une période" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Aujourd'hui</SelectItem>
                <SelectItem value="this-week">Cette semaine</SelectItem>
                <SelectItem value="this-month">Ce mois-ci</SelectItem>
                <SelectItem value="last-month">Le mois dernier</SelectItem>
                <SelectItem value="this-year">Cette année</SelectItem>
                <SelectItem value="last-year">L'année dernière</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Sélection personnalisée */}
          <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-2'}`}>
            <div className="space-y-2">
              <Label>Date de début</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "dd/MM/yyyy", { locale: fr }) : "Sélectionner"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={(date) => {
                      setStartDate(date);
                      setQuickPeriod('');
                    }}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Date de fin</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "dd/MM/yyyy", { locale: fr }) : "Sélectionner"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={(date) => {
                      setEndDate(date);
                      setQuickPeriod('');
                    }}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Bouton d'extraction */}
          <div className="flex justify-center">
            <Button 
              onClick={handleGenerateReport}
              disabled={!startDate || !endDate}
              className={`flex items-center gap-2 ${isMobile ? 'w-full' : ''}`}
            >
              <Download className="h-4 w-4" />
              Générer le rapport Excel
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Aperçu des statistiques pour la période sélectionnée */}
      {startDate && endDate && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>
                Aperçu de la période sélectionnée
                <span className="text-sm font-normal text-muted-foreground ml-2">
                  ({format(startDate, "dd/MM/yyyy", { locale: fr })} - {format(endDate, "dd/MM/yyyy", { locale: fr })})
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ReadingStatsCards
                totalReads={totalReads}
                monthlyReads={totalReads}
                totalBooks={books.length}
              />
            </CardContent>
          </Card>

          {totalReads > 0 && (
            <div className={`space-y-6 ${isMobile ? 'space-y-4' : ''}`}>
              <TopBooksTable
                topBooks={topBooks}
                maxReadCount={maxReadCount}
              />

              <RecentReadsTable
                recentReads={recentReads}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};