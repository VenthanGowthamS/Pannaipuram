import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/admin/v2/',
  build: {
    outDir: '../backend/public/admin-v2',
    emptyOutDir: true,
    sourcemap: false,
    minify: 'terser'
  },
  server: {
    port: 5173,
    proxy: {
      '/admin': 'http://localhost:3000',
      '/api': 'http://localhost:3000'
    }
  }
});
