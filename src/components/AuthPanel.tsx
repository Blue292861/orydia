
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { LoginCrow } from '@/components/LoginCrow';

export const AuthPanel: React.FC = () => {
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });
  
  const [signupData, setSignupData] = useState({
    email: '',
    password: '',
    username: '',
    firstName: '',
    lastName: '',
    streetAddress: '',
    city: '',
    postalCode: '',
    country: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [showPasswordError, setShowPasswordError] = useState(false);

  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoginData({
      ...loginData,
      [e.target.name]: e.target.value
    });
    // Masquer le corbeau si l'utilisateur modifie ses données
    if (showPasswordError) {
      setShowPasswordError(false);
    }
  };

  const handleSignupChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSignupData({
      ...signupData,
      [e.target.name]: e.target.value
    });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setShowPasswordError(false);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: loginData.email,
        password: loginData.password,
      });

      if (error) {
        // Afficher le corbeau seulement en cas d'erreur de mot de passe
        if (error.message.includes('Invalid login credentials') || 
            error.message.includes('Email not confirmed') ||
            error.message.includes('Invalid password')) {
          setShowPasswordError(true);
        }
        throw error;
      }

      toast({
        title: 'Connexion réussie !',
        description: 'Bienvenue en Orydia, aventurier !',
      });
    } catch (error: any) {
      toast({
        title: 'Erreur de connexion',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signUp({
        email: signupData.email,
        password: signupData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            username: signupData.username,
            first_name: signupData.firstName,
            last_name: signupData.lastName,
            street_address: signupData.streetAddress,
            city: signupData.city,
            postal_code: signupData.postalCode,
            country: signupData.country
          }
        }
      });

      if (error) throw error;

      toast({
        title: 'Inscription réussie !',
        description: 'Vérifiez votre parchemin électronique pour confirmer votre entrée en Orydia.',
      });
    } catch (error: any) {
      toast({
        title: 'Erreur d\'inscription',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!loginData.email) {
      toast({
        title: 'Adresse requise',
        description: 'Veuillez saisir votre adresse de messagerie pour qu\'un pigeon puisse vous porter secours.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(loginData.email, {
        redirectTo: `${window.location.origin}/`,
      });

      if (error) throw error;

      toast({
        title: 'Pigeon dépêché !',
        description: 'Un messager ailé vole vers votre boîte aux lettres avec les instructions de réinitialisation.',
      });
      setShowPasswordError(false);
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="relative">
      <Card className="w-full max-w-2xl mx-auto bg-wood-50/95 backdrop-blur-sm border-2 border-gold-400/30 shadow-2xl mystical-glow">
        <CardHeader className="bg-gradient-to-r from-forest-700 via-forest-600 to-forest-700 text-white rounded-t-lg relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-gold-400/10 via-transparent to-gold-400/10" />
          <CardTitle className="text-center text-xl sm:text-2xl font-medieval relative z-10">
            Portail des Aventuriers
          </CardTitle>
          <div className="absolute -top-2 -right-2 w-6 sm:w-8 h-6 sm:h-8 bg-gold-400/20 rounded-full animate-mystical-pulse" />
          <div className="absolute -bottom-1 -left-1 w-4 sm:w-6 h-4 sm:h-6 bg-gold-400/20 rounded-full animate-mystical-pulse" style={{ animationDelay: '1s' }} />
        </CardHeader>
        <CardContent className="p-4 sm:p-6 parchment-texture">
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-wood-200/80 backdrop-blur-sm">
              <TabsTrigger 
                value="login" 
                className="data-[state=active]:bg-forest-500 data-[state=active]:text-white font-medieval text-xs sm:text-sm"
              >
                Se connecter
              </TabsTrigger>
              <TabsTrigger 
                value="signup"
                className="data-[state=active]:bg-forest-500 data-[state=active]:text-white font-medieval text-xs sm:text-sm"
              >
                Rejoindre la guilde
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="login" className="space-y-3 sm:space-y-4 mt-4 sm:mt-6">
              <form onSubmit={handleLogin} className="space-y-3 sm:space-y-4">
                <div>
                  <Label htmlFor="login-email" className="text-forest-800 font-medium font-medieval text-sm">
                    Adresse de messagerie
                  </Label>
                  <Input
                    id="login-email"
                    name="email"
                    type="email"
                    value={loginData.email}
                    onChange={handleLoginChange}
                    required
                    placeholder="votre.quete@orydia.com"
                    className="border-wood-400 focus:border-gold-400 bg-white/80 backdrop-blur-sm text-sm"
                  />
                </div>
                <div>
                  <Label htmlFor="login-password" className="text-forest-800 font-medium font-medieval text-sm">
                    Mot de passe secret
                  </Label>
                  <Input
                    id="login-password"
                    name="password"
                    type="password"
                    value={loginData.password}
                    onChange={handleLoginChange}
                    required
                    placeholder="••••••••"
                    className="border-wood-400 focus:border-gold-400 bg-white/80 backdrop-blur-sm text-sm"
                  />
                </div>
                <Button 
                  type="submit" 
                  disabled={loading} 
                  className="w-full bg-gradient-to-r from-forest-600 to-forest-700 hover:from-forest-700 hover:to-forest-800 text-white font-medieval shadow-lg hover:shadow-xl transition-all duration-300 text-sm sm:text-base"
                >
                  {loading ? 'Invocation en cours...' : 'Entrer en Orydia'}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="signup" className="space-y-3 sm:space-y-4 mt-4 sm:mt-6">
              <form onSubmit={handleSignup} className="space-y-3 sm:space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <Label htmlFor="signup-email" className="text-forest-800 font-medium font-medieval text-sm">
                      Adresse de messagerie *
                    </Label>
                    <Input
                      id="signup-email"
                      name="email"
                      type="email"
                      value={signupData.email}
                      onChange={handleSignupChange}
                      required
                      placeholder="votre.quete@orydia.com"
                      className="border-wood-400 focus:border-gold-400 bg-white/80 backdrop-blur-sm text-sm"
                    />
                  </div>
                  <div>
                    <Label htmlFor="signup-password" className="text-forest-800 font-medium font-medieval text-sm">
                      Mot de passe secret *
                    </Label>
                    <Input
                      id="signup-password"
                      name="password"
                      type="password"
                      value={signupData.password}
                      onChange={handleSignupChange}
                      required
                      placeholder="Au moins 6 runes"
                      minLength={6}
                      className="border-wood-400 focus:border-gold-400 bg-white/80 backdrop-blur-sm text-sm"
                    />
                  </div>
                  <div>
                    <Label htmlFor="signup-username" className="text-forest-800 font-medium font-medieval text-sm">
                      Nom d'aventurier *
                    </Label>
                    <Input
                      id="signup-username"
                      name="username"
                      value={signupData.username}
                      onChange={handleSignupChange}
                      required
                      placeholder="Héros_Légendaire"
                      className="border-wood-400 focus:border-gold-400 bg-white/80 backdrop-blur-sm text-sm"
                    />
                  </div>
                  <div>
                    <Label htmlFor="signup-firstName" className="text-forest-800 font-medium font-medieval text-sm">
                      Prénom *
                    </Label>
                    <Input
                      id="signup-firstName"
                      name="firstName"
                      value={signupData.firstName}
                      onChange={handleSignupChange}
                      required
                      placeholder="Arion"
                      className="border-wood-400 focus:border-gold-400 bg-white/80 backdrop-blur-sm text-sm"
                    />
                  </div>
                  <div>
                    <Label htmlFor="signup-lastName" className="text-forest-800 font-medium font-medieval text-sm">
                      Nom de famille *
                    </Label>
                    <Input
                      id="signup-lastName"
                      name="lastName"
                      value={signupData.lastName}
                      onChange={handleSignupChange}
                      required
                      placeholder="Fortelame"
                      className="border-wood-400 focus:border-gold-400 bg-white/80 backdrop-blur-sm text-sm"
                    />
                  </div>
                  <div>
                    <Label htmlFor="signup-address" className="text-forest-800 font-medium font-medieval text-sm">
                      Adresse de résidence *
                    </Label>
                    <Input
                      id="signup-address"
                      name="streetAddress"
                      value={signupData.streetAddress}
                      onChange={handleSignupChange}
                      required
                      placeholder="123 Rue des Héros"
                      className="border-wood-400 focus:border-gold-400 bg-white/80 backdrop-blur-sm text-sm"
                    />
                  </div>
                  <div>
                    <Label htmlFor="signup-city" className="text-forest-800 font-medium font-medieval text-sm">
                      Cité *
                    </Label>
                    <Input
                      id="signup-city"
                      name="city"
                      value={signupData.city}
                      onChange={handleSignupChange}
                      required
                      placeholder="Valorhall"
                      className="border-wood-400 focus:border-gold-400 bg-white/80 backdrop-blur-sm text-sm"
                    />
                  </div>
                  <div>
                    <Label htmlFor="signup-postal" className="text-forest-800 font-medium font-medieval text-sm">
                      Code postal *
                    </Label>
                    <Input
                      id="signup-postal"
                      name="postalCode"
                      value={signupData.postalCode}
                      onChange={handleSignupChange}
                      required
                      placeholder="75001"
                      className="border-wood-400 focus:border-gold-400 bg-white/80 backdrop-blur-sm text-sm"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="signup-country" className="text-forest-800 font-medium font-medieval text-sm">
                      Royaume *
                    </Label>
                    <Input
                      id="signup-country"
                      name="country"
                      value={signupData.country}
                      onChange={handleSignupChange}
                      required
                      placeholder="Orydia"
                      className="border-wood-400 focus:border-gold-400 bg-white/80 backdrop-blur-sm text-sm"
                    />
                  </div>
                </div>
                <Button 
                  type="submit" 
                  disabled={loading} 
                  className="w-full bg-gradient-to-r from-forest-600 to-forest-700 hover:from-forest-700 hover:to-forest-800 text-white font-medieval shadow-lg hover:shadow-xl transition-all duration-300 text-sm sm:text-base"
                >
                  {loading ? 'Inscription à la guilde...' : 'Rejoindre l\'aventure'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      {showPasswordError && (
        <LoginCrow 
          onPasswordReset={handlePasswordReset}
        />
      )}
    </div>
  );
};
