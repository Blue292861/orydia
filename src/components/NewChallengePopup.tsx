import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Calendar, Target, Gift, ChevronRight, X } from 'lucide-react';
import { Challenge } from '@/types/Challenge';
import { getUnseenChallenges, markChallengeSeen } from '@/services/challengeService';
import { useAuth } from '@/contexts/AuthContext';

interface NewChallengePopupProps {
  onNavigateToProfile?: () => void;
}

export default function NewChallengePopup({ onNavigateToProfile }: NewChallengePopupProps) {
  const { user } = useAuth();
  const [unseenChallenges, setUnseenChallenges] = useState<Challenge[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (user) {
      loadUnseenChallenges();
    }
  }, [user]);

  const loadUnseenChallenges = async () => {
    if (!user) return;
    
    const challenges = await getUnseenChallenges(user.id);
    if (challenges.length > 0) {
      setUnseenChallenges(challenges);
      setIsOpen(true);
    }
  };

  const handleClose = async () => {
    if (user && unseenChallenges.length > 0) {
      // Marquer tous les défis comme vus
      for (const challenge of unseenChallenges) {
        await markChallengeSeen(user.id, challenge.id);
      }
    }
    setIsOpen(false);
  };

  const handleViewChallenges = async () => {
    await handleClose();
    onNavigateToProfile?.();
  };

  const handleNext = () => {
    if (currentIndex < unseenChallenges.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  if (unseenChallenges.length === 0) return null;

  const challenge = unseenChallenges[currentIndex];
  const daysRemaining = Math.ceil((challenge.endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-lg bg-gradient-to-br from-slate-900 via-amber-950/20 to-slate-900 border-2 border-amber-500/50 shadow-2xl shadow-amber-500/20">
        <button
          onClick={handleClose}
          className="absolute right-4 top-4 text-amber-200/60 hover:text-amber-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center pt-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 text-3xl mb-4 animate-pulse">
            {challenge.icon}
          </div>
          
          <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/50 mb-2">
            🎯 NOUVEAU DÉFI !
          </Badge>
          
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-amber-100">
              {challenge.name}
            </DialogTitle>
          </DialogHeader>
          
          <p className="text-amber-200/80 mt-2">{challenge.description}</p>
        </div>

        <div className="flex items-center justify-center gap-2 text-sm text-amber-300 mt-2">
          <Calendar className="w-4 h-4" />
          <span>
            Du {challenge.startDate.toLocaleDateString('fr-FR')} au {challenge.endDate.toLocaleDateString('fr-FR')}
          </span>
          <Badge variant="outline" className="border-amber-500/50 text-amber-400 ml-2">
            {daysRemaining} jours restants
          </Badge>
        </div>

        <div className="border-t border-amber-700/30 pt-4 mt-2">
          <h4 className="text-amber-100 font-semibold flex items-center gap-2 mb-3">
            <Target className="w-4 h-4" /> Objectifs
          </h4>
          <ScrollArea className="max-h-40">
            <div className="space-y-2">
              {challenge.objectives.map((obj, idx) => (
                <div 
                  key={obj.id} 
                  className="flex items-center gap-3 p-2 rounded-lg bg-slate-800/50"
                >
                  <div className="w-6 h-6 rounded-full bg-amber-900/50 border border-amber-700/50 flex items-center justify-center text-amber-300 text-xs">
                    {idx + 1}
                  </div>
                  <span className="text-amber-200/90 text-sm">{obj.objectiveName}</span>
                  {obj.targetCount > 1 && (
                    <Badge variant="outline" className="ml-auto text-xs border-amber-700/50 text-amber-400">
                      0/{obj.targetCount}
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        <div className="border-t border-amber-700/30 pt-4">
          <h4 className="text-amber-100 font-semibold flex items-center gap-2 mb-3">
            <Gift className="w-4 h-4" /> Récompenses
          </h4>
          <div className="flex flex-wrap gap-2 justify-center">
            {challenge.orydorsReward > 0 && (
              <Badge className="bg-amber-600/30 text-amber-200 border border-amber-500/50 px-3 py-1">
                💰 {challenge.orydorsReward} Orydors
              </Badge>
            )}
            {challenge.xpReward > 0 && (
              <Badge className="bg-purple-600/30 text-purple-200 border border-purple-500/50 px-3 py-1">
                ⭐ {challenge.xpReward} XP
              </Badge>
            )}
            {challenge.premiumMonthsReward > 0 && (
              <Badge className="bg-yellow-600/30 text-yellow-200 border border-yellow-500/50 px-3 py-1">
                👑 {challenge.premiumMonthsReward} mois premium
              </Badge>
            )}
            {challenge.itemRewards.map((item, idx) => (
              <Badge key={idx} className="bg-green-600/30 text-green-200 border border-green-500/50 px-3 py-1">
                🎁 {item.quantity}x item
              </Badge>
            ))}
          </div>
        </div>

        {unseenChallenges.length > 1 && (
          <div className="flex items-center justify-center gap-2 mt-2">
            {unseenChallenges.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  idx === currentIndex ? 'bg-amber-500' : 'bg-amber-900/50'
                }`}
              />
            ))}
          </div>
        )}

        <div className="flex gap-3 mt-4">
          <Button 
            variant="outline" 
            onClick={handleClose}
            className="flex-1 border-amber-700/50 text-amber-200 hover:bg-amber-900/30"
          >
            Plus tard
          </Button>
          <Button 
            onClick={handleViewChallenges}
            className="flex-1 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white"
          >
            Voir mes défis <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
