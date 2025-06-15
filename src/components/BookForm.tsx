import React from 'react';
import { Book } from '@/types/Book';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
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
    setBook(prev => ({ ...prev, content }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(book);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-2">
        <Label htmlFor="title">Titre du livre</Label>
        <Input
          id="title"
          name="title"
          value={book.title}
          onChange={handleChange}
          placeholder="Entrez le titre du livre"
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
          required
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="coverUrl">URL de l'image de couverture</Label>
        <div className="space-y-2">
          <Input
            id="coverUrl"
            name="coverUrl"
            value={book.coverUrl}
            onChange={handleChange}
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
          onChange={handleChange}
          placeholder="Points gagnés pour la lecture de ce livre"
          min="0"
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
            required
          />
          <FileImport type="pdf" onFileImport={handleContentImport} />
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit">
          {initialBook.id ? 'Mettre à jour le livre' : 'Ajouter le livre'}
        </Button>
      </div>
    </form>
  );
};
