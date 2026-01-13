import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Star, Trophy } from "lucide-react";
import { CopyrightWarning } from "@/components/CopyrightWarning";
import { Game, GameChapter, GameChoice } from "@/types/Game";
import { gameService } from "@/services/gameService";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { sanitizeHtml } from "@/utils/security";

interface GameReaderProps {
  game: Game;
  onBack: () => void;
}

export function GameReader({ game, onBack }: GameReaderProps) {
  const [currentChapter, setCurrentChapter] = useState<GameChapter | null>(null);
  const [choices, setChoices] = useState<GameChoice[]>([]);
  const [totalPointsEarned, setTotalPointsEarned] = useState(0);
  const [completedChapters, setCompletedChapters] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFirstChapter();
  }, [game]);

  // ← COLLE LE NOUVEAU useEffect ICI 👇
  useEffect(() => {
    if (currentChapter?.id) {
      loadChoices(currentChapter.id);
    }
  }, [currentChapter?.id]);

  const loadFirstChapter = async () => {
    try {
      const chapters = await gameService.getGameChapters(game.id);
      if (chapters.length > 0) {
        const firstChapter = chapters.find((c) => c.chapter_number === 1) || chapters[0];
        setCurrentChapter(firstChapter);
      }
    } catch (error) {
      toast.error("Erreur lors du chargement du jeu");
    } finally {
      setLoading(false);
    }
  };

  const loadChoices = async (chapterId: string) => {
    try {
      const chapterChoices = await gameService.getChapterChoices(chapterId);
      setChoices(chapterChoices);
    } catch (error) {
      toast.error("Erreur lors du chargement des choix");
    }
  };

  const handleChoice = async (choice: GameChoice) => {
    try {
      // Award points for the choice
      if (choice.points_reward > 0) {
        await awardPoints(choice.points_reward, "game_choice");
        setTotalPointsEarned((prev) => prev + choice.points_reward);
        toast.success(`+${choice.points_reward} Orydors!`);
      }

      // Mark current chapter as completed
      if (currentChapter && !completedChapters.includes(currentChapter.id)) {
        setCompletedChapters((prev) => [...prev, currentChapter.id]);
      }

      // Navigate to next chapter or end game
      if (choice.next_chapter_id) {
        const nextChapter = await gameService.getChapterById(choice.next_chapter_id);
        if (nextChapter) {
          setCurrentChapter(nextChapter);
        }
      } else {
        // End of game
        handleGameEnd();
      }
    } catch (error) {
      toast.error("Erreur lors du traitement du choix");
    }
  };

  const handleGameEnd = async () => {
    try {
      if (currentChapter?.is_ending && currentChapter.ending_reward_points) {
        await awardPoints(currentChapter.ending_reward_points, "game_completion");
        setTotalPointsEarned((prev) => prev + currentChapter.ending_reward_points!);
        toast.success(`Jeu terminé! +${currentChapter.ending_reward_points} Orydors de bonus!`);
      }

      // Could add game completion logic here
      toast.success("Félicitations ! Vous avez terminé le jeu !");
    } catch (error) {
      toast.error("Erreur lors de la finalisation du jeu");
    }
  };

  const awardPoints = async (points: number, type: string) => {
    try {
      await supabase.functions.invoke("award-points", {
        body: {
          points,
          transaction_type: type,
          description: `Points gagnés dans le jeu: ${game.name}`,
        },
      });
    } catch (error) {
      console.error("Erreur lors de l'attribution des points:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Chargement du jeu...</h2>
        </div>
      </div>
    );
  }

  if (!currentChapter) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Aucun chapitre trouvé</h2>
          <Button onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <CopyrightWarning />
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={onBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour
            </Button>
            <div className="text-center">
              <h1 className="text-lg font-bold">{game.name}</h1>
              <p className="text-sm text-muted-foreground">par {game.author}</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="flex items-center gap-1">
                <Star className="w-3 h-3" />
                {totalPointsEarned}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5" />
                Chapitre {currentChapter.chapter_number}: {currentChapter.title}
              </CardTitle>
              {currentChapter.is_ending && <Badge variant="destructive">Chapitre final</Badge>}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Chapter Content */}
            <div className="prose max-w-none">
              {currentChapter.content.includes(".pdf") ? (
                // Affichage PDF intégré
                <div className="w-full">
                  <iframe
                    src={currentChapter.content}
                    className="w-full h-[70vh] border border-gray-200 rounded-lg"
                    title={`Chapitre ${currentChapter.chapter_number}: ${currentChapter.title}`}
                  />
                  <p className="text-xs text-muted-foreground mt-2 text-center">
                    📄 Document PDF - Mise en page originale conservée
                  </p>
                </div>
              ) : (
                // Affichage texte classique avec sanitisation XSS
                <div
                  className="text-base leading-relaxed whitespace-pre-wrap"
                  dangerouslySetInnerHTML={{
                    __html: sanitizeHtml(currentChapter.content),
                  }}
                />
              )}
            </div>

            {/* Choices */}
            {choices.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold">Que voulez-vous faire ?</h3>
                <div className="space-y-2">
                  {choices.map((choice) => (
                    <Button
                      key={choice.id}
                      variant="outline"
                      className="w-full text-left justify-start h-auto py-3 px-4"
                      onClick={() => handleChoice(choice)}
                    >
                      <div className="flex justify-between items-center w-full">
                        <span>{choice.choice_text}</span>
                        {choice.points_reward > 0 && (
                          <Badge variant="secondary" className="ml-2">
                            +{choice.points_reward} pts
                          </Badge>
                        )}
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* End of game message */}
            {choices.length === 0 && currentChapter.is_ending && (
              <div className="text-center py-8">
                <Trophy className="w-12 h-12 mx-auto mb-4 text-primary" />
                <h3 className="text-xl font-bold mb-2">Fin du jeu</h3>
                <p className="text-muted-foreground mb-4">Vous avez terminé "{game.name}" avec succès !</p>
                <p className="text-lg font-semibold text-primary mb-4">
                  Total des points gagnés: {totalPointsEarned} Orydors
                </p>
                <Button onClick={onBack} size="lg">
                  Retour à la bibliothèque
                </Button>
              </div>
            )}

            {/* No choices and not ending */}
            {choices.length === 0 && !currentChapter.is_ending && (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">Ce chapitre n'a pas de choix configurés.</p>
                <Button onClick={onBack}>Retour à la bibliothèque</Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Progress indicator */}
        <div className="mt-6 text-center text-sm text-muted-foreground">
          Chapitres complétés: {completedChapters.length}
        </div>
      </div>
    </div>
  );
}
