import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'), // Enables @/ to point to /src
    },
  },
  server: {
    // Proxy /api/* requests to backend
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'https://bloodcontract-game-production.up.railway.app',
        changeOrigin: true,
        secure: true,
      },
      '/cars': {
        target: process.env.VITE_API_URL || 'https://bloodcontract-game-production.up.railway.app',
        changeOrigin: true,
        secure: true,
      },
      '/houses': {
        target: process.env.VITE_API_URL || 'https://bloodcontract-game-production.up.railway.app',
        changeOrigin: true,
        secure: true,
      },
      '/dogs': {
        target: process.env.VITE_API_URL || 'https://bloodcontract-game-production.up.railway.app',
        changeOrigin: true,
        secure: true,
      },
      '/weapons': {
        target: process.env.VITE_API_URL || 'https://bloodcontract-game-production.up.railway.app',
        changeOrigin: true,
        secure: true,
      },
      '/armors': {
        target: process.env.VITE_API_URL || 'https://bloodcontract-game-production.up.railway.app',
        changeOrigin: true,
        secure: true,
      },
      '/special-items': {
        target: process.env.VITE_API_URL || 'https://bloodcontract-game-production.up.railway.app',
        changeOrigin: true,
        secure: true,
      },
      '/crimes': {
        target: process.env.VITE_API_URL || 'https://bloodcontract-game-production.up.railway.app',
        changeOrigin: true,
        secure: true,
      },
      '/avatars': {
        target: process.env.VITE_API_URL || 'https://bloodcontract-game-production.up.railway.app',
        changeOrigin: true,
        secure: true,
      },
      '/missions': {
        target: process.env.VITE_API_URL || 'https://bloodcontract-game-production.up.railway.app',
        changeOrigin: true,
        secure: true,
      },
    },
  },
});
