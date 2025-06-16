
// Utilitaires pour l'optimisation des images
export const optimizeImageUrl = (url: string, width?: number, quality?: number): string => {
  // Si c'est une image locale, on la retourne telle quelle
  if (url.startsWith('/') || url.startsWith('./')) {
    return url;
  }

  // Pour les images externes, on peut ajouter des paramètres d'optimisation
  const urlObj = new URL(url);
  
  if (width) {
    urlObj.searchParams.set('w', width.toString());
  }
  
  if (quality) {
    urlObj.searchParams.set('q', quality.toString());
  }

  return urlObj.toString();
};

// Préchargement des images critiques
export const preloadImage = (src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = src;
  });
};

// Lazy loading des images
export const createIntersectionObserver = (callback: (entries: IntersectionObserverEntry[]) => void) => {
  const options = {
    root: null,
    rootMargin: '50px',
    threshold: 0.1
  };

  return new IntersectionObserver(callback, options);
};

// Conversion en WebP si supporté
export const getOptimizedImageFormat = (originalUrl: string): string => {
  const supportsWebP = (() => {
    const canvas = document.createElement('canvas');
    return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
  })();

  if (supportsWebP && !originalUrl.endsWith('.svg')) {
    // En production, vous pourriez convertir automatiquement en WebP
    return originalUrl;
  }

  return originalUrl;
};
