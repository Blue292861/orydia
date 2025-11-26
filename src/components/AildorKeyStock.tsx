
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Key, ShoppingCart } from 'lucide-react';
import cleAildor from '@/assets/cle-aildor.png';

const AILDOR_KEY_ID = '550e8400-e29b-41d4-a716-446655440000';

interface AildorKeyStockProps {
  onNavigateToShop?: () => void;
}

export const AildorKeyStock: React.FC<AildorKeyStockProps> = ({ onNavigateToShop }) => {
  const { session } = useAuth();
  const [keyCount, setKeyCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadKeyCount = async () => {
      if (!session?.user?.id) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('user_inventory')
          .select('quantity')
          .eq('user_id', session.user.id)
          .eq('reward_type_id', AILDOR_KEY_ID)
          .maybeSingle();

        if (error) {
          console.error('Error loading key count:', error);
        } else {
          setKeyCount(data?.quantity || 0);
        }
      } catch (err) {
        console.error('Error loading key count:', err);
      } finally {
        setLoading(false);
      }
    };

    loadKeyCount();
  }, [session?.user?.id]);

  if (loading) {
    return (
      <Card className="bg-gradient-to-br from-amber-900/30 to-orange-950/40 border-2 border-amber-700/50">
        <CardContent className="p-4">
          <div className="animate-pulse flex items-center gap-4">
            <div className="w-16 h-16 bg-amber-800/50 rounded-lg"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-amber-800/50 rounded w-3/4"></div>
              <div className="h-3 bg-amber-800/50 rounded w-1/2"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-amber-900/30 to-orange-950/40 border-2 border-amber-700/50 overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          {/* Image de la clé */}
          <div className="relative flex-shrink-0">
            <div className="w-16 h-16 rounded-lg overflow-hidden bg-gradient-to-br from-amber-800/50 to-orange-900/50 border border-amber-600/30 flex items-center justify-center">
              <img 
                src={cleAildor} 
                alt="Clé d'Aildor le dragon" 
                className="w-14 h-14 object-contain"
              />
            </div>
            {keyCount > 0 && (
              <div className="absolute -top-1 -right-1 bg-amber-500 text-black text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center border border-amber-300">
                {keyCount}
              </div>
            )}
          </div>

          {/* Infos */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Key className="h-4 w-4 text-amber-400" />
              <h3 className="font-semibold text-amber-100 truncate">
                Clés d'Aildor le dragon
              </h3>
            </div>
            <p className="text-xs text-amber-200/70 line-clamp-2">
              {keyCount > 0 
                ? `Vous possédez ${keyCount} clé${keyCount > 1 ? 's' : ''}. Utilisez-les pour rouvrir vos coffres !`
                : 'Achetez des clés pour rouvrir vos coffres sans relire les chapitres.'
              }
            </p>
          </div>

          {/* Bouton */}
          <Button
            onClick={onNavigateToShop}
            size="sm"
            className="flex-shrink-0 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white border border-amber-400/50"
          >
            <ShoppingCart className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">Boutique</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
