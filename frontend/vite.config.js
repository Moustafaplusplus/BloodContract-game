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
    // Proxy /api/* requests to backend on port 5001
    proxy: {
      '/api': {
        target: 'http://localhost:5001',
        changeOrigin: true,
      },
      '/cars': {
        target: 'http://localhost:5001',
        changeOrigin: true,
      },
      '/houses': {
        target: 'http://localhost:5001',
        changeOrigin: true,
      },
      '/dogs': {
        target: 'http://localhost:5001',
        changeOrigin: true,
      },
      '/weapons': {
        target: 'http://localhost:5001',
        changeOrigin: true,
      },
      '/armors': {
        target: 'http://localhost:5001',
        changeOrigin: true,
      },
      '/special-items': {
        target: 'http://localhost:5001',
        changeOrigin: true,
      },
    },
  },
});
