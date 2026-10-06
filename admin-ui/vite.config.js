import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Two homes for the same build:
//  - Cloudflare Pages (admin.pannaipuram.com) — CF_PAGES=1 is set in its build
//    environment, so serve from the site root into dist/.
//  - Render fallback (api.pannaipuram.com/admin/v2/) — `npm run build` locally
//    writes into backend/public/admin-v2, which is committed and served by Express.
const onPages = !!process.env.CF_PAGES;

export default defineConfig({
  plugins: [react()],
  base: onPages ? '/' : '/admin/v2/',
  build: {
    outDir: onPages ? 'dist' : '../backend/public/admin-v2',
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
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.js'],
    include: ['src/**/*.test.jsx'],
  }
});
