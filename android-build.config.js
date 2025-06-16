
module.exports = {
  // Configuration pour les builds Android
  buildTypes: {
    debug: {
      minifyEnabled: false,
      debuggable: true,
    },
    release: {
      minifyEnabled: true,
      shrinkResources: true,
      debuggable: false,
      signingConfig: 'release'
    }
  },
  
  // Configuration des assets
  assets: {
    compressionEnabled: true,
    formats: ['webp', 'png', 'jpg'],
  },
  
  // Configuration des performances
  performance: {
    enableR8: true, // Optimiseur de code Android
    enableMultidex: true, // Support pour les grosses applications
  }
};
