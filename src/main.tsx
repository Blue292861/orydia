import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Enregistrement du service worker en production avec versioning
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  // Service worker registration
}

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
