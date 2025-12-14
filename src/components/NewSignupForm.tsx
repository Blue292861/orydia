
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { getEmailConfirmationUrl } from '@/utils/redirectUrls';

export const NewSignupForm: React.FC = () => {
  const [signupData, setSignupData] = useState({
    email: '',
    password: '',
    username: '',
    firstName: '',
    lastName: '',
    address: '',
    postalCode: '',
    city: '',
    country: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSignupData({
      ...signupData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Vérification que tous les champs sont remplis
    const requiredFields = ['email', 'password', 'username', 'firstName', 'lastName', 'city', 'country'];
    const emptyFields = requiredFields.filter(field => !signupData[field as keyof typeof signupData].trim());
    
    if (emptyFields.length > 0) {
      toast({
        title: 'Inscription incomplète',
        description: 'Tous les champs sont obligatoires pour créer votre compte.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.signUp({
        email: signupData.email,
        password: signupData.password,
      options: {
        emailRedirectTo: getEmailConfirmationUrl(),
        data: {
          username: signupData.username,
          first_name: signupData.firstName,
          last_name: signupData.lastName,
          address: signupData.address || null,
          postal_code: signupData.postalCode || null,
          city: signupData.city,
          country: signupData.country
        }
      }
      });

      if (error) throw error;

      toast({
        title: 'Inscription réussie !',
        description: 'Vérifiez votre email pour confirmer votre inscription.',
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

  return (
    <form onSubmit={handleSubmit} className="space-y-2 sm:space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
        {/* Email */}
        <div className="space-y-1">
          <Label htmlFor="signup-email" className="text-forest-800 font-medium font-medieval text-xs sm:text-sm">
            Email *
          </Label>
          <Input
            id="signup-email"
            name="email"
            type="email"
            value={signupData.email}
            onChange={handleChange}
            required
            placeholder="votre.email@exemple.com"
            className="border-wood-400 focus:border-gold-400 bg-white/80 backdrop-blur-sm text-sm h-9 sm:h-10 text-forest-900"
          />
        </div>
        
        {/* Password */}
        <div className="space-y-1">
          <Label htmlFor="signup-password" className="text-forest-800 font-medium font-medieval text-xs sm:text-sm">
            Mot de passe *
          </Label>
          <div className="relative">
            <Input
              id="signup-password"
              name="password"
              type={showPassword ? "text" : "password"}
              value={signupData.password}
              onChange={handleChange}
              required
              placeholder="6 caractères min."
              minLength={6}
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
        
        {/* Username */}
        <div className="space-y-1">
          <Label htmlFor="signup-username" className="text-forest-800 font-medium font-medieval text-xs sm:text-sm">
            Pseudo *
          </Label>
          <Input
            id="signup-username"
            name="username"
            value={signupData.username}
            onChange={handleChange}
            required
            placeholder="VotreNom123"
            className="border-wood-400 focus:border-gold-400 bg-white/80 backdrop-blur-sm text-sm h-9 sm:h-10 text-forest-900"
          />
        </div>
        
        {/* First Name */}
        <div className="space-y-1">
          <Label htmlFor="signup-firstName" className="text-forest-800 font-medium font-medieval text-xs sm:text-sm">
            Prénom *
          </Label>
          <Input
            id="signup-firstName"
            name="firstName"
            value={signupData.firstName}
            onChange={handleChange}
            required
            placeholder="Jean"
            className="border-wood-400 focus:border-gold-400 bg-white/80 backdrop-blur-sm text-sm h-9 sm:h-10 text-forest-900"
          />
        </div>
        
        {/* Last Name */}
        <div className="space-y-1">
          <Label htmlFor="signup-lastName" className="text-forest-800 font-medium font-medieval text-xs sm:text-sm">
            Nom *
          </Label>
          <Input
            id="signup-lastName"
            name="lastName"
            value={signupData.lastName}
            onChange={handleChange}
            required
            placeholder="Dupont"
            className="border-wood-400 focus:border-gold-400 bg-white/80 backdrop-blur-sm text-sm h-9 sm:h-10 text-forest-900"
          />
        </div>
        
        {/* Address */}
        <div className="space-y-1">
          <Label htmlFor="signup-address" className="text-forest-800 font-medium font-medieval text-xs sm:text-sm">
            Adresse
          </Label>
          <Input
            id="signup-address"
            name="address"
            value={signupData.address}
            onChange={handleChange}
            placeholder="123 rue..."
            className="border-wood-400 focus:border-gold-400 bg-white/80 backdrop-blur-sm text-sm h-9 sm:h-10 text-forest-900"
          />
        </div>
        
        {/* Postal Code */}
        <div className="space-y-1">
          <Label htmlFor="signup-postalCode" className="text-forest-800 font-medium font-medieval text-xs sm:text-sm">
            Code postal
          </Label>
          <Input
            id="signup-postalCode"
            name="postalCode"
            value={signupData.postalCode}
            onChange={handleChange}
            placeholder="75000"
            className="border-wood-400 focus:border-gold-400 bg-white/80 backdrop-blur-sm text-sm h-9 sm:h-10 text-forest-900"
          />
        </div>
        
        {/* City */}
        <div className="space-y-1">
          <Label htmlFor="signup-city" className="text-forest-800 font-medium font-medieval text-xs sm:text-sm">
            Ville *
          </Label>
          <Input
            id="signup-city"
            name="city"
            value={signupData.city}
            onChange={handleChange}
            required
            placeholder="Paris"
            className="border-wood-400 focus:border-gold-400 bg-white/80 backdrop-blur-sm text-sm h-9 sm:h-10 text-forest-900"
          />
        </div>
        
        {/* Country */}
        <div className="space-y-1 sm:col-span-2">
          <Label htmlFor="signup-country" className="text-forest-800 font-medium font-medieval text-xs sm:text-sm">
            Pays *
          </Label>
          <Input
            id="signup-country"
            name="country"
            value={signupData.country}
            onChange={handleChange}
            required
            placeholder="France"
            className="border-wood-400 focus:border-gold-400 bg-white/80 backdrop-blur-sm text-sm h-9 sm:h-10 text-forest-900"
          />
        </div>
      </div>
      
      <Button 
        type="submit" 
        disabled={loading} 
        className="w-full bg-gradient-to-r from-forest-600 to-forest-700 hover:from-forest-700 hover:to-forest-800 text-white font-medieval shadow-lg hover:shadow-xl transition-all duration-300 text-sm h-10 sm:h-11 mt-2"
      >
        {loading ? 'Inscription...' : 'Créer mon compte'}
      </Button>
    </form>
  );
};
