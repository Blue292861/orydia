
import React, { useState } from 'react';
import { Book } from '@/types/Book';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { BookForm } from '@/components/BookForm';
import { Plus, Pencil, Trash2, Crown, Star, Zap } from 'lucide-react';
import { useBooks } from '@/hooks/useBooks';
import { useResponsive } from '@/hooks/useResponsive';

export const AdminDashboard: React.FC = () => {
  const { books, loading, addBook, updateBook, deleteBook } = useBooks();
  const [showDialog, setShowDialog] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const { isMobile, isTablet } = useResponsive();

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
      updateBook(bookData);
    } else {
      addBook(bookData);
    }
    setShowDialog(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce livre ?')) {
      deleteBook(id);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Chargement...</div>;
  }

  return (
    <div className="h-full max-h-screen overflow-y-auto space-y-6 pr-2">
      <div className={`flex ${isMobile ? 'flex-col gap-4' : 'justify-between items-center'}`}>
        <h2 className={`font-bold ${isMobile ? 'text-2xl' : isTablet ? 'text-3xl' : 'text-3xl'}`}>
          Tableau de bord Admin
        </h2>
        <Button 
          onClick={handleOpenAdd} 
          className={`flex items-center gap-2 ${isMobile ? 'w-full justify-center' : ''}`}
          size={isMobile ? 'default' : 'default'}
        >
          <Plus className="h-4 w-4" /> 
          {isMobile ? 'Ajouter' : 'Ajouter un nouveau livre'}
        </Button>
      </div>

      <div className={`grid gap-4 ${
        isMobile 
          ? 'grid-cols-1' 
          : isTablet 
            ? 'grid-cols-1 md:grid-cols-2' 
            : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
      }`}>
        {books.map((book) => (
          <Card key={book.id} className={book.isPremium ? "ring-2 ring-yellow-500" : ""}>
            <div className={`flex ${isMobile ? 'h-[100px]' : 'h-[120px]'}`}>
              <img 
                src={book.coverUrl} 
                alt={book.title}
                className={`${isMobile ? 'w-20' : 'w-24'} h-full object-cover`}
              />
              <CardHeader className={`flex-1 ${isMobile ? 'p-3' : 'p-4'}`}>
                <div className="flex items-center gap-2">
                  <CardTitle className={`${isMobile ? 'text-base' : 'text-lg'} leading-tight`}>
                    {book.title}
                  </CardTitle>
                  {book.isPremium && <Crown className="h-4 w-4 text-yellow-500 flex-shrink-0" />}
                </div>
                <p className={`${isMobile ? 'text-xs' : 'text-sm'} text-muted-foreground line-clamp-1`}>
                  {book.author}
                </p>
                <div className={`flex items-center gap-1 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                  <img src="/lovable-uploads/4a891ef6-ff72-4b5a-b33c-0dc33dd3aa26.png" alt="Tensens Icon" className="h-4 w-4" />
                  <span className="font-medium">{book.points} Tensens</span>
                </div>
              </CardHeader>
            </div>
            <CardContent className={`${isMobile ? 'p-3' : 'p-4'} pt-0 space-y-2`}>
              <div className="flex flex-wrap items-center gap-1">
                {book.isPremium && (
                  <Badge variant="default" className={`bg-yellow-500 text-white flex items-center ${isMobile ? 'text-xs' : ''}`}>
                    <Crown className="h-3 w-3 mr-1" /> Premium
                  </Badge>
                )}
                {book.isMonthSuccess && (
                  <Badge variant="default" className={`bg-blue-500 text-white flex items-center ${isMobile ? 'text-xs' : ''}`}>
                    <Star className="h-3 w-3 mr-1" /> Succès du mois
                  </Badge>
                )}
                {book.isPacoFavourite && (
                  <Badge variant="default" className={`bg-green-500 text-white flex items-center ${isMobile ? 'text-xs' : ''}`}>
                    <Zap className="h-3 w-3 mr-1" /> Coup de coeur
                  </Badge>
                )}
                {book.tags && book.tags.length > 0 && (
                  book.tags.slice(0, isMobile ? 2 : 3).map((tag) => (
                    <Badge key={tag} variant="secondary" className={isMobile ? 'text-xs' : 'text-xs'}>
                      {tag}
                    </Badge>
                  ))
                )}
              </div>
              <div className={`flex ${isMobile ? 'flex-col gap-2' : 'justify-end gap-2'}`}>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleOpenEdit(book)}
                  className={isMobile ? 'w-full' : ''}
                >
                  <Pencil className="h-4 w-4 mr-1" /> Modifier
                </Button>
                <Button 
                  variant="destructive" 
                  size="sm" 
                  onClick={() => handleDelete(book.id)}
                  className={isMobile ? 'w-full' : ''}
                >
                  <Trash2 className="h-4 w-4 mr-1" /> Supprimer
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {books.length === 0 && (
        <div className={`text-center py-12 border rounded-lg ${isMobile ? 'px-4' : ''}`}>
          <p className={`text-muted-foreground ${isMobile ? 'text-sm' : ''}`}>
            Aucun livre dans la bibliothèque pour le moment. Ajoutez votre premier livre !
          </p>
        </div>
      )}

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className={`${isMobile ? 'w-[95vw] max-w-[95vw]' : 'sm:max-w-[525px]'}`}>
          <DialogHeader>
            <DialogTitle className={isMobile ? 'text-lg' : ''}>
              {editingBook ? 'Modifier le livre' : 'Ajouter un nouveau livre'}
            </DialogTitle>
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
              hasChapters: false,
              isInteractive: false,
            }}
            onSubmit={handleSubmit}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};
