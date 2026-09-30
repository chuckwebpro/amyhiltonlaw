import legacySeo from '../data/legacy-seo.json';
import { resolveLegacyNewsImageSrc } from './legacyNewsImages';

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

/** Normalize scraped OG URLs to site-relative news image paths (or pass through other relative paths). */
export function normalizeLegacyOgImage(url: string | undefined): string | undefined {
  if (!url) return undefined;
  if (
    /^https?:\/\//i.test(url) ||
    /^\/News\//i.test(url) ||
    /^\/news\/news-images\//i.test(url) ||
    /^\/images\/news\//i.test(url)
  ) {
    return resolveLegacyNewsImageSrc(url);
  }
  if (url.startsWith('/')) return url;
  return `/${url.replace(/^\//, '')}`;
}
