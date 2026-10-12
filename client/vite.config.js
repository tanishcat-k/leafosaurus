import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// the proxy sends /api and /uploads requests to the express server
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost:5001',
      '/uploads': 'http://localhost:5001',
    },
  },
});
