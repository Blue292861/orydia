import React, { useState } from 'react';
import { ChapterEpub } from '@/types/ChapterEpub';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { chapterEpubService } from '@/services/chapterEpubService';
import { Loader2 } from 'lucide-react';
import DOMPurify from 'dompurify';

interface ChapterEpubFormProps {
  bookId: string;
  chapter?: ChapterEpub;
  nextPosition: number;
  onSuccess: () => void;
  onCancel: () => void;
}

export const ChapterEpubForm: React.FC<ChapterEpubFormProps> = ({
  bookId,
  chapter,
  nextPosition,
  onSuccess,
  onCancel,
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: chapter?.title || '',
    description: chapter?.description || '',
    position: chapter?.position || nextPosition,
    chapter_number: chapter?.chapter_number || nextPosition,
  });
  const [epubFile, setEpubFile] = useState<File | null>(null);
  const [illustrationFile, setIllustrationFile] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast.error('Le titre est obligatoire');
      return;
    }

    if (!chapter && !epubFile) {
      toast.error('Le fichier EPUB est obligatoire');
      return;
    }

    setLoading(true);

    try {
      let epub_url = chapter?.epub_url || '';
      let illustration_url = chapter?.illustration_url || '';

      // Upload EPUB if provided
      if (epubFile) {
        epub_url = await chapterEpubService.uploadChapterEpub(
          epubFile,
          bookId,
          formData.chapter_number
        );
      }

      // Upload illustration if provided
      if (illustrationFile) {
        illustration_url = await chapterEpubService.uploadChapterIllustration(illustrationFile);
      }

      const chapterData = {
        book_id: bookId,
        chapter_number: formData.chapter_number,
        title: DOMPurify.sanitize(formData.title.trim()),
        description: formData.description.trim() ? DOMPurify.sanitize(formData.description.trim()) : undefined,
        epub_url,
        illustration_url: illustration_url || undefined,
        position: formData.position,
      };

      if (chapter) {
        await chapterEpubService.updateChapter(chapter.id, chapterData);
        toast.success('Chapitre mis à jour avec succès');
      } else {
        await chapterEpubService.createChapter(chapterData);
        toast.success('Chapitre créé avec succès');
      }

      onSuccess();
    } catch (error) {
      console.error('Error saving chapter:', error);
      toast.error('Erreur lors de la sauvegarde du chapitre');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{chapter ? 'Modifier le chapitre' : 'Ajouter un chapitre'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Titre du chapitre *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Ex: Chapitre 1: Le Commencement"
              maxLength={200}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description courte (facultatif)</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Une courte description du chapitre..."
              maxLength={500}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="position">Position (ordre de lecture)</Label>
            <Input
              id="position"
              type="number"
              value={formData.position}
              onChange={(e) => setFormData({ ...formData, position: parseInt(e.target.value) })}
              min={1}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="illustration">Illustration du chapitre (facultatif)</Label>
            <Input
              id="illustration"
              type="file"
              accept="image/*"
              onChange={(e) => setIllustrationFile(e.target.files?.[0] || null)}
            />
            {chapter?.illustration_url && !illustrationFile && (
              <p className="text-sm text-muted-foreground">Illustration actuelle présente</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="epub">Fichier EPUB {!chapter && '*'}</Label>
            <Input
              id="epub"
              type="file"
              accept=".epub,application/epub+zip"
              onChange={(e) => setEpubFile(e.target.files?.[0] || null)}
              required={!chapter}
            />
            {chapter && !epubFile && (
              <p className="text-sm text-muted-foreground">EPUB actuel présent</p>
            )}
          </div>

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
              Annuler
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {chapter ? 'Mettre à jour' : 'Créer'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
