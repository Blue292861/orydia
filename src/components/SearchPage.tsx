import React, { useState } from 'react';
import { Book } from '@/types/Book';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Coins, Tag } from 'lucide-react';

interface SearchPageProps {
  books: Book[];
  onBookSelect: (book: Book) => void;
}

export const SearchPage: React.FC<SearchPageProps> = ({ books, onBookSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  
  // Get all unique tags from all books
  const allTags = Array.from(new Set(books.flatMap(book => book.tags || [])));
  
  const filteredBooks = books.filter(book => {
    const matchesSearch = book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         book.author.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTags = selectedTags.length === 0 || 
                       selectedTags.every(tag => (book.tags || []).includes(tag));
    
    return matchesSearch && matchesTags;
  });

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedTags([]);
  };

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

        {allTags.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Filter by tags:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {allTags.map((tag) => (
                <Badge
                  key={tag}
                  variant={selectedTags.includes(tag) ? "default" : "outline"}
                  className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                  onClick={() => toggleTag(tag)}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {(searchTerm || selectedTags.length > 0) && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {filteredBooks.length} result(s) found
              {searchTerm && ` for "${searchTerm}"`}
              {selectedTags.length > 0 && ` with tags: ${selectedTags.join(', ')}`}
            </p>
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              Clear filters
            </Button>
          </div>
        )}
      </div>

      {(searchTerm || selectedTags.length > 0) && (
        <div className="space-y-4">
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
                <CardContent className="p-4 pt-0 space-y-2">
                  {book.tags && book.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {book.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                  <Button 
                    onClick={() => onBookSelect(book)}
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

      {(searchTerm || selectedTags.length > 0) && filteredBooks.length === 0 && (
        <div className="text-center py-12 border rounded-lg">
          <p className="text-muted-foreground">No books found matching your search criteria.</p>
        </div>
      )}

      {!searchTerm && selectedTags.length === 0 && (
        <div className="text-center py-12 border rounded-lg">
          <p className="text-muted-foreground">Start typing or select tags to search for books.</p>
        </div>
      )}
    </div>
  );
};
