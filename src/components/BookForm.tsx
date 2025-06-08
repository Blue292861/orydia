
import React from 'react';
import { Book } from '@/types/Book';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { TagInput } from '@/components/TagInput';
import { FileImport } from '@/components/FileImport';

interface BookFormProps {
  initialBook: Book;
  onSubmit: (book: Book) => void;
}

export const BookForm: React.FC<BookFormProps> = ({ initialBook, onSubmit }) => {
  const [book, setBook] = React.useState<Book>(initialBook);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setBook(prev => ({ 
      ...prev, 
      [name]: name === 'points' ? parseInt(value) || 0 : value 
    }));
  };

  const handleTagsChange = (tags: string[]) => {
    setBook(prev => ({ ...prev, tags }));
  };

  const handleCoverImport = (coverData: string) => {
    setBook(prev => ({ ...prev, coverUrl: coverData }));
  };

  const handleContentImport = (content: string) => {
    setBook(prev => ({ ...prev, content }));
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
        <div className="space-y-2">
          <Input
            id="coverUrl"
            name="coverUrl"
            value={book.coverUrl}
            onChange={handleChange}
            placeholder="Enter URL for cover image or import file"
            required
          />
          <FileImport type="image" onFileImport={handleCoverImport} />
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="points">Points Reward</Label>
        <Input
          id="points"
          name="points"
          type="number"
          value={book.points}
          onChange={handleChange}
          placeholder="Points earned for reading this book"
          min="0"
          required
        />
      </div>

      <div className="grid gap-2">
        <Label>Tags</Label>
        <TagInput tags={book.tags} onTagsChange={handleTagsChange} />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="content">Book Content</Label>
        <div className="space-y-2">
          <Textarea
            id="content"
            name="content"
            value={book.content}
            onChange={handleChange}
            placeholder="Enter the book content or import PDF"
            className="min-h-[200px]"
            required
          />
          <FileImport type="pdf" onFileImport={handleContentImport} />
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit">
          {initialBook.id ? 'Update Book' : 'Add Book'}
        </Button>
      </div>
    </form>
  );
};
