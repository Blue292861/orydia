
import { useEffect } from 'react';

export const useServiceWorker = () => {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', async () => {
        // Nettoyer TOUS les service workers intrusifs (peu importe l'environnement)
        try {
          const registrations = await navigator.serviceWorker.getRegistrations();
          for (const registration of registrations) {
            const scriptURL = registration.active?.scriptURL || '';
            const url = new URL(scriptURL);
            
            // Désenregistrer tout SW qui n'est PAS notre SW sain
            if (!url.pathname.startsWith('/sw.js')) {
              console.log('🧹 Unregistering intrusive SW:', scriptURL);
              await registration.unregister();
            } else if (scriptURL.includes('5gvci.com') || scriptURL.includes('service-worker.min.js')) {
              console.log('🧹 Unregistering known malicious SW:', scriptURL);
              await registration.unregister();
            }
          }
        } catch (err) {
          console.error('❌ Error cleaning up service workers:', err);
        }

        // Purger les caches non-Orydia (optionnel mais recommandé)
        try {
          const cacheNames = await caches.keys();
          for (const cacheName of cacheNames) {
            if (!cacheName.startsWith('orydia-v')) {
              console.log('🧹 Deleting unknown cache:', cacheName);
              await caches.delete(cacheName);
            }
          }
        } catch (err) {
          console.error('❌ Error cleaning up caches:', err);
        }

        // Enregistrer le service worker sain avec nouvelle version
        if (process.env.NODE_ENV === 'production') {
          navigator.serviceWorker.register('/sw.js?v=3')
          .then((registration) => {
            console.log('✅ SW registered successfully:', registration);
            
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
              console.error('❌ SW registration failed:', registrationError);
            });
        }
      });
    }
  }, []);
};
