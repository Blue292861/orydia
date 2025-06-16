
import React, { useState } from 'react';
import { Audiobook } from '@/types/Audiobook';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { TagInput } from '@/components/TagInput';
import { FileImport } from '@/components/FileImport';

interface AudiobookFormProps {
  initialAudiobook: Audiobook;
  onSubmit: (audiobook: Audiobook) => void;
}

export const AudiobookForm: React.FC<AudiobookFormProps> = ({ initialAudiobook, onSubmit }) => {
  const [formData, setFormData] = useState<Audiobook>(initialAudiobook);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (field: keyof Audiobook, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Nom</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          required
        />
      </div>

      <div>
        <Label htmlFor="author">Auteur</Label>
        <Input
          id="author"
          value={formData.author}
          onChange={(e) => handleChange('author', e.target.value)}
          required
        />
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description || ''}
          onChange={(e) => handleChange('description', e.target.value)}
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
        <Label htmlFor="audio_url">Fichier audio</Label>
        <div className="space-y-2">
          <Input
            id="audio_url"
            type="text"
            value={formData.audio_url}
            onChange={(e) => handleChange('audio_url', e.target.value)}
            placeholder="URL du fichier audio ou importer un fichier"
            required
          />
          <FileImport type="audio" onFileImport={(dataUrl) => handleChange('audio_url', dataUrl)} />
        </div>
        {formData.audio_url && (
          <audio controls className="mt-2 w-full">
            <source src={formData.audio_url} />
            Votre navigateur ne supporte pas l'élément audio.
          </audio>
        )}
      </div>

      <div>
        <Label>Tags</Label>
        <TagInput
          tags={formData.tags}
          onTagsChange={(tags) => handleChange('tags', tags)}
          placeholder="Ajouter des tags..."
        />
      </div>

      <div>
        <Label htmlFor="points">Points (Tensens)</Label>
        <Input
          id="points"
          type="number"
          min="0"
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
      </div>

      <Button type="submit" className="w-full">
        {initialAudiobook.id ? 'Mettre à jour l\'audiobook' : 'Ajouter l\'audiobook'}
      </Button>
    </form>
  );
};
