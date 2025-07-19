import React, { useState, useEffect } from 'react';
import { Book } from '@/types/Book';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BookOpen, Edit, Eye } from 'lucide-react';
import { useBooks } from '@/hooks/useBooks';
import { ChapterEditor } from '@/components/ChapterEditor';

export const ChapterEditorAdmin: React.FC = () => {
  const { books } = useBooks();
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredBooks = books.filter(book => 
    book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.author.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const booksWithChapters = filteredBooks.filter(book => book.hasChapters);

  if (selectedBook) {
    return (
      <ChapterEditor 
        book={selectedBook} 
        onClose={() => setSelectedBook(null)} 
      />
    );
  }

  return (
    <div className="h-full max-h-screen overflow-y-auto space-y-6 pr-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Éditeur de Chapitres</h1>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sélectionner un livre avec chapitres</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Rechercher un livre par titre ou auteur..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          {booksWithChapters.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg mb-2">Aucun livre avec chapitres trouvé</p>
              <p className="text-sm">
                Utilisez le formulaire d'ajout de livre et la fonction d'extraction automatique 
                pour créer des livres avec chapitres.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {booksWithChapters.map((book) => (
                <Card key={book.id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <img
                        src={book.coverUrl}
                        alt={book.title}
                        className="w-16 h-20 object-cover rounded"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium truncate">{book.title}</h3>
                        <p className="text-sm text-muted-foreground truncate">{book.author}</p>
                        <div className="flex items-center gap-2 mt-2">
                          {book.isInteractive && (
                            <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                              Interactif
                            </span>
                          )}
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            Chapitres
                          </span>
                        </div>
                        <Button
                          size="sm"
                          className="mt-3 w-full"
                          onClick={() => setSelectedBook(book)}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Éditer
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};