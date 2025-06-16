
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import viteCompression from 'vite-plugin-compression';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
    // Désactiver la compression pour les builds Android/Capacitor pour éviter les doublons
    mode === 'production' && !process.env.CAPACITOR_BUILD && viteCompression({
      algorithm: 'gzip',
      ext: '.gz',
    }),
    mode === 'production' && !process.env.CAPACITOR_BUILD && viteCompression({
      algorithm: 'brotliCompress',
      ext: '.br',
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Minification et compression pour la production
    minify: mode === 'production' ? 'terser' : 'esbuild',
    terserOptions: mode === 'production' ? {
      compress: {
        drop_console: true, // Supprime les console.log en production
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug'],
      },
      mangle: true,
    } : undefined,
    // Code splitting optimisé
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-toast', '@radix-ui/react-tabs'],
          supabase: ['@supabase/supabase-js'],
          utils: ['date-fns', 'clsx', 'tailwind-merge'],
        },
        // Optimisation des noms de chunks
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name!.split('.');
          const ext = info[info.length - 1];
          if (/\.(png|jpe?g|svg|gif|tiff|bmp|ico)$/i.test(assetInfo.name!)) {
            return `assets/images/[name]-[hash].${ext}`;
          }
          if (/\.(css)$/i.test(assetInfo.name!)) {
            return `assets/css/[name]-[hash].${ext}`;
          }
          return `assets/[name]-[hash].${ext}`;
        },
      },
    },
    // Compression des assets
    assetsInlineLimit: 4096, // Inline les petits assets (4KB)
    cssCodeSplit: true,
    sourcemap: mode === 'development', // Sourcemaps uniquement en développement
    target: 'esnext', // Cible moderne pour de meilleures optimisations
    // Optimisations avancées
    reportCompressedSize: false, // Désactive le rapport de taille pour accélérer le build
  },
  // Optimisation des images et assets
  assetsInclude: ['**/*.png', '**/*.jpg', '**/*.jpeg', '**/*.gif', '**/*.svg', '**/*.webp'],
  // Préchargement des modules
  optimizeDeps: {
    include: [
      'react', 
      'react-dom', 
      'react-router-dom',
      '@supabase/supabase-js',
      'lucide-react',
    ],
  },
}));
