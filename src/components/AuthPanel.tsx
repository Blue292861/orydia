
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LoginForm } from '@/components/LoginForm';
import { NewSignupForm } from '@/components/NewSignupForm';

interface AuthPanelProps {
  onTabChange?: (tab: string) => void;
}

export const AuthPanel: React.FC<AuthPanelProps> = ({ onTabChange }) => {
  const [activeTab, setActiveTab] = useState('login');

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    onTabChange?.(tab);
  };
  
  return (
    <div className="relative w-full">
      <Card 
        className="w-full max-w-2xl mx-auto bg-wood-50/95 backdrop-blur-sm border-2 border-gold-400/30 shadow-2xl mystical-glow max-h-[85vh] overflow-y-auto"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        <CardHeader className="bg-gradient-to-r from-forest-700 via-forest-600 to-forest-700 text-white rounded-t-lg relative overflow-hidden sticky top-0 z-10">
          <div className="absolute inset-0 bg-gradient-to-r from-gold-400/10 via-transparent to-gold-400/10" />
          <CardTitle className="text-center text-lg sm:text-xl md:text-2xl font-medieval relative z-10">
            Espace Personnel
          </CardTitle>
          <div className="absolute -top-2 -right-2 w-6 sm:w-8 h-6 sm:h-8 bg-gold-400/20 rounded-full animate-mystical-pulse" />
          <div className="absolute -bottom-1 -left-1 w-4 sm:w-6 h-4 sm:h-6 bg-gold-400/20 rounded-full animate-mystical-pulse" style={{ animationDelay: '1s' }} />
        </CardHeader>
        <CardContent className="p-3 sm:p-4 md:p-6 parchment-texture">
          <Tabs defaultValue="login" className="w-full" onValueChange={handleTabChange}>
            <TabsList className="grid w-full grid-cols-2 bg-wood-200/80 backdrop-blur-sm">
              <TabsTrigger 
                value="login" 
                className="data-[state=active]:bg-forest-500 data-[state=active]:text-white font-medieval text-xs sm:text-sm"
              >
                Se connecter
              </TabsTrigger>
              <TabsTrigger 
                value="signup"
                className="data-[state=active]:bg-forest-500 data-[state=active]:text-white font-medieval text-xs sm:text-sm"
              >
                S'inscrire
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="login" className="space-y-3 sm:space-y-4 mt-3 sm:mt-4 md:mt-6">
              <LoginForm onPasswordReset={() => {}} />
            </TabsContent>
            
            <TabsContent value="signup" className="space-y-2 sm:space-y-3 mt-3 sm:mt-4">
              <NewSignupForm />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
