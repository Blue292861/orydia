import React, { useState, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { toast } from '@/hooks/use-toast';
import { Guild, GuildMember } from '@/types/Guild';
import { leaveGuild, updateGuild } from '@/services/guildService';
import { LogOut, Save, Loader2, Info, Users, Upload, ImageIcon } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface GuildSettingsProps {
  guild: Guild;
  membership: GuildMember;
  onLeaveSuccess: () => void;
  onUpdateSuccess: () => void;
}

export const GuildSettings: React.FC<GuildSettingsProps> = ({
  guild,
  membership,
  onLeaveSuccess,
  onUpdateSuccess
}) => {
  const isOwner = membership.role === 'owner';
  const [isLeaving, setIsLeaving] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editName, setEditName] = useState(guild.name);
  const [editSlogan, setEditSlogan] = useState(guild.slogan || '');
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'Fichier trop volumineux',
          description: 'L\'image ne doit pas dépasser 5 Mo',
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

  const handleLeave = async () => {
    setIsLeaving(true);
    try {
      const result = await leaveGuild();
      if (result.success) {
        toast({
          title: isOwner ? 'Guilde dissoute' : 'Guilde quittée',
          description: isOwner 
            ? 'Votre guilde a été dissoute car vous étiez le seul membre.'
            : 'Vous avez quitté la guilde.'
        });
        onLeaveSuccess();
      } else {
        toast({
          title: 'Erreur',
          description: result.error || 'Impossible de quitter la guilde',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue',
        variant: 'destructive'
      });
    } finally {
      setIsLeaving(false);
    }
  };

  const handleSave = async () => {
    if (!isOwner) return;
    
    setIsSaving(true);
    try {
      const result = await updateGuild(guild.id, {
        name: editName !== guild.name ? editName : undefined,
        slogan: editSlogan !== guild.slogan ? editSlogan : undefined,
        bannerFile: bannerFile || undefined
      });

      if (result.success) {
        toast({
          title: 'Modifications enregistrées',
          description: 'Les informations de la guilde ont été mises à jour.'
        });
        setBannerFile(null);
        setBannerPreview(null);
        onUpdateSuccess();
      } else {
        toast({
          title: 'Erreur',
          description: result.error || 'Impossible de sauvegarder les modifications',
          variant: 'destructive'
        });
      }
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue',
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const hasChanges = editName !== guild.name || editSlogan !== (guild.slogan || '') || bannerFile !== null;

  return (
    <div className="space-y-4">
      {/* Guild info */}
      <Card className="p-4 bg-forest-800/50 border-forest-600">
        <h3 className="flex items-center gap-2 text-lg font-medium text-wood-100 mb-4">
          <Info className="w-5 h-5 text-gold-400" />
          Informations
        </h3>
        
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-wood-200">Date de création</span>
            <span className="text-wood-100">
              {format(new Date(guild.created_at), 'd MMMM yyyy', { locale: fr })}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-wood-200">Nombre de membres</span>
            <span className="text-wood-100 flex items-center gap-1">
              <Users className="w-4 h-4" />
              {guild.member_count}
            </span>
          </div>
        </div>
      </Card>

      {/* Edit settings (owner only) */}
      {isOwner && (
        <Card className="p-4 bg-forest-800/50 border-forest-600">
          <h3 className="text-lg font-medium text-wood-100 mb-4">Modifier la guilde</h3>
          
          <div className="space-y-4">
            {/* Banner upload */}
            <div className="space-y-2">
              <Label className="text-wood-200">Image de la guilde</Label>
              <div className="flex items-center gap-4">
                <div 
                  className="relative w-24 h-24 rounded-lg overflow-hidden bg-forest-700/50 border border-forest-500 flex items-center justify-center cursor-pointer hover:border-gold-500/50 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {bannerPreview ? (
                    <img src={bannerPreview} alt="Aperçu" className="w-full h-full object-cover" />
                  ) : guild.banner_url ? (
                    <img src={guild.banner_url} alt="Bannière actuelle" className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon className="w-8 h-8 text-wood-300" />
                  )}
                  <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Upload className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="flex-1">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="border-forest-500 text-wood-100 hover:bg-forest-700"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Changer l'image
                  </Button>
                  <p className="text-xs text-wood-300 mt-1">JPG, PNG ou GIF. Max 5 Mo</p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleBannerChange}
                  className="hidden"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-name" className="text-wood-200">Nom</Label>
              <Input
                id="edit-name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                maxLength={30}
                className="bg-forest-700/50 border-forest-500 text-wood-100"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-slogan" className="text-wood-200">Slogan</Label>
              <Textarea
                id="edit-slogan"
                value={editSlogan}
                onChange={(e) => setEditSlogan(e.target.value)}
                maxLength={100}
                rows={2}
                className="bg-forest-700/50 border-forest-500 text-wood-100 resize-none"
              />
            </div>

            <Button
              onClick={handleSave}
              disabled={isSaving || !hasChanges}
              className="w-full bg-gold-500 hover:bg-gold-600 text-forest-900"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Enregistrement...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Enregistrer les modifications
                </>
              )}
            </Button>
          </div>
        </Card>
      )}

      {/* Leave guild */}
      <Card className="p-4 bg-red-900/20 border-red-800/50">
        <h3 className="text-lg font-medium text-red-300 mb-2">Zone de danger</h3>
        <p className="text-sm text-wood-200 mb-4">
          {isOwner 
            ? 'Dissoudre la guilde supprimera définitivement tous les membres, messages, annonces et ressources du coffre.'
            : 'Vous pouvez quitter la guilde à tout moment.'}
        </p>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button 
              variant="destructive" 
              className="w-full"
            >
              <LogOut className="w-4 h-4 mr-2" />
              {isOwner ? 'Dissoudre la guilde' : 'Quitter la guilde'}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="bg-forest-800 border-forest-600">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-wood-100">
                {isOwner ? 'Dissoudre la guilde ?' : 'Quitter la guilde ?'}
              </AlertDialogTitle>
              <AlertDialogDescription className="text-wood-200">
                {isOwner 
                  ? `⚠️ Cette action est IRRÉVERSIBLE. La guilde "${guild.name}" sera définitivement supprimée avec tous ses ${guild.member_count} membre${guild.member_count > 1 ? 's' : ''}, messages, annonces et ressources du coffre.`
                  : 'Vous pourrez rejoindre une autre guilde ou revenir plus tard.'}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="border-forest-500 text-wood-100 hover:bg-forest-700">
                Annuler
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleLeave}
                disabled={isLeaving}
                className="bg-red-600 hover:bg-red-700"
              >
                {isLeaving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  'Confirmer'
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </Card>
    </div>
  );
};
