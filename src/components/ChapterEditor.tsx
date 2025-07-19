import React, { useState, useEffect } from 'react';
import { Book, Chapter, InteractiveChoice } from '@/types/Book';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { BookOpen, Zap, Plus, Trash2, Eye, Edit } from 'lucide-react';
import { fetchChaptersByBookId, extractChaptersFromContent, addInteractiveChoice } from '@/services/chapterService';
import { toast } from 'sonner';

interface ChapterEditorProps {
  book: Book;
  onClose: () => void;
}

export const ChapterEditor: React.FC<ChapterEditorProps> = ({ book, onClose }) => {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [editingChapter, setEditingChapter] = useState<Chapter | null>(null);
  const [newChoice, setNewChoice] = useState({
    choiceText: '',
    consequenceText: '',
    pointsModifier: 0,
  });
  const [loading, setLoading] = useState(true);
  const [extracting, setExtracting] = useState(false);

  useEffect(() => {
    loadChapters();
  }, [book.id]);

  const loadChapters = async () => {
    try {
      const chaptersData = await fetchChaptersByBookId(book.id);
      setChapters(chaptersData);
    } catch (error) {
      console.error('Erreur lors du chargement des chapitres:', error);
      toast.error('Erreur lors du chargement des chapitres');
    } finally {
      setLoading(false);
    }
  };

  const handleExtractChapters = async (autoSplit: boolean = false) => {
    setExtracting(true);
    try {
      const result = await extractChaptersFromContent(book.id, book.content, autoSplit);
      toast.success(`${result.totalChapters} chapitres extraits avec succès`);
      if (result.interactiveChapters > 0) {
        toast.info(`${result.interactiveChapters} chapitres interactifs détectés`);
      }
      await loadChapters();
    } catch (error) {
      console.error('Erreur lors de l\'extraction des chapitres:', error);
      toast.error('Erreur lors de l\'extraction des chapitres');
    } finally {
      setExtracting(false);
    }
  };

  const handleAddChoice = async (chapterId: string) => {
    if (!newChoice.choiceText.trim()) {
      toast.error('Le texte du choix est requis');
      return;
    }

    try {
      await addInteractiveChoice({
        chapterId,
        choiceText: newChoice.choiceText,
        consequenceText: newChoice.consequenceText || undefined,
        nextChapterId: undefined,
        pointsModifier: newChoice.pointsModifier,
      });

      setNewChoice({
        choiceText: '',
        consequenceText: '',
        pointsModifier: 0,
      });

      toast.success('Choix ajouté avec succès');
      await loadChapters();
    } catch (error) {
      console.error('Erreur lors de l\'ajout du choix:', error);
      toast.error('Erreur lors de l\'ajout du choix');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <BookOpen className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Chargement des chapitres...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Éditeur de chapitres</h2>
          <p className="text-muted-foreground">{book.title}</p>
        </div>
        <Button variant="outline" onClick={onClose}>
          Fermer
        </Button>
      </div>

      {/* Actions d'extraction */}
      {chapters.length === 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Extraction automatique des chapitres
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Aucun chapitre détecté. Utilisez l'extraction automatique pour analyser le contenu du livre.
            </p>
            <div className="flex gap-2">
              <Button 
                onClick={() => handleExtractChapters(false)}
                disabled={extracting}
              >
                {extracting ? 'Extraction...' : 'Détection intelligente'}
              </Button>
              <Button 
                variant="outline"
                onClick={() => handleExtractChapters(true)}
                disabled={extracting}
              >
                Division automatique
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Liste des chapitres */}
      {chapters.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">
              Chapitres ({chapters.length})
            </h3>
            <div className="flex gap-2">
              <Button 
                size="sm"
                variant="outline"
                onClick={() => handleExtractChapters(false)}
                disabled={extracting}
              >
                Ré-extraire
              </Button>
              <Badge variant="outline">
                {chapters.filter(c => c.isInteractive).length} interactifs
              </Badge>
            </div>
          </div>

          {chapters.map((chapter, index) => (
            <Card key={chapter.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <span className="text-lg">Chapitre {chapter.chapterNumber}</span>
                    <span className="text-base font-normal">{chapter.title}</span>
                    {chapter.isInteractive && (
                      <Badge variant="secondary">
                        <Zap className="h-3 w-3 mr-1" />
                        Interactif
                      </Badge>
                    )}
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditingChapter(chapter)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Aperçu du contenu */}
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Contenu :</p>
                    <p className="text-sm line-clamp-3">
                      {chapter.content.substring(0, 200)}...
                    </p>
                  </div>

                  {/* Choix interactifs */}
                  {chapter.choices && chapter.choices.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-2">Choix interactifs :</p>
                      <div className="space-y-2">
                        {chapter.choices.map((choice, choiceIndex) => (
                          <div key={choice.id} className="border rounded p-3">
                            <div className="flex items-start gap-2">
                              <Badge variant="outline" className="mt-1">
                                {String.fromCharCode(65 + choiceIndex)}
                              </Badge>
                              <div className="flex-1">
                                <p className="font-medium">{choice.choiceText}</p>
                                {choice.consequenceText && (
                                  <p className="text-sm text-muted-foreground mt-1">
                                    Conséquence : {choice.consequenceText}
                                  </p>
                                )}
                                {choice.pointsModifier !== 0 && (
                                  <Badge variant="secondary" className="mt-1">
                                    {choice.pointsModifier > 0 ? '+' : ''}{choice.pointsModifier} Tensens
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Ajouter un choix */}
                  {chapter.isInteractive && (
                    <div className="border-t pt-4">
                      <p className="font-medium mb-3">Ajouter un choix interactif :</p>
                      <div className="space-y-3">
                        <Input
                          placeholder="Texte du choix"
                          value={newChoice.choiceText}
                          onChange={(e) => setNewChoice({ ...newChoice, choiceText: e.target.value })}
                        />
                        <Textarea
                          placeholder="Conséquence (optionnel)"
                          value={newChoice.consequenceText}
                          onChange={(e) => setNewChoice({ ...newChoice, consequenceText: e.target.value })}
                        />
                        <div className="flex gap-2">
                          <Input
                            type="number"
                            placeholder="Points"
                            value={newChoice.pointsModifier}
                            onChange={(e) => setNewChoice({ ...newChoice, pointsModifier: parseInt(e.target.value) || 0 })}
                            className="w-24"
                          />
                          <Button
                            size="sm"
                            onClick={() => handleAddChoice(chapter.id)}
                            disabled={!newChoice.choiceText.trim()}
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Ajouter
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modal d'édition de chapitre */}
      {editingChapter && (
        <Card className="border-primary">
          <CardHeader>
            <CardTitle>Éditer le chapitre {editingChapter.chapterNumber}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="chapter-title">Titre</Label>
              <Input
                id="chapter-title"
                value={editingChapter.title}
                onChange={(e) => setEditingChapter({ ...editingChapter, title: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="chapter-content">Contenu</Label>
              <Textarea
                id="chapter-content"
                value={editingChapter.content}
                onChange={(e) => setEditingChapter({ ...editingChapter, content: e.target.value })}
                rows={10}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="interactive-mode"
                checked={editingChapter.isInteractive}
                onCheckedChange={(checked) => setEditingChapter({ ...editingChapter, isInteractive: checked })}
              />
              <Label htmlFor="interactive-mode">Chapitre interactif</Label>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => setEditingChapter(null)} variant="outline">
                Annuler
              </Button>
              <Button>
                Sauvegarder
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};