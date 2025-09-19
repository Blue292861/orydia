
import React, { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { HelmetProvider } from 'react-helmet-async';
import Index from "./pages/Index";
import AuthPage from "./pages/AuthPage";
import EmailConfirmationPage from "./pages/EmailConfirmationPage";
import WorkPage from "./pages/WorkPage";
import { GenrePage } from "./pages/GenrePage";

import SplashScreen from "./components/SplashScreen";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { UserStatsProvider } from "./contexts/UserStatsContext";
import { ContrastProvider } from "./contexts/ContrastContext";

const queryClient = new QueryClient();

const AppContent = () => {
  const { session, loading } = useAuth();
  const location = useLocation();
  const [showSplash, setShowSplash] = useState(true);

  const handleSplashComplete = () => {
    setShowSplash(false);
  };

  // Ne pas afficher le splash screen sur la page d'auth
  const isAuthPage = location.pathname === '/auth';

  // Debug logs removed for production

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background text-foreground">
        <div>Chargement...</div>
      </div>
    );
  }

  // Si pas de session, aller à la page d'auth (sauf pour la confirmation d'email)
  if (!session) {
    return (
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/email-confirmation" element={<EmailConfirmationPage />} />
        <Route path="/*" element={<Navigate to="/auth" replace />} />
      </Routes>
    );
  }

  // Si connecté, afficher le splash puis l'app
  if (showSplash) {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }

  return (
    <Routes>
      <Route path="/auth" element={<Navigate to="/" replace />} />
      <Route path="/email-confirmation" element={<EmailConfirmationPage />} />
      <Route path="/genre/:genre" element={<GenrePage />} />
      <Route path="/:authorSlug/:titleSlug" element={<WorkPage />} />
      <Route path="/*" element={<Index />} />
    </Routes>
  );
};

const App = () => {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <ContrastProvider>
            <AuthProvider>
              <UserStatsProvider>
                <TooltipProvider>
                  <Toaster />
                  <Sonner />
                  <AppContent />
                </TooltipProvider>
              </UserStatsProvider>
            </AuthProvider>
          </ContrastProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </HelmetProvider>
  );
};

export default App;
