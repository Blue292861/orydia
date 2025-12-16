import { useState, useMemo } from 'react';
import { Check, ChevronsUpDown, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface Book {
  id: string;
  title: string;
  cover_url?: string;
  author?: string;
}

interface BookSearchSelectProps {
  books: Book[];
  value?: string | string[];
  onChange: (value: string | string[]) => void;
  multiple?: boolean;
  placeholder?: string;
  className?: string;
}

export function BookSearchSelect({ 
  books, 
  value, 
  onChange, 
  multiple = false, 
  placeholder = "Rechercher un livre...",
  className 
}: BookSearchSelectProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredBooks = useMemo(() => {
    if (!searchQuery.trim()) return books.slice(0, 50); // Limit initial display
    const query = searchQuery.toLowerCase();
    return books.filter(book => 
      book.title.toLowerCase().includes(query) ||
      book.author?.toLowerCase().includes(query)
    ).slice(0, 50);
  }, [books, searchQuery]);

  const selectedBooks = useMemo(() => {
    if (!value) return [];
    const ids = Array.isArray(value) ? value : [value];
    return books.filter(book => ids.includes(book.id));
  }, [books, value]);

  const handleSelect = (bookId: string) => {
    if (multiple) {
      const currentIds = Array.isArray(value) ? value : value ? [value] : [];
      const newIds = currentIds.includes(bookId)
        ? currentIds.filter(id => id !== bookId)
        : [...currentIds, bookId];
      onChange(newIds);
    } else {
      onChange(bookId);
      setOpen(false);
    }
  };

  const handleRemove = (bookId: string) => {
    if (multiple) {
      const currentIds = Array.isArray(value) ? value : [];
      onChange(currentIds.filter(id => id !== bookId));
    } else {
      onChange('');
    }
  };

  const isSelected = (bookId: string) => {
    if (!value) return false;
    return Array.isArray(value) ? value.includes(bookId) : value === bookId;
  };

  return (
    <div className={cn("space-y-2", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between bg-slate-800 border-amber-700/50 hover:bg-slate-700"
          >
            <span className="truncate text-amber-200">
              {selectedBooks.length > 0 
                ? multiple 
                  ? `${selectedBooks.length} livre(s) sélectionné(s)`
                  : selectedBooks[0]?.title
                : placeholder
              }
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[400px] p-0 bg-slate-900 border-amber-700/50" align="start">
          <Command className="bg-transparent">
            <div className="flex items-center border-b border-amber-700/30 px-3">
              <Search className="mr-2 h-4 w-4 shrink-0 text-amber-400/60" />
              <CommandInput 
                placeholder="Rechercher par titre ou auteur..." 
                value={searchQuery}
                onValueChange={setSearchQuery}
                className="bg-transparent border-0 focus:ring-0 text-amber-100 placeholder:text-amber-400/40"
              />
            </div>
            <CommandList>
              <CommandEmpty className="py-6 text-center text-amber-200/60">
                Aucun livre trouvé
              </CommandEmpty>
              <CommandGroup className="max-h-64 overflow-y-auto">
                {filteredBooks.map((book) => (
                  <CommandItem
                    key={book.id}
                    value={book.id}
                    onSelect={() => handleSelect(book.id)}
                    className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-slate-800"
                  >
                    <div className={cn(
                      "flex h-4 w-4 items-center justify-center rounded border",
                      isSelected(book.id) 
                        ? "bg-amber-600 border-amber-600" 
                        : "border-amber-700/50"
                    )}>
                      {isSelected(book.id) && <Check className="h-3 w-3 text-white" />}
                    </div>
                    {book.cover_url && (
                      <img 
                        src={book.cover_url} 
                        alt={book.title}
                        className="w-8 h-10 object-cover rounded"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-amber-100 truncate">{book.title}</p>
                      {book.author && (
                        <p className="text-xs text-amber-400/60 truncate">{book.author}</p>
                      )}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Selected books display */}
      {multiple && selectedBooks.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedBooks.map(book => (
            <Badge 
              key={book.id} 
              variant="secondary"
              className="bg-amber-600/20 text-amber-200 border border-amber-600/40 pl-2 pr-1 py-1"
            >
              <span className="truncate max-w-[150px]">{book.title}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove(book.id);
                }}
                className="ml-1 p-0.5 hover:bg-amber-600/40 rounded"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
