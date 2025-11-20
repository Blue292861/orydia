import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useUserStats } from '@/contexts/UserStatsContext';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface WelcomeDialogProps {
  onComplete?: () => void;
}

export const WelcomeDialog: React.FC<WelcomeDialogProps> = ({ onComplete }) => {
  const { user } = useAuth();
  const { userStats } = useUserStats();
  const [isOpen, setIsOpen] = useState(false);
  const hasShownRef = useRef(false);

  useEffect(() => {
    // Éviter les multiples déclenchements
    if (hasShownRef.current) return;
    
    // Pour les utilisateurs non-connectés
    if (!user) {
      const hasSeenWelcome = localStorage.getItem('orydia-welcome-seen');
      if (!hasSeenWelcome) {
        setIsOpen(true);
        hasShownRef.current = true;
      }
      return;
    }

    // Pour les utilisateurs connectés - vérifier s'ils ont déjà vu le welcome
    const userWelcomeSeen = localStorage.getItem(`orydia-welcome-seen-user-${user.id}`);
    const tutorialCompleted = userStats.achievements.find(
      (a) => a.id === 'tutorial-completed'
    )?.unlocked;

    // Afficher seulement si l'utilisateur n'a jamais vu le welcome ET n'a pas complété le tuto
    // Et seulement si les achievements sont chargés (length > 0 ou tutorialCompleted défini)
    if (!tutorialCompleted && !userWelcomeSeen && userStats.achievements.length >= 0) {
      setIsOpen(true);
      hasShownRef.current = true;
    }
  }, [user?.id, userStats.achievements.length]);

  const handleClose = () => {
    setIsOpen(false);
    
    // Si non-connecté, marquer comme vu dans localStorage
    if (!user) {
      localStorage.setItem('orydia-welcome-seen', 'true');
    } else {
      // Si connecté, marquer aussi pour cet utilisateur spécifique
      localStorage.setItem(`orydia-welcome-seen-user-${user.id}`, 'true');
    }
    
    // Notifier que le dialog est fermé pour lancer le tutoriel guidé si connecté
    if (onComplete) {
      onComplete();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[500px] bg-gradient-to-br from-forest-800 to-forest-900 border-gold-400 z-[9999]">
        <DialogHeader>
          <DialogTitle className="text-2xl text-gold-300 text-center font-medieval">
            Bienvenue en Orydia !
          </DialogTitle>
        </DialogHeader>
        <div className="py-6">
          <DialogDescription className="text-center text-wood-100 text-lg">
            Connecte toi ou inscris toi pour découvrir notre catalogue d'œuvres gratuites !
          </DialogDescription>
        </div>
        <div className="flex justify-center">
          <Button 
            onClick={handleClose}
            className="bg-gold-500 hover:bg-gold-600 text-forest-900 font-semibold px-8"
          >
            Compris !
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
