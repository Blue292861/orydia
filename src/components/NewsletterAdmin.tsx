import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { Send, Plus, Trash2, Paperclip, X, Users, Loader2, RefreshCw, Eye } from 'lucide-react';
import { Newsletter, NewsletterAttachment } from '@/types/Newsletter';
import {
  getNewsletters,
  createNewsletter,
  updateNewsletter,
  deleteNewsletter,
  sendNewsletter,
  getSubscriberCount,
  uploadAttachment,
} from '@/services/newsletterService';
import { useResponsive } from '@/hooks/useResponsive';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export const NewsletterAdmin: React.FC = () => {
  const [newsletters, setNewsletters] = useState<Newsletter[]>([]);
  const [loading, setLoading] = useState(true);
  const [subscriberCount, setSubscriberCount] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewNewsletter, setPreviewNewsletter] = useState<Newsletter | null>(null);
  const [sending, setSending] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const { isMobile } = useResponsive();

  // Form state
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [attachments, setAttachments] = useState<NewsletterAttachment[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [newslettersData, count] = await Promise.all([
        getNewsletters(),
        getSubscriberCount(),
      ]);
      setNewsletters(newslettersData);
      setSubscriberCount(count);
    } catch (error) {
      console.error('Error fetching newsletters:', error);
      toast.error('Erreur lors du chargement des newsletters');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const resetForm = () => {
    setSubject('');
    setContent('');
    setAttachments([]);
    setEditingId(null);
    setShowForm(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      const uploadPromises = Array.from(files).map((file) => uploadAttachment(file));
      const uploaded = await Promise.all(uploadPromises);
      setAttachments((prev) => [...prev, ...uploaded]);
      toast.success(`${uploaded.length} fichier(s) ajouté(s)`);
    } catch (error) {
      console.error('Error uploading files:', error);
      toast.error('Erreur lors de l\'upload des fichiers');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!subject.trim() || !content.trim()) {
      toast.error('Le sujet et le contenu sont obligatoires');
      return;
    }

    try {
      if (editingId) {
        await updateNewsletter(editingId, { subject, content, attachments });
        toast.success('Newsletter mise à jour');
      } else {
        await createNewsletter(subject, content, attachments);
        toast.success('Newsletter créée');
      }
      resetForm();
      fetchData();
    } catch (error) {
      console.error('Error saving newsletter:', error);
      toast.error('Erreur lors de la sauvegarde');
    }
  };

  const handleSend = async (id: string) => {
    if (!window.confirm(`Envoyer cette newsletter à ${subscriberCount} abonnés ?`)) {
      return;
    }

    setSending(id);
    try {
      const result = await sendNewsletter(id);
      toast.success(`Newsletter envoyée à ${result.sentCount} abonnés`);
      if (result.failedCount > 0) {
        toast.warning(`${result.failedCount} envois ont échoué`);
      }
      fetchData();
    } catch (error) {
      console.error('Error sending newsletter:', error);
      toast.error('Erreur lors de l\'envoi');
    } finally {
      setSending(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Supprimer cette newsletter ?')) return;

    try {
      await deleteNewsletter(id);
      toast.success('Newsletter supprimée');
      fetchData();
    } catch (error) {
      console.error('Error deleting newsletter:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  const handleEdit = (newsletter: Newsletter) => {
    setSubject(newsletter.subject);
    setContent(newsletter.content);
    setAttachments(newsletter.attachments);
    setEditingId(newsletter.id);
    setShowForm(true);
  };

  const getStatusBadge = (status: Newsletter['status']) => {
    const variants: Record<Newsletter['status'], { label: string; className: string }> = {
      draft: { label: 'Brouillon', className: 'bg-gray-500' },
      sending: { label: 'Envoi en cours', className: 'bg-blue-500' },
      sent: { label: 'Envoyée', className: 'bg-green-500' },
      failed: { label: 'Échec', className: 'bg-red-500' },
    };
    const { label, className } = variants[status];
    return <Badge className={className}>{label}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <h3 className="text-xl font-bold text-amber-400">Newsletters</h3>
          <Badge variant="outline" className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            {subscriberCount} abonnés
          </Badge>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchData}>
            <RefreshCw className="w-4 h-4 mr-1" />
            Actualiser
          </Button>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="w-4 h-4 mr-1" />
            Nouvelle newsletter
          </Button>
        </div>
      </div>

      {/* Form Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className={isMobile ? 'w-[95vw] max-w-[95vw]' : 'sm:max-w-[600px]'}>
          <DialogHeader>
            <DialogTitle>
              {editingId ? 'Modifier la newsletter' : 'Nouvelle newsletter'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="subject">Objet *</Label>
              <Input
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="L'objet de votre newsletter..."
              />
            </div>

            <div>
              <Label htmlFor="content">Contenu *</Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Le contenu de votre newsletter..."
                rows={10}
              />
            </div>

            <div>
              <Label>Pièces jointes</Label>
              <div className="mt-2 space-y-2">
                {attachments.map((att, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 bg-muted rounded-md"
                  >
                    <div className="flex items-center gap-2">
                      <Paperclip className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm truncate max-w-[200px]">{att.name}</span>
                      {att.size && (
                        <span className="text-xs text-muted-foreground">
                          ({Math.round(att.size / 1024)} KB)
                        </span>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeAttachment(index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}

                <div className="flex items-center gap-2">
                  <Input
                    type="file"
                    multiple
                    onChange={handleFileUpload}
                    disabled={uploading}
                    className="hidden"
                    id="file-upload"
                  />
                  <Label htmlFor="file-upload" className="cursor-pointer">
                    <Button variant="outline" size="sm" asChild disabled={uploading}>
                      <span>
                        {uploading ? (
                          <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                        ) : (
                          <Paperclip className="w-4 h-4 mr-1" />
                        )}
                        Ajouter des fichiers
                      </span>
                    </Button>
                  </Label>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={resetForm}>
              Annuler
            </Button>
            <Button onClick={handleSave}>
              {editingId ? 'Mettre à jour' : 'Enregistrer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Aperçu</DialogTitle>
          </DialogHeader>
          {previewNewsletter && (
            <div className="space-y-4">
              <div>
                <Label>Objet</Label>
                <p className="font-medium">{previewNewsletter.subject}</p>
              </div>
              <div>
                <Label>Contenu</Label>
                <div className="p-4 bg-muted rounded-md whitespace-pre-wrap">
                  {previewNewsletter.content}
                </div>
              </div>
              {previewNewsletter.attachments.length > 0 && (
                <div>
                  <Label>Pièces jointes ({previewNewsletter.attachments.length})</Label>
                  <ul className="list-disc pl-4 mt-1">
                    {previewNewsletter.attachments.map((att, i) => (
                      <li key={i}>
                        <a
                          href={att.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-amber-500 hover:underline"
                        >
                          {att.name}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Newsletter List */}
      <Card>
        <CardHeader>
          <CardTitle>Historique des newsletters</CardTitle>
        </CardHeader>
        <CardContent>
          {newsletters.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Aucune newsletter pour le moment
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Objet</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Envoyée</TableHead>
                  <TableHead>Résultats</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {newsletters.map((newsletter) => (
                  <TableRow key={newsletter.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium truncate max-w-[200px]">
                          {newsletter.subject}
                        </p>
                        {newsletter.attachments.length > 0 && (
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Paperclip className="w-3 h-3" />
                            {newsletter.attachments.length} pièce(s) jointe(s)
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(newsletter.status)}</TableCell>
                    <TableCell>
                      {newsletter.sentAt
                        ? format(new Date(newsletter.sentAt), 'dd MMM yyyy HH:mm', { locale: fr })
                        : '-'}
                    </TableCell>
                    <TableCell>
                      {newsletter.status === 'sent' && (
                        <span className="text-sm">
                          ✅ {newsletter.sentCount}
                          {newsletter.failedCount > 0 && (
                            <span className="text-red-500 ml-2">
                              ❌ {newsletter.failedCount}
                            </span>
                          )}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setPreviewNewsletter(newsletter);
                            setShowPreview(true);
                          }}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        {newsletter.status === 'draft' && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(newsletter)}
                            >
                              Modifier
                            </Button>
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => handleSend(newsletter.id)}
                              disabled={sending === newsletter.id}
                            >
                              {sending === newsletter.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Send className="w-4 h-4" />
                              )}
                            </Button>
                          </>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(newsletter.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
