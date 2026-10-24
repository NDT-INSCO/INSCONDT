import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: '/-Project-/',
  // The preview proxy serves the dev server from a dynamic host name.
  // `allowedHosts` only affects the dev server; production output is unchanged.
  server: { allowedHosts: true },
  build: {
    outDir: 'docs',
    emptyOutDir: true,
  },
});