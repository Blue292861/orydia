import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChestReward } from "@/types/RewardType";
import { RewardCardDisplay } from "./RewardCardDisplay";
import { Sparkles } from "lucide-react";
import coffreArgent from "@/assets/coffre-argent.png";
import coffreOr from "@/assets/coffre-or.png";
import carteOrydors from "@/assets/carte-orydors.png";

interface ChestOpeningDialogProps {
  isOpen: boolean;
  onClose: () => void;
  chestType: 'silver' | 'gold';
  orydors: number;
  orydorsVariation: number;
  additionalRewards: ChestReward[];
  bookTitle: string;
}

type AnimationPhase = 'chest-closed' | 'chest-opening' | 'reveal-orydors' | 'reveal-rewards' | 'complete';

export function ChestOpeningDialog({
  isOpen,
  onClose,
  chestType,
  orydors,
  orydorsVariation,
  additionalRewards,
  bookTitle
}: ChestOpeningDialogProps) {
  const [phase, setPhase] = useState<AnimationPhase>('chest-closed');
  const [currentRewardIndex, setCurrentRewardIndex] = useState(-1);
  const [showSkipButton, setShowSkipButton] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setPhase('chest-closed');
      setCurrentRewardIndex(-1);
      setShowSkipButton(false);
    }
  }, [isOpen]);

  const handleOpenChest = () => {
    setPhase('chest-opening');
    setTimeout(() => {
      setPhase('reveal-orydors');
      setShowSkipButton(true);
    }, 1500);
  };

  const handleNextReward = () => {
    if (currentRewardIndex < additionalRewards.length - 1) {
      setCurrentRewardIndex(prev => prev + 1);
      setPhase('reveal-rewards');
    } else {
      setPhase('complete');
    }
  };

  const handleSkipAll = () => {
    setPhase('complete');
  };

  const handleClose = () => {
    setPhase('chest-closed');
    setCurrentRewardIndex(-1);
    onClose();
  };

  const chestColor = chestType === 'gold' 
    ? 'from-amber-400 via-yellow-500 to-amber-600' 
    : 'from-slate-300 via-slate-400 to-slate-500';

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl bg-gradient-to-br from-background to-muted border-2 border-primary/20">
        {phase === 'chest-closed' && (
          <div className="flex flex-col items-center justify-center py-12 space-y-8">
            <h2 className="text-2xl font-bold text-center">
              Félicitations pour avoir terminé<br />
              <span className="text-primary">{bookTitle}</span>
            </h2>
            
            {/* Chest with animated halo */}
            <div className="relative">
              {/* Animated halo */}
              <div className={`absolute inset-0 bg-gradient-to-r ${chestColor} rounded-full blur-3xl opacity-60 animate-pulse-slow scale-150`} />
              
              {/* Chest */}
              <div className="relative transform hover:scale-105 transition-transform duration-300 chest-appear">
                <img 
                  src={chestType === 'gold' ? coffreOr : coffreArgent}
                  alt={`Coffre ${chestType === 'gold' ? 'd\'or' : 'd\'argent'}`}
                  className="w-48 h-48 object-contain drop-shadow-2xl"
                />
              </div>
            </div>

            <p className="text-lg text-muted-foreground text-center">
              Un coffre {chestType === 'gold' ? 'doré' : 'argenté'} vous attend !
            </p>

            <Button 
              onClick={handleOpenChest}
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Ouvrir le coffre
            </Button>
          </div>
        )}

        {phase === 'chest-opening' && (
          <div className="flex items-center justify-center py-12">
            <div className="chest-opening">
              <img 
                src={chestType === 'gold' ? coffreOr : coffreArgent}
                alt={`Coffre ${chestType === 'gold' ? 'd\'or' : 'd\'argent'}`}
                className="w-48 h-48 object-contain drop-shadow-2xl animate-bounce"
              />
            </div>
          </div>
        )}

        {phase === 'reveal-orydors' && (
          <div className="flex flex-col items-center justify-center py-8 space-y-6">
            <h3 className="text-xl font-semibold">Vos récompenses !</h3>
            
            <RewardCardDisplay
              reward={{
                type: 'currency',
                name: 'Orydors',
                quantity: orydors,
                imageUrl: carteOrydors,
                rarity: 'common',
                rewardTypeId: 'orydors'
              }}
              variation={orydorsVariation}
            />

            <p className="text-sm text-muted-foreground">
              Variation : {orydorsVariation}% du montant de base
            </p>

            {additionalRewards.length > 0 ? (
              <Button onClick={handleNextReward} size="lg">
                Carte suivante ({additionalRewards.length} restantes)
              </Button>
            ) : (
              <Button onClick={handleClose} size="lg">
                Terminer
              </Button>
            )}

            {showSkipButton && additionalRewards.length > 0 && (
              <Button onClick={handleSkipAll} variant="ghost" size="sm">
                Tout révéler
              </Button>
            )}
          </div>
        )}

        {phase === 'reveal-rewards' && currentRewardIndex >= 0 && (
          <div className="flex flex-col items-center justify-center py-8 space-y-6">
            <h3 className="text-xl font-semibold">
              Récompense {currentRewardIndex + 2} / {additionalRewards.length + 1}
            </h3>
            
            <RewardCardDisplay
              reward={additionalRewards[currentRewardIndex]}
            />

            {currentRewardIndex < additionalRewards.length - 1 ? (
              <Button onClick={handleNextReward} size="lg">
                Carte suivante ({additionalRewards.length - currentRewardIndex - 1} restantes)
              </Button>
            ) : (
              <Button onClick={handleClose} size="lg">
                Terminer
              </Button>
            )}

            {showSkipButton && (
              <Button onClick={handleSkipAll} variant="ghost" size="sm">
                Tout révéler
              </Button>
            )}
          </div>
        )}

        {phase === 'complete' && (
          <div className="flex flex-col items-center justify-center py-8 space-y-6">
            <h3 className="text-2xl font-bold text-primary">Toutes vos récompenses !</h3>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-h-96 overflow-y-auto w-full p-4">
              <div className="flex flex-col items-center space-y-2 p-4 bg-muted rounded-lg">
                <img 
                  src={carteOrydors} 
                  alt="Orydors"
                  className="w-16 h-16 object-contain"
                />
                <p className="font-semibold">{orydors} Orydors</p>
                <p className="text-xs text-muted-foreground">{orydorsVariation}%</p>
              </div>

              {additionalRewards.map((reward, index) => (
                <div key={index} className="flex flex-col items-center space-y-2 p-4 bg-muted rounded-lg">
                  <img 
                    src={reward.imageUrl} 
                    alt={reward.name}
                    className="w-16 h-16 object-contain"
                  />
                  <p className="font-semibold text-sm text-center">{reward.name}</p>
                  <p className="text-xs text-muted-foreground">x{reward.quantity}</p>
                </div>
              ))}
            </div>

            <Button onClick={handleClose} size="lg" className="w-full max-w-xs">
              Continuer
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
