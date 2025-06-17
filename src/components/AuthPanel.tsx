
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
        description: 'Vous êtes maintenant connecté.',
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
        description: 'Vérifiez votre email pour confirmer votre compte.',
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
        title: 'Email requis',
        description: 'Veuillez saisir votre adresse email pour réinitialiser votre mot de passe.',
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
        title: 'Email envoyé !',
        description: 'Vérifiez votre boîte email pour réinitialiser votre mot de passe.',
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
      <Card className="w-full max-w-2xl mx-auto bg-wood-100 border-2 border-wood-400 shadow-xl">
        <CardHeader className="bg-forest-600 text-white rounded-t-lg">
          <CardTitle className="text-center text-2xl font-serif">Bienvenue</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-wood-300">
              <TabsTrigger 
                value="login" 
                className="data-[state=active]:bg-forest-500 data-[state=active]:text-white"
              >
                Se connecter
              </TabsTrigger>
              <TabsTrigger 
                value="signup"
                className="data-[state=active]:bg-forest-500 data-[state=active]:text-white"
              >
                S'inscrire
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="login" className="space-y-4">
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <Label htmlFor="login-email" className="text-forest-800 font-medium">
                    Adresse e-mail
                  </Label>
                  <Input
                    id="login-email"
                    name="email"
                    type="email"
                    value={loginData.email}
                    onChange={handleLoginChange}
                    required
                    placeholder="votre.email@exemple.com"
                    className="border-wood-400 focus:border-forest-500"
                  />
                </div>
                <div>
                  <Label htmlFor="login-password" className="text-forest-800 font-medium">
                    Mot de passe
                  </Label>
                  <Input
                    id="login-password"
                    name="password"
                    type="password"
                    value={loginData.password}
                    onChange={handleLoginChange}
                    required
                    placeholder="Votre mot de passe"
                    className="border-wood-400 focus:border-forest-500"
                  />
                </div>
                <Button 
                  type="submit" 
                  disabled={loading} 
                  className="w-full bg-forest-600 hover:bg-forest-700 text-white"
                >
                  {loading ? 'Connexion...' : 'Se connecter'}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="signup" className="space-y-4">
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="signup-email" className="text-forest-800 font-medium">
                      Adresse e-mail *
                    </Label>
                    <Input
                      id="signup-email"
                      name="email"
                      type="email"
                      value={signupData.email}
                      onChange={handleSignupChange}
                      required
                      placeholder="votre.email@exemple.com"
                      className="border-wood-400 focus:border-forest-500"
                    />
                  </div>
                  <div>
                    <Label htmlFor="signup-password" className="text-forest-800 font-medium">
                      Mot de passe *
                    </Label>
                    <Input
                      id="signup-password"
                      name="password"
                      type="password"
                      value={signupData.password}
                      onChange={handleSignupChange}
                      required
                      placeholder="Minimum 6 caractères"
                      minLength={6}
                      className="border-wood-400 focus:border-forest-500"
                    />
                  </div>
                  <div>
                    <Label htmlFor="signup-username" className="text-forest-800 font-medium">
                      Nom d'utilisateur *
                    </Label>
                    <Input
                      id="signup-username"
                      name="username"
                      value={signupData.username}
                      onChange={handleSignupChange}
                      required
                      placeholder="nom_utilisateur"
                      className="border-wood-400 focus:border-forest-500"
                    />
                  </div>
                  <div>
                    <Label htmlFor="signup-firstName" className="text-forest-800 font-medium">
                      Prénom *
                    </Label>
                    <Input
                      id="signup-firstName"
                      name="firstName"
                      value={signupData.firstName}
                      onChange={handleSignupChange}
                      required
                      placeholder="Jean"
                      className="border-wood-400 focus:border-forest-500"
                    />
                  </div>
                  <div>
                    <Label htmlFor="signup-lastName" className="text-forest-800 font-medium">
                      Nom de famille *
                    </Label>
                    <Input
                      id="signup-lastName"
                      name="lastName"
                      value={signupData.lastName}
                      onChange={handleSignupChange}
                      required
                      placeholder="Dupont"
                      className="border-wood-400 focus:border-forest-500"
                    />
                  </div>
                  <div>
                    <Label htmlFor="signup-address" className="text-forest-800 font-medium">
                      Adresse *
                    </Label>
                    <Input
                      id="signup-address"
                      name="streetAddress"
                      value={signupData.streetAddress}
                      onChange={handleSignupChange}
                      required
                      placeholder="123 rue de la Paix"
                      className="border-wood-400 focus:border-forest-500"
                    />
                  </div>
                  <div>
                    <Label htmlFor="signup-city" className="text-forest-800 font-medium">
                      Ville *
                    </Label>
                    <Input
                      id="signup-city"
                      name="city"
                      value={signupData.city}
                      onChange={handleSignupChange}
                      required
                      placeholder="Paris"
                      className="border-wood-400 focus:border-forest-500"
                    />
                  </div>
                  <div>
                    <Label htmlFor="signup-postal" className="text-forest-800 font-medium">
                      Code postal *
                    </Label>
                    <Input
                      id="signup-postal"
                      name="postalCode"
                      value={signupData.postalCode}
                      onChange={handleSignupChange}
                      required
                      placeholder="75001"
                      className="border-wood-400 focus:border-forest-500"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="signup-country" className="text-forest-800 font-medium">
                      Pays *
                    </Label>
                    <Input
                      id="signup-country"
                      name="country"
                      value={signupData.country}
                      onChange={handleSignupChange}
                      required
                      placeholder="France"
                      className="border-wood-400 focus:border-forest-500"
                    />
                  </div>
                </div>
                <Button 
                  type="submit" 
                  disabled={loading} 
                  className="w-full bg-forest-600 hover:bg-forest-700 text-white"
                >
                  {loading ? 'Création en cours...' : 'Créer mon compte'}
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
