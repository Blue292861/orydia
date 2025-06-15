
import { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';
import { toast } from '@/components/ui/use-toast';

interface SubscriptionInfo {
  isPremium: boolean;
  subscriptionTier: string | null;
  subscriptionEnd: string | null;
}

interface AuthContextType {
  session: Session | null;
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  subscription: SubscriptionInfo;
  checkSubscriptionStatus: () => Promise<void>;
  manageSubscription: () => Promise<void>;
  createCheckout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  isAdmin: false,
  loading: true,
  subscription: { isPremium: false, subscriptionTier: null, subscriptionEnd: null },
  checkSubscriptionStatus: async () => {},
  manageSubscription: async () => {},
  createCheckout: async () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<SubscriptionInfo>({ isPremium: false, subscriptionTier: null, subscriptionEnd: null });

  const checkSubscriptionStatus = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('check-subscription');
      if (error) throw error;
      setSubscription({
        isPremium: data.subscribed,
        subscriptionTier: data.subscription_tier,
        subscriptionEnd: data.subscription_end,
      });
    } catch (error) {
      console.error('Error checking subscription status:', error);
      // Reset subscription state on error to avoid false positives
      setSubscription({ isPremium: false, subscriptionTier: null, subscriptionEnd: null });
    }
  };

  const manageSubscription = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');
      if (error) throw error;
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Error managing subscription:', error);
    }
  };

  const createCheckout = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout');
      if (error) throw error;
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de lancer le processus de paiement.',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    const checkAdminRole = async (user: User | null) => {
      if (!user) {
        setIsAdmin(false);
        return;
      }
      try {
        const { data, error } = await supabase.rpc('user_has_role', {
          p_user_id: user.id,
          p_role: 'admin',
        });
        if (error) throw error;
        setIsAdmin(data);
      } catch (error) {
        console.error('Error checking user role:', error);
        setIsAdmin(false);
      }
    };

    const setAuthData = async (session: Session | null) => {
      setSession(session);
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      await checkAdminRole(currentUser);
      setLoading(false);
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      setAuthData(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setAuthData(session);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (session) {
      checkSubscriptionStatus();
    } else {
      // Clear subscription status on logout
      setSubscription({ isPremium: false, subscriptionTier: null, subscriptionEnd: null });
    }
  }, [session]);

  const value = {
    session,
    user,
    isAdmin,
    loading,
    subscription,
    checkSubscriptionStatus,
    manageSubscription,
    createCheckout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
