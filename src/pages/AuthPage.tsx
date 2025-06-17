
import React, { useState } from 'react';
import { LoginCrow } from '@/components/LoginCrow';
import { SignUpForm } from '@/components/SignUpForm';

const AuthPage: React.FC = () => {
  const [showSignUp, setShowSignUp] = useState(false);

  const handlePasswordReset = () => {
    // TODO: Implémenter la réinitialisation de mot de passe
    console.log('Reset password functionality to be implemented');
  };

  if (showSignUp) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <SignUpForm onBack={() => setShowSignUp(false)} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
      <LoginCrow 
        onPasswordReset={handlePasswordReset}
        onShowSignUp={() => setShowSignUp(true)} 
      />
    </div>
  );
};

export default AuthPage;
