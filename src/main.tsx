// src/main.tsx (Version Corrigée)

import React, { useEffect } from 'react'; // <-- Ajout de useEffect ici
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { initializeAdMob } from './utils/adMob'; // <-- Import de l'initialiseur

// Enregistrement du service worker en production avec versioning
if ('serviceWorker' in navigator && import.meta.env.PROD) {
// ... (code service worker inchangé)
}

const RootComponent: React.FC = () => {
    // Initialisation d'AdMob au chargement de l'application
    useEffect(() => {
        initializeAdMob();
    }, []);

    return <App />;
};


createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RootComponent /> // <-- Utilisation du composant wrapper
  </React.StrictMode>
);
