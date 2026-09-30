import type { ArticleEntry } from './articles';
import { getLegacyArticleSeo, normalizeLegacyOgImage } from './legacySeo';
import { ARTICLE_IMAGES_DIR, resolveLegacyNewsImageSrc } from './legacyNewsImages';
import {
  newsArticleResponsiveSrc,
  newsArticleWebpStemFromPath,
  publicWebpPath,
} from './publicImages';
import { site } from '../config/site';

const MARKDOWN_IMAGE_RE = /!\[[^\]]*\]\(([^)]+)\)/;
const ARTICLE_IMAGE_RE = /(?:news-images|\/images\/news\/)/i;

function defaultCardImage(): string {
  return site.defaultOgImage;
}

function articleImagePath(fileName: string): string {
  return publicWebpPath(`${ARTICLE_IMAGES_DIR}/${fileName}`);
}

/** Post card / OG: largest generated WebP variant. */
function articleCardDisplaySrc(webpStem: string): string {
  return newsArticleResponsiveSrc(webpStem).src;
}

function fileNameFromPath(pathname: string): string | undefined {
  const stem = newsArticleWebpStemFromPath(resolveLegacyNewsImageSrc(pathname));
  if (!stem) return undefined;
  return stem.replace(/^\/images\/news\//i, '');
}

/** First in-article image (legacy or `/images/news/` paths). */
function firstBodyNewsImage(body: string | undefined): string | undefined {
  if (!body) return undefined;
  const match = body.match(MARKDOWN_IMAGE_RE);
  if (!match || !ARTICLE_IMAGE_RE.test(match[1])) return undefined;
  return resolveLegacyNewsImageSrc(match[1]);
}

function candidatePathsForFileName(fileName: string): string[] {
  const dot = fileName.lastIndexOf('.');
  const stem = dot >= 0 ? fileName.slice(0, dot) : fileName;
  const ext = dot >= 0 ? fileName.slice(dot) : '';

  const names = new Set<string>([fileName]);
  if (!ext && /-SM$/i.test(stem)) {
    names.add(`${stem}.png`);
    names.add(`${stem.replace(/-SM$/i, '')}.png`);
  }
  if (!ext) {
    names.add(`${stem}.png`);
    names.add(`${stem}.jpg`);
  }

  return [...names].map((name) => articleCardDisplaySrc(articleImagePath(name)));
}

function variantsFromResolved(resolved: string): string[] {
  const fileName = fileNameFromPath(resolved);
  if (!fileName) return [resolveLegacyNewsImageSrc(resolved)];
  return candidatePathsForFileName(fileName);
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
    return { src: fromBody, fallbacks: [terminal] };
  }

  const legacy = entry.data.legacySlug ? getLegacyArticleSeo(entry.data.legacySlug) : undefined;
  const og = normalizeLegacyOgImage(legacy?.ogImage);
  if (!og) return { src: terminal, fallbacks: [] };

  const candidates = variantsFromResolved(og);
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
