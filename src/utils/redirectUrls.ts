/**
 * Utility functions for handling email redirect URLs
 */

/**
 * Get the appropriate redirect URL for email confirmations
 * Prioritizes deployed URL over localhost for production builds
 */
export const getEmailRedirectUrl = (path: string = '/'): string => {
  // For production builds, try to use a production URL if available
  if (import.meta.env.PROD) {
    // You can set this environment variable in your deployment
    const productionUrl = import.meta.env.VITE_PRODUCTION_URL;
    if (productionUrl) {
      return `${productionUrl}${path}`;
    }
  }
  
  // Fallback to current origin (will be localhost in dev)
  return `${window.location.origin}${path}`;
};

/**
 * Get the confirmation page URL for email redirects
 */
export const getEmailConfirmationUrl = (): string => {
  return getEmailRedirectUrl('/email-confirmation');
};