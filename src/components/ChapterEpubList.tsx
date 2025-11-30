import React, { useState, useEffect } from 'react';
import { ChapterEpub } from '@/types/ChapterEpub';
import { chapterEpubService } from '@/services/chapterEpubService';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Edit, Trash2, GripVertical, RefreshCw, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
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
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import WaypointManager from './WaypointManager';

interface ChapterEpubListProps {
  bookId: string;
  onEdit: (chapter: ChapterEpub) => void;
  refresh: number;
}

export const ChapterEpubList: React.FC<ChapterEpubListProps> = ({ bookId, onEdit, refresh }) => {
  const [chapters, setChapters] = useState<ChapterEpub[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteChapter, setDeleteChapter] = useState<ChapterEpub | null>(null);
  const [migrating, setMigrating] = useState(false);
  const [waypointChapter, setWaypointChapter] = useState<ChapterEpub | null>(null);

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

  const handleMigrateChapters = async () => {
    setMigrating(true);
    const chaptersToMigrate = chapters.filter(ch => ch.opf_url && !ch.merged_epub_url);
    
    if (chaptersToMigrate.length === 0) {
      toast.info('Tous les chapitres sont déjà migrés');
      setMigrating(false);
      return;
    }

    toast.info(`Migration de ${chaptersToMigrate.length} chapitre(s)...`);
    let successCount = 0;
    let failCount = 0;

    for (const chapter of chaptersToMigrate) {
      try {
        // Call merge function
        const { data, error } = await supabase.functions.invoke('merge-epub-opf', {
          body: { epubUrl: chapter.epub_url, opfUrl: chapter.opf_url }
        });

        if (error) throw error;

        // Upload merged EPUB
        const blob = data instanceof Blob ? data : new Blob([data]);
        const mergedUrl = await chapterEpubService.uploadMergedEpub(blob, chapter.book_id, chapter.chapter_number);
        
        // Update chapter
        await chapterEpubService.updateChapter(chapter.id, { merged_epub_url: mergedUrl });
        
        successCount++;
        console.log(`✅ Migrated chapter ${chapter.chapter_number}`);
      } catch (error) {
        console.error(`❌ Failed to migrate chapter ${chapter.chapter_number}:`, error);
        failCount++;
      }
    }

    setMigrating(false);
    loadChapters();
    
    if (successCount > 0) {
      toast.success(`${successCount} chapitre(s) migré(s) avec succès`);
    }
    if (failCount > 0) {
      toast.error(`${failCount} chapitre(s) en erreur`);
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

  const needsMigration = chapters.some(ch => ch.opf_url && !ch.merged_epub_url);

  return (
    <>
      {needsMigration && (
        <div className="mb-4">
          <Button
            onClick={handleMigrateChapters}
            disabled={migrating}
            variant="outline"
            className="w-full"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${migrating ? 'animate-spin' : ''}`} />
            {migrating ? 'Migration en cours...' : 'Pré-fusionner les EPUBs'}
          </Button>
        </div>
      )}
      
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
                  onClick={() => setWaypointChapter(chapter)}
                  title="Gérer les waypoints"
                  className="text-amber-500 hover:text-amber-600 hover:border-amber-500"
                >
                  <MapPin className="h-4 w-4" />
                </Button>
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

      {/* Waypoint Manager Dialog */}
      <Dialog open={!!waypointChapter} onOpenChange={() => setWaypointChapter(null)}>
        <DialogContent className="w-[95vw] max-w-6xl h-[90vh] md:h-[85vh] p-0 overflow-hidden">
          {waypointChapter && (
            <WaypointManager
              chapter={waypointChapter}
              onClose={() => setWaypointChapter(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
