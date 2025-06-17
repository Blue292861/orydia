
import React from 'react';
import { Button } from '@/components/ui/button';
import { PointsDisplay } from '@/components/PointsDisplay';
import { BookOpen, Settings, ShoppingCart, Trophy, LogOut } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useResponsive } from '@/hooks/useResponsive';

interface HeaderProps {
  onNavigate: (page: 'library' | 'reader' | 'admin' | 'shop-admin' | 'achievement-admin' | 'orders-admin' | 'reading-stats-admin' | 'audiobook-admin' | 'shop' | 'search' | 'profile') => void;
  currentPage: string;
}

export const Header: React.FC<HeaderProps> = ({ onNavigate, currentPage }) => {
  const { session, isAdmin } = useAuth();
  const { isMobile } = useResponsive();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error(`Erreur lors de la déconnexion : ${error.message}`);
    } else {
      toast.success('Vous avez été déconnecté avec succès.');
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 pt-safe-top">
      <div className="w-full max-w-full px-2 py-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center text-amber-400 flex-shrink-0">
            <PointsDisplay />
          </div>

          <div className="flex items-center space-x-1 flex-shrink-0">
            {isAdmin && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant={['admin', 'shop-admin', 'achievement-admin', 'orders-admin', 'reading-stats-admin', 'audiobook-admin'].includes(currentPage) ? 'default' : 'ghost'}
                    size="sm"
                    className={`flex items-center gap-1 px-2 py-1 ${isMobile ? 'text-[10px]' : 'text-xs'}`}
                  >
                    <Settings className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'}`} />
                    {!isMobile && <span>Admin</span>}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem onClick={() => onNavigate('admin')}>
                    <BookOpen className="h-4 w-4 mr-2" />
                    <span>Gérer la bibliothèque</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onNavigate('shop-admin')}>
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    <span>Gérer la boutique</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onNavigate('achievement-admin')}>
                    <Trophy className="h-4 w-4 mr-2" />
                    <span>Gérer les succès</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onNavigate('orders-admin')}>
                    <Settings className="h-4 w-4 mr-2" />
                    <span>Gérer les commandes</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onNavigate('reading-stats-admin')}>
                    <BookOpen className="h-4 w-4 mr-2" />
                    <span>Statistiques de lecture</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onNavigate('audiobook-admin')}>
                    <BookOpen className="h-4 w-4 mr-2" />
                    <span>Gérer les audiobooks</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            
            {session && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className={`flex items-center gap-1 px-2 py-1 ${isMobile ? 'text-[10px]' : 'text-xs'}`}
              >
                <LogOut className={`${isMobile ? 'h-3 w-3' : 'h-4 w-4'}`} />
                {!isMobile && <span>Déconnexion</span>}
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
