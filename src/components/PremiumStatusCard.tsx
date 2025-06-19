
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Crown, Star } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useResponsive } from '@/hooks/useResponsive';

interface PremiumStatusCardProps {
  isPremium: boolean;
}

export const PremiumStatusCard: React.FC<PremiumStatusCardProps> = ({ isPremium }) => {
  const { createCheckout } = useAuth();
  const { isMobile } = useResponsive();
  const [loading, setLoading] = useState(false);

  const handlePremiumClick = async () => {
    setLoading(true);
    await createCheckout();
    setLoading(false);
  };

  if (isPremium) return null;

  return (
    <Card className="bg-gradient-to-r from-purple-700 to-pink-700 border-2 border-purple-400">
      <CardContent className={`text-center ${isMobile ? 'p-4' : 'p-6'}`}>
        <Star className={`text-yellow-300 mx-auto mb-4 ${
          isMobile ? 'h-8 w-8' : 'h-12 w-12'
        }`} />
        <h3 className={`font-bold text-purple-100 mb-2 ${
          isMobile ? 'text-lg' : 'text-xl'
        }`}>
          Débloquez le Premium !
        </h3>
        <p className={`text-purple-200 mb-4 ${
          isMobile ? 'text-sm' : 'text-base'
        }`}>
          Obtenez des points bonus et débloquez des succès exclusifs
        </p>
        <Button 
          onClick={handlePremiumClick}
          disabled={loading}
          className={`bg-yellow-500 hover:bg-yellow-600 text-black font-bold ${
            isMobile ? 'text-sm px-4 py-2' : ''
          }`}
        >
          <Crown className={`mr-2 ${isMobile ? 'h-3 w-3' : 'h-4 w-4'}`} />
          {loading ? "Chargement..." : "Activer Premium"}
        </Button>
      </CardContent>
    </Card>
  );
};
