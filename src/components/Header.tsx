
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

interface HeaderProps {
  onNavigate: (page: 'library' | 'reader' | 'admin' | 'shop-admin' | 'achievement-admin' | 'shop' | 'search' | 'profile') => void;
  currentPage: string;
}

export const Header: React.FC<HeaderProps> = ({ onNavigate, currentPage }) => {
  const { session, isAdmin } = useAuth();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error(`Erreur lors de la déconnexion : ${error.message}`);
    } else {
      toast.success('Vous avez été déconnecté avec succès.');
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center text-amber-400">
            <PointsDisplay />
          </div>

          <div className="flex items-center space-x-2">
            {isAdmin && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant={['admin', 'shop-admin', 'achievement-admin'].includes(currentPage) ? 'default' : 'ghost'}
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Settings className="h-4 w-4" />
                    Administration
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
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
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            
            {session && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                Se déconnecter
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
