
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Gift, Play, Loader } from 'lucide-react';
import { useUserStats } from '@/contexts/UserStatsContext';
import { useToast } from '@/hooks/use-toast';

interface AdForTensensProps {
  onAdCompleted: () => void;
  onAdClosed: () => void;
}

export const AdForTensens: React.FC<AdForTensensProps> = ({ 
  onAdCompleted, 
  onAdClosed 
}) => {
  const [countdown, setCountdown] = useState(15);
  const [canClaim, setCanClaim] = useState(false);
  const [adStarted, setAdStarted] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Simulate AdSense loading
    try {
      // @ts-ignore
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      console.error("Erreur AdSense:", e);
    }

    // Auto-start ad after 1 second
    const startTimer = setTimeout(() => {
      setAdStarted(true);
      
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            setCanClaim(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }, 1000);

    return () => clearTimeout(startTimer);
  }, []);

  const handleClaimReward = () => {
    onAdCompleted();
    toast({
      title: "Tensens gratuits !",
      description: "Vous avez gagné 10 Tensens en regardant la publicité !",
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-95 flex flex-col items-center justify-center z-50 text-white p-4">
      <div className="w-full max-w-4xl aspect-video bg-gray-900 border border-gray-700 rounded-lg flex items-center justify-center mb-6">
        {/* Ad placeholder */}
        <div className="text-center">
          <Play className="h-16 w-16 text-yellow-400 mx-auto mb-4" />
          <p className="text-2xl font-bold mb-2">Publicité</p>
          <p className="text-muted-foreground mb-4">
            Regardez cette courte publicité pour obtenir 10 Tensens gratuits
          </p>
          
          {/* AdSense placeholder */}
          <ins className="adsbygoogle"
               style={{ display: 'block', width: '100%', height: '250px' }}
               data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
               data-ad-slot="ZZZZZZZZZZ"
               data-ad-format="fluid"
               data-ad-layout-key="-gw-3+1f-3d+2z"
               data-full-width-responsive="true"></ins>
               
          {adStarted && !canClaim && (
            <div className="mt-4">
              <div className="text-3xl font-bold text-yellow-400">{countdown}</div>
              <p className="text-sm text-gray-400">Publicité en cours...</p>
            </div>
          )}
        </div>
      </div>
      
      <div className="text-center">
        <h3 className="text-xl font-bold mb-2">
          Gagnez des Tensens gratuits !
        </h3>
        <div className="flex items-center justify-center gap-2 mb-4">
          <img 
            src="/lovable-uploads/4a891ef6-ff72-4b5a-b33c-0dc33dd3aa26.png" 
            alt="Tensens Icon" 
            className="h-6 w-6" 
          />
          <span className="text-2xl font-bold text-yellow-400">+10 Tensens</span>
        </div>
        
        {canClaim ? (
          <Button 
            onClick={handleClaimReward} 
            size="lg"
            className="bg-green-600 hover:bg-green-700 text-white font-bold"
          >
            <Gift className="mr-2 h-4 w-4" />
            Réclamer mes Tensens !
          </Button>
        ) : (
          <Button size="lg" variant="secondary" disabled>
            {adStarted ? (
              <>
                <Loader className="mr-2 h-4 w-4 animate-spin" />
                Récompense disponible dans {countdown}s
              </>
            ) : (
              "Chargement de la publicité..."
            )}
          </Button>
        )}
      </div>
      
      <Button 
        variant="ghost" 
        onClick={onAdClosed}
        className="mt-4 text-gray-400 hover:text-white"
      >
        Fermer
      </Button>
    </div>
  );
};
