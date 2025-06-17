
import React from 'react';
import { AuthPanel } from '@/components/AuthPanel';

const AuthPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-forest-900 via-wood-800 to-forest-900 flex items-center justify-center p-4">
      <AuthPanel />
    </div>
  );
};

export default AuthPage;
