
import React, { useState, useMemo } from 'react';
import { Book } from '@/types/Book';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Tag } from 'lucide-react';
import { BookCard } from './BookCard';
import { BookCarousel } from './BookCarousel';

interface SearchPageProps {
  books: Book[];
  onBookSelect: (book: Book) => void;
}

export const SearchPage: React.FC<SearchPageProps> = ({ books, onBookSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const allTags = useMemo(() => Array.from(new Set(books.flatMap(book => book.tags || []))), [books]);

  const filteredBooks = useMemo(() => books.filter(book => {
    const matchesSearch = book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         book.author.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTags = selectedTags.length === 0 || 
                       selectedTags.every(tag => (book.tags || []).includes(tag));
    
    return matchesSearch && matchesTags;
  }), [books, searchTerm, selectedTags]);

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

  const booksByTag = useMemo(() => {
    const groupedBooks: { [key: string]: Book[] } = {};
    allTags.forEach(tag => {
      groupedBooks[tag] = books.filter(book => (book.tags || []).includes(tag));
    });
    return groupedBooks;
  }, [books, allTags]);

  const isFiltering = searchTerm || selectedTags.length > 0;

  if (books.length === 0) {
    return (
      <div className="text-center py-12 border border-wood-700 bg-wood-800/30 rounded-lg text-wood-200">
        <p>Il n'y a aucun livre dans la bibliothèque.</p>
        <p className="text-sm text-wood-400">Ajoutez-en depuis le panneau d'administration.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20 text-wood-100">
      <div className="space-y-4">
        <h2 className="text-3xl font-bold text-center text-wood-100">Rechercher des livres</h2>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-wood-300 h-4 w-4" />
          <Input
            placeholder="Rechercher par titre ou auteur..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-wood-800/60 border-wood-700 text-wood-100 placeholder:text-wood-400 focus:ring-primary"
          />
        </div>

        {allTags.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4 text-wood-300" />
              <span className="text-sm font-medium">Filtrer par tags :</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {allTags.map((tag) => (
                <Badge
                  key={tag}
                  variant={selectedTags.includes(tag) ? "default" : "secondary"}
                  className="cursor-pointer capitalize"
                  onClick={() => toggleTag(tag)}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {isFiltering && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-wood-300">
              {filteredBooks.length} résultat(s) trouvé(s)
              {searchTerm && ` pour "${searchTerm}"`}
              {selectedTags.length > 0 && ` avec les tags : ${selectedTags.join(', ')}`}
            </p>
            <Button variant="ghost" size="sm" onClick={clearFilters} className="text-primary hover:text-primary/90 hover:bg-transparent">
              Effacer les filtres
            </Button>
          </div>
        )}
      </div>

      {isFiltering ? (
        <>
          {filteredBooks.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {filteredBooks.map((book) => (
                <BookCard key={book.id} book={book} onBookSelect={onBookSelect} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border border-wood-700 bg-wood-800/30 rounded-lg">
              <p className="text-wood-300">Aucun livre ne correspond à vos critères de recherche.</p>
            </div>
          )}
        </>
      ) : (
        <div className="space-y-8">
            {allTags.map(tag => (
                <BookCarousel 
                    key={tag}
                    title={tag}
                    books={booksByTag[tag]}
                    onBookSelect={onBookSelect}
                />
            ))}
            {allTags.length === 0 && (
                 <div className="text-center py-12 border border-wood-700 bg-wood-800/30 rounded-lg">
                    <p className="text-wood-300">Aucun livre n'a de tag pour le moment.</p>
                </div>
            )}
        </div>
      )}
    </div>
  );
};
