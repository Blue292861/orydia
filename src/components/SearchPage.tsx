
import React, { useState } from 'react';
import { Book } from '@/types/Book';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Coins } from 'lucide-react';

interface SearchPageProps {
  books: Book[];
  onSelectBook: (book: Book) => void;
}

export const SearchPage: React.FC<SearchPageProps> = ({ books, onSelectBook }) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredBooks = books.filter(book => 
    book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.author.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-20">
      <div className="space-y-4">
        <h2 className="text-3xl font-bold text-center">Search Books</h2>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search by title or author..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {searchTerm && (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {filteredBooks.length} result(s) found for "{searchTerm}"
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBooks.map((book) => (
              <Card key={book.id} className="cursor-pointer hover:shadow-lg transition-shadow">
                <div className="flex h-[120px]">
                  <img 
                    src={book.coverUrl} 
                    alt={book.title}
                    className="w-24 h-full object-cover" 
                  />
                  <CardHeader className="flex-1 p-4">
                    <CardTitle className="text-lg">{book.title}</CardTitle>
                    <p className="text-sm text-muted-foreground">{book.author}</p>
                    <div className="flex items-center gap-1 text-sm">
                      <Coins className="h-4 w-4 text-primary" />
                      <span className="font-medium">{book.points} points</span>
                    </div>
                  </CardHeader>
                </div>
                <CardContent className="p-4 pt-0">
                  <Button 
                    onClick={() => onSelectBook(book)}
                    className="w-full"
                  >
                    Read Book
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {searchTerm && filteredBooks.length === 0 && (
        <div className="text-center py-12 border rounded-lg">
          <p className="text-muted-foreground">No books found matching your search.</p>
        </div>
      )}
    </div>
  );
};
