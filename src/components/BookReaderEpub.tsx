// src/components/BookReaderEpub.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Book } from '@/types/Book';
import { Button } from '@/components/ui/button';
import { ChevronLeft, X, Star } from 'lucide-react';
import { BannerAd } from '@/components/BannerAd';
import { RewardAd } from '@/components/RewardAd';
import { AgeVerificationDialog } from '@/components/AgeVerificationDialog';
import { RatingDialog } from './RatingDialog';
import { CopyrightWarning } from '@/components/CopyrightWarning';
import { EpubReaderCore } from '@/components/epub/EpubReaderCore';
import { useUserStats } from '@/contexts/UserStatsContext';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface BookReaderEpubProps {
  book: Book;
  onBack: () => void;
}

export const BookReaderEpub: React.FC<BookReaderEpubProps> = ({ book, onBack }) => {
  const { userStats, addPointsForBook } = useUserStats();
  const { session, subscription, user } = useAuth();
  const { toast } = useToast();
  
  const [showRatingDialog, setShowRatingDialog] = useState(false);
  const [hasRatedApp, setHasRatedApp] = useState(false);
  const [hasFinished, setHasFinished] = useState(false);
  const [showRewardAd, setShowRewardAd] = useState(false);
  const [showAgeVerification, setShowAgeVerification] = useState(book.isAdultContent);
  const [ageVerified, setAgeVerified] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);
  const readingStartTime = useRef<number>(Date.now());

  const isAlreadyRead = userStats.booksRead.includes(book.id);
  const isPremium = subscription.isPremium;
  const pointsToWin = isPremium ? book.points * 2 : book.points;

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

  // Surveiller la progression de lecture
  useEffect(() => {
    const checkProgress = () => {
      if (!user || !book.id) return;
      
      try {
        const progressKey = `epub_progress_${book.id}`;
        const savedProgress = localStorage.getItem(progressKey);
        
        if (savedProgress) {
          const progress = JSON.parse(savedProgress);
          setReadingProgress(progress.progress || 0);
          
          // Si le livre est lu à plus de 90%, considérer comme terminé  
          if (progress.progress >= 90 && !isAlreadyRead && !hasFinished) {
            handleAutoFinish();
          }
        }
      } catch (error) {
        console.error('Error checking progress:', error);
      }
    };

    const interval = setInterval(checkProgress, 5000); // Vérifier toutes les 5 secondes
    return () => clearInterval(interval);
  }, [user, book.id, isAlreadyRead, hasFinished]);

  const recordReadingSession = useCallback(async () => {
    if (!user) return;

    const sessionDuration = Math.floor((Date.now() - readingStartTime.current) / 1000);
    
    if (sessionDuration < 30) return;

    try {
      if (!hasRatedApp && sessionDuration > 120) {
        setShowRatingDialog(true);
      }
    } catch (error) {
      console.error("Erreur lors de l'enregistrement de la lecture:", error);
    }
  }, [user, hasRatedApp]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      recordReadingSession();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      recordReadingSession();
    };
  }, [recordReadingSession]);

  const handleBackClick = async () => {
    await recordReadingSession();
    onBack();
  };

  const handleAutoFinish = async () => {
    if (!session || isAlreadyRead || hasFinished) return;
    
    if (!isPremium) {
      setShowRewardAd(true);
      return;
    }
    
    await grantReward();
  };

  const handleManualFinish = async () => {
    if (!session) {
       toast({ title: "Erreur", description: "Vous devez être connecté.", variant: "destructive" });
       return;
    }
    
    if (!isAlreadyRead && !hasFinished) {
      if (!isPremium) {
        setShowRewardAd(true);
        return;
      }
      
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
      {showRewardAd && (
        <RewardAd 
          book={book}
          pointsToWin={pointsToWin}
          onAdCompleted={handleAdCompleted}
          onAdClosed={handleAdClosed}
        />
      )}
      
      <div className="w-full max-w-none mx-auto pb-10">
        <div className="flex justify-between items-center mb-6 px-4">
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
            {readingProgress > 0 && (
              <div className="text-xs text-muted-foreground mt-1">
                Progression: {readingProgress}%
              </div>
            )}
          </div>
          
          <Button variant="ghost" size="icon" onClick={handleBackClick}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Disclaimer de propriété intellectuelle */}
        <div className="px-4 mb-4">
          <CopyrightWarning />
        </div>
        
        {/* Lecteur EPUB avec suivi de progression */}
        <div className="w-full">
          <EpubReaderCore 
            url={book.content} 
            bookId={book.id}
          />
        </div>
        
        {!isPremium && (
          <div className="mt-8 mb-6 px-4">
            <BannerAd />
          </div>
        )}
        
        <div className="mt-8 pt-6 border-t flex justify-center px-4">
          {isAlreadyRead ? (
            <div className="text-muted-foreground text-center">
              <img src="/lovable-uploads/4a891ef6-ff72-4b5a-b33c-0dc33dd3aa26.png" alt="Icône Tensens" className="h-6 w-6 mx-auto mb-2" />
              <p>Vous avez déjà gagné des Tensens pour ce livre</p>
            </div>
          ) : hasFinished ? (
            <div className="text-center text-green-600">
              <img src="/lovable-uploads/4a891ef6-ff72-4b5a-b33c-0dc33dd3aa26.png" alt="Icône Tensens" className="h-6 w-6 mx-auto mb-2" />
              <p>Tensens accordés ! Bien joué !</p>
            </div>
          ) : readingProgress >= 90 ? (
            <Button 
              onClick={handleManualFinish} 
              className="flex items-center gap-2"
              disabled={false}
            >
              <img src="/lovable-uploads/4a891ef6-ff72-4b5a-b33c-0dc33dd3aa26.png" alt="Icône Tensens" className="h-4 w-4" />
              {isPremium ? 
                `Terminer la lecture & Gagner ${pointsToWin} Tensens` :
                `Regarder une publicité & Gagner ${pointsToWin} Tensens`
              }
            </Button>
          ) : null}
        </div>

        <RatingDialog 
          open={showRatingDialog} 
          onOpenChange={(open) => {
            setShowRatingDialog(open);
            if (!open) {
              setHasRatedApp(true);
            }
          }} 
        />
      </div>
    </>
  );
};