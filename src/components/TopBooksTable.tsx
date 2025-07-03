
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
import { BookReadCount } from '@/types/ReadingStats';

interface TopBooksTableProps {
  topBooks: BookReadCount[];
  maxReadCount: number;
}

export const TopBooksTable: React.FC<TopBooksTableProps> = ({
  topBooks,
  maxReadCount
}) => {
  return (
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
              <TableRow key={book.id}>
                <TableCell>
                  <div className="flex items-center space-x-3">
                    <img 
                      src={book.coverUrl} 
                      alt={book.title}
                      className="w-10 h-10 object-cover rounded"
                    />
                    <div>
                      <div className="font-medium">{book.title}</div>
                      {book.isPremium && <Badge variant="secondary" className="text-xs">Premium</Badge>}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="font-medium">{book.author}</TableCell>
                <TableCell>
                  <Badge variant="outline">{count} lectures</Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <div className="w-full bg-gray-200 rounded-full h-2 mr-2 max-w-[100px]">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${Math.min((count / maxReadCount) * 100, 100)}%` }}
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
  );
};
