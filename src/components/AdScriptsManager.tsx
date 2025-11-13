import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Scripts publicitaires à injecter conditionnellement
const AD_SCRIPTS = [
  {
    id: 'ad-script-1',
    code: `(function(s){s.dataset.zone='10174648',s.src='https://groleegni.net/vignette.min.js'})([document.documentElement, document.body].filter(Boolean).pop().appendChild(document.createElement('script')))`
  },
  {
    id: 'ad-script-2',
    code: `(function(s){s.dataset.zone='10174631',s.src='https://forfrogadiertor.com/tag.min.js'})([document.documentElement, document.body].filter(Boolean).pop().appendChild(document.createElement('script')))`
  },
  {
    id: 'ad-script-3',
    src: 'https://3nbf4.com/act/files/tag.min.js?z=10174608',
    async: true,
    'data-cfasync': 'false'
  }
];

// Routes où les scripts publicitaires NE DOIVENT PAS être chargés
const EXCLUDED_ROUTES = [
  /^\/book\/[^/]+\/chapter\/[^/]+$/, // Lecture de chapitre
  /^\/book\/[^/]+\/chapters$/, // Table des matières
  /^\/auth$/ // Page d'authentification
];

export const AdScriptsManager = () => {
  const location = useLocation();

  useEffect(() => {
    // Vérifier si on est sur une route exclue
    const isExcluded = EXCLUDED_ROUTES.some(pattern => pattern.test(location.pathname));

    if (isExcluded) {
      // Nettoyer les scripts et overlays si présents
      AD_SCRIPTS.forEach(script => {
        const existingScript = document.getElementById(script.id);
        if (existingScript) {
          existingScript.remove();
        }
      });

      // Nettoyer les overlays publicitaires connus
      const overlays = document.querySelectorAll('[class*="ad-"], [id*="ad-"], [class*="banner"]');
      overlays.forEach(overlay => {
        if (overlay.parentElement) {
          overlay.remove();
        }
      });

      return;
    }

    // Injecter les scripts sur les routes autorisées
    AD_SCRIPTS.forEach(script => {
      // Ne pas réinjecter si déjà présent
      if (document.getElementById(script.id)) return;

      const scriptElement = document.createElement('script');
      scriptElement.id = script.id;

      if ('code' in script) {
        scriptElement.textContent = script.code;
      } else if ('src' in script) {
        scriptElement.src = script.src;
        if (script.async) scriptElement.async = true;
        if (script['data-cfasync']) scriptElement.setAttribute('data-cfasync', script['data-cfasync']);
      }

      document.head.appendChild(scriptElement);
    });

    // Cleanup à l'unmount
    return () => {
      AD_SCRIPTS.forEach(script => {
        const existingScript = document.getElementById(script.id);
        if (existingScript) {
          existingScript.remove();
        }
      });
    };
  }, [location.pathname]);

  return null;
};
