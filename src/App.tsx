
import React, { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Index from "./pages/Index";
import AuthPage from "./pages/AuthPage";
import SplashScreen from "./components/SplashScreen";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { UserStatsProvider } from "./contexts/UserStatsContext";
import { ThemeProvider } from "./contexts/ThemeContext";

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

  console.log('🔍 Auth State:', { 
    session: !!session, 
    loading, 
    currentPath: location.pathname,
    showSplash,
    isAuthPage 
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background text-foreground">
        <div>Chargement...</div>
      </div>
    );
  }

  // Si pas de session, aller à la page d'auth
  if (!session) {
    return (
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
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
      <Route path="/*" element={<Index />} />
    </Routes>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <ThemeProvider>
            <UserStatsProvider>
              <TooltipProvider>
                <Toaster />
                <Sonner />
                <AppContent />
              </TooltipProvider>
            </UserStatsProvider>
          </ThemeProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
