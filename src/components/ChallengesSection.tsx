import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Target, Clock, Gift, Check, BookOpen, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { UserChallengeStatus } from '@/types/Challenge';
import { getUserChallengesWithProgress, claimChallengeRewards, getBooksWithReward } from '@/services/challengeService';
import { useNavigate } from 'react-router-dom';

interface BookWithReward {
  id: string;
  title: string;
  author: string;
  cover_url: string;
  genres: string[];
  dropChance: number;
  chestType: string;
}

export default function ChallengesSection() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [challengeStatuses, setChallengeStatuses] = useState<UserChallengeStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [claimingId, setClaimingId] = useState<string | null>(null);
  const [booksDialogOpen, setBooksDialogOpen] = useState(false);
  const [selectedRewardBooks, setSelectedRewardBooks] = useState<BookWithReward[]>([]);
  const [selectedRewardName, setSelectedRewardName] = useState('');

  useEffect(() => {
    if (user) {
      loadChallenges();
    }
  }, [user]);

  const loadChallenges = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const statuses = await getUserChallengesWithProgress(user.id);
      setChallengeStatuses(statuses);
    } catch (error) {
      console.error('Error loading challenges:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClaimRewards = async (challengeId: string) => {
    if (!user) return;
    
    setClaimingId(challengeId);
    try {
      const result = await claimChallengeRewards(user.id, challengeId);
      if (result.success) {
        toast.success('Récompenses réclamées avec succès !');
        loadChallenges();
      } else {
        toast.error(result.error || 'Erreur lors de la réclamation');
      }
    } catch (error) {
      toast.error('Erreur lors de la réclamation');
    } finally {
      setClaimingId(null);
    }
  };

  const handleViewBooksWithItem = async (rewardTypeId: string, rewardName: string) => {
    try {
      const books = await getBooksWithReward(rewardTypeId);
      setSelectedRewardBooks(books);
      setSelectedRewardName(rewardName);
      setBooksDialogOpen(true);
    } catch (error) {
      toast.error('Erreur lors du chargement des livres');
    }
  };

  const getDaysRemaining = (endDate: Date) => {
    return Math.max(0, Math.ceil((endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
  };

  if (isLoading) {
    return (
      <Card className="bg-slate-800/50 border-amber-700/30">
        <CardContent className="p-6">
          <div className="text-center text-amber-200/60">Chargement des défis...</div>
        </CardContent>
      </Card>
    );
  }

  if (challengeStatuses.length === 0) {
    return (
      <Card className="bg-slate-800/50 border-amber-700/30">
        <CardHeader>
          <CardTitle className="text-amber-100 flex items-center gap-2">
            <Target className="w-5 h-5" /> Défis en cours
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-amber-200/60">
            <Target className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Aucun défi disponible pour le moment</p>
            <p className="text-sm mt-1">Revenez bientôt pour découvrir de nouveaux défis !</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="bg-slate-800/50 border-amber-700/30">
        <CardHeader>
          <CardTitle className="text-amber-100 flex items-center gap-2">
            <Target className="w-5 h-5" /> Défis en cours
            <Badge className="ml-auto bg-amber-600/30 text-amber-200">
              {challengeStatuses.length} actif(s)
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {challengeStatuses.map((status) => {
            const { challenge, progress, overallProgress, isFullyCompleted, rewardsClaimed } = status;
            const daysRemaining = getDaysRemaining(challenge.endDate);

            return (
              <Card 
                key={challenge.id} 
                className={`bg-slate-900/50 border transition-all ${
                  isFullyCompleted && !rewardsClaimed 
                    ? 'border-green-500/50 shadow-lg shadow-green-500/10' 
                    : 'border-amber-700/30'
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{challenge.icon}</span>
                      <div>
                        <h3 className="font-semibold text-amber-100">{challenge.name}</h3>
                        <p className="text-sm text-amber-200/60">{challenge.description}</p>
                      </div>
                    </div>
                    <Badge 
                      variant="outline" 
                      className={`${daysRemaining <= 3 ? 'border-red-500/50 text-red-400' : 'border-amber-500/50 text-amber-300'}`}
                    >
                      <Clock className="w-3 h-3 mr-1" />
                      {daysRemaining}j restants
                    </Badge>
                  </div>

                  {/* Barre de progression globale */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-amber-200/80">Progression</span>
                      <span className="text-amber-300">{Math.round(overallProgress)}%</span>
                    </div>
                    <Progress 
                      value={overallProgress} 
                      className="h-2 bg-slate-700"
                    />
                  </div>

                  {/* Liste des objectifs */}
                  <div className="space-y-2 mb-4">
                    {challenge.objectives.map((objective) => {
                      const objProgress = progress.find(p => p.objectiveId === objective.id);
                      const isObjCompleted = objProgress?.isCompleted || false;
                      const current = objProgress?.currentProgress || 0;
                      const target = objective.targetCount;

                      return (
                        <div 
                          key={objective.id}
                          className={`flex items-center gap-3 p-2 rounded-lg ${
                            isObjCompleted ? 'bg-green-900/20' : 'bg-slate-800/50'
                          }`}
                        >
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                            isObjCompleted 
                              ? 'bg-green-500 text-white' 
                              : 'bg-slate-700 border border-amber-700/50'
                          }`}>
                            {isObjCompleted && <Check className="w-3 h-3" />}
                          </div>
                          <span className={`flex-1 text-sm ${
                            isObjCompleted ? 'text-green-300 line-through' : 'text-amber-200'
                          }`}>
                            {objective.objectiveName}
                          </span>
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${
                              isObjCompleted 
                                ? 'border-green-500/50 text-green-400' 
                                : 'border-amber-700/50 text-amber-400'
                            }`}
                          >
                            {current}/{target}
                          </Badge>

                          {/* Bouton pour voir les livres avec cet item (collect_item) */}
                          {objective.objectiveType === 'collect_item' && objective.targetRewardTypeId && !isObjCompleted && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-xs text-amber-400 hover:text-amber-300 p-1 h-auto"
                              onClick={() => handleViewBooksWithItem(
                                objective.targetRewardTypeId!,
                                objective.targetRewardType?.name || 'cet item'
                              )}
                            >
                              <BookOpen className="w-3 h-3 mr-1" />
                              Livres
                            </Button>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Récompenses */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    {challenge.orydorsReward > 0 && (
                      <Badge className="bg-amber-600/20 text-amber-300 border border-amber-500/30">
                        💰 {challenge.orydorsReward} Orydors
                      </Badge>
                    )}
                    {challenge.xpReward > 0 && (
                      <Badge className="bg-purple-600/20 text-purple-300 border border-purple-500/30">
                        ⭐ {challenge.xpReward} XP
                      </Badge>
                    )}
                    {challenge.premiumMonthsReward > 0 && (
                      <Badge className="bg-yellow-600/20 text-yellow-300 border border-yellow-500/30">
                        👑 {challenge.premiumMonthsReward} mois premium
                      </Badge>
                    )}
                    {challenge.itemRewards.length > 0 && (
                      <Badge className="bg-green-600/20 text-green-300 border border-green-500/30">
                        🎁 {challenge.itemRewards.length} item(s)
                      </Badge>
                    )}
                  </div>

                  {/* Bouton réclamer */}
                  {isFullyCompleted && !rewardsClaimed && (
                    <Button
                      onClick={() => handleClaimRewards(challenge.id)}
                      disabled={claimingId === challenge.id}
                      className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white animate-pulse"
                    >
                      <Gift className="w-4 h-4 mr-2" />
                      {claimingId === challenge.id ? 'Réclamation...' : 'Réclamer les récompenses'}
                    </Button>
                  )}

                  {rewardsClaimed && (
                    <div className="text-center py-2 text-green-400 text-sm flex items-center justify-center gap-2">
                      <Check className="w-4 h-4" />
                      Récompenses réclamées
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </CardContent>
      </Card>

      {/* Dialog pour voir les livres avec un item */}
      <Dialog open={booksDialogOpen} onOpenChange={setBooksDialogOpen}>
        <DialogContent className="max-w-lg bg-slate-900 border-amber-700/50">
          <DialogHeader>
            <DialogTitle className="text-amber-100">
              📦 Livres donnant "{selectedRewardName}"
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-96">
            {selectedRewardBooks.length === 0 ? (
              <div className="text-center py-8 text-amber-200/60">
                Aucun livre ne donne cet item actuellement.
              </div>
            ) : (
              <div className="space-y-3">
                {selectedRewardBooks.map((book) => (
                  <div 
                    key={book.id}
                    className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/50 hover:bg-slate-800 transition-colors cursor-pointer"
                    onClick={() => {
                      setBooksDialogOpen(false);
                      navigate(`/book/${book.id}`);
                    }}
                  >
                    <img 
                      src={book.cover_url} 
                      alt={book.title}
                      className="w-12 h-16 object-cover rounded"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium text-amber-100">{book.title}</h4>
                      <p className="text-sm text-amber-200/60">{book.author}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs border-amber-700/50 text-amber-400">
                          {book.dropChance}% ({book.chestType === 'gold' ? 'Or' : 'Argent'})
                        </Badge>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-amber-500/50" />
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
}
