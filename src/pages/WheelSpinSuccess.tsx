import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

export const WheelSpinSuccess: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [processing, setProcessing] = useState(true);

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    
    if (!sessionId) {
      navigate('/', { replace: true });
      return;
    }

    // Trigger the paid spin
    const triggerPaidSpin = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('spin-wheel', {
          body: { spinType: 'paid' }
        });

        if (error) throw error;

        toast({
          title: 'Tour payant activé ! 🎰',
          description: 'Retournez à la roue pour tourner !',
        });

        // Navigate back to home with flag to auto-spin
        navigate('/?wheel_auto_spin=true', { replace: true });
      } catch (error: any) {
        console.error('Error triggering paid spin:', error);
        toast({
          title: 'Erreur',
          description: 'Impossible de valider le tour payant',
          variant: 'destructive',
        });
        navigate('/', { replace: true });
      } finally {
        setProcessing(false);
      }
    };

    triggerPaidSpin();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
        <p className="text-lg text-foreground">Validation de votre tour...</p>
      </div>
    </div>
  );
};

export default WheelSpinSuccess;
