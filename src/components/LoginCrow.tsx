
import React from 'react';
import { Button } from './ui/button';
import { Bird } from 'lucide-react';

export const LoginCrow = ({ onPasswordReset }: { onPasswordReset: () => void }) => {
  return (
    <div className="absolute -top-20 -right-4 sm:right-0 sm:-top-24 animate-fade-in-down w-64 z-20">
      <div className="relative flex items-end">
        <Bird className="w-24 h-24 text-black transform -scale-x-100" strokeWidth={1.5} />
        
        <div className="relative bg-wood-100 text-wood-900 p-4 rounded-lg shadow-lg border-2 border-wood-800 ml-[-20px] mb-6">
          <p className="text-sm font-semibold">Mot de passe oublié, voyageur ?</p>
          <p className="text-xs mt-1">Un message peut être envoyé à votre scribe pour vous aider.</p>
          <Button 
            onClick={onPasswordReset} 
            className="w-full mt-3 bg-amber-500 hover:bg-amber-600 text-black text-xs"
            size="sm"
          >
            Envoyer un corbeau messager
          </Button>
          <div className="absolute -bottom-2 left-4 w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-t-8 border-t-wood-100 transform -translate-x-1/2"></div>
        </div>
      </div>
    </div>
  );
};
