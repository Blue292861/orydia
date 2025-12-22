import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChestReward, XPData } from "@/types/ChestReward";
import { RewardCardDisplay } from "./RewardCardDisplay";
import { RarityFlash } from "./RarityEffects";
import { AnimatedXPBar } from "./AnimatedXPBar";
import { LevelUpCelebration } from "./LevelUpCelebration";
import { CollectionCompleteAnimation } from "./CollectionCompleteAnimation";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import coffreArgent from "@/assets/coffre-argent.png";
import coffreOr from "@/assets/coffre-or.png";
import carteOrydors from "@/assets/carte-orydors.png";
import { useUserStats } from "@/contexts/UserStatsContext";
import { PendingLevelReward } from "@/types/LevelReward";

interface CollectionCompleted {
  name: string;
  iconUrl: string;
  orydorsReward: number;
  xpReward: number;
}

interface ChestOpeningDialogProps {
  isOpen: boolean;
  onClose: () => void;
  chestType: 'silver' | 'gold';
  orydors: number;
  orydorsVariation: number;
  additionalRewards: ChestReward[];
  bookTitle: string;
  xpData?: XPData;
  completedCollections?: CollectionCompleted[];
}

type AnimationPhase = 
  | 'chest-closed' 
  | 'chest-opening' 
  | 'anticipation' 
  | 'reveal-orydors' 
  | 'reveal-rewards' 
  | 'complete' 
  | 'collection-complete'
  | 'xp-animation' 
  | 'level-up';

