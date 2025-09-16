import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Star, Gift } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { useUserStats } from '@/contexts/UserStatsContext';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface RatingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const RatingDialog: React.FC<RatingDialogProps> = ({ open, onOpenChange }) => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addPointsForBook } = useUserStats();
  const { user } = useAuth();

  const handleRatingSubmit = async () => {
    if (rating === 0) {
      toast({
        title: 'Veuillez sélectionner une note',
        description: 'Choisissez entre 1 et 5 étoiles pour évaluer l\'application.',
        variant: 'destructive'
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Marquer que l'utilisateur a noté l'application
      const { error: updateError } = await supabase
        .from('profiles')
        .upsert({
          id: user?.id,
          has_rated_app: true,
          app_rating: rating,
          rated_at: new Date().toISOString()
        }, {
          onConflict: 'id'
        });

      if (updateError) {
        throw updateError;
      }

      // Attribuer les points de récompense (créer un livre fictif pour l'attribution)
      await addPointsForBook('app-rating', 150);

      toast({
        title: '🎉 Merci pour votre évaluation !',
        description: 'Vous avez gagné 150 Tensens pour avoir noté Orydia !',
      });

      onOpenChange(false);

      // Rediriger vers le store approprié pour noter l'app
      if (typeof window !== 'undefined') {
        // Détection de la plateforme
        const userAgent = navigator.userAgent.toLowerCase();
        
        if (userAgent.includes('android')) {
          // Rediriger vers Google Play Store
          window.open('market://details?id=com.orydia.app', '_blank');
        } else if (userAgent.includes('iphone') || userAgent.includes('ipad')) {
          // Rediriger vers App Store (remplacez par votre ID d'app réel)
          window.open('itms-apps://itunes.apple.com/app/id[YOUR_APPLE_APP_ID]', '_blank');
        } else {
          // Version web - rediriger vers une page de remerciement ou feedback
          toast({
            title: 'Merci !',
            description: 'Votre évaluation nous aide à améliorer Orydia.',
          });
        }
      }

    } catch (error) {
      console.error('Error submitting rating:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible d\'enregistrer votre évaluation. Réessayez plus tard.',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader className="text-center">
          <DialogTitle className="flex items-center justify-center gap-2 text-2xl">
            <Star className="h-6 w-6 text-amber-500" />
            Vous appréciez Orydia ?
          </DialogTitle>
          <DialogDescription className="text-center space-y-4">
            <p>
              Votre avis nous aide à améliorer l'expérience pour tous les lecteurs !
            </p>
            <div className="flex items-center justify-center gap-2 p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800">
              <Gift className="h-5 w-5 text-amber-600" />
              <span className="font-semibold text-amber-700 dark:text-amber-300">
                Gagnez 150 Tensens en notant l'app !
              </span>
            </div>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Système d'étoiles */}
          <div className="flex justify-center space-x-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className="p-1 hover:scale-110 transition-transform"
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                onClick={() => setRating(star)}
              >
                <Star
                  className={`h-8 w-8 ${
                    star <= (hoveredRating || rating)
                      ? 'text-amber-400 fill-amber-400'
                      : 'text-gray-300 dark:text-gray-600'
                  } transition-colors`}
                />
              </button>
            ))}
          </div>

          {rating > 0 && (
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                {rating === 5 && "Fantastique ! Merci pour ce 5 étoiles ! ⭐"}
                {rating === 4 && "Merci ! Vos 4 étoiles nous motivent ! 🌟"}
                {rating === 3 && "Merci pour votre évaluation ! 👍"}
                {rating <= 2 && "Merci pour votre retour, nous travaillons à nous améliorer ! 💪"}
              </p>
            </div>
          )}

          {/* Boutons d'action */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={handleRatingSubmit}
              disabled={rating === 0 || isSubmitting}
              className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Envoi en cours...
                </>
              ) : (
                <>
                  <Gift className="h-4 w-4 mr-2" />
                  Noter et gagner 150 Tensens
                </>
              )}
            </Button>
            <Button
              variant="ghost"
              onClick={handleSkip}
              className="flex-1"
              disabled={isSubmitting}
            >
              Plus tard
            </Button>
          </div>

          <p className="text-xs text-center text-muted-foreground">
            Vous ne verrez plus ce message après avoir noté l'application
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};