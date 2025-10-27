import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AddressRequiredDialogProps {
  open: boolean;
  onClose: () => void;
  onAddressSaved: () => void;
  userId: string;
}

export const AddressRequiredDialog: React.FC<AddressRequiredDialogProps> = ({
  open,
  onClose,
  onAddressSaved,
  userId
}) => {
  const [addressData, setAddressData] = useState({
    address: '',
    postalCode: '',
    city: '',
    country: ''
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAddressData({
      ...addressData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!addressData.address || !addressData.city || !addressData.country) {
      toast({
        title: 'Champs manquants',
        description: 'Veuillez remplir au minimum l\'adresse, la ville et le pays.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          address: addressData.address,
          postal_code: addressData.postalCode || null,
          city: addressData.city,
          country: addressData.country
        })
        .eq('id', userId);

      if (error) throw error;

      toast({
        title: 'Adresse enregistrée',
        description: 'Votre adresse a été mise à jour avec succès.',
      });
      
      onAddressSaved();
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
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Adresse de livraison requise</DialogTitle>
          <DialogDescription>
            Pour finaliser votre achat, nous avons besoin de votre adresse postale.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="address">Adresse *</Label>
            <Input
              id="address"
              name="address"
              value={addressData.address}
              onChange={handleChange}
              required
              placeholder="123 rue de la Paix"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="postalCode">Code postal</Label>
              <Input
                id="postalCode"
                name="postalCode"
                value={addressData.postalCode}
                onChange={handleChange}
                placeholder="75000"
              />
            </div>
            <div>
              <Label htmlFor="city">Ville *</Label>
              <Input
                id="city"
                name="city"
                value={addressData.city}
                onChange={handleChange}
                required
                placeholder="Paris"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="country">Pays *</Label>
            <Input
              id="country"
              name="country"
              value={addressData.country}
              onChange={handleChange}
              required
              placeholder="France"
            />
          </div>
          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Annuler
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Enregistrement...' : 'Valider'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
