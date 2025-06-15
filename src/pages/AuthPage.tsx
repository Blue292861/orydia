
import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LoginCrow } from '@/components/LoginCrow';
import { toast } from 'sonner';

const AuthPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCrow, setShowCrow] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setShowCrow(false);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      toast.error(error.message);
      if (error.message === 'Invalid login credentials') {
        setShowCrow(true);
        setForgotPasswordEmail(email);
      }
    } else {
      toast.success('Connexion réussie !');
    }
    setLoading(false);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: username,
        },
        emailRedirectTo: window.location.origin,
      },
    });
    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Compte créé ! Veuillez vérifier vos e-mails pour confirmer votre compte.');
    }
    setLoading(false);
  };

  const handlePasswordReset = async () => {
    if (!forgotPasswordEmail) {
      toast.error("Veuillez entrer une adresse e-mail.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(forgotPasswordEmail, {
      redirectTo: `${window.location.origin}/`,
    });
    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Un e-mail de réinitialisation de mot de passe a été envoyé.');
    }
    setLoading(false);
    setShowCrow(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-forest-900 via-forest-800 to-wood-900 overflow-hidden relative">
      <div className="absolute inset-0 bg-black/30">
        <div className="absolute top-0 left-0 w-1/2 h-full bg-gradient-to-tr from-black/50 to-transparent animate-sway opacity-50" style={{ transformOrigin: 'bottom left' }}></div>
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-tl from-black/50 to-transparent animate-sway opacity-50" style={{ animationDelay: '-9s', transformOrigin: 'bottom right' }}></div>
      </div>
      
      <div className="relative z-10 w-full max-w-md">
        <h1 className="text-7xl font-cursive font-bold text-center text-title-blue mb-4 -mt-8" style={{ textShadow: '2px 2px 8px #000' }}>
          Orydia
        </h1>
        <div className="relative">
          {showCrow && <LoginCrow onPasswordReset={handlePasswordReset} />}
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-forest-900/80 border-wood-700/60 text-wood-200">
              <TabsTrigger value="login">Se connecter</TabsTrigger>
              <TabsTrigger value="signup">Créer un compte</TabsTrigger>
            </TabsList>
            <TabsContent value="login">
              <Card className="bg-forest-800/80 border-wood-600/50 text-white backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-wood-200">Parchemin d'Identification</CardTitle>
                  <CardDescription className="text-forest-300">
                    Présentez vos lettres de créance pour entrer dans le royaume.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleLogin}>
                    <div className="grid gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="email-login" className="text-wood-200">E-mail du Scribe</Label>
                        <Input id="email-login" type="email" placeholder="nom@domaine.com" required onChange={(e) => setEmail(e.target.value)} className="bg-forest-900/70 border-wood-700 text-white focus:border-wood-400" />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="password-login" className="text-wood-200">Mot de Passe Secret</Label>
                        <Input id="password-login" type="password" required onChange={(e) => setPassword(e.target.value)} className="bg-forest-900/70 border-wood-700 text-white focus:border-wood-400" />
                      </div>
                      <Button type="submit" disabled={loading} className="w-full bg-wood-600 hover:bg-wood-700 text-forest-100 font-bold">
                        {loading ? 'Vérification...' : 'Entrer'}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="signup">
              <Card className="bg-forest-800/80 border-wood-600/50 text-white backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-wood-200">Enrôlement</CardTitle>
                  <CardDescription className="text-forest-300">
                    Inscrivez votre nom sur les registres du royaume.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSignup}>
                    <div className="grid gap-4">
                       <div className="grid gap-2">
                        <Label htmlFor="username-signup" className="text-wood-200">Nom d'Aventurier</Label>
                        <Input id="username-signup" type="text" placeholder="Votre nom" required onChange={(e) => setUsername(e.target.value)} className="bg-forest-900/70 border-wood-700 text-white focus:border-wood-400" />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="email-signup" className="text-wood-200">E-mail du Scribe</Label>
                        <Input id="email-signup" type="email" placeholder="nom@domaine.com" required onChange={(e) => setEmail(e.target.value)} className="bg-forest-900/70 border-wood-700 text-white focus:border-wood-400" />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="password-signup" className="text-wood-200">Mot de Passe Secret</Label>
                        <Input id="password-signup" type="password" required onChange={(e) => setPassword(e.target.value)} className="bg-forest-900/70 border-wood-700 text-white focus:border-wood-400" />
                      </div>
                      <Button type="submit" disabled={loading} className="w-full bg-wood-600 hover:bg-wood-700 text-forest-100 font-bold">
                        {loading ? 'Inscription en cours...' : "S'enrôler"}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
