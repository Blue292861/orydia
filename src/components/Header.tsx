
import React from 'react';
import { Button } from '@/components/ui/button';
import { Book } from 'lucide-react';
import { PointsDisplay } from '@/components/PointsDisplay';

interface HeaderProps {
  isAdmin: boolean;
  setIsAdmin: (isAdmin: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({ isAdmin, setIsAdmin }) => {
  return (
    <header className="bg-primary text-primary-foreground py-4">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Book className="h-6 w-6" />
          <h1 className="text-2xl font-bold">BookStream</h1>
        </div>
        
        <div className="flex items-center gap-4">
          {!isAdmin && <PointsDisplay />}
          <Button 
            variant={isAdmin ? "secondary" : "ghost"} 
            onClick={() => setIsAdmin(!isAdmin)}
            className="transition-all duration-300 hover:scale-105"
          >
            {isAdmin ? 'Switch to User View' : 'Switch to Admin View'}
          </Button>
        </div>
      </div>
    </header>
  );
};
