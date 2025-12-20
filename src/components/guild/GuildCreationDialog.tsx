import React, { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { createGuild, GUILD_COST } from '@/services/guildService';
import { useUserStats } from '@/contexts/UserStatsContext';
import { Camera, Loader2, Shield, Coins } from 'lucide-react';

interface GuildCreationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export const GuildCreationDialog: React.FC<GuildCreationDialogProps> = ({
  open,
  onOpenChange,
  onSuccess
}) => {
  const { userStats, loadUserStats } = useUserStats();
  const [name, setName] = useState('');
  const [slogan, setSlogan] = useState('');
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Les admins n'ont pas besoin de vérifier les points
  const hasEnoughPoints = userStats.isAdmin || userStats.totalPoints >= GUILD_COST;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'Fichier trop volumineux',
          description: 'La taille maximale est de 5 Mo',
          variant: 'destructive'
        });
        return;
      }
      setBannerFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setBannerPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast({
        title: 'Nom requis',
        description: 'Veuillez entrer un nom pour votre guilde',
        variant: 'destructive'
      });
      return;
    }

    if (name.length < 3 || name.length > 30) {
      toast({
        title: 'Nom invalide',
        description: 'Le nom doit contenir entre 3 et 30 caractères',
        variant: 'destructive'
      });
      return;
    }

    setIsLoading(true);

    try {
      const result = await createGuild(
        { name: name.trim(), slogan: slogan.trim() || undefined, bannerFile: bannerFile || undefined },
        userStats.totalPoints,
        userStats.isAdmin
      );

      if (result.success) {
        toast({
          title: '🏰 Guilde créée !',
          description: `Bienvenue dans "${name}" !`
        });
        await loadUserStats();
        onSuccess();
        onOpenChange(false);
        // Reset form
        setName('');
        setSlogan('');
        setBannerFile(null);
        setBannerPreview(null);
      } else {
        toast({
          title: 'Erreur',
          description: result.error || 'Impossible de créer la guilde',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error creating guild:', error);
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto bg-gradient-to-b from-forest-800 to-forest-900 border-gold-500/30">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-gold-300">
            <Shield className="w-5 h-5" />
            Créer une Guilde
          </DialogTitle>
          <DialogDescription className="text-wood-300">
            Fondez votre propre guilde de lecture et rassemblez des lecteurs !
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Cost display */}
          <div className={`flex items-center justify-between p-3 rounded-lg ${hasEnoughPoints ? 'bg-forest-700/50' : 'bg-red-900/30'}`}>
            <div className="flex items-center gap-2">
              <Coins className="w-5 h-5 text-gold-400" />
              <span className="text-sm text-wood-200">Coût de création</span>
            </div>
            <div className="flex flex-col items-end">
              <span className={`font-bold ${hasEnoughPoints ? 'text-gold-400' : 'text-red-400'}`}>
                {GUILD_COST.toLocaleString()} Orydors
              </span>
              <span className="text-xs text-wood-400">
                Vous avez : {userStats.totalPoints.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Banner upload */}
          <div className="space-y-2">
            <Label className="text-wood-200">Bannière (optionnel)</Label>
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="relative h-32 rounded-lg border-2 border-dashed border-forest-500 bg-forest-800/50 cursor-pointer hover:border-gold-500/50 transition-colors overflow-hidden"
            >
              {bannerPreview ? (
                <img src={bannerPreview} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center justify-center h-full gap-2 text-wood-400">
                  <Camera className="w-8 h-8" />
                  <span className="text-sm">Cliquez pour ajouter une bannière</span>
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="guild-name" className="text-wood-200">Nom de la guilde *</Label>
            <Input
              id="guild-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Les Chroniqueurs d'Aildor"
              maxLength={30}
              className="bg-forest-700/50 border-forest-500 text-wood-100 placeholder:text-wood-500"
            />
            <span className="text-xs text-wood-400">{name.length}/30 caractères</span>
          </div>

          {/* Slogan */}
          <div className="space-y-2">
            <Label htmlFor="guild-slogan" className="text-wood-200">Slogan (optionnel)</Label>
            <Textarea
              id="guild-slogan"
              value={slogan}
              onChange={(e) => setSlogan(e.target.value)}
              placeholder="Unis par la passion des histoires..."
              maxLength={100}
              rows={2}
              className="bg-forest-700/50 border-forest-500 text-wood-100 placeholder:text-wood-500 resize-none"
            />
            <span className="text-xs text-wood-400">{slogan.length}/100 caractères</span>
          </div>

          {/* Submit */}
          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 border-forest-500 text-wood-200 hover:bg-forest-700"
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !hasEnoughPoints || !name.trim()}
              className="flex-1 bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-600 hover:to-gold-700 text-forest-900"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Création...
                </>
              ) : (
                'Créer la Guilde'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
