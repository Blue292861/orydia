import React, { useState } from 'react';
import { useUserStats } from '@/contexts/UserStatsContext';
import { Button } from '@/components/ui/button';
import { ChevronRight, ChevronLeft, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GuidedTutorialProps {
  onComplete: () => void;
  onSkip: () => void;
  currentPage?: 'library' | 'search' | 'shop' | 'profile';
}

interface TutorialStep {
  tab: 'library' | 'search' | 'shop' | 'profile';
  title: string;
  message: string;
}

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    tab: 'library',
    title: 'Page d\'accueil',
    message: 'Dans la page d\'accueil, tu retrouveras les succès du mois précédent ainsi que les recommandations de notre cher ami Paco, que tu retrouveras sur notre Instagram.'
  },
  {
    tab: 'search',
    title: 'Rechercher',
    message: 'C\'est ici que tu auras accès à notre vaste catalogue ! Sélectionne ton genre préféré ou recherche directement le nom d\'un auteur ou d\'une œuvre et laisse toi porter par le talent de nos auteurs !'
  },
  {
    tab: 'shop',
    title: 'Boutique',
    message: 'Nous récompensons chaque lecture ! Pour chaque livre lu, tu gagneras des Tensens que tu pourras dépenser ici contre des cadeaux, des bons d\'achat ou faire un don à des associations !'
  },
  {
    tab: 'profile',
    title: 'Profil',
    message: 'Retrouve tes statistiques et ton niveau de lecteur. Accomplis des hauts-faits pour devenir le lecteur le plus puissant d\'Orydia !'
  }
];

export const GuidedTutorial: React.FC<GuidedTutorialProps> = ({ 
  onComplete, 
  onSkip,
  currentPage = 'library'
}) => {
  const { completeTutorial } = useUserStats();
  const [currentStep, setCurrentStep] = useState(0);

  const currentStepData = TUTORIAL_STEPS[currentStep];
  const isLastStep = currentStep === TUTORIAL_STEPS.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      handleComplete();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    await completeTutorial();
    onComplete();
  };

  const handleSkip = async () => {
    await completeTutorial();
    onSkip();
  };

  return (
    <div className="fixed inset-0 z-[9998] overflow-hidden">
      {/* Semi-transparent overlay */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      {/* Spotlight effect - indicator pointing to the highlighted tab */}
      <div className="absolute bottom-16 left-0 right-0 flex justify-center pointer-events-none z-[9999]">
        <div 
          className={cn(
            "transition-all duration-500 ease-in-out",
            currentStepData.tab === 'library' && "translate-x-[-37.5%]",
            currentStepData.tab === 'search' && "translate-x-[-12.5%]",
            currentStepData.tab === 'shop' && "translate-x-[12.5%]",
            currentStepData.tab === 'profile' && "translate-x-[37.5%]"
          )}
        >
          <div className="w-24 h-24 rounded-full bg-gold-400/30 animate-pulse" />
        </div>
      </div>

      {/* Tutorial content box */}
      <div className="absolute inset-0 flex items-center justify-center p-4 z-[10000] pointer-events-none">
        <div className="bg-gradient-to-br from-forest-800 to-forest-900 border-2 border-gold-400 rounded-lg shadow-2xl max-w-lg w-full p-6 pointer-events-auto animate-in fade-in slide-in-from-bottom-4 duration-300">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="bg-gold-400 text-forest-900 rounded-full w-8 h-8 flex items-center justify-center font-bold">
                {currentStep + 1}
              </div>
              <h3 className="text-xl font-semibold text-gold-300 font-medieval">
                {currentStepData.title}
              </h3>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSkip}
              className="text-wood-400 hover:text-wood-100"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Progress bar */}
          <div className="w-full h-2 bg-forest-700 rounded-full mb-6 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-gold-400 to-gold-500 transition-all duration-300 rounded-full"
              style={{ width: `${((currentStep + 1) / TUTORIAL_STEPS.length) * 100}%` }}
            />
          </div>

          {/* Message */}
          <p className="text-wood-100 text-base leading-relaxed mb-6">
            {currentStepData.message}
          </p>

          {/* Navigation buttons */}
          <div className="flex items-center justify-between gap-4">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="border-wood-600 text-wood-100 hover:bg-forest-700 disabled:opacity-50"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Précédent
            </Button>

            <div className="flex gap-1">
              {TUTORIAL_STEPS.map((_, index) => (
                <div
                  key={index}
                  className={cn(
                    "w-2 h-2 rounded-full transition-all duration-300",
                    index === currentStep ? "bg-gold-400 w-4" : "bg-forest-600"
                  )}
                />
              ))}
            </div>

            <Button
              onClick={handleNext}
              className="bg-gold-500 hover:bg-gold-600 text-forest-900 font-semibold"
            >
              {isLastStep ? 'Terminer' : 'Suivant'}
              {!isLastStep && <ChevronRight className="h-4 w-4 ml-1" />}
            </Button>
          </div>

          {/* Skip button */}
          <div className="text-center mt-4">
            <Button
              variant="link"
              onClick={handleSkip}
              className="text-wood-400 hover:text-wood-100 text-sm"
            >
              Passer le tutoriel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
