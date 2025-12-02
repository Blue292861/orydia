import React, { useEffect, useState } from 'react';
import { useParams, Navigate, useNavigate } from 'react-router-dom';
import { Book } from '@/types/Book';
import { Audiobook } from '@/types/Audiobook';
import { Header } from '@/components/Header';
import { SecurityHeaders } from '@/components/SecurityHeaders';
import { PremiumSelectionDialog } from '@/components/PremiumSelectionDialog';
import { WorkMeta } from '@/components/WorkMeta';
import { useBooks } from '@/hooks/useBooks';
import { audiobookService } from '@/services/audiobookService';
import { useAuth } from '@/contexts/AuthContext';
import { findWorkBySlug } from '@/utils/slugUtils';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Share2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { TextReader } from '@/components/TextReader';
import { fetchBooksFromDB } from '@/services/bookService';
import { AdInterstitial } from '@/components/AdInterstitial';
import { useUserStats } from '@/contexts/UserStatsContext';
import { hasUserDiscoveredRareBook, addRareBookToCollection } from '@/services/rareBookService';

/**
 * Page component for displaying individual books or audiobooks
 * Accessible via /{author-slug}/{title-slug}
 */
const WorkPage: React.FC = () => {
  const { authorSlug, titleSlug } = useParams<{ authorSlug: string; titleSlug: string }>();
  const { books } = useBooks();
  const { subscription, user } = useAuth();
  const { userStats } = useUserStats();
  const navigate = useNavigate();
  const [audiobooks, setAudiobooks] = useState<Audiobook[]>([]);
  const [foundWork, setFoundWork] = useState<Book | Audiobook | null>(null);
  const [workType, setWorkType] = useState<'book' | 'audiobook' | null>(null);
  const [showPremiumDialog, setShowPremiumDialog] = useState(false);
  const [showAdInterstitial, setShowAdInterstitial] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAudiobooks = async () => {
      try {
        const audiobookData = await audiobookService.getAllAudiobooks();
        setAudiobooks(audiobookData);
      } catch (error) {
        console.error('Error loading audiobooks:', error);
      }
    };
    loadAudiobooks();
  }, []);

  useEffect(() => {
    const fetchWorks = async () => {
      if (!authorSlug || !titleSlug) return;
      setLoading(true);
      
      const allBooks = await fetchBooksFromDB();
      const allAudiobooks = await audiobookService.getAllAudiobooks();
      
      const foundBook = findWorkBySlug(allBooks, authorSlug, titleSlug);
      if (foundBook) {
        setFoundWork(foundBook);
        setWorkType('book');
        
        // Si c'est un livre rare et que l'utilisateur est connecté, l'ajouter à sa collection
        if (foundBook.isRare && user) {
          const alreadyDiscovered = await hasUserDiscoveredRareBook(user.id, foundBook.id);
          if (!alreadyDiscovered) {
            try {
              await addRareBookToCollection(user.id, foundBook.id);
              toast({
                title: "💎 Livre rare découvert !",
                description: `"${foundBook.title}" a été ajouté à votre collection de livres rares.`,
              });
            } catch (error) {
              console.error('Error adding rare book:', error);
            }
          }
        }
        
        setLoading(false);
        return;
      }

      const foundAudiobook = findWorkBySlug(allAudiobooks, authorSlug, titleSlug);
      if (foundAudiobook) {
        setFoundWork(foundAudiobook);
        setWorkType('audiobook');
        setLoading(false);
      }
    };
    
    if (books.length === 0) {
      fetchWorks();
    } else {
      const foundBook = findWorkBySlug(books, authorSlug, titleSlug);
      if (foundBook) {
        setFoundWork(foundBook);
        setWorkType('book');
        
        // Si c'est un livre rare et que l'utilisateur est connecté, l'ajouter à sa collection
        const checkAndAddRareBook = async () => {
          if (foundBook.isRare && user) {
            const alreadyDiscovered = await hasUserDiscoveredRareBook(user.id, foundBook.id);
            if (!alreadyDiscovered) {
              try {
                await addRareBookToCollection(user.id, foundBook.id);
                toast({
                  title: "💎 Livre rare découvert !",
                  description: `"${foundBook.title}" a été ajouté à votre collection de livres rares.`,
                });
              } catch (error) {
                console.error('Error adding rare book:', error);
              }
            }
          }
        };
        checkAndAddRareBook();
      } else {
        const foundAudiobook = findWorkBySlug(audiobooks, authorSlug, titleSlug);
        if (foundAudiobook) {
          setFoundWork(foundAudiobook);
          setWorkType('audiobook');
        }
      }
      setLoading(false);
    }
  }, [authorSlug, titleSlug, books, audiobooks, user]);

  const handleStartReading = () => {
    if (!foundWork) return;

    const isPremium = 'isPremium' in foundWork ? foundWork.isPremium : foundWork.is_premium;
    
    if (isPremium && !subscription.isPremium) {
      setShowPremiumDialog(true);
      return;
    }

    // Vérifier si c'est la première lecture (le livre n'est pas dans booksRead)
    const bookId = foundWork.id;
    const isFirstRead = workType === 'book' && !userStats.booksRead.includes(bookId);

    // Afficher la publicité pour les utilisateurs freemium lors de la première lecture
    if (!subscription.isPremium && isFirstRead) {
      setShowAdInterstitial(true);
      return;
    }

    proceedToReading();
  };

  const proceedToReading = () => {
    if (!foundWork) return;

    navigate('/', { 
      state: { 
        selectedWork: foundWork, 
        workType: workType 
      } 
    });
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: foundWork ? ('title' in foundWork ? foundWork.title : foundWork.name) : '',
          text: `Découvrez cette œuvre sur Orydia`,
          url: window.location.href
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast({
          title: "Lien copié !",
          description: "Le lien a été copié dans votre presse-papier",
        });
      }
    } catch (error) {
      console.error('Error sharing:', error);
      toast({
        title: "Erreur",
        description: "Impossible de partager le lien",
        variant: "destructive"
      });
    }
  };

  const handleBackToLibrary = () => {
    navigate('/');
  };

  if (authorSlug && titleSlug && !loading && !foundWork) {
    return <Navigate to="/" replace />;
  }
  
  if (!foundWork || !workType) {
    return (
      <>
        <SecurityHeaders />
        <div className="min-h-screen bg-background">
          <Header onNavigate={handleBackToLibrary} currentPage="library" />
          <main className="flex-1 p-4 flex items-center justify-center">
            <div className="text-center">
              <div className="text-foreground">Chargement...</div>
            </div>
          </main>
        </div>
      </>
    );
  }

  const title = 'title' in foundWork ? foundWork.title : foundWork.name;
  const coverUrl = 'coverUrl' in foundWork ? foundWork.coverUrl : foundWork.cover_url;
  const summary = workType === 'book' && 'summary' in foundWork ? foundWork.summary : 
                  workType === 'audiobook' && 'description' in foundWork ? foundWork.description : undefined;
  const isPremium = 'isPremium' in foundWork ? foundWork.isPremium : foundWork.is_premium;

  return (
    <>
      <SecurityHeaders />
      <WorkMeta 
        title={title}
        author={foundWork.author}
        description={summary}
        coverUrl={coverUrl}
        workType={workType}
      />
      <div className="min-h-screen bg-background">
        <Header onNavigate={handleBackToLibrary} currentPage="library" />
        <main className="flex-1 p-4 max-w-4xl mx-auto">
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={handleBackToLibrary}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour
            </Button>
          </div>

          <Card className="p-6">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="md:col-span-1">
                <img
                  src={coverUrl}
                  alt={`Couverture de ${title}`}
                  className="w-full rounded-lg shadow-lg"
                />
              </div>
              
              <div className="md:col-span-2">
                <div className="mb-4">
                  <h1 className="text-3xl font-bold text-foreground mb-2">{title}</h1>
                  <p className="text-xl text-muted-foreground mb-4">{foundWork.author}</p>
                  
                  {isPremium && (
                    <div className="inline-flex items-center px-3 py-1 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200 text-sm font-medium mb-4">
                      ✨ Premium
                    </div>
                  )}
                </div>

                {summary && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-2">Résumé</h3>
                    <p className="text-muted-foreground leading-relaxed">{summary}</p>
                  </div>
                )}

                <div className="flex gap-3">
                  <Button onClick={handleStartReading} className="flex-1">
                    {workType === 'book' ? 'Commencer la lecture' : 'Écouter'}
                  </Button>
                  
                  <Button variant="outline" onClick={handleShare}>
                    <Share2 className="w-4 h-4 mr-2" />
                    Partager
                  </Button>
                </div>
              </div>
            </div>
          </Card>
          
          <div className="mt-6">
            {workType === 'book' && (
              <TextReader content={(foundWork as Book).content} />
            )}
          </div>
        </main>

        {showAdInterstitial && (
          <AdInterstitial
            title="Publicité"
            description="Regardez cette courte publicité avant de commencer votre lecture"
            onClose={() => setShowAdInterstitial(false)}
            onAdWatched={() => {
              setShowAdInterstitial(false);
              proceedToReading();
            }}
            autoCloseDelay={5000}
          />
        )}

        <PremiumSelectionDialog 
          trigger={
            <button 
              style={{ display: 'none' }} 
              ref={(el) => {
                if (el && showPremiumDialog) {
                  el.click();
                  setShowPremiumDialog(false);
                }
              }}
            />
          }
        />
      </div>
    </>
  );
};

export default WorkPage;
