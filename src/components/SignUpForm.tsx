
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface SignUpFormProps {
  onBack: () => void;
}

export const SignUpForm: React.FC<SignUpFormProps> = ({ onBack }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: '',
    firstName: '',
    lastName: '',
    city: '',
    country: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            username: formData.username,
            first_name: formData.firstName,
            last_name: formData.lastName,
            city: formData.city,
            country: formData.country
          }
        }
      });

      if (error) throw error;

      toast({
        title: 'Inscription réussie !',
        description: 'Votre compte a été créé avec succès.',
      });
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Créer un compte</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email">Adresse e-mail *</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="votre.email@exemple.com"
              />
            </div>
            <div>
              <Label htmlFor="password">Mot de passe *</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Minimum 6 caractères"
                minLength={6}
              />
            </div>
            <div>
              <Label htmlFor="username">Nom d'utilisateur *</Label>
              <Input
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                placeholder="nom_utilisateur"
              />
            </div>
            <div>
              <Label htmlFor="firstName">Prénom *</Label>
              <Input
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
                placeholder="Jean"
              />
            </div>
            <div>
              <Label htmlFor="lastName">Nom de famille *</Label>
              <Input
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
                placeholder="Dupont"
              />
            </div>
            <div>
              <Label htmlFor="city">Ville *</Label>
              <Input
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
                required
                placeholder="Paris"
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="country">Pays *</Label>
              <Input
                id="country"
                name="country"
                value={formData.country}
                onChange={handleChange}
                required
                placeholder="France"
              />
            </div>
          </div>
          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onBack} className="flex-1">
              Retour à la connexion
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Création en cours...' : 'Créer mon compte'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
