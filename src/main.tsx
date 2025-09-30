
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Enregistrement du service worker en production avec versioning
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    const buildId = import.meta.env.VITE_BUILD_ID || Date.now();
    const swUrl = `/sw.js?v=${buildId}`;
    
    navigator.serviceWorker.register(swUrl, { updateViaCache: 'none' })
      .then((registration) => {
        console.log('Service Worker registered successfully:', registration);
        
        // Vérifier les mises à jour
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // Nouvelle version disponible - forcer le rechargement
                if (confirm('Une nouvelle version est disponible. Recharger maintenant ?')) {
                  window.location.reload();
                }
              }
            });
          }
        });
      })
      .catch((error) => {
        console.log('Service Worker registration failed:', error);
      });
  });
}

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
