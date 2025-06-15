
import React from 'react';
import { Button } from './ui/button';
import { Bird } from 'lucide-react';

export const LoginCrow = ({ onPasswordReset }: { onPasswordReset: () => void }) => {
  return (
    <div className="absolute -top-8 right-0 transform translate-x-1/4 animate-fade-in-down w-64 z-20">
      <div className="relative flex flex-col items-center">
        <div className="relative bg-forest-200 text-forest-900 p-4 rounded-lg shadow-lg border-2 border-forest-800 mb-[-10px]">
          <p className="text-sm font-semibold">Mot de passe oublié, aventurier ?</p>
          <p className="text-xs mt-1">Un pigeon voyageur peut être dépêché !</p>
          <Button 
            onClick={onPasswordReset} 
            className="w-full mt-3 bg-forest-500 hover:bg-forest-600 text-white text-xs"
            size="sm"
          >
            Envoyer un message
          </Button>
          <div className="absolute -bottom-2 left-1/2 w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-t-8 border-t-forest-200 transform -translate-x-1/2"></div>
        </div>
        
        <Bird className="w-16 h-16 text-forest-900" strokeWidth={1.5} />
      </div>
    </div>
  );
};
