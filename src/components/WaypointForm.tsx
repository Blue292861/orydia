import React, { useState } from 'react';
import { FileText, Image, Volume2, ExternalLink, Upload, Loader2 } from 'lucide-react';
import { Waypoint, WaypointType, WaypointFormData } from '@/types/Waypoint';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { uploadWaypointImage, uploadWaypointAudio } from '@/services/waypointService';

interface WaypointFormProps {
  chapterId: string;
  selectedWord: string;
  selectedCfi: string;
  existingWaypoint?: Waypoint | null;
  onSave: (data: WaypointFormData) => void;
  onCancel: () => void;
  onDelete?: () => void;
}

const waypointTypes: { type: WaypointType; label: string; icon: React.ReactNode }[] = [
  { type: 'text', label: 'Texte', icon: <FileText className="h-4 w-4" /> },
  { type: 'image', label: 'Image', icon: <Image className="h-4 w-4" /> },
  { type: 'audio', label: 'Audio', icon: <Volume2 className="h-4 w-4" /> },
  { type: 'link', label: 'Lien', icon: <ExternalLink className="h-4 w-4" /> },
];

const WaypointForm: React.FC<WaypointFormProps> = ({
  chapterId,
  selectedWord,
  selectedCfi,
  existingWaypoint,
  onSave,
  onCancel,
  onDelete
}) => {
  const [waypointType, setWaypointType] = useState<WaypointType>(
    existingWaypoint?.waypoint_type || 'text'
  );
  const [contentText, setContentText] = useState(existingWaypoint?.content_text || '');
  const [contentImageUrl, setContentImageUrl] = useState(existingWaypoint?.content_image_url || '');
  const [contentAudioUrl, setContentAudioUrl] = useState(existingWaypoint?.content_audio_url || '');
  const [contentLinkUrl, setContentLinkUrl] = useState(existingWaypoint?.content_link_url || '');
  const [contentLinkLabel, setContentLinkLabel] = useState(existingWaypoint?.content_link_label || '');
  const [isUploading, setIsUploading] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const url = await uploadWaypointImage(file, chapterId);
      setContentImageUrl(url);
    } catch (error) {
      console.error('Error uploading image:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const url = await uploadWaypointAudio(file, chapterId);
      setContentAudioUrl(url);
    } catch (error) {
      console.error('Error uploading audio:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = () => {
    const data: WaypointFormData = {
      chapter_id: chapterId,
      word_text: selectedWord,
      cfi_range: selectedCfi,
      waypoint_type: waypointType,
      content_text: contentText || undefined,
      content_image_url: contentImageUrl || undefined,
      content_audio_url: contentAudioUrl || undefined,
      content_link_url: contentLinkUrl || undefined,
      content_link_label: contentLinkLabel || undefined,
    };
    onSave(data);
  };

  const isValid = () => {
    switch (waypointType) {
      case 'text':
        return contentText.trim().length > 0;
      case 'image':
        return contentImageUrl.length > 0;
      case 'audio':
        return contentAudioUrl.length > 0;
      case 'link':
        return contentLinkUrl.trim().length > 0;
      default:
        return false;
    }
  };

  return (
    <div className="space-y-4">
      {/* Selected word display */}
      <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
        <Label className="text-xs text-muted-foreground">Mot sélectionné</Label>
        <p className="text-lg font-semibold text-amber-500">{selectedWord}</p>
      </div>

      {/* Type selector */}
      <div className="space-y-2">
        <Label>Type de waypoint</Label>
        <div className="grid grid-cols-4 gap-2">
          {waypointTypes.map(({ type, label, icon }) => (
            <button
              key={type}
              type="button"
              onClick={() => setWaypointType(type)}
              className={`flex flex-col items-center gap-1 p-3 rounded-lg border transition-all ${
                waypointType === type
                  ? 'bg-amber-500 text-white border-amber-500'
                  : 'bg-muted/50 border-border hover:border-amber-500/50'
              }`}
            >
              {icon}
              <span className="text-xs">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Dynamic fields based on type */}
      <div className="space-y-3">
        {waypointType === 'text' && (
          <div className="space-y-2">
            <Label htmlFor="contentText">Description / Définition</Label>
            <Textarea
              id="contentText"
              value={contentText}
              onChange={(e) => setContentText(e.target.value)}
              placeholder="Entrez la description ou définition..."
              rows={4}
            />
          </div>
        )}

        {waypointType === 'image' && (
          <>
            <div className="space-y-2">
              <Label>Image</Label>
              {contentImageUrl ? (
                <div className="relative">
                  <img 
                    src={contentImageUrl} 
                    alt="Preview" 
                    className="w-full h-32 object-cover rounded-lg border"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => setContentImageUrl('')}
                  >
                    Supprimer
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-center h-32 border-2 border-dashed border-border rounded-lg">
                  <label className="cursor-pointer flex flex-col items-center gap-2">
                    {isUploading ? (
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    ) : (
                      <>
                        <Upload className="h-8 w-8 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Cliquez pour uploader</span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                      disabled={isUploading}
                    />
                  </label>
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="imageDesc">Description de l'image (optionnel)</Label>
              <Textarea
                id="imageDesc"
                value={contentText}
                onChange={(e) => setContentText(e.target.value)}
                placeholder="Décrivez l'image..."
                rows={2}
              />
            </div>
          </>
        )}

        {waypointType === 'audio' && (
          <>
            <div className="space-y-2">
              <Label>Fichier audio</Label>
              {contentAudioUrl ? (
                <div className="space-y-2">
                  <audio src={contentAudioUrl} controls className="w-full" />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => setContentAudioUrl('')}
                  >
                    Supprimer
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-center h-24 border-2 border-dashed border-border rounded-lg">
                  <label className="cursor-pointer flex flex-col items-center gap-2">
                    {isUploading ? (
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    ) : (
                      <>
                        <Upload className="h-8 w-8 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Uploader un fichier audio</span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="audio/*"
                      className="hidden"
                      onChange={handleAudioUpload}
                      disabled={isUploading}
                    />
                  </label>
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="audioDesc">Description (optionnel)</Label>
              <Textarea
                id="audioDesc"
                value={contentText}
                onChange={(e) => setContentText(e.target.value)}
                placeholder="Décrivez le contenu audio..."
                rows={2}
              />
            </div>
          </>
        )}

        {waypointType === 'link' && (
          <>
            <div className="space-y-2">
              <Label htmlFor="linkUrl">URL du lien</Label>
              <Input
                id="linkUrl"
                type="url"
                value={contentLinkUrl}
                onChange={(e) => setContentLinkUrl(e.target.value)}
                placeholder="https://example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="linkLabel">Texte du bouton (optionnel)</Label>
              <Input
                id="linkLabel"
                value={contentLinkLabel}
                onChange={(e) => setContentLinkLabel(e.target.value)}
                placeholder="Visiter le site"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="linkDesc">Description (optionnel)</Label>
              <Textarea
                id="linkDesc"
                value={contentText}
                onChange={(e) => setContentText(e.target.value)}
                placeholder="Décrivez ce que l'utilisateur trouvera..."
                rows={2}
              />
            </div>
          </>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="flex-1"
        >
          Annuler
        </Button>
        {existingWaypoint && onDelete && (
          <Button
            type="button"
            variant="destructive"
            onClick={onDelete}
          >
            Supprimer
          </Button>
        )}
        <Button
          type="button"
          onClick={handleSubmit}
          disabled={!isValid() || isUploading}
          className="flex-1 bg-amber-500 hover:bg-amber-600"
        >
          {existingWaypoint ? 'Mettre à jour' : 'Créer'}
        </Button>
      </div>
    </div>
  );
};

export default WaypointForm;
