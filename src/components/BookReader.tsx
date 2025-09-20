import React, { useState, useEffect, useRef } from 'react';
import { Book } from '@/types/Book';
import { Button } from '@/components/ui/button';
import { ChevronLeft, X, Star } from 'lucide-react';
import { TextSizeControls } from '@/components/TextSizeControls';
import { BannerAd } from '@/components/BannerAd';
import { RewardAd } from '@/components/RewardAd';
import { InteractiveBookReader } from '@/components/InteractiveBookReader';
import { EmbeddedPDFReader } from '@/components/EmbeddedPDFReader';
import { EpubPageReader } from '@/components/EpubPageReader';
import { EpubReaderEngine } from './EpubReaderEngine';
import { AgeVerificationDialog } from '@/components/AgeVerificationDialog';
import { RatingDialog } from './RatingDialog';
import { CopyrightWarning } from '@/components/CopyrightWarning';
import { useUserStats } from '@/contexts/UserStatsContext';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { TutorialPopup } from '@/components/TutorialPopup';
import { EpubViewer } from '@/components/EpubViewer'; // Import du nouveau composant

interface BookReaderProps {
  book: Book;
  onBack: () => void;
}

export const BookReader: React.FC<BookReaderProps> = ({ book, onBack }) => {
  // All hooks must be at the top level
  const { userStats, addPointsForBook } = useUserStats();
  const { session, subscription, user } = useAuth();
  const { toast } = useToast();
  
  // State management
  const [showRatingDialog, setShowRatingDialog] = useState(false);
  const [hasRatedApp, setHasRatedApp] = useState(false);
  const [hasFinished, setHasFinished] = useState(false);
  const [fontSize, setFontSize] = useState(16);
  const [highContrast, setHighContrast] = useState(false);
  const [showRewardAd, setShowRewardAd] = useState(false);
  const [showAgeVerification, setShowAgeVerification] = useState(book.isAdultContent);
  const [ageVerified, setAgeVerified] = useState(false);
  const readingStartTime = useRef<number>(Date.now());

  // Computed values
  const isAlreadyRead = userStats.booksRead.includes(book.id);
  const isPremium = subscription.isPremium;
  const pointsToWin = isPremium ? book.points * 2 : book.points;
  const isPDFContent = book.content?.startsWith('http') && book.content.includes('.pdf');
  const isEpubUrl = book.content?.startsWith('http') && book.content.includes('.epub');
  const hasExtractedContent = book.content && !isPDFContent && !isEpubUrl;
  const isEpubStructured = Boolean(hasExtractedContent && (/=== Chapitre \d+ ===/.test(book.content || '') || /<hr class="chapter-sep"/.test(book.content || '')));

  // Effect pour vérifier si l'utilisateur a déjà noté l'app
  useEffect(() => {
    const checkRatingStatus = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('has_rated_app')
          .eq('id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error checking rating status:', error);
          return;
        }

        setHasRatedApp(data?.has_rated_app || false);
      } catch (error) {
        console.error('Error checking rating status:', error);
      }
    };

    checkRatingStatus();
  }, [user]);

  // Effect pour enregistrer le temps de lecture quand on quitte
  useEffect(() => {
    const handleBeforeUnload = () => {
      recordReadingSession();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      recordReadingSession();
    };
  }, [hasRatedApp]); // Add hasRatedApp as dependency

  // Enregistrer une session de lecture
  const recordReadingSession = async () => {
    if (!user) return;

    const sessionDuration = Math.floor((Date.now() - readingStartTime.current) / 1000);
    
    // Ne pas enregistrer les sessions très courtes (moins de 30 secondes)
    if (sessionDuration < 30) return;

    try {
      // Montrer le popup de notation si l'utilisateur n'a pas encore noté l'app
      // et que la session de lecture était suffisamment longue (plus de 2 minutes)
      if (!hasRatedApp && sessionDuration > 120) {
        setShowRatingDialog(true);
      }
    } catch (error) {
      console.error("Erreur lors de l'enregistrement de la lecture:", error);
    }
  };

  const handleBackClick = async () => {
    await recordReadingSession();
    onBack();
  };

  const handleFinishReading = async () => {
    if (!session) {
       toast({ title: "Erreur", description: "Vous devez être connecté.", variant: "destructive" });
       return;
    }
    
    if (!isAlreadyRead && !hasFinished) {
      // Si l'utilisateur n'est pas premium, afficher la publicité de récompense
      if (!isPremium) {
        setShowRewardAd(true);
        return;
      }
      
      // Pour les utilisateurs premium, accorder directement les points
      await grantReward();
    }
  };

  const grantReward = async () => {
    addPointsForBook(book.id, pointsToWin);

    const { error } = await supabase.from('book_completions').insert({
      user_id: session!.user.id,
      book_id: book.id,
    });
    
    if (error) {
      console.error("Erreur lors de l'enregistrement de la lecture:", error);
    }

    setHasFinished(true);
    toast({
      title: "Livre terminé !",
      description: `Vous avez gagné ${pointsToWin} Tensens pour avoir lu "${book.title}"`,
    });
  };

  const handleAdCompleted = async () => {
    setShowRewardAd(false);
    await grantReward();
  };

  const handleAdClosed = () => {
    setShowRewardAd(false);
    toast({
      title: "Publicité fermée",
      description: "Vous devez regarder la publicité complètement pour obtenir votre récompense.",
      variant: "destructive"
    });
  };

  const handleAgeVerified = () => {
    setAgeVerified(true);
    setShowAgeVerification(false);
  };

  const handleAgeVerificationCanceled = () => {
    setShowAgeVerification(false);
    handleBackClick();
  };

  // Si le livre a des chapitres, utiliser le lecteur interactif
  if (book.hasChapters) {
    return <InteractiveBookReader book={book} onClose={handleBackClick} />;
  }

  // If age verification is needed and not yet verified, show only the verification dialog
  if (book.isAdultContent && !ageVerified) {
    return (
      <AgeVerificationDialog
        isOpen={showAgeVerification}
        onConfirm={handleAgeVerified}
        onCancel={handleAgeVerificationCanceled}
      />
    );
  }
  
  return (
    <>
      <CopyrightWarning />
      {showRewardAd && (
        <RewardAd 
          book={book}
          pointsToWin={pointsToWin}
          onAdCompleted={handleAdCompleted}
          onAdClosed={handleAdClosed}
        />
      )}
      
      <div className="w-full max-w-none mx-auto pb-10">
        <div className="flex justify-between items-center mb-6">
          <Button variant="ghost" onClick={handleBackClick} className="flex items-center gap-1">
            <ChevronLeft className="h-4 w-4" />
            Retour à la Bibliothèque
          </Button>
          
          <div className="text-center">
            <h2 className="font-bold">{book.title}</h2>
            <p className="text-sm text-muted-foreground">{book.author}</p>
            <div className="flex items-center justify-center gap-1 mt-1">
              <img src="/lovable-uploads/4a891ef6-ff72-4b5a-b33c-0dc33dd3aa26.png" alt="Tensens Icon" className="h-4 w-4" />
              <span className="text-sm font-medium">{book.points} Tensens</span>
              {isPremium && (
                <div className="flex items-center gap-1 text-yellow-500 ml-2 px-2 py-1 rounded-full bg-yellow-500/10 text-xs font-semibold">
                  <Star className="h-3 w-3 fill-current" />
                  <span>x2 BONUS</span>
                </div>
              )}
            </div>
          </div>
          
          <Button variant="ghost" size="icon" onClick={handleBackClick}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Contrôles de taille et contraste (EPUB et contenu extrait) */}
        {(hasExtractedContent || isEpubUrl) && (
          <div className="mb-4">
            <TextSizeControls 
              fontSize={fontSize} 
              onFontSizeChange={setFontSize}
              highContrast={highContrast}
              onHighContrastChange={setHighContrast}
            />
          </div>
        )}
        
        <div className={`rounded-lg p-4 sm:p-6 lg:p-8 shadow-md w-full ${
          highContrast && hasExtractedContent
            ? 'bg-black text-white border border-gray-600' 
            : 'bg-card text-card-foreground'
        }`}>
          {isPDFContent ? (
            <EmbeddedPDFReader 
              pdfUrl={book.content}
              title={book.title}
              content="" // Always empty since it's a PDF URL
            />
          ) : isEpubUrl ? (
            <EpubViewer bookUrl={book.content!} />
          ) : isEpubStructured ? (
            <EpubPageReader
              content={book.content || ''}
              fontSize={fontSize}
              highContrast={highContrast}
              isPremium={isPremium}
              isAlreadyRead={isAlreadyRead}
              hasFinished={hasFinished}
              pointsToWin={pointsToWin}
              onFinish={handleFinishReading}
            />
          ) : (
            <div 
              className={`whitespace-pre-wrap leading-relaxed ${
                highContrast ? 'text-white' : 'text-foreground'
              }`}
              style={{ fontSize: `${fontSize}px` }}
            >
              {book.content}
            </div>
          )}
          
          {/* Publicité pour les non-premium */}
          {!isPremium && (
            <div className="mt-8 mb-6">
              <BannerAd />
            </div>
          )}
          
          {!isEpubStructured && hasExtractedContent && (
            <div className="mt-8 pt-6 border-t flex justify-center">
              {isAlreadyRead ? (
                <div className={`${highContrast && !isPDFContent ? 'text-gray-300' : 'text-muted-foreground'} text-center`}>
                  <img src="/lovable-uploads/4a891ef6-ff72-4b5a-b33c-0dc33dd3aa26.png" alt="Icône Tensens" className="h-6 w-6 mx-auto mb-2" />
                  <p>Vous avez déjà gagné des Tensens pour ce livre</p>
                </div>
              ) : hasFinished ? (
                <div className="text-center text-green-600">
                  <img src="/lovable-uploads/4a891ef6-ff72-4b5a-b33c-0dc33dd3aa26.png" alt="Icône Tensens" className="h-6 w-6 mx-auto mb-2" />
                  <p>Tensens accordés ! Bien joué !</p>
                </div>
              ) : (
                <Button 
                  onClick={handleFinishReading} 
                  className="flex items-center gap-2"
                  disabled={false}
                >
                  <img src="/lovable-uploads/4a891ef6-ff72-4b5a-b33c-0dc33dd3aa26.png" alt="Icône Tensens" className="h-4 w-4" />
                  {isPremium ? 
                    `Terminer la lecture & Gagner ${pointsToWin} Tensens` :
                    `Regarder une publicité & Gagner ${pointsToWin} Tensens`
                  }
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Dialog de notation */}
        <RatingDialog 
          open={showRatingDialog} 
          onOpenChange={(open) => {
            setShowRatingDialog(open);
            if (!open) {
              setHasRatedApp(true); // Marquer comme "vu" même si pas noté pour éviter spam
            }
          }} 
        />
      </div>

      {/* Pop-up du tutoriel de lecture */}
      <TutorialPopup
        tutorialId="reader"
        title="Conseils de lecture"
        description="Pour faciliter ta lecture, tu peux changer la taille de la police de caractère à ta guise ! Tu peux aussi inverser les couleurs avec le bouton tout en haut !"
      />
      
      {/* Pop-up du tutoriel des Tensens */}
      {!isAlreadyRead && !hasFinished && !isPremium && (
        <TutorialPopup
          tutorialId="tensens"
          title="Félicitations, lecteur !"
          description="Tu as bien mérité une belle récompense pour les efforts que tu as fournis !"
        />
      )}
    </>
  );
};
