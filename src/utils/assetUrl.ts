/**
 * Absolute URL for a file shipped in `public/`.
 *
 * A GitHub Pages project site is served from `/<repo>/`, so a hard-coded
 * `/assets/x.jpg` points at the domain root and 404s. Everything that links to
 * a file in `public/` must go through here.
 *
 * `import.meta.env` does not exist when the tests run under Node (`tsx`), so the
 * base falls back to `/` there — the returned string is only used as expected
 * output in those tests, never fetched.
 */
export function assetBase(): string {
  const base = (import.meta as ImportMeta & { env?: { BASE_URL?: string } }).env?.BASE_URL || '/';
  return base.endsWith('/') ? base : `${base}/`;
}

export function assetUrl(relative: string): string {
  return `${assetBase()}${relative.replace(/^\/+/, '')}`;
}
