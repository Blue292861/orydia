import React from 'react';
import { Audiobook } from '@/types/Audiobook';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Crown, Star, Zap, Play } from 'lucide-react';
import { ShareButton } from '@/components/ShareButton';

interface AudiobookPreviewDialogProps {
  audiobook: Audiobook | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStartListening: (audiobook: Audiobook) => void;
}

export const AudiobookPreviewDialog: React.FC<AudiobookPreviewDialogProps> = ({
  audiobook,
  open,
  onOpenChange,
  onStartListening
}) => {
  if (!audiobook) return null;

  const handleStartListening = () => {
    onStartListening(audiobook);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{audiobook.name}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <img 
                src={audiobook.cover_url} 
                alt={audiobook.name}
                className="w-32 h-40 object-cover rounded-lg shadow-md" 
              />
            </div>
            
            <div className="flex-1 space-y-3">
              <div>
                <h4 className="font-semibold text-lg">{audiobook.author}</h4>
                {audiobook.genre && (
                  <p className="text-primary font-medium">{audiobook.genre}</p>
                )}
              </div>

              <div className="flex items-center gap-2 text-lg">
                <img src="/lovable-uploads/4a891ef6-ff72-4b5a-b33c-0dc33dd3aa26.png" alt="Tensens Icon" className="h-5 w-5" />
                <span className="font-bold">{audiobook.points} Tensens</span>
              </div>

              <div className="flex flex-wrap gap-2">
                {audiobook.is_premium && (
                  <Badge className="bg-yellow-500 text-white">
                    <Crown className="h-3 w-3 mr-1" /> Premium
                  </Badge>
                )}
                {audiobook.is_featured && (
                  <Badge className="bg-purple-500 text-white">
                    <Star className="h-3 w-3 mr-1" /> À la Une
                  </Badge>
                )}
                {audiobook.is_month_success && (
                  <Badge className="bg-blue-500 text-white">
                    <Star className="h-3 w-3 mr-1" /> Succès du mois
                  </Badge>
                )}
                {audiobook.is_paco_favourite && (
                  <Badge className="bg-green-500 text-white">
                    <Zap className="h-3 w-3 mr-1" /> Coup de cœur
                  </Badge>
                )}
                {audiobook.is_paco_chronicle && (
                  <Badge className="bg-red-500 text-white">
                    Chronique de Paco
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {audiobook.description && (
            <div>
              <h4 className="font-semibold mb-2">Description</h4>
              <p className="text-muted-foreground leading-relaxed">
                {audiobook.description}
              </p>
            </div>
          )}

          {audiobook.tags && audiobook.tags.length > 0 && (
            <div>
              <h4 className="font-semibold mb-2">Tags</h4>
              <div className="flex flex-wrap gap-2">
                {audiobook.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button 
              onClick={handleStartListening} 
              className="flex-1" 
              size="lg"
            >
              <Play className="h-5 w-5 mr-2" />
              Démarrer l'écoute
            </Button>
            <ShareButton 
              author={audiobook.author} 
              title={audiobook.name}
              variant="outline"
              size="lg"
              showText={true}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};