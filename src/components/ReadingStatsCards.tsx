
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, TrendingUp, Calendar } from 'lucide-react';

interface ReadingStatsCardsProps {
  totalReads: number;
  monthlyReads: number;
  totalBooks: number;
}

export const ReadingStatsCards: React.FC<ReadingStatsCardsProps> = ({
  totalReads,
  monthlyReads,
  totalBooks
}) => {
  return (
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
          <div className="text-2xl font-bold">{totalBooks}</div>
          <p className="text-xs text-muted-foreground">Dans la bibliothèque</p>
        </CardContent>
      </Card>
    </div>
  );
};
