
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Gift, X } from 'lucide-react';
import { useUserStats } from '@/contexts/UserStatsContext';
import { useToast } from '@/hooks/use-toast';
import { ExternalAd } from '@/components/ExternalAd';

interface AdForTensensProps {
  onAdCompleted: () => void;
  onAdClosed: () => void;
}

export const AdForTensens: React.FC<AdForTensensProps> = ({ 
  onAdCompleted, 
  onAdClosed 
}) => {
  const [countdown, setCountdown] = useState(5);
  const [canClaim, setCanClaim] = useState(false);
  const [adLoaded, setAdLoaded] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!adLoaded) return;

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
  }, [adLoaded]);

  const handleClaimReward = () => {
    onAdCompleted();
    toast({
      title: "Tensens gratuits !",
      description: "Vous avez gagné 10 Tensens en regardant la publicité !",
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-95 flex flex-col items-center justify-center z-[9999] text-white p-4">
      <Button 
        variant="ghost" 
        size="icon"
        onClick={onAdClosed}
        className="absolute top-4 right-4 text-white hover:bg-white/10"
      >
        <X className="h-6 w-6" />
      </Button>

      <div className="w-full max-w-4xl mx-auto text-center space-y-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold mb-2">Publicité</h2>
          <p className="text-muted-foreground">
            Regardez cette courte publicité pour obtenir 10 Tensens gratuits
          </p>
        </div>

        <div className="relative bg-gray-900 border border-gray-700 rounded-lg p-4 min-h-[300px] flex items-center justify-center">
          <ExternalAd onAdLoaded={() => setAdLoaded(true)} />
        </div>
        
        {adLoaded && !canClaim && (
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-400">{countdown}</div>
            <p className="text-sm text-gray-400">Attendez encore {countdown} secondes...</p>
          </div>
        )}
      </div>
      
      <div className="text-center space-y-4">
        <h3 className="text-xl font-bold">
          Gagnez des Tensens gratuits !
        </h3>
        <div className="flex items-center justify-center gap-2">
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
            {adLoaded 
              ? `Récompense disponible dans ${countdown}s`
              : "Chargement de la publicité..."
            }
          </Button>
        )}
      </div>
    </div>
  );
};
