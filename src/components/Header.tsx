
import React from 'react';
import { Button } from '@/components/ui/button';
import { PointsDisplay } from '@/components/PointsDisplay';
import { BookOpen, Settings, ShoppingCart, Users, Trophy } from 'lucide-react';

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
              <Button
                variant={currentPage === 'admin' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onNavigate('admin')}
              >
                <Settings className="h-4 w-4" />
              </Button>
              
              <Button
                variant={currentPage === 'shop-admin' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onNavigate('shop-admin')}
              >
                <ShoppingCart className="h-4 w-4" />
              </Button>
              
              <Button
                variant={currentPage === 'achievement-admin' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onNavigate('achievement-admin')}
              >
                <Trophy className="h-4 w-4" />
              </Button>
              
              <Button
                variant={currentPage === 'profile' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onNavigate('profile')}
              >
                <Users className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
