import React, { useState, useEffect, useMemo } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Flag, ImagePlus, Loader2, RefreshCw } from 'lucide-react';

interface ChapterReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookId: string;
  chapterId: string;
  chapterTitle: string;
}

const REPORT_TYPES = [
  { value: 'typo', label: "Faute d'orthographe / grammaire" },
  { value: 'layout', label: 'Problème de mise en page' },
  { value: 'missing', label: 'Contenu manquant' },
  { value: 'other', label: 'Autre' },
];

function generateCaptcha() {
  const a = Math.floor(Math.random() * 15) + 1;
  const b = Math.floor(Math.random() * 10) + 1;
  const useMultiply = Math.random() > 0.5;
  if (useMultiply) {
    return { question: `${a} × ${b}`, answer: a * b };
  }
  return { question: `${a} + ${b}`, answer: a + b };
}

export const ChapterReportDialog: React.FC<ChapterReportDialogProps> = ({
  open,
  onOpenChange,
  bookId,
  chapterId,
  chapterTitle,
}) => {
  const isMobile = useIsMobile();
  const { user } = useAuth();

  const [reportType, setReportType] = useState('');
  const [description, setDescription] = useState('');
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [captchaInput, setCaptchaInput] = useState('');
  const [captcha, setCaptcha] = useState(generateCaptcha);
  const [submitting, setSubmitting] = useState(false);

  // Reset form on open
  useEffect(() => {
    if (open) {
      setReportType('');
      setDescription('');
      setScreenshot(null);
      setCaptchaInput('');
      setCaptcha(generateCaptcha());
    }
  }, [open]);

  const canSubmit = useMemo(() => {
    return (
      reportType !== '' &&
      description.trim().length >= 10 &&
      captchaInput.trim() !== '' &&
      !submitting
    );
  }, [reportType, description, captchaInput, submitting]);

  const handleSubmit = async () => {
    if (!user) {
      toast.error('Vous devez être connecté pour signaler un problème.');
      return;
    }

    // Verify captcha
    if (parseInt(captchaInput.trim(), 10) !== captcha.answer) {
      toast.error('Réponse au captcha incorrecte. Réessayez.');
      setCaptcha(generateCaptcha());
      setCaptchaInput('');
      return;
    }

    setSubmitting(true);

    try {
      // Rate limit check
      const { data: allowed, error: rlError } = await supabase.rpc(
        'check_rate_limit',
        {
          p_user_id: user.id,
          p_action_type: 'chapter_report',
          p_max_attempts: 5,
          p_window_minutes: 60,
        }
      );

      if (rlError || !allowed) {
        toast.error('Trop de signalements récents. Réessayez dans une heure.');
        setSubmitting(false);
        return;
      }

      // Upload screenshot if provided
      let screenshotUrl: string | null = null;
      if (screenshot) {
        const ext = screenshot.name.split('.').pop();
        const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
        const { error: uploadError } = await supabase.storage
          .from('chapter-report-screenshots')
          .upload(path, screenshot);

        if (uploadError) {
          console.error('Screenshot upload error:', uploadError);
          toast.error("Erreur lors de l'upload de la capture.");
          setSubmitting(false);
          return;
        }

        const { data: urlData } = supabase.storage
          .from('chapter-report-screenshots')
          .getPublicUrl(path);
        screenshotUrl = urlData.publicUrl;
      }

      // Insert report
      const { error: insertError } = await supabase
        .from('chapter_reports' as any)
        .insert({
          user_id: user.id,
          book_id: bookId,
          chapter_id: chapterId,
          chapter_title: chapterTitle,
          report_type: reportType,
          description: description.trim(),
          screenshot_url: screenshotUrl,
        } as any);

      if (insertError) {
        console.error('Report insert error:', insertError);
        toast.error("Erreur lors de l'envoi du signalement.");
        setSubmitting(false);
        return;
      }

      toast.success('Signalement envoyé ! Merci pour votre aide. 🙏');
      onOpenChange(false);
    } catch (err) {
      console.error('Report error:', err);
      toast.error("Une erreur est survenue.");
    } finally {
      setSubmitting(false);
    }
  };

  const formContent = (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Type de problème</Label>
        <Select value={reportType} onValueChange={setReportType}>
          <SelectTrigger>
            <SelectValue placeholder="Sélectionnez le type..." />
          </SelectTrigger>
          <SelectContent>
            {REPORT_TYPES.map((t) => (
              <SelectItem key={t.value} value={t.value}>
                {t.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Description du problème</Label>
        <Textarea
          placeholder="Décrivez le problème rencontré (min. 10 caractères)..."
          value={description}
          onChange={(e) =>
            setDescription(e.target.value.slice(0, 1000))
          }
          rows={4}
        />
        <p className="text-xs text-muted-foreground text-right">
          {description.length}/1000
        </p>
      </div>

      <div className="space-y-2">
        <Label>Capture d'écran (optionnel)</Label>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 cursor-pointer border rounded-md px-3 py-2 text-sm hover:bg-accent transition-colors">
            <ImagePlus className="h-4 w-4" />
            {screenshot ? screenshot.name.slice(0, 25) : 'Ajouter une image'}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => setScreenshot(e.target.files?.[0] || null)}
            />
          </label>
          {screenshot && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setScreenshot(null)}
            >
              Retirer
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          Vérification : combien font {captcha.question} ?
          <button
            type="button"
            onClick={() => {
              setCaptcha(generateCaptcha());
              setCaptchaInput('');
            }}
            className="text-muted-foreground hover:text-foreground"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
        </Label>
        <Input
          type="number"
          inputMode="numeric"
          placeholder="Votre réponse"
          value={captchaInput}
          onChange={(e) => setCaptchaInput(e.target.value)}
        />
      </div>

      <p className="text-xs text-muted-foreground">
        📖 Chapitre : <strong>{chapterTitle}</strong>
      </p>

      <Button
        className="w-full"
        onClick={handleSubmit}
        disabled={!canSubmit}
      >
        {submitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Envoi...
          </>
        ) : (
          <>
            <Flag className="mr-2 h-4 w-4" />
            Envoyer le signalement
          </>
        )}
      </Button>
    </div>
  );

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Signaler un problème</SheetTitle>
            <SheetDescription>
              Aidez-nous à améliorer la qualité du contenu.
            </SheetDescription>
          </SheetHeader>
          <div className="mt-4">{formContent}</div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Signaler un problème</DialogTitle>
          <DialogDescription>
            Aidez-nous à améliorer la qualité du contenu.
          </DialogDescription>
        </DialogHeader>
        {formContent}
      </DialogContent>
    </Dialog>
  );
};
