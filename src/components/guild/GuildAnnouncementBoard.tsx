import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from '@/hooks/use-toast';
import { 
  getGuildAnnouncements, 
  createGuildAnnouncement, 
  deleteGuildAnnouncement,
  GuildAnnouncement 
} from '@/services/guildChatService';
import { Megaphone, Plus, Loader2, Trash2, Calendar, User } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface GuildAnnouncementBoardProps {
  guildId: string;
  isAdmin: boolean;
}

export const GuildAnnouncementBoard: React.FC<GuildAnnouncementBoardProps> = ({ guildId, isAdmin }) => {
  const [announcements, setAnnouncements] = useState<GuildAnnouncement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadAnnouncements = async () => {
    setIsLoading(true);
    const data = await getGuildAnnouncements(guildId);
    setAnnouncements(data);
    setIsLoading(false);
  };

  useEffect(() => {
    loadAnnouncements();
  }, [guildId]);

  const handleCreate = async () => {
    if (!newTitle.trim() || !newContent.trim()) {
      toast({
        title: 'Erreur',
        description: 'Titre et contenu requis',
        variant: 'destructive'
      });
      return;
    }

    setIsCreating(true);
    const result = await createGuildAnnouncement(guildId, newTitle, newContent);

    if (result.success) {
      toast({
        title: 'Annonce publiée',
        description: 'Votre annonce est maintenant visible par tous les membres'
      });
      setShowCreateDialog(false);
      setNewTitle('');
      setNewContent('');
      loadAnnouncements();
    } else {
      toast({
        title: 'Erreur',
        description: result.error || 'Impossible de publier l\'annonce',
        variant: 'destructive'
      });
    }
    setIsCreating(false);
  };

  const handleDelete = async (announcementId: string) => {
    setDeletingId(announcementId);
    const result = await deleteGuildAnnouncement(announcementId);

    if (result.success) {
      setAnnouncements(prev => prev.filter(a => a.id !== announcementId));
      toast({
        title: 'Annonce supprimée'
      });
    } else {
      toast({
        title: 'Erreur',
        description: result.error || 'Impossible de supprimer l\'annonce',
        variant: 'destructive'
      });
    }
    setDeletingId(null);
  };

  if (isLoading) {
    return (
      <Card className="p-6 bg-forest-800/50 border-forest-600">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-gold-400" />
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with create button */}
      {isAdmin && (
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="w-full bg-gold-500 hover:bg-gold-600 text-forest-900">
              <Plus className="w-4 h-4 mr-2" />
              Publier une annonce
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md bg-forest-800 border-forest-600">
            <DialogHeader>
              <DialogTitle className="text-gold-300">Nouvelle annonce</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="announcement-title" className="text-wood-200">Titre</Label>
                <Input
                  id="announcement-title"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Titre de l'annonce"
                  maxLength={100}
                  className="bg-forest-700/50 border-forest-500 text-wood-100"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="announcement-content" className="text-wood-200">Contenu</Label>
                <Textarea
                  id="announcement-content"
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Contenu de l'annonce..."
                  rows={4}
                  maxLength={2000}
                  className="bg-forest-700/50 border-forest-500 text-wood-100 resize-none"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowCreateDialog(false)}
                  className="flex-1 border-forest-500 text-wood-200 hover:bg-forest-700"
                >
                  Annuler
                </Button>
                <Button
                  onClick={handleCreate}
                  disabled={isCreating || !newTitle.trim() || !newContent.trim()}
                  className="flex-1 bg-gold-500 hover:bg-gold-600 text-forest-900"
                >
                  {isCreating ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    'Publier'
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Announcements list */}
      {announcements.length === 0 ? (
        <Card className="p-6 bg-forest-800/50 border-forest-600">
          <div className="text-center py-8">
            <Megaphone className="w-12 h-12 mx-auto text-gold-400/50 mb-3" />
            <h3 className="text-lg font-medium text-wood-200 mb-2">Aucune annonce</h3>
            <p className="text-wood-400 text-sm">
              {isAdmin 
                ? 'Publiez votre première annonce pour informer les membres de la guilde.'
                : 'Les fondateurs et administrateurs peuvent publier des annonces ici.'}
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {announcements.map((announcement) => (
            <Card key={announcement.id} className="p-4 bg-forest-800/50 border-forest-600">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-gold-300 mb-2">{announcement.title}</h3>
                  <p className="text-wood-200 text-sm whitespace-pre-wrap mb-3">
                    {announcement.content}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-wood-500">
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {announcement.author_profile?.username || 'Admin'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {format(new Date(announcement.created_at), 'd MMMM yyyy', { locale: fr })}
                    </span>
                  </div>
                </div>

                {isAdmin && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-400 hover:text-red-300 hover:bg-red-500/20"
                        disabled={deletingId === announcement.id}
                      >
                        {deletingId === announcement.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-forest-800 border-forest-600">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-wood-100">Supprimer l'annonce ?</AlertDialogTitle>
                        <AlertDialogDescription className="text-wood-400">
                          Cette action est irréversible.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="border-forest-500 text-wood-200 hover:bg-forest-700">
                          Annuler
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(announcement.id)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Supprimer
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
