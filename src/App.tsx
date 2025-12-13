
import React, { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { HelmetProvider } from 'react-helmet-async';
import Index from "./pages/Index";
import SearchResultsPage from "./pages/SearchResultsPage";
import AuthPage from "./pages/AuthPage";
import EmailConfirmationPage from "./pages/EmailConfirmationPage";
import WorkPage from "./pages/WorkPage";
import { GenrePage } from "./pages/GenrePage";
import { AdminStatsPage } from "./pages/AdminStatsPage";
import UnsubscribePage from "./pages/UnsubscribePage";
import { BookTableOfContents } from "./pages/BookTableOfContents";
import { ChapterEpubReader } from "./components/ChapterEpubReader";
import { ItemPurchaseSuccess } from "./pages/ItemPurchaseSuccess";

import SplashScreen from "./components/SplashScreen";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { UserStatsProvider } from "./contexts/UserStatsContext";
import { ContrastProvider } from "./contexts/ContrastContext";
import { PlatformUtils } from "./utils/platformDetection";
import { useServiceWorker } from "./hooks/useServiceWorker";
import { useRouteToast } from "./hooks/use-route-toast";

const queryClient = new QueryClient();

const AppContent = () => {
  const { session, loading } = useAuth();
  const location = useLocation();
  const [showSplash, setShowSplash] = useState(true);
  const isWeb = PlatformUtils.isWeb();
  
  // Activer le nettoyage et l'enregistrement du service worker
  useServiceWorker();
  
  // Initialiser le système de toasts liés aux changements de route
  useRouteToast();

  const handleSplashComplete = () => {
    setShowSplash(false);
  };

  // Ne pas afficher le splash screen sur la page d'auth
  const isAuthPage = location.pathname === '/auth';

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background text-foreground">
        <div>Chargement...</div>
      </div>
    );
  }

  // Routes publiques accessibles sans authentification (web uniquement)
  const publicRoutes = ['/', '/auth', '/email-confirmation'];
  const isPublicRoute = publicRoutes.includes(location.pathname) || 
                        location.pathname.startsWith('/genre/') || 
                        location.pathname.match(/^\/[^/]+\/[^/]+$/); // Pattern /:authorSlug/:titleSlug

  // Si pas de session
  if (!session) {
    // Sur web, autoriser l'accès aux routes publiques
    if (isWeb && isPublicRoute) {
      return (
        <Routes>
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/email-confirmation" element={<EmailConfirmationPage />} />
          <Route path="/genre/:genre" element={<GenrePage />} />
          <Route path="/:authorSlug/:titleSlug" element={<WorkPage />} />
          <Route path="/*" element={<Index />} />
        </Routes>
      );
    }
    
    // Sur mobile natif ou routes non publiques, rediriger vers auth
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
      <Route path="/admin/stats" element={<AdminStatsPage />} />
      <Route path="/search" element={<SearchResultsPage />} />
      <Route path="/genre/:genre" element={<GenrePage />} />
      <Route path="/désinscription" element={<UnsubscribePage />} />
      <Route path="/book/:bookId/chapters" element={<BookTableOfContents />} />
      <Route path="/book/:bookId/chapter/:chapterId" element={<ChapterEpubReader />} />
      <Route path="/item-purchase-success" element={<ItemPurchaseSuccess />} />
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
