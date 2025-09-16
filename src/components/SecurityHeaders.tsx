
import React, { useEffect } from 'react';
import { getCSPDirectives } from '@/utils/security';

export const SecurityHeaders: React.FC = () => {
  useEffect(() => {
    // Set Content Security Policy
    const meta = document.createElement('meta');
    meta.httpEquiv = 'Content-Security-Policy';
    meta.content = getCSPDirectives();
    document.head.appendChild(meta);

    // Set other security headers via meta tags (limited effectiveness, but better than nothing)
    const securityMetas = [
      { httpEquiv: 'X-Content-Type-Options', content: 'nosniff' },
      // X-Frame-Options removed to allow in-app iframes (epub.js)
      { httpEquiv: 'X-XSS-Protection', content: '1; mode=block' },
      { httpEquiv: 'Referrer-Policy', content: 'strict-origin-when-cross-origin' }
    ];

    const metaElements = securityMetas.map(({ httpEquiv, content }) => {
      const element = document.createElement('meta');
      element.httpEquiv = httpEquiv;
      element.content = content;
      document.head.appendChild(element);
      return element;
    });

    // Cleanup function
    return () => {
      document.head.removeChild(meta);
      metaElements.forEach(element => {
        if (document.head.contains(element)) {
          document.head.removeChild(element);
        }
      });
    };
  }, []);

  return null; // This component only sets up security headers
};
