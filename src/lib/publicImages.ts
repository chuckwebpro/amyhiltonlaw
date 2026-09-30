/** Width breakpoints for interior / home hero photography (see PageHero). */
export const HERO_IMAGE_WIDTHS = [550, 800, 1000, 1200, 1500] as const;

export const HERO_IMAGE_SIZES =
  '(min-width: 1570px) 1500px, (min-width: 1270px) 1200px, (min-width: 1070px) 1000px, (min-width: 800px) 800px, (min-width: 550px) 550px, calc(100vw - 20px)';

/** Normalizes legacy `/images/foo.jpg` paths to the WebP stem path used in markup. */
export function publicWebpPath(src: string): string {
  return src.replace(/\.(jpe?g|png)$/i, '.webp');
}

/**
 * In-article news photography (see `scripts/optimize-images.mjs` news profile).
 * Largest variant should cover ~860px column at 2× (ArticleLayout sidebar grid).
 */
export const NEWS_ARTICLE_WIDTHS = [600, 900, 1200, 1440] as const;

/**
 * Matches `.contained` widths minus 300px sidebar and `gap-10` (40px) when lg+ grid is active.
 * 1270+ → 1200−340=860; 1070+ → 1000−340=660; stacked below lg uses full contained width.
 */
export const NEWS_ARTICLE_SIZES =
  '(min-width: 1270px) 860px, (min-width: 1070px) 660px, (min-width: 800px) 780px, calc(100vw - 2rem)';

const SIZED_NEWS_WEBP = new RegExp(`-(${NEWS_ARTICLE_WIDTHS.join('|')})\\.webp$`, 'i');

/** `/images/news/foo.webp` stem — not a generated `-{width}.webp` file. */
export function isNewsArticleWebpStem(src: string): boolean {
  return /^\/images\/news\/[^/]+\.webp$/i.test(src) && !SIZED_NEWS_WEBP.test(src);
}

/** Stem or sized path → `/images/news/{name}.webp`. */
export function newsArticleWebpStemFromPath(path: string): string | undefined {
  const match = path.match(/^\/images\/news\/(.+?)(?:-\d+)?\.webp$/i);
  if (!match) return undefined;
  return `/images/news/${match[1]}.webp`;
}

/** `webpStemPath` is `/images/news/foo.webp` → sized `-{width}.webp` assets. */
export function newsArticleResponsiveSrc(webpStemPath: string): {
  src: string;
  srcset: string;
} {
  const stem = newsArticleWebpStemFromPath(webpStemPath) ?? webpStemPath;
  const base = stem.replace(/\.webp$/i, '');
  const largest = NEWS_ARTICLE_WIDTHS[NEWS_ARTICLE_WIDTHS.length - 1];
  const src = `${base}-${largest}.webp`;
  const srcset = NEWS_ARTICLE_WIDTHS.map((w) => `${base}-${w}.webp ${w}w`).join(', ');
  return { src, srcset };
}
