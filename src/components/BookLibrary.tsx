
import React from 'react';
import { Book } from '@/types/Book';
import { Card, CardContent } from '@/components/ui/card';

interface BookLibraryProps {
  books: Book[];
  onSelectBook: (book: Book) => void;
}

export const BookLibrary: React.FC<BookLibraryProps> = ({ books, onSelectBook }) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">My Library</h2>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {books.map((book) => (
          <Card 
            key={book.id} 
            className="overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105"
            onClick={() => onSelectBook(book)}
          >
            <div className="aspect-[2/3] relative">
              <img 
                src={book.coverUrl} 
                alt={book.title}
                className="w-full h-full object-cover" 
              />
            </div>
            <CardContent className="p-4">
              <h3 className="font-bold truncate">{book.title}</h3>
              <p className="text-sm text-muted-foreground">{book.author}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {books.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No books in your library yet.</p>
        </div>
      )}
    </div>
  );
};
