import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle, Mail, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const EmailConfirmationPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'expired'>('loading');
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const handleEmailConfirmation = async () => {
      const token = searchParams.get('token');
      const type = searchParams.get('type');

      if (!token || type !== 'signup') {
        setStatus('error');
        return;
      }

      try {
        const { error } = await supabase.auth.verifyOtp({
          token_hash: token,
          type: 'signup'
        });

        if (error) {
          console.error('Email confirmation error:', error);
          if (error.message.includes('expired')) {
            setStatus('expired');
          } else {
            setStatus('error');
          }
          return;
        }

        setStatus('success');
        toast({
          title: 'Confirmation réussie !',
          description: 'Votre compte a été confirmé avec succès. Bienvenue en Orydia !',
        });

        // Auto redirect after 5 seconds
        const timer = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(timer);
              navigate('/', { replace: true });
              return 0;
            }
            return prev - 1;
          });
        }, 1000);

        return () => clearInterval(timer);
      } catch (error) {
        console.error('Unexpected error:', error);
        setStatus('error');
      }
    };

    handleEmailConfirmation();
  }, [searchParams, navigate]);

  const handleResendEmail = async () => {
    // This would require the user's email, which we don't have here
    // In a real implementation, you might want to redirect to a resend form
    toast({
      title: 'Renvoi d\'email',
      description: 'Veuillez vous reconnecter et demander un nouveau lien de confirmation.',
      variant: 'default',
    });
    navigate('/auth');
  };

  const handleGoHome = () => {
    navigate('/', { replace: true });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-forest-900 via-forest-800 to-forest-700 relative overflow-hidden flex items-center justify-center p-4">
      {/* Fond animé avec des particules */}
      <div className="absolute inset-0 bg-gradient-to-br from-forest-900/80 via-forest-800/60 to-forest-700/80">
        <div className="absolute inset-0">
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-forest-200/30 rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 4}s`,
                animationDuration: `${2 + Math.random() * 3}s`
              }}
            />
          ))}
        </div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-cursive text-5xl md:text-6xl text-title-blue drop-shadow-2xl mb-4">
            Confirmation
          </h1>
          <div className="flex justify-center items-center gap-4 mb-4">
            <div className="h-px bg-gradient-to-r from-transparent via-title-blue/50 to-transparent flex-1 max-w-20" />
            <div className="w-2 h-2 bg-title-blue rounded-full animate-pulse" />
            <div className="h-px bg-gradient-to-r from-transparent via-title-blue/50 to-transparent flex-1 max-w-20" />
          </div>
        </div>

        <Card className="bg-white/95 backdrop-blur-sm border-wood-400 shadow-2xl">
          <CardHeader className="text-center pb-4">
            <CardTitle className="font-medieval text-2xl text-forest-800 flex items-center justify-center gap-2">
              {status === 'loading' && <Loader2 className="h-6 w-6 animate-spin text-forest-600" />}
              {status === 'success' && <CheckCircle className="h-6 w-6 text-green-600" />}
              {(status === 'error' || status === 'expired') && <XCircle className="h-6 w-6 text-red-600" />}
              
              {status === 'loading' && 'Vérification en cours...'}
              {status === 'success' && 'Compte confirmé !'}
              {status === 'error' && 'Erreur de confirmation'}
              {status === 'expired' && 'Lien expiré'}
            </CardTitle>
          </CardHeader>
          
          <CardContent className="text-center space-y-4">
            {status === 'loading' && (
              <div className="space-y-2">
                <p className="text-forest-700 font-serif">
                  Les scribes d'Orydia vérifient votre parchemin...
                </p>
                <div className="flex justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-forest-600"></div>
                </div>
              </div>
            )}
            
            {status === 'success' && (
              <div className="space-y-4">
                <p className="text-forest-700 font-serif">
                  Félicitations, noble aventurier ! Votre place dans le royaume d'Orydia est désormais confirmée.
                </p>
                <p className="text-sm text-forest-600">
                  Redirection automatique dans {countdown} seconde{countdown > 1 ? 's' : ''}...
                </p>
                <Button 
                  onClick={handleGoHome}
                  className="w-full bg-gradient-to-r from-forest-600 to-forest-700 hover:from-forest-700 hover:to-forest-800 text-white font-medieval"
                >
                  Commencer l'aventure maintenant
                </Button>
              </div>
            )}
            
            {status === 'error' && (
              <div className="space-y-4">
                <p className="text-forest-700 font-serif">
                  Une erreur mystérieuse s'est produite lors de la vérification de votre parchemin.
                </p>
                <div className="space-y-2">
                  <Button 
                    onClick={handleResendEmail}
                    variant="outline"
                    className="w-full border-forest-400 text-forest-700 hover:bg-forest-50"
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Demander un nouveau lien
                  </Button>
                  <Button 
                    onClick={() => navigate('/auth')}
                    className="w-full bg-gradient-to-r from-forest-600 to-forest-700 hover:from-forest-700 hover:to-forest-800 text-white font-medieval"
                  >
                    Retour à la connexion
                  </Button>
                </div>
              </div>
            )}
            
            {status === 'expired' && (
              <div className="space-y-4">
                <p className="text-forest-700 font-serif">
                  Hélas ! Votre parchemin de confirmation a perdu sa magie. Les liens magiques n'ont qu'une durée limitée.
                </p>
                <div className="space-y-2">
                  <Button 
                    onClick={handleResendEmail}
                    variant="outline"
                    className="w-full border-forest-400 text-forest-700 hover:bg-forest-50"
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Obtenir un nouveau lien magique
                  </Button>
                  <Button 
                    onClick={() => navigate('/auth')}
                    className="w-full bg-gradient-to-r from-forest-600 to-forest-700 hover:from-forest-700 hover:to-forest-800 text-white font-medieval"
                  >
                    Retour à la connexion
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EmailConfirmationPage;