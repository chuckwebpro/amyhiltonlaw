import legacySeo from '../data/legacy-seo.json';

export interface LegacySeoEntry {
  path: string;
  title?: string;
  description?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  canonical?: string;
  h1?: string;
  legacySlug?: string;
}

const manifest = legacySeo as Record<string, LegacySeoEntry>;

/** Lookup by site path, e.g. `/article/divorce-season/` or `/contact/`. */
export function getLegacySeo(path: string): LegacySeoEntry | undefined {
  const normalized = path.endsWith('/') ? path : `${path}/`;
  return manifest[normalized];
}

/** Article pages are keyed by legacy slug in the manifest. */
export function getLegacyArticleSeo(legacySlug: string): LegacySeoEntry | undefined {
  return getLegacySeo(`/article/${legacySlug}/`);
}

/** Prefer HTTPS and site default when legacy OG URLs are http or extensionless. */
export function normalizeLegacyOgImage(
  url: string | undefined,
  siteOrigin: string,
): string | undefined {
  if (!url) return undefined;
  const fixed = url.replace(/^http:\/\//i, 'https://').replace(/^https:\/\/www\./i, 'https://');
  if (fixed.startsWith('https://')) return fixed;
  return new URL(fixed, siteOrigin).href;
}
