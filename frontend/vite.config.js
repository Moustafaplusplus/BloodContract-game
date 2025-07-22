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
    // Proxy /api/* requests to backend on port 5000
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
      '/crimes': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
      '/weapons': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
      '/armors': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
