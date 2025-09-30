
import React, { useState, useEffect } from 'react';
import { Audiobook } from '@/types/Audiobook';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { AudiobookFormV2 } from '@/components/AudiobookFormV2';
import { Plus, Pencil, Trash2, Crown, Star, Zap, Play } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const AudiobookAdmin: React.FC = () => {
  const [audiobooks, setAudiobooks] = useState<Audiobook[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [editingAudiobook, setEditingAudiobook] = useState<Audiobook | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchAudiobooks = async () => {
    try {
      const { data, error } = await supabase
        .from('audiobooks')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAudiobooks((data || []).map(audiobook => ({
        ...audiobook,
        genres: (audiobook as any).genres || []
      })));
    } catch (error) {
      console.error('Error fetching audiobooks:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les audiobooks",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAudiobooks();
  }, []);

  const handleOpenAdd = () => {
    setEditingAudiobook(null);
    setShowDialog(true);
  };

  const handleOpenEdit = (audiobook: Audiobook) => {
    setEditingAudiobook(audiobook);
    setShowDialog(true);
  };

  const handleSubmit = async (audiobookData: Audiobook, chapters: any[]) => {
    try {
      let audiobookId = editingAudiobook?.id;
      
      if (editingAudiobook) {
        // Mise à jour de l'audiobook existant
        const { error } = await supabase
          .from('audiobooks')
          .update({
            name: audiobookData.name,
            author: audiobookData.author,
            description: audiobookData.description,
            cover_url: audiobookData.cover_url,
            genre: audiobookData.genre,
            tags: audiobookData.tags,
            points: audiobookData.points,
            is_premium: audiobookData.is_premium,
            is_month_success: audiobookData.is_month_success,
            is_paco_favourite: audiobookData.is_paco_favourite,
            is_paco_chronicle: audiobookData.is_paco_chronicle,
            is_featured: audiobookData.is_featured,
          })
          .eq('id', editingAudiobook.id);

        if (error) throw error;
        
        // Supprimer les anciens chapitres
        await supabase
          .from('audiobook_chapters')
          .delete()
          .eq('audiobook_id', editingAudiobook.id);
        
      } else {
        // Création d'un nouvel audiobook
        const { data: newAudiobook, error } = await supabase
          .from('audiobooks')
          .insert({
            name: audiobookData.name,
            author: audiobookData.author,
            description: audiobookData.description,
            cover_url: audiobookData.cover_url,
            genre: audiobookData.genre,
            tags: audiobookData.tags,
            points: audiobookData.points,
            is_premium: audiobookData.is_premium,
            is_month_success: audiobookData.is_month_success,
            is_paco_favourite: audiobookData.is_paco_favourite,
            is_paco_chronicle: audiobookData.is_paco_chronicle,
            is_featured: audiobookData.is_featured,
            audio_url: '', // Rétrocompatibilité
          })
          .select()
          .single();

        if (error) throw error;
        audiobookId = newAudiobook.id;
      }

      // Ajouter les nouveaux chapitres
      if (chapters.length > 0) {
        const chapterData = chapters.map(chapter => ({
          ...chapter,
          audiobook_id: audiobookId
        }));

        const { error: chaptersError } = await supabase
          .from('audiobook_chapters')
          .insert(chapterData);

        if (chaptersError) throw chaptersError;
      }
        
      toast({
        title: "Succès",
        description: editingAudiobook ? "Audiobook mis à jour avec succès" : "Audiobook créé avec succès",
      });
      
      setShowDialog(false);
      fetchAudiobooks();
    } catch (error) {
      console.error('Error saving audiobook:', error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder l'audiobook",
        variant: "destructive",
      });
    }
  };

  const extractFilePathFromUrl = (url: string): string | null => {
    if (!url) return null;
    const match = url.match(/\/storage\/v1\/object\/public\/[^\/]+\/(.+)$/);
    return match ? match[1] : null;
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet audiobook ?')) {
      try {
        // Récupérer les données de l'audiobook et ses chapitres avant suppression
        const { data: audiobook, error: fetchError } = await supabase
          .from('audiobooks')
          .select('cover_url, audio_url')
          .eq('id', id)
          .single();

        const { data: chapters, error: chaptersError } = await supabase
          .from('audiobook_chapters')
          .select('audio_url')
          .eq('audiobook_id', id);

        if (fetchError) throw fetchError;

        // Supprimer les fichiers associés dans Storage
        const filesToDelete: Array<{ bucket: string; path: string }> = [];

        if (audiobook?.cover_url) {
          const coverPath = extractFilePathFromUrl(audiobook.cover_url);
          if (coverPath) {
            filesToDelete.push({ bucket: 'book-covers', path: coverPath });
          }
        }

        if (audiobook?.audio_url) {
          const audioPath = extractFilePathFromUrl(audiobook.audio_url);
          if (audioPath) {
            filesToDelete.push({ bucket: 'book-covers', path: audioPath });
          }
        }

        // Supprimer les fichiers audio des chapitres
        if (chapters) {
          chapters.forEach(chapter => {
            if (chapter.audio_url) {
              const audioPath = extractFilePathFromUrl(chapter.audio_url);
              if (audioPath) {
                filesToDelete.push({ bucket: 'book-covers', path: audioPath });
              }
            }
          });
        }

        // Supprimer les fichiers de Storage
        for (const file of filesToDelete) {
          try {
            const { error: storageError } = await supabase.storage
              .from(file.bucket)
              .remove([file.path]);
            
            if (storageError) {
              console.warn(`Failed to delete file ${file.path}:`, storageError);
            }
          } catch (error) {
            console.warn(`Error deleting file ${file.path}:`, error);
          }
        }

        // Supprimer les chapitres
        const { error: chaptersDeleteError } = await supabase
          .from('audiobook_chapters')
          .delete()
          .eq('audiobook_id', id);

        if (chaptersDeleteError) throw chaptersDeleteError;

        // Supprimer l'audiobook
        const { error } = await supabase
          .from('audiobooks')
          .delete()
          .eq('id', id);

        if (error) throw error;
        
        toast({
          title: "Succès",
          description: "Audiobook supprimé avec succès",
        });
        fetchAudiobooks();
      } catch (error) {
        console.error('Error deleting audiobook:', error);
        toast({
          title: "Erreur",
          description: "Impossible de supprimer l'audiobook",
          variant: "destructive",
        });
      }
    }
  };

  if (loading) {
    return <div className="text-center py-12">Chargement...</div>;
  }

  return (
    <div className="h-full max-h-screen overflow-y-auto space-y-6 pr-2">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Gestion des Audiobooks</h2>
        <Button onClick={handleOpenAdd} className="flex items-center gap-2">
          <Plus className="h-4 w-4" /> Ajouter un nouvel audiobook
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {audiobooks.map((audiobook) => (
          <Card key={audiobook.id} className={audiobook.is_premium ? "ring-2 ring-yellow-500" : ""}>
            <div className="flex h-[120px]">
              <img 
                src={audiobook.cover_url} 
                alt={audiobook.name}
                className="w-24 h-full object-cover" 
              />
              <CardHeader className="flex-1 p-4">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-lg">{audiobook.name}</CardTitle>
                  {audiobook.is_premium && <Crown className="h-4 w-4 text-yellow-500" />}
                </div>
                <p className="text-sm text-muted-foreground">{audiobook.author}</p>
                <div className="flex items-center gap-1 text-sm">
                  <img src="/lovable-uploads/4a891ef6-ff72-4b5a-b33c-0dc33dd3aa26.png" alt="Tensens Icon" className="h-4 w-4" />
                  <span className="font-medium">{audiobook.points} Tensens</span>
                </div>
              </CardHeader>
            </div>
            <CardContent className="p-4 pt-0 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                {audiobook.is_premium && (
                  <Badge variant="default" className="bg-yellow-500 text-white flex items-center">
                    <Crown className="h-3 w-3 mr-1" /> Premium
                  </Badge>
                )}
                {audiobook.is_month_success && (
                  <Badge variant="default" className="bg-blue-500 text-white flex items-center">
                    <Star className="h-3 w-3 mr-1" /> Succès du mois
                  </Badge>
                )}
                {audiobook.is_paco_favourite && (
                  <Badge variant="default" className="bg-green-500 text-white flex items-center">
                    <Zap className="h-3 w-3 mr-1" /> Coup de cœur
                  </Badge>
                )}
                {audiobook.tags && audiobook.tags.length > 0 && (
                  audiobook.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))
                )}
              </div>
              {audiobook.audio_url && (
                <audio controls className="w-full h-8">
                  <source src={audiobook.audio_url} />
                </audio>
              )}
              <div className="flex justify-end gap-2">
                <Button variant="outline" size="sm" onClick={() => handleOpenEdit(audiobook)}>
                  <Pencil className="h-4 w-4 mr-1" /> Modifier
                </Button>
                <Button variant="destructive" size="sm" onClick={() => handleDelete(audiobook.id)}>
                  <Trash2 className="h-4 w-4 mr-1" /> Supprimer
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {audiobooks.length === 0 && (
        <div className="text-center py-12 border rounded-lg">
          <p className="text-muted-foreground">Aucun audiobook dans la bibliothèque pour le moment. Ajoutez votre premier audiobook !</p>
        </div>
      )}

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-[525px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingAudiobook ? 'Modifier l\'audiobook' : 'Ajouter un nouvel audiobook'}</DialogTitle>
          </DialogHeader>
          <AudiobookFormV2 
            initialAudiobook={editingAudiobook || {
              id: '',
              name: '',
              author: '',
              description: '',
              cover_url: '',
              audio_url: '',
              genre: '',
              tags: [],
              genres: [],
              points: 0,
              is_premium: false,
              is_month_success: false,
              is_paco_favourite: false,
              is_paco_chronicle: false,
              is_featured: false,
            }}
            onSubmit={handleSubmit}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};
