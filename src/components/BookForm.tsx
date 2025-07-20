
import React from 'react';
import { Book } from '@/types/Book';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { TagInput } from '@/components/TagInput';
import { FileImport } from '@/components/FileImport';
import { sanitizeText, sanitizeHtml, validateTextLength, validateUrl, validatePoints } from '@/utils/security';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, BookOpen } from 'lucide-react';

interface BookFormProps {
  initialBook: Book;
  onSubmit: (book: Book) => void;
}

export const BookForm: React.FC<BookFormProps> = ({ initialBook, onSubmit }) => {
  const [book, setBook] = React.useState<Book>(initialBook);
  const [isExtracting, setIsExtracting] = React.useState(false);
  const { toast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Validate input length
    let maxLength = 200; // default
    if (name === 'title') maxLength = 200;
    else if (name === 'author') maxLength = 100;
    else if (name === 'summary') maxLength = 1000;
    else if (name === 'content') maxLength = 500000;
    
    if (!validateTextLength(value, maxLength)) {
      toast({
        title: "Input too long",
        description: `${name} must be less than ${maxLength} characters.`,
        variant: "destructive"
      });
      return;
    }

    const sanitizedValue = name === 'content' ? sanitizeHtml(value) : sanitizeText(value);
    
    setBook(prev => ({ 
      ...prev, 
      [name]: name === 'points' ? parseInt(value) || 0 : sanitizedValue 
    }));
  };

  const handleCoverUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value && !validateUrl(value)) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid image URL.",
        variant: "destructive"
      });
      return;
    }
    setBook(prev => ({ ...prev, coverUrl: sanitizeText(value) }));
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

  const handleContentImport = (content: string) => {
    const sanitizedContent = sanitizeHtml(content);
    setBook(prev => ({ ...prev, content: sanitizedContent }));
  };

  const handleExtractChapters = async () => {
    if (!book.content?.trim()) {
      toast({
        title: "Contenu requis",
        description: "Veuillez d'abord ajouter du contenu au livre pour extraire les chapitres.",
        variant: "destructive"
      });
      return;
    }

    setIsExtracting(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('extract-chapters', {
        body: { 
          content: book.content,
          title: book.title || 'Livre sans titre'
        }
      });

      if (error) throw error;

      if (data?.hasChapters) {
        setBook(prev => ({ 
          ...prev, 
          hasChapters: true,
          isInteractive: data.isInteractive || false 
        }));
        
        toast({
          title: "Chapitres extraits avec succès",
          description: `${data.chaptersCount} chapitres détectés. ${data.isInteractive ? 'Contenu interactif détecté!' : ''}`,
        });
      } else {
        toast({
          title: "Aucun chapitre détecté",
          description: "Le contenu ne semble pas avoir de structure en chapitres claire.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Erreur lors de l\'extraction des chapitres:', error);
      toast({
        title: "Erreur d'extraction",
        description: "Une erreur s'est produite lors de l'extraction des chapitres.",
        variant: "destructive"
      });
    } finally {
      setIsExtracting(false);
    }
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

    if (!book.content?.trim()) {
      toast({
        title: "Validation Error",
        description: "Content is required.",
        variant: "destructive"
      });
      return false;
    }

    if (!validateUrl(book.coverUrl)) {
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

    onSubmit({
      ...book,
      title: sanitizeText(book.title),
      author: sanitizeText(book.author),
      summary: book.summary ? sanitizeText(book.summary) : undefined,
      content: sanitizeHtml(book.content),
      coverUrl: sanitizeText(book.coverUrl)
    });
  };

  return (
    <div className="h-full max-h-[80vh] overflow-y-auto pr-2">
      <form onSubmit={handleSubmit} className="space-y-4">
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
          maxLength={1000}
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

      <div className="grid gap-2">
        <Label htmlFor="points">Récompense en points</Label>
        <Input
          id="points"
          name="points"
          type="number"
          value={book.points}
          onChange={handlePointsChange}
          placeholder="Points gagnés pour la lecture de ce livre"
          min="0"
          max="100000"
          required
        />
      </div>

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

      <div className="grid gap-2">
        <Label>Étiquettes</Label>
        <TagInput tags={book.tags} onTagsChange={handleTagsChange} />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="content">Contenu du livre</Label>
        <div className="space-y-2">
          <Textarea
            id="content"
            name="content"
            value={book.content}
            onChange={handleChange}
            placeholder="Entrez le contenu du livre ou importez un PDF"
            className="min-h-[200px]"
            maxLength={500000}
            required
          />
          <FileImport type="pdf" onFileImport={handleContentImport} />
          
          {book.content && (
            <div className="flex flex-col gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleExtractChapters}
                disabled={isExtracting}
                className="w-full"
              >
                {isExtracting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Extraction en cours...
                  </>
                ) : (
                  <>
                    <BookOpen className="mr-2 h-4 w-4" />
                    Détecter et extraire les chapitres
                  </>
                )}
              </Button>
              
              {book.hasChapters && (
                <div className="text-sm text-green-600 dark:text-green-400">
                  ✓ Chapitres détectés {book.isInteractive && '(Contenu interactif)'}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit">
          {initialBook.id ? 'Mettre à jour le livre' : 'Ajouter le livre'}
        </Button>
      </div>
      </form>
    </div>
  );
};
