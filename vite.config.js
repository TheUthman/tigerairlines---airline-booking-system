import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
      
      proxy: {
        // Proxy all /api routes to backend
        '/api': {
          target: 'http://92.4.130.93:8080',
          changeOrigin: true,
          secure: false,
        },
        // Proxy /auth routes if they don't start with /api
        '/auth': {
          target: 'http://92.4.130.93:8080',
          changeOrigin: true,
          secure: false,
        },
      },
    },
  };
});