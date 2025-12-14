
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { LoginCrow } from '@/components/LoginCrow';

interface LoginFormProps {
  onPasswordReset: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onPasswordReset }) => {
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [showPasswordError, setShowPasswordError] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLoginData({
      ...loginData,
      [e.target.name]: e.target.value
    });
    // Masquer le corbeau si l'utilisateur modifie ses données
    if (showPasswordError) {
      setShowPasswordError(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
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

  const handlePasswordResetClick = async () => {
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
      <form onSubmit={handleSubmit} className="space-y-2 sm:space-y-3">
        <div className="space-y-1">
          <Label htmlFor="login-email" className="text-forest-800 font-medium font-medieval text-xs sm:text-sm">
            Adresse de messagerie
          </Label>
          <Input
            id="login-email"
            name="email"
            type="email"
            value={loginData.email}
            onChange={handleChange}
            required
            placeholder="votre.quete@orydia.com"
            className="border-wood-400 focus:border-gold-400 bg-white/80 backdrop-blur-sm text-sm h-9 sm:h-10 text-forest-900"
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="login-password" className="text-forest-800 font-medium font-medieval text-xs sm:text-sm">
            Mot de passe secret
          </Label>
          <div className="relative">
            <Input
              id="login-password"
              name="password"
              type={showPassword ? "text" : "password"}
              value={loginData.password}
              onChange={handleChange}
              required
              placeholder="••••••••"
              className="border-wood-400 focus:border-gold-400 bg-white/80 backdrop-blur-sm text-sm pr-10 h-9 sm:h-10 text-forest-900"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-forest-600 hover:text-gold-600"
              title={showPassword ? "Masquer" : "Révéler"}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
        <Button 
          type="submit" 
          disabled={loading} 
          className="w-full bg-gradient-to-r from-forest-600 to-forest-700 hover:from-forest-700 hover:to-forest-800 text-white font-medieval shadow-lg hover:shadow-xl transition-all duration-300 text-sm h-10 sm:h-11"
        >
          {loading ? 'Invocation...' : 'Entrer en Orydia'}
        </Button>
      </form>
      
      {showPasswordError && (
        <LoginCrow 
          onPasswordReset={handlePasswordResetClick}
        />
      )}
    </div>
  );
};
