import React, { useState, useEffect } from 'react';
import { ChapterEpub } from '@/types/ChapterEpub';
import { chapterEpubService } from '@/services/chapterEpubService';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Edit, Trash2, GripVertical } from 'lucide-react';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface ChapterEpubListProps {
  bookId: string;
  onEdit: (chapter: ChapterEpub) => void;
  refresh: number;
}

export const ChapterEpubList: React.FC<ChapterEpubListProps> = ({ bookId, onEdit, refresh }) => {
  const [chapters, setChapters] = useState<ChapterEpub[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteChapter, setDeleteChapter] = useState<ChapterEpub | null>(null);

  const loadChapters = async () => {
    try {
      const data = await chapterEpubService.getChaptersByBookId(bookId);
      setChapters(data);
    } catch (error) {
      console.error('Error loading chapters:', error);
      toast.error('Erreur lors du chargement des chapitres');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadChapters();
  }, [bookId, refresh]);

  const handleDelete = async () => {
    if (!deleteChapter) return;

    try {
      await chapterEpubService.deleteChapter(deleteChapter.id);
      toast.success('Chapitre supprimé');
      loadChapters();
    } catch (error) {
      console.error('Error deleting chapter:', error);
      toast.error('Erreur lors de la suppression');
    } finally {
      setDeleteChapter(null);
    }
  };

  if (loading) {
    return <div className="text-center py-4">Chargement...</div>;
  }

  if (chapters.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Aucun chapitre pour le moment. Créez-en un pour commencer.
      </div>
    );
  }

  return (
    <>
      <div className="space-y-2">
        {chapters.map((chapter) => (
          <Card key={chapter.id}>
            <CardContent className="flex items-center gap-4 p-4">
              <GripVertical className="h-5 w-5 text-muted-foreground cursor-move" />
              
              {chapter.illustration_url && (
                <img
                  src={chapter.illustration_url}
                  alt={chapter.title}
                  className="h-16 w-16 object-cover rounded"
                />
              )}
              
              <div className="flex-1">
                <h4 className="font-semibold">{chapter.title}</h4>
                <p className="text-sm text-muted-foreground">
                  Position {chapter.position} • Chapitre {chapter.chapter_number}
                </p>
                {chapter.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                    {chapter.description}
                  </p>
                )}
              </div>
              
              <div className="flex gap-2">
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => onEdit(chapter)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="destructive"
                  onClick={() => setDeleteChapter(chapter)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <AlertDialog open={!!deleteChapter} onOpenChange={() => setDeleteChapter(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer le chapitre ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Le chapitre "{deleteChapter?.title}" sera définitivement supprimé.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Supprimer</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
