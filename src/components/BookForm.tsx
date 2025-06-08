
import React from 'react';
import { Book } from '@/types/Book';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface BookFormProps {
  initialBook: Book;
  onSubmit: (book: Book) => void;
}

export const BookForm: React.FC<BookFormProps> = ({ initialBook, onSubmit }) => {
  const [book, setBook] = React.useState<Book>(initialBook);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setBook(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(book);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-2">
        <Label htmlFor="title">Book Title</Label>
        <Input
          id="title"
          name="title"
          value={book.title}
          onChange={handleChange}
          placeholder="Enter the book title"
          required
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="author">Author</Label>
        <Input
          id="author"
          name="author"
          value={book.author}
          onChange={handleChange}
          placeholder="Enter the author's name"
          required
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="coverUrl">Cover Image URL</Label>
        <Input
          id="coverUrl"
          name="coverUrl"
          value={book.coverUrl}
          onChange={handleChange}
          placeholder="Enter URL for cover image"
          required
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="content">Book Content</Label>
        <Textarea
          id="content"
          name="content"
          value={book.content}
          onChange={handleChange}
          placeholder="Enter the book content"
          className="min-h-[200px]"
          required
        />
      </div>

      <div className="flex justify-end">
        <Button type="submit">
          {initialBook.id ? 'Update Book' : 'Add Book'}
        </Button>
      </div>
    </form>
  );
};
