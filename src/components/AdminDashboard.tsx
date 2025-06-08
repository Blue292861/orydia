
import React, { useState } from 'react';
import { Book } from '@/types/Book';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { BookForm } from '@/components/BookForm';
import { Plus, Pencil, Trash2 } from 'lucide-react';

interface AdminDashboardProps {
  books: Book[];
  onAddBook: (book: Book) => void;
  onUpdateBook: (book: Book) => void;
  onDeleteBook: (id: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
  books, 
  onAddBook,
  onUpdateBook,
  onDeleteBook
}) => {
  const [showDialog, setShowDialog] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);

  const handleOpenAdd = () => {
    setEditingBook(null);
    setShowDialog(true);
  };

  const handleOpenEdit = (book: Book) => {
    setEditingBook(book);
    setShowDialog(true);
  };

  const handleSubmit = (bookData: Book) => {
    if (editingBook) {
      onUpdateBook(bookData);
    } else {
      onAddBook(bookData);
    }
    setShowDialog(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this book?')) {
      onDeleteBook(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Admin Dashboard</h2>
        <Button onClick={handleOpenAdd} className="flex items-center gap-2">
          <Plus className="h-4 w-4" /> Add New Book
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {books.map((book) => (
          <Card key={book.id}>
            <div className="flex h-[120px]">
              <img 
                src={book.coverUrl} 
                alt={book.title}
                className="w-24 h-full object-cover" 
              />
              <CardHeader className="flex-1 p-4">
                <CardTitle className="text-lg">{book.title}</CardTitle>
                <p className="text-sm text-muted-foreground">{book.author}</p>
              </CardHeader>
            </div>
            <CardContent className="p-4 pt-0 flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => handleOpenEdit(book)}>
                <Pencil className="h-4 w-4 mr-1" /> Edit
              </Button>
              <Button variant="destructive" size="sm" onClick={() => handleDelete(book.id)}>
                <Trash2 className="h-4 w-4 mr-1" /> Delete
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {books.length === 0 && (
        <div className="text-center py-12 border rounded-lg">
          <p className="text-muted-foreground">No books in the library yet. Add your first book!</p>
        </div>
      )}

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>{editingBook ? 'Edit Book' : 'Add New Book'}</DialogTitle>
          </DialogHeader>
          <BookForm 
            initialBook={editingBook || {
              id: '',
              title: '',
              author: '',
              coverUrl: '',
              content: ''
            }}
            onSubmit={handleSubmit}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};
