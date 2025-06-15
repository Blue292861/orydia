
import React from 'react';
import { Button } from '@/components/ui/button';
import { Book, ShoppingCart } from 'lucide-react';
import { PointsDisplay } from '@/components/PointsDisplay';

interface HeaderProps {
  isAdmin: boolean;
  setIsAdmin: (isAdmin: boolean) => void;
  currentView?: string;
  onNavigate?: (view: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ isAdmin, setIsAdmin, currentView, onNavigate }) => {
  return (
    <header className="bg-primary text-primary-foreground py-4">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Book className="h-6 w-6" />
          <h1 className="text-2xl font-bold">BookStream</h1>
        </div>
        
        <div className="flex items-center gap-4">
          {isAdmin && onNavigate && (
            <div className="flex gap-2">
              <Button 
                variant={currentView === 'books' ? "secondary" : "ghost"}
                onClick={() => onNavigate('books')}
                size="sm"
              >
                Livres
              </Button>
              <Button 
                variant={currentView === 'shop' ? "secondary" : "ghost"}
                onClick={() => onNavigate('shop')}
                size="sm"
                className="flex items-center gap-2"
              >
                <ShoppingCart className="h-4 w-4" />
                Boutique
              </Button>
            </div>
          )}
          {!isAdmin && <PointsDisplay />}
          <Button 
            variant={isAdmin ? "secondary" : "ghost"} 
            onClick={() => setIsAdmin(!isAdmin)}
            className="transition-all duration-300 hover:scale-105"
          >
            {isAdmin ? 'Vue Utilisateur' : 'Vue Administrateur'}
          </Button>
        </div>
      </div>
    </header>
  );
};
