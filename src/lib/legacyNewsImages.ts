import { isNewsArticleWebpStem, newsArticleResponsiveSrc, publicWebpPath } from './publicImages';

/** Site-relative directory for migrated news/article photography. */
export const ARTICLE_IMAGES_DIR = '/images/news';

function finalizeArticleImagePath(path: string): string {
  let out = path;
  if (/^\/images\/news\/.+\.(jpe?g|png)$/i.test(out)) {
    out = publicWebpPath(out);
  }
  if (isNewsArticleWebpStem(out)) {
    return newsArticleResponsiveSrc(out).src;
  }
  return out;
}

/** Normalize legacy CMS paths and absolute URLs to sized `/images/news/{file}-{width}.webp`. */
export function resolveLegacyNewsImageSrc(src: string): string {
  const trimmed = src.trim();
  if (!trimmed) return trimmed;

  if (/^https?:\/\//i.test(trimmed)) {
    try {
      const parsed = new URL(
        trimmed.replace(/^http:\/\//i, 'https://').replace(/^https:\/\/www\./i, 'https://'),
      );
      return finalizeArticleImagePath(normalizeNewsImagePath(parsed.pathname));
    } catch {
      return trimmed;
    }
  }

  if (/^\/News\//i.test(trimmed)) {
    return finalizeArticleImagePath(
      normalizeNewsImagePath(trimmed.replace(/^\/News\//i, '/news/')),
    );
  }

  if (/^\/news\/news-images\//i.test(trimmed) || /^\/images\/news\//i.test(trimmed)) {
    return finalizeArticleImagePath(normalizeNewsImagePath(trimmed));
  }

  return trimmed;
}

export function normalizeNewsImagePath(pathname: string): string {
  const path = pathname.replace(/\/News\//gi, '/news/');

  const legacySub = path.match(/^\/news\/news-images\/(?:embeds|xs|thumbnail)\/(.+)$/i);
  if (legacySub) return `${ARTICLE_IMAGES_DIR}/${legacySub[1]}`;

  const legacyRoot = path.match(/^\/news\/news-images\/(.+)$/i);
  if (legacyRoot) return `${ARTICLE_IMAGES_DIR}/${legacyRoot[1]}`;

  const local = path.match(/^\/images\/news\/(.+)$/i);
  if (local) return `${ARTICLE_IMAGES_DIR}/${local[1]}`;

  return path;
}
