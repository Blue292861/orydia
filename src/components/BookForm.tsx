// src/components/BookForm.tsx
import React from 'react';
import { Book } from '@/types/Book';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { TagInput } from '@/components/TagInput';
import { GenreSelector } from '@/components/GenreSelector';
import { LiteraryGenre } from '@/constants/genres';
import { FileImport } from '@/components/FileImport';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { sanitizeText, sanitizeImageUrl, sanitizeTextWithSpaces, sanitizeHtml, validateTextLength, validateImageUrl, validatePoints } from '@/utils/security';
import { useToast } from '@/hooks/use-toast';
import { BookOpen, Zap } from 'lucide-react';

interface BookFormProps {
  initialBook: Book;
  onSubmit: (book: Book) => void;
}

export const BookForm: React.FC<BookFormProps> = ({ initialBook, onSubmit }) => {
  const [book, setBook] = React.useState<Book>({
    ...initialBook,
    hasChapters: true // Système de chapitres obligatoire par défaut
  });
  const [selectedGenres, setSelectedGenres] = React.useState<LiteraryGenre[]>(
    (initialBook.genres || []).filter((genre): genre is LiteraryGenre => 
      typeof genre === 'string' && genre.length > 0
    )
  );
  const { toast } = useToast();

  const isEpubContent = book.content && (book.content.startsWith('http') || book.content.startsWith('https')) && book.content.endsWith('.epub');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    let maxLength = 200;
    if (name === 'title') maxLength = 200;
    else if (name === 'author') maxLength = 100;
    else if (name === 'summary') maxLength = 2000;
    else if (name === 'content') maxLength = 1200000;
    
    if (!validateTextLength(value, maxLength)) {
      toast({
        title: "Input too long",
        description: `${name} must be less than ${maxLength} characters.`,
        variant: "destructive"
      });
      return;
    }

    setBook(prev => ({ 
      ...prev, 
      [name]: name === 'points' ? parseInt(value) || 0 : value 
    }));
  };

  const handleCoverUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value && !validateImageUrl(value)) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid image URL.",
        variant: "destructive"
      });
      return;
    }
    setBook(prev => ({ ...prev, coverUrl: sanitizeImageUrl(value) }));
  };

  const handlePointsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const points = parseInt(e.target.value) || 0;
    if (!validatePoints(points)) {
      toast({
        title: "Invalid points",
        description: "Points must be between 0 and 100,000.",
        variant: "destructive"
      });
      return;
    }
    setBook(prev => ({ ...prev, points }));
  };

  const handleTagsChange = (tags: string[]) => {
    setBook(prev => ({ ...prev, tags }));
  };

  const handlePremiumChange = (isPremium: boolean) => {
    setBook(prev => ({ ...prev, isPremium }));
  };

  const handleMonthSuccessChange = (isMonthSuccess: boolean) => {
    setBook(prev => ({ ...prev, isMonthSuccess }));
  };

  const handlePacoFavouriteChange = (isPacoFavourite: boolean) => {
    setBook(prev => ({ ...prev, isPacoFavourite }));
  };

  const handleCoverImport = (coverData: string) => {
    setBook(prev => ({ ...prev, coverUrl: coverData }));
  };

  const handleInteractiveChange = (isInteractive: boolean) => {
    setBook(prev => ({ 
      ...prev, 
      isInteractive,
      // Reset points to 0 for interactive books (rewards defined per ending chapter)
      points: isInteractive ? 0 : prev.points
    }));
  };

  const validateForm = (): boolean => {
    if (!book.title?.trim()) {
      toast({
        title: "Validation Error",
        description: "Title is required.",
        variant: "destructive"
      });
      return false;
    }
    if (!book.author?.trim()) {
      toast({
        title: "Validation Error",
        description: "Author is required.",
        variant: "destructive"
      });
      return false;
    }
    if (!book.coverUrl?.trim()) {
      toast({
        title: "Validation Error",
        description: "Cover URL is required.",
        variant: "destructive"
      });
      return false;
    }
    // Content is optional since chapters system is mandatory
    if (!validateImageUrl(book.coverUrl)) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid cover URL.",
        variant: "destructive"
      });
      return false;
    }
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    // Fusionner les genres sélectionnés dans l'objet final
    const finalBook = {
      ...book,
      genres: selectedGenres.filter((genre): genre is LiteraryGenre => 
        typeof genre === 'string' && genre.length > 0
      ),
      title: sanitizeTextWithSpaces(book.title),
      author: sanitizeTextWithSpaces(book.author),
      summary: book.summary ? sanitizeTextWithSpaces(book.summary) : undefined,
      content: book.content,
      coverUrl: sanitizeImageUrl(book.coverUrl)
    };
    
    onSubmit(finalBook);
  };

  return (
    <ScrollArea className="h-full max-h-[80vh]">
      <div className="pr-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Type selector: Classic vs Interactive */}
          <div className="grid gap-2">
            <Label>Type de livre</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={!book.isInteractive ? "default" : "outline"}
                onClick={() => handleInteractiveChange(false)}
                className="flex-1"
              >
                <BookOpen className="h-4 w-4 mr-2" />
                Classique
              </Button>
              <Button
                type="button"
                variant={book.isInteractive ? "default" : "outline"}
                onClick={() => handleInteractiveChange(true)}
                className="flex-1"
              >
                <Zap className="h-4 w-4 mr-2" />
                Interactif
              </Button>
            </div>
          </div>

          {book.isInteractive && (
            <Alert className="bg-primary/10 border-primary">
              <Zap className="h-4 w-4" />
              <AlertDescription>
                Mode interactif : Les récompenses en Orydors seront définies pour chaque chapitre de fin dans l'éditeur de chapitres.
              </AlertDescription>
            </Alert>
          )}

          <div className="grid gap-2">
            <Label htmlFor="title">Titre du livre</Label>
            <Input
              id="title"
              name="title"
              value={book.title}
              onChange={handleChange}
              placeholder="Entrez le titre du livre"
              maxLength={200}
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="author">Auteur</Label>
            <Input
              id="author"
              name="author"
              value={book.author}
              onChange={handleChange}
              placeholder="Entrez le nom de l'auteur"
              maxLength={100}
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="summary">Résumé</Label>
            <Textarea
              id="summary"
              name="summary"
              value={book.summary || ''}
              onChange={handleChange}
              placeholder="Entrez un résumé du livre"
              className="min-h-[100px]"
              maxLength={2000}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="coverUrl">URL de l'image de couverture</Label>
            <div className="space-y-2">
              <Input
                id="coverUrl"
                name="coverUrl"
                value={book.coverUrl}
                onChange={handleCoverUrlChange}
                placeholder="Entrez l'URL de l'image de couverture ou importez un fichier"
                required
              />
              <FileImport type="image" onFileImport={handleCoverImport} />
            </div>
          </div>

          {/* Only show points for classic books */}
          {!book.isInteractive && (
            <div className="grid gap-2">
              <Label htmlFor="points">Récompense en Orydors</Label>
              <Input
                id="points"
                name="points"
                type="number"
                value={book.points}
                onChange={handlePointsChange}
                placeholder="Orydors gagnés pour la lecture de ce livre"
                min="0"
                max="100000"
                required
              />
            </div>
          )}

          <div className="flex items-center space-x-2">
            <Switch
              id="isPremium"
              checked={book.isPremium}
              onCheckedChange={handlePremiumChange}
            />
            <Label htmlFor="isPremium" className="cursor-pointer">
              Livre Premium
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="isMonthSuccess"
              checked={book.isMonthSuccess}
              onCheckedChange={handleMonthSuccessChange}
            />
            <Label htmlFor="isMonthSuccess" className="cursor-pointer">
              Succès du mois
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="isPacoFavourite"
              checked={book.isPacoFavourite}
              onCheckedChange={handlePacoFavouriteChange}
            />
            <Label htmlFor="isPacoFavourite" className="cursor-pointer">
              Coup de coeur de Paco
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="isAdultContent"
              checked={book.isAdultContent}
              onCheckedChange={(checked) => setBook(prev => ({ ...prev, isAdultContent: checked }))}
            />
            <Label htmlFor="isAdultContent" className="cursor-pointer">
              Contenu +16 ans
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="isRare"
              checked={book.isRare}
              onCheckedChange={(checked) => setBook(prev => ({ ...prev, isRare: checked }))}
            />
            <Label htmlFor="isRare" className="cursor-pointer">
              💎 Livre Rare (accessible uniquement via lien)
            </Label>
          </div>
          
          {book.isRare && (
            <Alert className="bg-amber-900/20 border-amber-700">
              <AlertDescription className="text-amber-200">
                ⚠️ Ce livre ne sera visible que via son lien personnalisé. Il n'apparaîtra pas dans les recherches ni les listes de genres.
              </AlertDescription>
            </Alert>
          )}

          <div className="grid gap-2">
            <GenreSelector
              selectedGenres={selectedGenres}
              onGenresChange={setSelectedGenres}
            />
          </div>

          <div className="grid gap-2">
            <Label>Étiquettes</Label>
            <TagInput tags={book.tags} onTagsChange={handleTagsChange} />
          </div>

          <Alert>
            <AlertDescription>
              {book.isInteractive 
                ? "Les chapitres interactifs avec choix multiples et les chapitres de fin seront gérés dans l'éditeur de chapitres."
                : "Le contenu du livre sera géré via le système de chapitres. Après avoir créé le livre, vous pourrez ajouter les chapitres en cliquant sur \"Gérer les chapitres\"."}
            </AlertDescription>
          </Alert>

          <div className="flex justify-end">
            <Button type="submit">
              {initialBook.id ? 'Mettre à jour le livre' : 'Ajouter le livre'}
            </Button>
          </div>
        </form>
      </div>
    </ScrollArea>
  );
};