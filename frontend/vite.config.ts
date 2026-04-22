import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const BACKEND_TARGET = process.env.BACKEND_URL || 'http://localhost:8000';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: Number(process.env.PORT) || 5173,
    allowedHosts: true,
    proxy: {
      '/api': { target: BACKEND_TARGET, changeOrigin: true },
      '/uploads': { target: BACKEND_TARGET, changeOrigin: true },
    },
  },
});
