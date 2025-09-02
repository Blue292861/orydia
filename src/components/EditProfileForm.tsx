
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Edit } from 'lucide-react';

interface Profile {
  id: string;
  username: string | null;
  first_name: string | null;
  last_name: string | null;
  city: string | null;
  country: string | null;
}

export const EditProfileForm: React.FC = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [formData, setFormData] = useState({
    username: '',
    firstName: '',
    lastName: '',
    city: '',
    country: '',
    email: '',
    newPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileData) {
          setProfile(profileData);
          setFormData({
            username: profileData.username || '',
            firstName: profileData.first_name || '',
            lastName: profileData.last_name || '',
            city: profileData.city || '',
            country: profileData.country || '',
            email: user.email || '',
            newPassword: ''
          });
        }
      }
    };

    if (open) {
      fetchProfile();
    }
  }, [open]);

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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Utilisateur non connecté');

      // Mettre à jour le profil
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          username: formData.username,
          first_name: formData.firstName,
          last_name: formData.lastName,
          city: formData.city,
          country: formData.country
        })
        .eq('id', user.id);

      if (profileError) throw profileError;

      // Mettre à jour l'email si modifié
      if (formData.email !== user.email) {
        const { error: emailError } = await supabase.auth.updateUser({
          email: formData.email
        });
        if (emailError) throw emailError;
      }

      // Mettre à jour le mot de passe si fourni
      if (formData.newPassword) {
        const { error: passwordError } = await supabase.auth.updateUser({
          password: formData.newPassword
        });
        if (passwordError) throw passwordError;
      }

      toast({
        title: 'Profil mis à jour',
        description: 'Vos informations ont été modifiées avec succès.',
      });
      setOpen(false);
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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <Edit className="h-4 w-4" />
          Modifier mes informations
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Modifier mes informations personnelles</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email">Adresse e-mail</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="votre.email@exemple.com"
              />
            </div>
            <div>
              <Label htmlFor="username">Nom d'utilisateur</Label>
              <Input
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="nom_utilisateur"
              />
            </div>
            <div>
              <Label htmlFor="firstName">Prénom</Label>
              <Input
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="Jean"
              />
            </div>
            <div>
              <Label htmlFor="lastName">Nom de famille</Label>
              <Input
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Dupont"
              />
            </div>
            <div>
              <Label htmlFor="city">Ville</Label>
              <Input
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="Paris"
              />
            </div>
            <div className="md:col-span-2">
              <hr className="my-4" />
              <h3 className="font-semibold mb-2">Modifier le mot de passe (optionnel)</h3>
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="newPassword">Nouveau mot de passe</Label>
              <Input
                id="newPassword"
                name="newPassword"
                type="password"
                value={formData.newPassword}
                onChange={handleChange}
                placeholder="Laisser vide pour ne pas modifier"
                minLength={6}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Enregistrement en cours...' : 'Enregistrer les modifications'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
