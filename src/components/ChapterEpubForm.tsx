import React, { useState, useEffect } from 'react';
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
import { supabase } from '@/integrations/supabase/client';

interface ChapterEpubFormProps {
  bookId: string;
  chapter?: ChapterEpub;
  onSuccess: () => void;
  onCancel: () => void;
}

export const ChapterEpubForm: React.FC<ChapterEpubFormProps> = ({
  bookId,
  chapter,
  onSuccess,
  onCancel,
}) => {
  const [loading, setLoading] = useState(false);
  const [nextChapterNumber, setNextChapterNumber] = useState<number>(1);
  const [nextPosition, setNextPosition] = useState<number>(1);
  const [formData, setFormData] = useState({
    title: chapter?.title || '',
    description: chapter?.description || '',
    position: chapter?.position || 1,
    chapter_number: chapter?.chapter_number || 1,
  });
  const [epubFile, setEpubFile] = useState<File | null>(null);
  const [illustrationFile, setIllustrationFile] = useState<File | null>(null);
  const [opfFile, setOpfFile] = useState<File | null>(null);

  // Calculate next available chapter_number and position
  useEffect(() => {
    const fetchNextValues = async () => {
      if (chapter) {
        // En mode édition, conserver les valeurs existantes
        setNextChapterNumber(chapter.chapter_number);
        setNextPosition(chapter.position);
        return;
      }

      try {
        // Récupérer le maximum de chapter_number
        const { data: chapterData, error: chapterError } = await supabase
          .from('book_chapter_epubs')
          .select('chapter_number')
          .eq('book_id', bookId)
          .order('chapter_number', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (chapterError && chapterError.code !== 'PGRST116') {
          console.error('Error fetching max chapter_number:', chapterError);
        }

        const maxChapterNumber = chapterData?.chapter_number || 0;
        setNextChapterNumber(maxChapterNumber + 1);

        // Récupérer le maximum de position
        const { data: positionData, error: positionError } = await supabase
          .from('book_chapter_epubs')
          .select('position')
          .eq('book_id', bookId)
          .order('position', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (positionError && positionError.code !== 'PGRST116') {
          console.error('Error fetching max position:', positionError);
        }

        const maxPosition = positionData?.position || 0;
        setNextPosition(maxPosition + 1);
      } catch (error) {
        console.error('Error calculating next values:', error);
      }
    };

    fetchNextValues();
  }, [bookId, chapter]);

  // Synchronize formData with nextChapterNumber and nextPosition
  useEffect(() => {
    if (!chapter) {
      setFormData(prev => ({ 
        ...prev, 
        chapter_number: nextChapterNumber,
        position: nextPosition 
      }));
    }
  }, [nextChapterNumber, nextPosition, chapter]);

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
      let opf_url = chapter?.opf_url || '';

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

      // Upload OPF if provided
      if (opfFile) {
        opf_url = await chapterEpubService.uploadChapterOPF(
          opfFile,
          bookId,
          formData.chapter_number
        );
      }

      const chapterData = {
        book_id: bookId,
        chapter_number: formData.chapter_number,
        title: DOMPurify.sanitize(formData.title.trim()),
        description: formData.description.trim() ? DOMPurify.sanitize(formData.description.trim()) : undefined,
        epub_url,
        illustration_url: illustration_url || undefined,
        opf_url: opf_url || undefined,
        position: formData.position,
      };

      let createdChapterId: string | undefined;

      if (chapter) {
        await chapterEpubService.updateChapter(chapter.id, chapterData);
        toast.success('Chapitre mis à jour avec succès');
        createdChapterId = chapter.id;
      } else {
        const newChapter = await chapterEpubService.createChapter(chapterData);
        toast.success('Chapitre créé avec succès');
        createdChapterId = newChapter.id;
      }

      // Trigger background translations for new chapters
      if (createdChapterId && !chapter) {
        toast.info('Traductions en cours en arrière-plan...');
        
        const languagesToTranslate = ['en', 'es', 'de', 'ru', 'zh', 'ja'];
        
        supabase.functions.invoke('translate-chapter-batch', {
          body: {
            chapter_id: createdChapterId,
            languages: languagesToTranslate,
          }
        }).catch((error) => {
          console.error('Translation batch error:', error);
        });
      }

      onSuccess();
    } catch (error: any) {
      console.error('Error saving chapter:', error);
      
      if (error?.code === '23505') {
        toast.error('Ce numéro de chapitre existe déjà. Veuillez rafraîchir la page et réessayer.');
      } else {
        toast.error('Erreur lors de la sauvegarde du chapitre');
      }
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

          <div className="space-y-2">
            <Label htmlFor="opf">Fichier OPF personnalisé (facultatif)</Label>
            <Input
              id="opf"
              type="file"
              accept=".opf,application/oebps-package+xml"
              onChange={(e) => setOpfFile(e.target.files?.[0] || null)}
            />
            {chapter?.opf_url && !opfFile && (
              <p className="text-sm text-muted-foreground">OPF personnalisé présent</p>
            )}
            <p className="text-xs text-muted-foreground">
              ℹ️ Un fichier EPUB contient déjà un OPF. N'uploadez un OPF personnalisé que si vous souhaitez remplacer la structure par défaut.
            </p>
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
