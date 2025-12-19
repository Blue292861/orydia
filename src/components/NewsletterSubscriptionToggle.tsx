import React, { useState, useEffect } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Mail, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import {
  getNewsletterSubscription,
  toggleNewsletterSubscription,
} from '@/services/newsletterService';

export const NewsletterSubscriptionToggle: React.FC = () => {
  const { user } = useAuth();
  const [subscribed, setSubscribed] = useState(true);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchSubscription = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const isSubscribed = await getNewsletterSubscription(user.id);
        setSubscribed(isSubscribed);
      } catch (error) {
        console.error('Error fetching subscription:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscription();
  }, [user]);

  const handleToggle = async (checked: boolean) => {
    if (!user || updating) return;

    setUpdating(true);
    try {
      await toggleNewsletterSubscription(user.id, checked);
      setSubscribed(checked);
      toast.success(
        checked
          ? 'Vous êtes maintenant abonné à la newsletter'
          : 'Vous êtes désabonné de la newsletter'
      );
    } catch (error) {
      console.error('Error toggling subscription:', error);
      toast.error('Erreur lors de la mise à jour');
    } finally {
      setUpdating(false);
    }
  };

  if (!user || loading) {
    return null;
  }

  return (
    <div className="flex items-center gap-3 p-3 rounded-md border border-amber-600/30 bg-amber-900/20">
      <Mail className="w-5 h-5 text-amber-400 flex-shrink-0" />
      <Label htmlFor="newsletter-toggle" className="flex-1 cursor-pointer text-sm text-amber-100">
        Recevoir la newsletter
      </Label>
      {updating ? (
        <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
      ) : (
        <Switch
          id="newsletter-toggle"
          checked={subscribed}
          onCheckedChange={handleToggle}
          disabled={updating}
        />
      )}
    </div>
  );
};
