import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

/**
 * The path the site is served from.
 *
 * A GitHub Pages *project* site lives under `/<repo-name>/`, so the base is
 * whatever the deploy workflow says it is (`SITE_BASE`). The default keeps the
 * historical address `https://ndt-insco.github.io/-Project-/` working for local
 * builds, which is why nothing breaks if the variable is unset.
 */
function siteBase(): string {
  const raw = (process.env.SITE_BASE ?? '').trim();
  if (!raw) return '/-Project-/';
  const trimmed = raw.replace(/^\/+|\/+$/g, '');
  return trimmed ? `/${trimmed}/` : '/';
}

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: siteBase(),
  // The preview proxy serves the dev server from a dynamic host name.
  // `allowedHosts` only affects the dev server; production output is unchanged.
  server: { allowedHosts: true },
  build: {
    outDir: 'docs',
    emptyOutDir: true,
  },
});
