import type { ArticleEntry } from './articles';
import { getLegacyArticleSeo, normalizeLegacyOgImage } from './legacySeo';
import { resolveLegacyNewsImageSrc } from './legacyNewsImages';
import { site } from '../config/site';

const MARKDOWN_IMAGE_RE = /!\[[^\]]*\]\(([^)]+)\)/;
const NEWS_IMAGES_RE = /news-images/i;

/** Most legacy art lives under `embeds/`; `xs/` and `thumbnail/` are optional sizes. */
const NEWS_IMAGE_SUBDIRS = ['embeds', 'xs', 'thumbnail'] as const;

function absoluteSiteUrl(pathOrUrl: string): string {
  return resolveLegacyNewsImageSrc(pathOrUrl);
}

function defaultCardImage(): string {
  return absoluteSiteUrl(site.defaultOgImage);
}

/** First in-article image under `/news/news-images/` (legacy markdown paths). */
function firstBodyNewsImage(body: string | undefined): string | undefined {
  if (!body) return undefined;
  const match = body.match(MARKDOWN_IMAGE_RE);
  if (!match || !NEWS_IMAGES_RE.test(match[1])) return undefined;
  return absoluteSiteUrl(match[1]);
}

function newsImageFileKey(pathname: string): string | undefined {
  const marker = '/news/news-images/';
  const idx = pathname.toLowerCase().indexOf(marker);
  if (idx === -1) return undefined;
  return pathname.slice(idx + marker.length).replace(/^(embeds|thumbnail|xs)\//i, '');
}

function variantUrls(origin: string, fileKey: string, preferSubdir?: string): string[] {
  const ordered = preferSubdir
    ? [preferSubdir, ...NEWS_IMAGE_SUBDIRS.filter((s) => s !== preferSubdir)]
    : [...NEWS_IMAGE_SUBDIRS];
  return [...new Set(ordered.map((sub) => `${origin}/news/news-images/${sub}/${fileKey}`))];
}

function variantsFromNewsUrl(url: string): string[] {
  try {
    const parsed = new URL(url);
    const fileKey = newsImageFileKey(parsed.pathname);
    if (!fileKey) return [parsed.href];
    const subMatch = parsed.pathname.match(/\/news\/news-images\/(embeds|thumbnail|xs)\//i);
    const prefer = subMatch?.[1]?.toLowerCase();
    return variantUrls(parsed.origin, fileKey, prefer);
  } catch {
    return [url];
  }
}

/** Card URLs from legacy OG paths (often root `/news/news-images/{file}` without a size folder). */
function variantsFromLegacyOg(og: string): string[] {
  const normalized = normalizeLegacyOgImage(og, site.url);
  if (!normalized) return [];

  try {
    const parsed = new URL(normalized);
    const fileKey = newsImageFileKey(parsed.pathname);
    if (!fileKey) return [parsed.href];

    const dot = fileKey.lastIndexOf('.');
    const stem = dot >= 0 ? fileKey.slice(0, dot) : fileKey;
    const ext = dot >= 0 ? fileKey.slice(dot) : '';

    const keys = new Set<string>([fileKey]);
    if (!ext && /-SM$/i.test(stem)) keys.add(`${stem}.png`);
    if (!ext) keys.add(`${stem}.jpg`);

    const out: string[] = [];
    for (const key of keys) {
      out.push(...variantUrls(parsed.origin, key));
    }
    out.push(parsed.href);
    return [...new Set(out)];
  } catch {
    return [normalized];
  }
}

export interface ArticleCardImages {
  src: string;
  /** Tried in order when `src` fails to load. */
  fallbacks: string[];
}

export function getArticleCardImages(entry: ArticleEntry): ArticleCardImages {
  const terminal = defaultCardImage();

  const fromBody = firstBodyNewsImage(entry.body);
  if (fromBody) {
    const candidates = variantsFromNewsUrl(fromBody);
    return { src: candidates[0], fallbacks: [...candidates.slice(1), terminal] };
  }

  const legacy = entry.data.legacySlug ? getLegacyArticleSeo(entry.data.legacySlug) : undefined;
  const og = normalizeLegacyOgImage(legacy?.ogImage, site.url);
  if (!og) return { src: terminal, fallbacks: [] };

  const candidates = variantsFromLegacyOg(og);
  return { src: candidates[0], fallbacks: [...candidates.slice(1), terminal] };
}

/** @deprecated Use {@link getArticleCardImages} for fallback support. */
export function getArticleCardImage(entry: ArticleEntry): string {
  return getArticleCardImages(entry).src;
}

export const articleDateFormat = new Intl.DateTimeFormat('en-US', {
  month: 'long',
  day: 'numeric',
  year: 'numeric',
});

export function articleAuthor(entry: ArticleEntry): string {
  const name = entry.data.author?.trim();
  if (!name) return 'Amy Hilton Law';
  if (/law/i.test(name)) return name;
  return name;
}