export function ChestOpeningDialog({
  isOpen,
  onClose,
  chestType,
  orydors,
  orydorsVariation,
  additionalRewards,
  bookTitle,
  xpData,
  completedCollections = []
}: ChestOpeningDialogProps) {
  const [phase, setPhase] = useState<AnimationPhase>('chest-closed');
  const [currentRewardIndex, setCurrentRewardIndex] = useState(-1);
  const [showSkipButton, setShowSkipButton] = useState(false);
  const [showFlash, setShowFlash] = useState(false);
  const [currentRarity, setCurrentRarity] = useState<'common' | 'rare' | 'epic' | 'legendary'>('common');
  const [dialogShake, setDialogShake] = useState(false);
  const [levelUpLevel, setLevelUpLevel] = useState<number | null>(null);
  const [pendingLevelReward, setPendingLevelReward] = useState<PendingLevelReward | null>(null);
  const [currentCollectionIndex, setCurrentCollectionIndex] = useState(0);
  
  const { pendingLevelRewards, claimLevelRewards, loadPendingLevelRewards } = useUserStats();

  useEffect(() => {
    if (isOpen) {
      setPhase('chest-closed');
      setCurrentRewardIndex(-1);
      setShowSkipButton(false);
      setShowFlash(false);
      setDialogShake(false);
      setLevelUpLevel(null);
      setPendingLevelReward(null);
      setCurrentCollectionIndex(0);
    }
  }, [isOpen]);

  const triggerRarityEffects = (rarity: string) => {
    const r = rarity as 'common' | 'rare' | 'epic' | 'legendary';
    setCurrentRarity(r);
    setShowFlash(true);
    
    if (r === 'epic' || r === 'legendary') {
      setDialogShake(true);
      setTimeout(() => setDialogShake(false), 500);
    }
    
    setTimeout(() => setShowFlash(false), 300);
  };

  const handleOpenChest = () => {
    setPhase('chest-opening');
    setTimeout(() => {
      setPhase('anticipation');
      setTimeout(() => {
        triggerRarityEffects('common');
        setPhase('reveal-orydors');
        setShowSkipButton(true);
      }, 800);
    }, 1500);
  };

  const handleNextReward = () => {
    if (currentRewardIndex < additionalRewards.length - 1) {
      const nextIndex = currentRewardIndex + 1;
      const nextReward = additionalRewards[nextIndex];
      
      setPhase('anticipation');
      const anticipationTime = getAnticipationTime(nextReward.rarity);
      
      setTimeout(() => {
        triggerRarityEffects(nextReward.rarity);
        setCurrentRewardIndex(nextIndex);
        setPhase('reveal-rewards');
      }, anticipationTime);
    } else {
      setPhase('complete');
    }
  };

  const getAnticipationTime = (rarity: string) => {
    switch(rarity) {
      case 'legendary': return 1000;
      case 'epic': return 700;
      case 'rare': return 400;
      default: return 200;
    }
  };

  const handleSkipAll = () => {
    setPhase('complete');
  };

  const handleContinueToXP = () => {
    // Check for collection completions first
    if (completedCollections.length > 0) {
      setCurrentCollectionIndex(0);
      setPhase('collection-complete');
    } else if (xpData && xpData.xpGained > 0) {
      setPhase('xp-animation');
    } else {
      handleClose();
    }
  };

  const handleCollectionContinue = () => {
    if (currentCollectionIndex < completedCollections.length - 1) {
      setCurrentCollectionIndex(prev => prev + 1);
    } else if (xpData && xpData.xpGained > 0) {
      setPhase('xp-animation');
    } else {
      handleClose();
    }
  };

  const handleXPAnimationComplete = () => {
    // Check if there's a level up to celebrate
    if (xpData?.didLevelUp && xpData.newLevels.length > 0) {
      // Load pending rewards before showing level up celebration
      loadPendingLevelRewards().then(() => {
        setLevelUpLevel(xpData.newLevels[xpData.newLevels.length - 1]);
        setPhase('level-up');
      });
    } else {
      handleClose();
    }
  };

  const handleLevelUp = (level: number) => {
    console.log('Level up reached:', level);
    // Could trigger additional effects here
  };

  const handleLevelUpContinue = () => {
    handleClose();
  };

  const handleClaimLevelReward = async () => {
    const rewards = await claimLevelRewards();
    if (rewards) {
      console.log('Level rewards claimed:', rewards);
    }
    handleClose();
  };

  const handleClose = () => {
    setPhase('chest-closed');
    setCurrentRewardIndex(-1);
    setLevelUpLevel(null);
    onClose();
  };

  const chestColor = chestType === 'gold' 
    ? 'from-amber-400 via-yellow-500 to-amber-600' 
    : 'from-slate-300 via-slate-400 to-slate-500';

  const getRarityTextStyle = (rarity: string) => {
    switch(rarity) {
      case 'legendary': return 'text-amber-500 animate-pulse';
      case 'epic': return 'text-purple-500';
      case 'rare': return 'text-blue-500';
      default: return 'text-muted-foreground';
    }
  };

  // Level up celebration (full screen overlay)
  if (phase === 'level-up' && levelUpLevel) {
    const currentPendingReward = pendingLevelRewards.find(r => r.level === levelUpLevel);
    return (
      <LevelUpCelebration
        newLevel={levelUpLevel}
        pendingReward={currentPendingReward}
        onContinue={handleLevelUpContinue}
        onClaimReward={currentPendingReward ? handleClaimLevelReward : undefined}
      />
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className={cn(
        "max-w-2xl bg-gradient-to-br from-background to-muted border-2 border-primary/20 overflow-hidden",
        dialogShake && "animate-shake"
      )}>
        {/* Flash overlay */}
        <RarityFlash rarity={currentRarity} isActive={showFlash} />

        {phase === 'chest-closed' && (
          <div className="flex flex-col items-center justify-center py-12 space-y-8">
            <h2 className="text-2xl font-bold text-center">
              Félicitations pour avoir terminé<br />
              <span className="text-primary">{bookTitle}</span>
            </h2>
            
            <div className="relative">
              <div className={`absolute inset-0 bg-gradient-to-r ${chestColor} rounded-full blur-3xl opacity-60 animate-pulse-slow scale-150`} />
              
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
            <div className="relative">
              <div className={`absolute inset-0 bg-gradient-to-r ${chestColor} rounded-full blur-3xl chest-halo-burst`} />
              
              <div className="relative chest-opening">
                <img 
                  src={chestType === 'gold' ? coffreOr : coffreArgent}
                  alt={`Coffre ${chestType === 'gold' ? 'd\'or' : 'd\'argent'}`}
                  className="w-48 h-48 object-contain drop-shadow-2xl"
                />
              </div>
            </div>
          </div>
        )}

        {phase === 'anticipation' && (
          <div className="flex flex-col items-center justify-center py-16 space-y-6">
            <div className="relative w-32 h-32">
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary/50 to-amber-500/50 animate-ping" />
              <div className="absolute inset-4 rounded-full bg-gradient-to-r from-primary/70 to-amber-500/70 animate-pulse" />
              <div className="absolute inset-8 rounded-full bg-primary/90 animate-bounce" />
            </div>
            <p className="text-lg text-muted-foreground animate-pulse">Révélation en cours...</p>
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
              <Button onClick={() => setPhase('complete')} size="lg">
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
            
            <p className={cn(
              "text-sm font-bold uppercase tracking-widest",
              getRarityTextStyle(additionalRewards[currentRewardIndex].rarity)
            )}>
              {additionalRewards[currentRewardIndex].rarity}
            </p>
            
            <RewardCardDisplay
              reward={additionalRewards[currentRewardIndex]}
            />

            {currentRewardIndex < additionalRewards.length - 1 ? (
              <Button onClick={handleNextReward} size="lg">
                Carte suivante ({additionalRewards.length - currentRewardIndex - 1} restantes)
              </Button>
            ) : (
              <Button onClick={() => setPhase('complete')} size="lg">
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
                <div 
                  key={index} 
                  className={cn(
                    "flex flex-col items-center space-y-2 p-4 rounded-lg",
                    reward.rarity === 'legendary' && "bg-amber-500/10 border border-amber-500/30",
                    reward.rarity === 'epic' && "bg-purple-500/10 border border-purple-500/30",
                    reward.rarity === 'rare' && "bg-blue-500/10 border border-blue-500/30",
                    reward.rarity === 'common' && "bg-muted"
                  )}
                >
                  <img 
                    src={reward.imageUrl} 
                    alt={reward.name}
                    className="w-16 h-16 object-contain"
                  />
                  <p className={cn(
                    "font-semibold text-sm text-center",
                    reward.rarity === 'legendary' && "text-amber-500",
                    reward.rarity === 'epic' && "text-purple-500",
                    reward.rarity === 'rare' && "text-blue-500"
                  )}>
                    {reward.name}
                  </p>
                  <p className="text-xs text-muted-foreground">x{reward.quantity}</p>
                </div>
              ))}
            </div>

            <Button onClick={handleContinueToXP} size="lg" className="w-full max-w-xs">
              Continuer
            </Button>
          </div>
        )}

        {phase === 'collection-complete' && completedCollections.length > 0 && (
          <CollectionCompleteAnimation
            isOpen={true}
            collectionName={completedCollections[currentCollectionIndex].name}
            collectionIconUrl={completedCollections[currentCollectionIndex].iconUrl}
            orydorsReward={completedCollections[currentCollectionIndex].orydorsReward}
            xpReward={completedCollections[currentCollectionIndex].xpReward}
            onContinue={handleCollectionContinue}
          />
        )}

        {phase === 'xp-animation' && xpData && (
          <div className="flex flex-col items-center justify-center py-8">
            <h3 className="text-xl font-semibold mb-4">Expérience gagnée !</h3>
            <AnimatedXPBar
              xpBefore={xpData.xpBefore}
              xpAfter={xpData.xpAfter}
              levelBefore={xpData.levelBefore}
              levelAfter={xpData.levelAfter}
              onComplete={handleXPAnimationComplete}
              onLevelUp={handleLevelUp}
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
