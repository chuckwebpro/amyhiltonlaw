import { site } from '../config/site';

/** Normalize legacy article image paths to absolute HTTPS URLs on the live site. */
export function resolveLegacyNewsImageSrc(src: string): string {
  const trimmed = src.trim();
  if (!trimmed) return trimmed;

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed
      .replace(/^http:\/\//i, 'https://')
      .replace(/^https:\/\/www\./i, 'https://')
      .replace(/\/News\//gi, '/news/');
  }

  if (/^\/News\//i.test(trimmed) || /^\/news\/news-images\//i.test(trimmed)) {
    const path = trimmed.replace(/^\/News\//i, '/news/');
    return new URL(path, site.url).href;
  }

  return trimmed;
}
