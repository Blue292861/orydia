
import React from 'react';
import { Button } from '@/components/ui/button';
import { PointsDisplay } from '@/components/PointsDisplay';
import { BookOpen, Settings, ShoppingCart, User, Trophy } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface HeaderProps {
  onNavigate: (page: 'library' | 'reader' | 'admin' | 'shop-admin' | 'achievement-admin' | 'shop' | 'search' | 'profile' | 'premium') => void;
  currentPage: string;
}

export const Header: React.FC<HeaderProps> = ({ onNavigate, currentPage }) => {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant={currentPage === 'library' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onNavigate('library')}
              className="flex items-center gap-2"
            >
              <BookOpen className="h-4 w-4" />
              Bibliothèque
            </Button>
            
            <Button
              variant={currentPage === 'shop' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onNavigate('shop')}
              className="flex items-center gap-2"
            >
              <ShoppingCart className="h-4 w-4" />
              Boutique
            </Button>
          </div>

          <div className="flex items-center space-x-4">
            <PointsDisplay />
            
            <div className="flex items-center space-x-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant={['admin', 'shop-admin', 'achievement-admin'].includes(currentPage) ? 'default' : 'ghost'}
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Settings className="h-4 w-4" />
                    Admin
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onNavigate('admin')}>
                    <BookOpen className="h-4 w-4 mr-2" />
                    <span>Gérer les livres</span>
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
              
              <Button
                variant={currentPage === 'profile' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onNavigate('profile')}
                className="flex items-center gap-2"
              >
                <User className="h-4 w-4" />
                Profil
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
