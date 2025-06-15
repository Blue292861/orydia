import React, { useState } from 'react';
import { Book } from '@/types/Book';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { BookForm } from '@/components/BookForm';
import { Plus, Pencil, Trash2, Coins, Crown, Star, Zap } from 'lucide-react';

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
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce livre ?')) {
      onDeleteBook(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Tableau de bord Admin</h2>
        <Button onClick={handleOpenAdd} className="flex items-center gap-2">
          <Plus className="h-4 w-4" /> Ajouter un nouveau livre
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {books.map((book) => (
          <Card key={book.id} className={book.isPremium ? "ring-2 ring-yellow-500" : ""}>
            <div className="flex h-[120px]">
              <img 
                src={book.coverUrl} 
                alt={book.title}
                className="w-24 h-full object-cover" 
              />
              <CardHeader className="flex-1 p-4">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-lg">{book.title}</CardTitle>
                  {book.isPremium && <Crown className="h-4 w-4 text-yellow-500" />}
                </div>
                <p className="text-sm text-muted-foreground">{book.author}</p>
                <div className="flex items-center gap-1 text-sm">
                  <Coins className="h-4 w-4 text-primary" />
                  <span className="font-medium">{book.points} points</span>
                </div>
              </CardHeader>
            </div>
            <CardContent className="p-4 pt-0 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                {book.isPremium && (
                  <Badge variant="default" className="bg-yellow-500 text-white flex items-center">
                    <Crown className="h-3 w-3 mr-1" /> Premium
                  </Badge>
                )}
                {book.isMonthSuccess && (
                  <Badge variant="default" className="bg-blue-500 text-white flex items-center">
                    <Star className="h-3 w-3 mr-1" /> Succès du mois
                  </Badge>
                )}
                {book.isPacoFavourite && (
                  <Badge variant="default" className="bg-green-500 text-white flex items-center">
                    <Zap className="h-3 w-3 mr-1" /> Coup de coeur
                  </Badge>
                )}
                {book.tags && book.tags.length > 0 && (
                  book.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))
                )}
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" size="sm" onClick={() => handleOpenEdit(book)}>
                  <Pencil className="h-4 w-4 mr-1" /> Modifier
                </Button>
                <Button variant="destructive" size="sm" onClick={() => handleDelete(book.id)}>
                  <Trash2 className="h-4 w-4 mr-1" /> Supprimer
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {books.length === 0 && (
        <div className="text-center py-12 border rounded-lg">
          <p className="text-muted-foreground">Aucun livre dans la bibliothèque pour le moment. Ajoutez votre premier livre !</p>
        </div>
      )}

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>{editingBook ? 'Modifier le livre' : 'Ajouter un nouveau livre'}</DialogTitle>
          </DialogHeader>
          <BookForm 
            initialBook={editingBook || {
              id: '',
              title: '',
              author: '',
              coverUrl: '',
              content: '',
              points: 0,
              tags: [],
              isPremium: false,
              isMonthSuccess: false,
              isPacoFavourite: false,
            }}
            onSubmit={handleSubmit}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};
