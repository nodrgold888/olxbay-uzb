import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // Lets the dev server be reached through a tunnel hostname (e.g.
    // *.trycloudflare.com) for quick demos; Vite blocks unknown Host headers
    // by default as a CSRF-ish protection. Fine for a local demo, not for
    // a real deployment (use a proper build + host there instead).
    allowedHosts: true,
    proxy: {
      '/api': 'http://localhost:4000',
      '/uploads': 'http://localhost:4000',
    },
  },
});
