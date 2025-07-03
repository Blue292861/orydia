
import React from 'react';
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
import { BookCompletion } from '@/types/ReadingStats';

interface RecentReadsTableProps {
  recentReads: BookCompletion[];
}

export const RecentReadsTable: React.FC<RecentReadsTableProps> = ({
  recentReads
}) => {
  return (
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
  );
};
