import React, { useState } from 'react';
import { Audiobook } from '@/types/Audiobook';
import { AudiobookChapter } from '@/types/AudiobookChapter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { TagInput } from '@/components/TagInput';
import { FileImport } from '@/components/FileImport';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2, Plus, Upload } from 'lucide-react';
import { sanitizeText, sanitizeTextWithSpaces, validateTextLength, validateUrl, validatePoints } from '@/utils/security';
import { useToast } from '@/hooks/use-toast';

interface AudiobookFormV2Props {
  initialAudiobook: Audiobook;
  onSubmit: (audiobook: Audiobook, chapters: Omit<AudiobookChapter, 'id' | 'audiobook_id' | 'created_at' | 'updated_at'>[]) => void;
}

interface ChapterFormData {
  title: string;
  audio_url: string;
  chapter_number: number;
  duration_seconds: number;
}

export const AudiobookFormV2: React.FC<AudiobookFormV2Props> = ({ initialAudiobook, onSubmit }) => {
  const [formData, setFormData] = useState<Audiobook>(initialAudiobook);
  const [chapters, setChapters] = useState<ChapterFormData[]>([]);
  const { toast } = useToast();

  const handleChange = (field: keyof Audiobook, value: any) => {
    // Validation similaire à l'ancienne version
    if (typeof value === 'string') {
      let maxLength = 500;
      if (field === 'name') maxLength = 200;
      else if (field === 'author') maxLength = 100;
      else if (field === 'genre') maxLength = 100;
      
      if (!validateTextLength(value, maxLength)) {
        toast({
          title: "Input too long",
          description: `${field} must be less than ${maxLength} characters.`,
          variant: "destructive"
        });
        return;
      }
    }

    if (field === 'points' && typeof value === 'number') {
      if (!validatePoints(value)) {
        toast({
          title: "Invalid points",
          description: "Points must be between 0 and 100,000.",
          variant: "destructive"
        });
        return;
      }
    }

    if (field === 'cover_url' && typeof value === 'string' && value) {
      if (!validateUrl(value)) {
        toast({
          title: "Invalid URL",
          description: "Please enter a valid image URL.",
          variant: "destructive"
        });
        return;
      }
    }

    const sanitizedValue = typeof value === 'string' ? 
      (field === 'name' || field === 'author' || field === 'description' || field === 'genre') ? sanitizeTextWithSpaces(value) : sanitizeText(value) 
      : value;
    
    setFormData(prev => ({
      ...prev,
      [field]: sanitizedValue
    }));
  };

  const addChapter = () => {
    setChapters(prev => [...prev, {
      title: `Chapitre ${prev.length + 1}`,
      audio_url: '',
      chapter_number: prev.length + 1,
      duration_seconds: 0
    }]);
  };

  const removeChapter = (index: number) => {
    setChapters(prev => prev.filter((_, i) => i !== index).map((chapter, i) => ({
      ...chapter,
      chapter_number: i + 1
    })));
  };

  const updateChapter = (index: number, field: keyof ChapterFormData, value: any) => {
    setChapters(prev => prev.map((chapter, i) => 
      i === index ? { ...chapter, [field]: value } : chapter
    ));
  };

  const validateForm = (): boolean => {
    if (!formData.name?.trim()) {
      toast({
        title: "Validation Error",
        description: "Name is required.",
        variant: "destructive"
      });
      return false;
    }

    if (!formData.author?.trim()) {
      toast({
        title: "Validation Error",
        description: "Author is required.",
        variant: "destructive"
      });
      return false;
    }

    if (!formData.cover_url?.trim()) {
      toast({
        title: "Validation Error",
        description: "Cover URL is required.",
        variant: "destructive"
      });
      return false;
    }

    if (chapters.length === 0) {
      toast({
        title: "Validation Error",
        description: "At least one chapter is required.",
        variant: "destructive"
      });
      return false;
    }

    for (let i = 0; i < chapters.length; i++) {
      const chapter = chapters[i];
      if (!chapter.title?.trim()) {
        toast({
          title: "Validation Error",
          description: `Chapter ${i + 1} title is required.`,
          variant: "destructive"
        });
        return false;
      }
      if (!chapter.audio_url?.trim()) {
        toast({
          title: "Validation Error",
          description: `Chapter ${i + 1} audio file is required.`,
          variant: "destructive"
        });
        return false;
      }
    }

    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const sanitizedData: Audiobook = {
      ...formData,
      name: sanitizeTextWithSpaces(formData.name),
      author: sanitizeTextWithSpaces(formData.author),
      description: formData.description ? sanitizeTextWithSpaces(formData.description) : undefined,
      genre: formData.genre ? sanitizeTextWithSpaces(formData.genre) : undefined,
      cover_url: sanitizeText(formData.cover_url),
      audio_url: '', // Plus utilisé avec le nouveau système
    };

    const sanitizedChapters = chapters.map(chapter => ({
      title: sanitizeTextWithSpaces(chapter.title),
      audio_url: sanitizeText(chapter.audio_url),
      chapter_number: chapter.chapter_number,
      duration_seconds: chapter.duration_seconds
    }));

    onSubmit(sanitizedData, sanitizedChapters);
  };

  return (
    <div className="h-full max-h-[80vh] overflow-y-auto pr-2">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Informations générales */}
        <Card>
          <CardHeader>
            <CardTitle>Informations générales</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Nom de l'audiobook</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                maxLength={200}
                required
              />
            </div>

            <div>
              <Label htmlFor="author">Auteur</Label>
              <Input
                id="author"
                value={formData.author}
                onChange={(e) => handleChange('author', e.target.value)}
                maxLength={100}
                required
              />
            </div>

            <div>
              <Label htmlFor="genre">Genre</Label>
              <Input
                id="genre"
                value={formData.genre || ''}
                onChange={(e) => handleChange('genre', e.target.value)}
                maxLength={100}
                placeholder="Ex: Fantaisie, Science-fiction, Romance..."
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description || ''}
                onChange={(e) => handleChange('description', e.target.value)}
                maxLength={500}
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="cover_url">Image de couverture</Label>
              <div className="space-y-2">
                <Input
                  id="cover_url"
                  type="text"
                  value={formData.cover_url}
                  onChange={(e) => handleChange('cover_url', e.target.value)}
                  placeholder="URL de l'image ou importer un fichier"
                  required
                />
                <FileImport type="image" onFileImport={(dataUrl) => handleChange('cover_url', dataUrl)} />
              </div>
              {formData.cover_url && (
                <img src={formData.cover_url} alt="Aperçu" className="mt-2 h-20 w-20 object-cover rounded-md" />
              )}
            </div>

            <div>
              <Label>Tags</Label>
              <TagInput
                tags={formData.tags}
                onTagsChange={(tags) => handleChange('tags', tags)}
              />
            </div>

            <div>
              <Label htmlFor="points">Points (Tensens)</Label>
              <Input
                id="points"
                type="number"
                min="0"
                max="100000"
                value={formData.points}
                onChange={(e) => handleChange('points', parseInt(e.target.value) || 0)}
                required
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_premium"
                  checked={formData.is_premium}
                  onCheckedChange={(checked) => handleChange('is_premium', !!checked)}
                />
                <Label htmlFor="is_premium">Audiobook Premium</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_featured"
                  checked={formData.is_featured}
                  onCheckedChange={(checked) => handleChange('is_featured', !!checked)}
                />
                <Label htmlFor="is_featured">Audio à la Une</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_month_success"
                  checked={formData.is_month_success}
                  onCheckedChange={(checked) => handleChange('is_month_success', !!checked)}
                />
                <Label htmlFor="is_month_success">Succès du mois</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_paco_favourite"
                  checked={formData.is_paco_favourite}
                  onCheckedChange={(checked) => handleChange('is_paco_favourite', !!checked)}
                />
                <Label htmlFor="is_paco_favourite">Coup de cœur de Paco</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is_paco_chronicle"
                  checked={formData.is_paco_chronicle}
                  onCheckedChange={(checked) => handleChange('is_paco_chronicle', !!checked)}
                />
                <Label htmlFor="is_paco_chronicle">La Chronique de Paco</Label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Chapitres */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Chapitres audio</CardTitle>
            <Button type="button" onClick={addChapter} variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Ajouter un chapitre
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {chapters.length === 0 && (
              <p className="text-muted-foreground text-center py-4">
                Aucun chapitre ajouté. Cliquez sur "Ajouter un chapitre" pour commencer.
              </p>
            )}

            {chapters.map((chapter, index) => (
              <Card key={index} className="border-l-4 border-l-primary">
                <CardHeader className="flex flex-row items-center justify-between pb-3">
                  <h4 className="text-sm font-medium">Chapitre {chapter.chapter_number}</h4>
                  <Button 
                    type="button" 
                    onClick={() => removeChapter(index)}
                    variant="destructive" 
                    size="sm"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <Label htmlFor={`chapter-title-${index}`}>Titre</Label>
                    <Input
                      id={`chapter-title-${index}`}
                      value={chapter.title}
                      onChange={(e) => updateChapter(index, 'title', e.target.value)}
                      placeholder="Ex: Chapitre 1, Introduction..."
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor={`chapter-audio-${index}`}>Fichier audio</Label>
                    <div className="space-y-2">
                      <Input
                        id={`chapter-audio-${index}`}
                        value={chapter.audio_url}
                        onChange={(e) => updateChapter(index, 'audio_url', e.target.value)}
                        placeholder="URL du fichier audio"
                        required
                      />
                      <FileImport 
                        type="audio" 
                        onFileImport={(dataUrl) => updateChapter(index, 'audio_url', dataUrl)} 
                      />
                    </div>
                    {chapter.audio_url && (
                      <audio controls className="mt-2 w-full">
                        <source src={chapter.audio_url} />
                        Votre navigateur ne supporte pas l'élément audio.
                      </audio>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>

        <Button type="submit" className="w-full" size="lg">
          {initialAudiobook.id ? 'Mettre à jour l\'audiobook' : 'Créer l\'audiobook'}
        </Button>
      </form>
    </div>
  );
};