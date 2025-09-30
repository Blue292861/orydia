
import React from 'react';
import { Button } from './ui/button';

interface LoginCrowProps {
  onPasswordReset: () => void;
}

export const LoginCrow: React.FC<LoginCrowProps> = ({ onPasswordReset }) => {
  return (
    <div className="absolute -top-20 -right-8 animate-fade-in-down w-48 z-20">
      <div className="relative flex flex-col items-center">
        <div className="relative bg-forest-200 text-forest-900 p-3 rounded-lg shadow-lg border-2 border-forest-800 mb-[-10px]">
          <p className="text-xs font-semibold text-center">Mot de passe oublié ?</p>
          <p className="text-xs mt-1 text-center">Recevez un lien par email !</p>
          <Button 
            onClick={onPasswordReset} 
            className="w-full mt-2 bg-forest-500 hover:bg-forest-600 text-white text-xs"
            size="sm"
          >
            Envoyer le lien
          </Button>
          <div className="absolute -bottom-2 left-1/2 w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-t-8 border-t-forest-200 transform -translate-x-1/2"></div>
        </div>
        
        <img src="/lovable-uploads/e4ca1c2e-eeba-4149-b13f-50ac08071650.png" alt="Assistant numérique" className="w-28 h-auto transform scale-75" />
      </div>
    </div>
  );
};
