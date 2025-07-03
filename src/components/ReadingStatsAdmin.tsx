
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Book } from '@/types/Book';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookOpen, TrendingUp, Calendar, FileDown } from 'lucide-react';
import * as XLSX from 'xlsx';

interface BookCompletion {
  book_id: string;
  completed_at: string;
  user_id: string;
  book?: Book;
}

interface ReadingStatsAdminProps {
  books: Book[];
}

const fetchBookCompletions = async (): Promise<BookCompletion[]> => {
  const { data, error } = await supabase
    .from('book_completions')
    .select('*')
    .order('completed_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

export const ReadingStatsAdmin: React.FC<ReadingStatsAdminProps> = ({ books }) => {
  const { data: completions, isLoading, error } = useQuery({
    queryKey: ['book-completions'],
    queryFn: fetchBookCompletions
  });

  if (isLoading) return <div>Chargement des statistiques...</div>;
  if (error) return <div>Erreur lors du chargement des statistiques</div>;

  // Enrichir les complétions avec les données des livres
  const enrichedCompletions = completions?.map(completion => ({
    ...completion,
    book: books.find(book => book.id === completion.book_id)
  })) || [];

  // Statistiques globales
  const totalReads = enrichedCompletions.length;
  const thisMonth = new Date();
  thisMonth.setDate(1);
  const monthlyReads = enrichedCompletions.filter(
    c => new Date(c.completed_at) >= thisMonth
  ).length;

  // Livres les plus lus
  const bookReadCounts = enrichedCompletions.reduce((acc, completion) => {
    if (completion.book) {
      const key = completion.book_id;
      acc[key] = (acc[key] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  // Statistiques mensuelles par livre
  const monthlyBookReadCounts = enrichedCompletions
    .filter(c => new Date(c.completed_at) >= thisMonth)
    .reduce((acc, completion) => {
      if (completion.book) {
        const key = completion.book_id;
        acc[key] = (acc[key] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

  const generateMonthlyReport = () => {
    // Préparer les données pour Excel
    const excelData = books.map(book => ({
      'Nom de l\'œuvre': book.title,
      'Nom de l\'auteur': book.author,
      'Vues ce mois-ci': monthlyBookReadCounts[book.id] || 0,
      'Vues totales': bookReadCounts[book.id] || 0
    }));

    // Créer le workbook
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(excelData);

    // Ajuster la largeur des colonnes
    const colWidths = [
      { wch: 30 }, // Nom de l'œuvre
      { wch: 20 }, // Nom de l'auteur
      { wch: 15 }, // Vues ce mois-ci
      { wch: 15 }  // Vues totales
    ];
    ws['!cols'] = colWidths;

    // Ajouter la feuille au workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Statistiques Mensuelles');

    // Générer le nom du fichier avec la date actuelle
    const currentDate = new Date();
    const monthYear = `${currentDate.getMonth() + 1}-${currentDate.getFullYear()}`;
    const fileName = `statistiques-lecture-${monthYear}.xlsx`;

    // Télécharger le fichier
    XLSX.writeFile(wb, fileName);
  };

  const topBooks = Object.entries(bookReadCounts)
    .map(([bookId, count]) => ({
      book: books.find(b => b.id === bookId),
      count
    }))
    .filter(item => item.book)
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // Lectures récentes
  const recentReads = enrichedCompletions
    .filter(c => c.book)
    .slice(0, 20);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Statistiques de lecture</h2>
        <Button onClick={generateMonthlyReport} className="flex items-center gap-2">
          <FileDown className="h-4 w-4" />
          Générer la fin de mois
        </Button>
      </div>
      
      {/* Cartes de statistiques globales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total des lectures</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalReads}</div>
            <p className="text-xs text-muted-foreground">Lectures terminées</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ce mois-ci</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{monthlyReads}</div>
            <p className="text-xs text-muted-foreground">Lectures ce mois</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Livres disponibles</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{books.length}</div>
            <p className="text-xs text-muted-foreground">Dans la bibliothèque</p>
          </CardContent>
        </Card>
      </div>

      {/* Livres les plus lus */}
      <Card>
        <CardHeader>
          <CardTitle>Livres les plus lus</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Livre</TableHead>
                <TableHead>Auteur</TableHead>
                <TableHead>Nombre de lectures</TableHead>
                <TableHead>Popularité</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topBooks.map(({ book, count }, index) => (
                <TableRow key={book!.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <img 
                        src={book!.coverUrl} 
                        alt={book!.title}
                        className="w-10 h-10 object-cover rounded"
                      />
                      <div>
                        <div className="font-medium">{book!.title}</div>
                        {book!.isPremium && <Badge variant="secondary" className="text-xs">Premium</Badge>}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{book!.author}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{count} lectures</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <div className="w-full bg-gray-200 rounded-full h-2 mr-2 max-w-[100px]">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${Math.min((count / Math.max(...Object.values(bookReadCounts))) * 100, 100)}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-muted-foreground">#{index + 1}</span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Lectures récentes */}
      <Card>
        <CardHeader>
          <CardTitle>Lectures récentes</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Livre</TableHead>
                <TableHead>Auteur</TableHead>
                <TableHead>Date de lecture</TableHead>
                <TableHead>Utilisateur</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentReads.map((completion) => (
                <TableRow key={`${completion.book_id}-${completion.user_id}-${completion.completed_at}`}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <img 
                        src={completion.book!.coverUrl} 
                        alt={completion.book!.title}
                        className="w-8 h-8 object-cover rounded"
                      />
                      <span className="font-medium">{completion.book!.title}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{completion.book!.author}</TableCell>
                  <TableCell>
                    {new Date(completion.completed_at).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{completion.user_id.slice(0, 8)}...</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
