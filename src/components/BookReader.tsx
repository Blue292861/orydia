
import React, { useState } from 'react';
import { Book } from '@/types/Book';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

interface BookReaderProps {
  book: Book;
  onClose: () => void;
}

export const BookReader: React.FC<BookReaderProps> = ({ book, onClose }) => {
  // In a real app, we would paginate the content based on screen size
  // For this demo, we'll just display the full content
  
  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <Button variant="ghost" onClick={onClose} className="flex items-center gap-1">
          <ChevronLeft className="h-4 w-4" />
          Back to Library
        </Button>
        
        <div className="text-center">
          <h2 className="font-bold">{book.title}</h2>
          <p className="text-sm text-muted-foreground">{book.author}</p>
        </div>
        
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <div className="bg-card rounded-lg p-8 shadow-md">
        <div className="prose prose-lg max-w-none">
          {book.content.split('\n\n').map((paragraph, index) => (
            <p key={index} className="mb-4 leading-relaxed text-foreground">
              {paragraph}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
};
