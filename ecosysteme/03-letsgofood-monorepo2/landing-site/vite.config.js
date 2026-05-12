import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: process.env.VITE_BASE_PATH || "/",
  plugins: [react()],
  build: {
    outDir: "dist",
    sourcemap: false,
    // Code splitting pour un chargement plus rapide
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom", "react-router-dom"],
        },
      },
    },
    // Avertissement si un chunk dépasse 500 Ko
    chunkSizeWarningLimit: 500,
  },
});
