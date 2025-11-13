
import { useEffect } from 'react';

export const useServiceWorker = () => {
  useEffect(() => {
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      window.addEventListener('load', async () => {
        // Nettoyer les service workers intrusifs
        try {
          const registrations = await navigator.serviceWorker.getRegistrations();
          for (const registration of registrations) {
            if (registration.active?.scriptURL && 
                (registration.active.scriptURL.includes('5gvci.com') || 
                 registration.active.scriptURL.includes('service-worker.min.js'))) {
              console.log('Unregistering intrusive SW:', registration.active.scriptURL);
              await registration.unregister();
            }
          }
        } catch (err) {
          console.error('Error cleaning up service workers:', err);
        }

        // Enregistrer le service worker sain avec version
        navigator.serviceWorker.register('/sw.js?v=2')
          .then((registration) => {
            console.log('SW registered successfully:', registration);
            
            // Vérifier les mises à jour
            registration.addEventListener('updatefound', () => {
              const newWorker = registration.installing;
              if (newWorker) {
                newWorker.addEventListener('statechange', () => {
                  if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                    // Nouvelle version disponible
                    if (confirm('Une nouvelle version est disponible. Recharger ?')) {
                      window.location.reload();
                    }
                  }
                });
              }
            });
          })
          .catch((registrationError) => {
            console.error('SW registration failed:', registrationError);
          });
      });
    }
  }, []);
};
