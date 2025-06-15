
import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Book } from '@/types/Book';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpenCheck, CalendarClock } from 'lucide-react';

interface ReadingStatsAdminProps {
  books: Book[];
}

const fetchCompletions = async () => {
  const { data, error } = await supabase.from('book_completions').select('*');
  if (error) throw new Error(error.message);
  return data;
};

export const ReadingStatsAdmin: React.FC<ReadingStatsAdminProps> = ({ books }) => {
  const { data: completions, isLoading, error } = useQuery({
    queryKey: ['book_completions'],
    queryFn: fetchCompletions
  });

  const stats = useMemo(() => {
    if (!completions || !books) return { bookStats: [], monthCompletions: 0 };

    const bookStats = books.map(book => ({
      ...book,
      completionCount: completions.filter(c => c.book_id === book.id).length
    }));
    
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const monthCompletions = completions.filter(c => new Date(c.completed_at) >= startOfMonth).length;

    return { bookStats, monthCompletions };
  }, [completions, books]);

  if (isLoading) return <div>Chargement des statistiques...</div>;
  if (error) return <div>Erreur de chargement: {error.message}</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold">Statistiques de Lecture</h2>
      
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Lectures ce mois-ci</CardTitle>
            <CalendarClock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.monthCompletions}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total des lectures</CardTitle>
            <BookOpenCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completions?.length || 0}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lectures par livre</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Livre</TableHead>
                <TableHead className="text-right">Nombre de lectures</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stats.bookStats.sort((a, b) => b.completionCount - a.completionCount).map(book => (
                <TableRow key={book.id}>
                  <TableCell>{book.title}</TableCell>
                  <TableCell className="text-right font-bold">{book.completionCount}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
