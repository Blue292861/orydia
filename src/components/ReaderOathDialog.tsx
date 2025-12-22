import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { BookSearchSelect } from "@/components/BookSearchSelect";
import { useBooks } from "@/hooks/useBooks";
import { useUserStats } from "@/contexts/UserStatsContext";
import { readerOathService } from "@/services/readerOathService";
import { STAKE_OPTIONS, StakeAmount } from "@/types/ReaderOath";
import { toast } from "@/hooks/use-toast";
import { format, addDays, setHours, setMinutes, setSeconds } from "date-fns";
import { fr } from "date-fns/locale";
import { CalendarIcon, Scroll, AlertTriangle, Trophy, Skull, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { OathPlacedAnimation } from "./OathPlacedAnimation";

interface ReaderOathDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  preselectedBookId?: string;
  preselectedBookTitle?: string;
  preselectedBookCover?: string;
  onOathPlaced?: () => void;
}

export function ReaderOathDialog({
  open,
  onOpenChange,
  preselectedBookId,
  preselectedBookTitle,
  preselectedBookCover,
  onOathPlaced,
}: ReaderOathDialogProps) {
  const { books } = useBooks();
  const { userStats, loadUserStats } = useUserStats();
  
  const [selectedBookId, setSelectedBookId] = useState<string>(preselectedBookId || "");
  const [selectedStake, setSelectedStake] = useState<StakeAmount>(500);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(addDays(new Date(), 3));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showOathAnimation, setShowOathAnimation] = useState(false);

  // Update when preselected book changes
  useEffect(() => {
    if (preselectedBookId) {
      setSelectedBookId(preselectedBookId);
    }
  }, [preselectedBookId]);

  const selectedBook = books.find(b => b.id === selectedBookId);
  const bookTitle = preselectedBookTitle || selectedBook?.title || "";
  const bookCover = preselectedBookCover || selectedBook?.coverUrl;

  const potentialWin = Math.floor(selectedStake * 1.1);
  const potentialLoss = Math.floor(selectedStake * 1.1);
  const currentBalance = userStats?.totalPoints || 0;
  const requiredBalance = Math.floor(selectedStake * 1.1);
  const hasEnoughBalance = currentBalance >= requiredBalance;

  // Set deadline to 23:59:59 of selected date
  const getDeadlineDate = () => {
    if (!selectedDate) return null;
    return setSeconds(setMinutes(setHours(selectedDate, 23), 59), 59);
  };

  const handlePlaceOath = async () => {
    if (!selectedBookId || !selectedDate) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un livre et une date limite",
        variant: "destructive",
      });
      return;
    }

    if (!hasEnoughBalance) {
      toast({
        title: "Orydors insuffisants",
        description: `Vous avez besoin de ${requiredBalance} Orydors pour ce serment`,
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const deadline = getDeadlineDate();
      if (!deadline) return;

      const result = await readerOathService.placeOath(
        selectedBookId,
        bookTitle,
        bookCover,
        selectedStake,
        deadline
      );

      if (result.success) {
        setShowOathAnimation(true);
        await loadUserStats();
      } else {
        toast({
          title: "Erreur",
          description: result.error || "Impossible de placer le serment",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error placing oath:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const minDate = addDays(new Date(), 1);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Scroll className="h-5 w-5 text-amber-500" />
            Serment du Lecteur
          </DialogTitle>
          <DialogDescription>
            Pariez sur votre capacité à terminer un livre avant la date limite !
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Sélection du livre */}
          {!preselectedBookId && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Livre à terminer</label>
              <BookSearchSelect
                books={books.map(b => ({
                  id: b.id,
                  title: b.title,
                  cover_url: b.coverUrl,
                  author: b.author,
                }))}
                value={selectedBookId}
                onChange={(val) => setSelectedBookId(Array.isArray(val) ? val[0] : val)}
                placeholder="Sélectionner un livre..."
              />
            </div>
          )}

          {preselectedBookId && (
            <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
              {bookCover && (
                <img
                  src={bookCover}
                  alt={bookTitle}
                  className="w-12 h-16 object-cover rounded"
                />
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{bookTitle}</p>
                <p className="text-sm text-muted-foreground">Livre sélectionné</p>
              </div>
            </div>
          )}

          {/* Sélection de la mise */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Mise (Orydors)</label>
            <div className="grid grid-cols-3 gap-2">
              {STAKE_OPTIONS.map((stake) => (
                <Button
                  key={stake}
                  variant={selectedStake === stake ? "default" : "outline"}
                  onClick={() => setSelectedStake(stake)}
                  className={cn(
                    "relative",
                    selectedStake === stake && "ring-2 ring-primary ring-offset-2 ring-offset-background"
                  )}
                >
                  {stake}
                </Button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              Solde actuel: {currentBalance.toLocaleString()} Orydors
            </p>
          </div>

          {/* Sélection de la date */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Date limite (23h59)</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !selectedDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {selectedDate ? (
                    format(selectedDate, "EEEE d MMMM yyyy", { locale: fr })
                  ) : (
                    "Choisir une date"
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={(date) => date < minDate}
                  initialFocus
                  locale={fr}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Récapitulatif gains/pertes */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
              <div className="flex items-center gap-2 text-green-500 mb-1">
                <Trophy className="h-4 w-4" />
                <span className="text-sm font-medium">Si victoire</span>
              </div>
              <p className="text-lg font-bold text-green-500">
                +{potentialWin.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">
                Mise + 10% bonus
              </p>
            </div>

            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <div className="flex items-center gap-2 text-red-500 mb-1">
                <Skull className="h-4 w-4" />
                <span className="text-sm font-medium">Si défaite</span>
              </div>
              <p className="text-lg font-bold text-red-500">
                -{potentialLoss.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">
                Mise + 10% pénalité
              </p>
            </div>
          </div>

          {/* Avertissement balance insuffisante */}
          {!hasEnoughBalance && (
            <div className="flex items-start gap-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
              <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-amber-500">Orydors insuffisants</p>
                <p className="text-muted-foreground">
                  Vous devez avoir {requiredBalance.toLocaleString()} Orydors 
                  (mise + pénalité potentielle)
                </p>
              </div>
            </div>
          )}

          {/* Bouton de confirmation */}
          <Button
            onClick={handlePlaceOath}
            disabled={!selectedBookId || !selectedDate || !hasEnoughBalance || isSubmitting}
            className="w-full"
            size="lg"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Placement en cours...
              </>
            ) : (
              <>
                <Scroll className="h-4 w-4 mr-2" />
                Prêter serment
              </>
            )}
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            Une fois placé, le serment ne peut être annulé.
          </p>
        </div>
      </DialogContent>

      {/* Animation de placement du serment */}
      <OathPlacedAnimation
        isOpen={showOathAnimation}
        bookTitle={bookTitle}
        stakeAmount={selectedStake}
        deadline={selectedDate || new Date()}
        onContinue={() => {
          setShowOathAnimation(false);
          onOathPlaced?.();
          onOpenChange(false);
        }}
      />
    </Dialog>
  );
}
