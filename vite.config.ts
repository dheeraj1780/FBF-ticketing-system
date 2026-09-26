import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Leading dot allows any subdomain, so new ngrok URLs work without edits.
const tunnelHosts = [".ngrok-free.dev", ".ngrok-free.app", ".ngrok.app", ".ngrok.io"];

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          react: ["react", "react-dom", "react-router-dom"],
          motion: ["framer-motion"],
          icons: ["lucide-react"],
        },
      },
    },
  },
  server: {
    host: true,
    port: 5173,
    // Fail instead of silently moving to 5174: tunnels forward to a fixed port.
    strictPort: true,
    allowedHosts: tunnelHosts,
  },
  preview: {
    host: true,
    allowedHosts: tunnelHosts,
  },
});
