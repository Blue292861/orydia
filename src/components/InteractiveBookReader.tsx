import React, { useState, useEffect } from 'react';
import { Book, Chapter, InteractiveChoice, UserStoryChoice } from '@/types/Book';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, BookOpen, Zap, Flag, Trophy, Coins } from 'lucide-react';
import { TextSizeControls } from './TextSizeControls';
import { CopyrightWarning } from '@/components/CopyrightWarning';
import { fetchChaptersByBookId, markChapterCompleted, saveUserChoice, getUserChoicesForBook } from '@/services/chapterService';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface InteractiveBookReaderProps {
  book: Book;
  onClose: () => void;
}

export const InteractiveBookReader: React.FC<InteractiveBookReaderProps> = ({ book, onClose }) => {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [userChoices, setUserChoices] = useState<UserStoryChoice[]>([]);
  const [fontSize, setFontSize] = useState(16);
  const [highContrast, setHighContrast] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showEndingReward, setShowEndingReward] = useState(false);
  const [endingReward, setEndingReward] = useState(0);
  const [rewardClaimed, setRewardClaimed] = useState(false);
  const { user } = useAuth();

  const currentChapter = chapters[currentChapterIndex];
  const progress = chapters.length > 0 ? ((currentChapterIndex + 1) / chapters.length) * 100 : 0;

  useEffect(() => {
    const loadChapters = async () => {
      try {
        const chaptersData = await fetchChaptersByBookId(book.id);
        setChapters(chaptersData);
        
        if (user) {
          const choicesData = await getUserChoicesForBook(book.id);
          setUserChoices(choicesData);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des chapitres:', error);
      } finally {
        setLoading(false);
      }
    };

    loadChapters();
  }, [book.id, user]);

  const handleNextChapter = async () => {
    if (currentChapter && user) {
      await markChapterCompleted(currentChapter.id, book.id);
    }
    
    if (currentChapterIndex < chapters.length - 1) {
      setCurrentChapterIndex(currentChapterIndex + 1);
    }
  };

  const handlePreviousChapter = () => {
    if (currentChapterIndex > 0) {
      setCurrentChapterIndex(currentChapterIndex - 1);
    }
  };

  const handleChoice = async (choice: InteractiveChoice) => {
    if (!user || !currentChapter) return;

    try {
      await saveUserChoice({
        userId: user.id,
        bookId: book.id,
        chapterId: currentChapter.id,
        choiceId: choice.id,
      });

      // Mettre à jour les choix locaux
      const newChoice: UserStoryChoice = {
        id: crypto.randomUUID(),
        userId: user.id,
        bookId: book.id,
        chapterId: currentChapter.id,
        choiceId: choice.id,
        chosenAt: new Date().toISOString(),
      };
      setUserChoices([...userChoices.filter(c => c.chapterId !== currentChapter.id), newChoice]);

      // Naviguer vers le chapitre suivant ou spécifique
      if (choice.nextChapterId) {
        const nextChapterIndex = chapters.findIndex(c => c.id === choice.nextChapterId);
        if (nextChapterIndex !== -1) {
          setCurrentChapterIndex(nextChapterIndex);
        }
      } else {
        handleNextChapter();
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du choix:', error);
    }
  };

  const handleClaimEndingReward = async () => {
    if (!user || !currentChapter || rewardClaimed) return;

    try {
      // Mark chapter as completed
      await markChapterCompleted(currentChapter.id, book.id);

      // Award points via edge function
      const { error } = await supabase.functions.invoke('award-points', {
        body: {
          userId: user.id,
          points: currentChapter.endingRewardPoints,
          transactionType: 'interactive_ending',
          description: `Fin atteinte: ${book.title} - ${currentChapter.title}`,
          referenceId: `ending_${book.id}_${currentChapter.id}`
        }
      });

      if (error) throw error;

      setEndingReward(currentChapter.endingRewardPoints);
      setShowEndingReward(true);
      setRewardClaimed(true);
      
      toast.success(`+${currentChapter.endingRewardPoints} Orydors gagnés !`);
    } catch (error) {
      console.error('Erreur lors de la réclamation de la récompense:', error);
      toast.error('Erreur lors de la réclamation de la récompense');
    }
  };

  const getTextStyle = () => ({
    fontSize: `${fontSize}px`,
    lineHeight: '1.7',
    ...(highContrast && {
      color: '#000',
      backgroundColor: '#fff',
      padding: '1rem',
      borderRadius: '0.5rem',
    })
  });

  const getUserChoiceForChapter = (chapterId: string) => {
    return userChoices.find(choice => choice.chapterId === chapterId);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Chargement des chapitres...</p>
        </div>
      </div>
    );
  }

  if (!currentChapter) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <p>Aucun chapitre trouvé pour ce livre.</p>
          <Button onClick={onClose}>Retour</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <CopyrightWarning />
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* En-tête avec contrôles */}
        <div className="flex items-center justify-between mb-6">
          <Button variant="outline" onClick={onClose}>
            <ChevronLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
          <TextSizeControls 
            fontSize={fontSize} 
            onFontSizeChange={setFontSize}
            highContrast={highContrast}
            onHighContrastChange={setHighContrast}
          />
        </div>

        {/* Informations du livre */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-4">
              <img 
                src={book.coverUrl} 
                alt={book.title}
                className="w-16 h-20 object-cover rounded"
              />
              <div>
                <CardTitle className="text-xl">{book.title}</CardTitle>
                <p className="text-muted-foreground">{book.author}</p>
                <div className="flex items-center gap-2 mt-2">
                  {book.isInteractive && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Zap className="h-3 w-3" />
                      Interactif
                    </Badge>
                  )}
                  <Badge variant="outline">
                    {chapters.length} chapitre{chapters.length > 1 ? 's' : ''}
                  </Badge>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Barre de progression */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">
              Chapitre {currentChapterIndex + 1} sur {chapters.length}
            </span>
            <span className="text-sm text-muted-foreground">
              {Math.round(progress)}% terminé
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Contenu du chapitre */}
        <Card className={`mb-6 ${currentChapter.isEnding ? 'border-amber-500/50' : ''}`}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              {currentChapter.title}
              {currentChapter.isInteractive && (
                <Badge variant="secondary" className="ml-2">
                  <Zap className="h-3 w-3 mr-1" />
                  Interactif
                </Badge>
              )}
              {currentChapter.isEnding && (
                <Badge className="ml-2 bg-amber-500/20 text-amber-500">
                  <Flag className="h-3 w-3 mr-1" />
                  Fin
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="whitespace-pre-wrap mb-6" style={getTextStyle()}>
              {currentChapter.content}
            </div>

            {/* Ending chapter reward section */}
            {currentChapter.isEnding && user && !showEndingReward && (
              <div className="border-t pt-6">
                <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/30">
                  <CardContent className="pt-6">
                    <div className="text-center space-y-4">
                      <Trophy className="h-12 w-12 text-amber-500 mx-auto" />
                      <div>
                        <h4 className="text-xl font-bold">Félicitations !</h4>
                        <p className="text-muted-foreground">
                          Vous avez atteint une fin de cette aventure.
                        </p>
                      </div>
                      <div className="flex items-center justify-center gap-2 text-2xl font-bold text-amber-500">
                        <Coins className="h-6 w-6" />
                        +{currentChapter.endingRewardPoints} Orydors
                      </div>
                      <Button 
                        onClick={handleClaimEndingReward}
                        className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                        size="lg"
                      >
                        <Trophy className="h-5 w-5 mr-2" />
                        Réclamer ma récompense
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Reward claimed confirmation */}
            {showEndingReward && (
              <div className="border-t pt-6">
                <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/30">
                  <CardContent className="pt-6">
                    <div className="text-center space-y-4">
                      <div className="h-12 w-12 rounded-full bg-green-500/20 flex items-center justify-center mx-auto">
                        <Trophy className="h-6 w-6 text-green-500" />
                      </div>
                      <div>
                        <h4 className="text-xl font-bold text-green-500">Récompense obtenue !</h4>
                        <p className="text-muted-foreground">
                          +{endingReward} Orydors ont été ajoutés à votre compte.
                        </p>
                      </div>
                      <Button onClick={onClose} variant="outline">
                        Retour à la bibliothèque
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Choix interactifs (only if not an ending chapter) */}
            {!currentChapter.isEnding && currentChapter.isInteractive && currentChapter.choices && currentChapter.choices.length > 0 && (
              <div className="border-t pt-6">
                <h4 className="font-semibold mb-4 flex items-center gap-2">
                  <Zap className="h-4 w-4 text-primary" />
                  Que choisissez-vous ?
                </h4>
                <div className="space-y-3">
                  {currentChapter.choices.map((choice, index) => {
                    const userChoice = getUserChoiceForChapter(currentChapter.id);
                    const isSelected = userChoice?.choiceId === choice.id;
                    
                    return (
                      <Card 
                        key={choice.id} 
                        className={`cursor-pointer transition-all hover:shadow-md ${
                          isSelected ? 'ring-2 ring-primary bg-primary/5' : ''
                        }`}
                        onClick={() => !userChoice && handleChoice(choice)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <Badge variant="outline" className="mt-1">
                              {String.fromCharCode(65 + index)}
                            </Badge>
                            <div className="flex-1">
                              <p className="font-medium">{choice.choiceText}</p>
                              {choice.consequenceText && (
                                <p className="text-sm text-muted-foreground mt-1">
                                  {choice.consequenceText}
                                </p>
                              )}
                              {choice.pointsModifier !== 0 && (
                                <Badge variant="secondary" className="mt-2">
                                  {choice.pointsModifier > 0 ? '+' : ''}{choice.pointsModifier} Orydors
                                </Badge>
                              )}
                            </div>
                            {isSelected && (
                              <Badge variant="default">Choisi</Badge>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation (hide if ending and not claimed) */}
        {(!currentChapter.isEnding || rewardClaimed) && (
          <div className="flex justify-between items-center">
            <Button 
              variant="outline" 
              onClick={handlePreviousChapter}
              disabled={currentChapterIndex === 0}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Chapitre précédent
            </Button>
            
            <div className="text-sm text-muted-foreground">
              {currentChapterIndex + 1} / {chapters.length}
            </div>

            <Button 
              onClick={handleNextChapter}
              disabled={currentChapterIndex === chapters.length - 1 || currentChapter.isEnding}
              variant={currentChapter.isInteractive && !getUserChoiceForChapter(currentChapter.id) ? "outline" : "default"}
            >
              Chapitre suivant
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};