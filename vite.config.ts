import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react(), tailwindcss()],
    define: {
      // SECURITY: Only expose VITE_-prefixed env vars to the client bundle.
      // Server-side keys (GEMINI_API_KEY) must NOT be embedded in the frontend bundle.
      // Use VITE_GOOGLE_MAPS_KEY for the maps key (already in .env.example).
      'process.env.VITE_GOOGLE_MAPS_KEY': JSON.stringify(env.VITE_GOOGLE_MAPS_KEY || ''),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
