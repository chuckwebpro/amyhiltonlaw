/**
 * Shared helpers for live-site content migration.
 */
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

export const SITE_ORIGIN = 'https://www.amyhiltonlaw.com';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

export function loadRedirects() {
  const source = readFileSync(join(root, 'src/data/article-redirects.ts'), 'utf8');
  const redirects = [...source.matchAll(/from:\s*'([^']+)',\s*\n\s*to:\s*'([^']+)'/g)].map(
    ([, from, to]) => ({ from, to }),
  );
  const legacyBlock = source.match(
    /LEGACY_ARTICLE_SLUGS:\s*readonly string\[\]\s*=\s*\[([\s\S]*?)\]\s*as const/,
  );
  const legacyFromArray = legacyBlock
    ? [...legacyBlock[1].matchAll(/'([^']+)'/g)].map((m) => m[1])
    : [];

  const toCanonical = new Map(redirects.map((r) => [r.from, r.to]));
  return { redirects, legacySlugs: legacyFromArray, toCanonical };
}

export async function fetchHtml(path) {
  const url = path.startsWith('http') ? path : `${SITE_ORIGIN}${path}`;
  const result = spawnSync('curl', ['-fsSL', '-A', 'amyhiltonlaw-migration/1.0', url], {
    encoding: 'utf8',
    maxBuffer: 20 * 1024 * 1024,
  });
  if (result.status !== 0) {
    throw new Error(result.stderr?.trim() || `curl failed for ${url}`);
  }
  return result.stdout;
}

export function extractSeo(html) {
  const meta = (name, attr = 'name') => {
    const re = new RegExp(`<meta[^>]+${attr}=["']${name}["'][^>]+content=["']([^"']*)["']`, 'i');
    const re2 = new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]+${attr}=["']${name}["']`, 'i');
    return html.match(re)?.[1] ?? html.match(re2)?.[1] ?? '';
  };

  const titleMatch = html.match(/<title[^>]*>\s*([^<]+?)\s*<\/title>/i);
  const title = titleMatch?.[1]?.replace(/\s+/g, ' ').trim() ?? '';

  const h1Match =
    html.match(/<h1[^>]*id=["']titlehero2_pageTitle["'][^>]*>([^<]+)<\/h1>/i) ??
    html.match(/<h1[^>]*>([^<]+)<\/h1>/i);

  const canonicalMatch = html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i);
  const canonicalAlt = html.match(/<link[^>]+href=["']([^"']+)["'][^>]+rel=["']canonical["']/i);

  const ogImages = [
    ...html.matchAll(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/gi),
  ].map((m) => m[1]);

  return {
    title,
    description: meta('description'),
    ogTitle: meta('og:title', 'property'),
    ogDescription: meta('og:description', 'property'),
    ogImage: ogImages[0] ?? '',
    ogImages,
    canonical: canonicalMatch?.[1] ?? canonicalAlt?.[1] ?? '',
    h1: h1Match?.[1]?.replace(/\s+/g, ' ').trim() ?? '',
  };
}

export function extractArticleBodyHtml(html) {
  const match = html.match(
    /<div class="article-content">([\s\S]*?)<\/div>\s*<div class="sidebar-container"/i,
  );
  return match?.[1]?.trim() ?? '';
}

export function htmlToMarkdown(fragment) {
  if (!fragment) return '';

  let md = fragment;
  md = md.replace(/<script[\s\S]*?<\/script>/gi, '');
  md = md.replace(/<style[\s\S]*?<\/style>/gi, '');

  md = md.replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, (_, t) => `\n\n## ${stripTags(t).trim()}\n\n`);
  md = md.replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, (_, t) => `\n\n### ${stripTags(t).trim()}\n\n`);
  md = md.replace(/<h4[^>]*>([\s\S]*?)<\/h4>/gi, (_, t) => `\n\n#### ${stripTags(t).trim()}\n\n`);

  md = md.replace(
    /<img[^>]+src=["']([^"']+)["'][^>]*alt=["']([^"']*)["'][^>]*\/?>/gi,
    (_, src, alt) => {
      const path = src.startsWith('http') ? src : src;
      return `\n\n![${alt || ''}](${path})\n\n`;
    },
  );
  md = md.replace(
    /<img[^>]+alt=["']([^"']*)["'][^>]+src=["']([^"']+)["'][^>]*\/?>/gi,
    (_, alt, src) => {
      return `\n\n![${alt || ''}](${src})\n\n`;
    },
  );
  md = md.replace(/<img[^>]+src=["']([^"']+)["'][^>]*\/?>/gi, (_, src) => `\n\n![](${src})\n\n`);

  md = md.replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, (_, t) => {
    const inner = inlineHtmlToMd(t);
    return inner.trim() ? `\n\n${inner.trim()}\n\n` : '';
  });

  md = md.replace(/<br\s*\/?>/gi, '\n');
  md = md.replace(/<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi, (_, href, text) => {
    return `[${stripTags(text).trim()}](${href})`;
  });

  md = md.replace(/<[^>]+>/g, '');
  md = md.replace(/\n{3,}/g, '\n\n');
  return md.trim();
}

function stripTags(html) {
  return html
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ');
}

function inlineHtmlToMd(html) {
  let s = html;
  s = s.replace(/<strong[^>]*>([\s\S]*?)<\/strong>/gi, '**$1**');
  s = s.replace(/<b[^>]*>([\s\S]*?)<\/b>/gi, '**$1**');
  s = s.replace(/<em[^>]*>([\s\S]*?)<\/em>/gi, '*$1*');
  s = s.replace(/<i[^>]*>([\s\S]*?)<\/i>/gi, '*$1*');
  s = s.replace(/<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi, (_, href, text) => {
    return `[${stripTags(text)}](${href})`;
  });
  return stripTags(s);
}

export function yamlEscape(value) {
  if (value == null || value === '') return '""';
  const str = String(value);
  if (/[:#\n"'&*]|^\s|\s$/.test(str)) {
    return `"${str.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
  }
  return `"${str.replace(/"/g, '\\"')}"`;
}

/** Parse news index once for article metadata keyed by legacy slug. */
export async function fetchNewsArticleMeta() {
  const html = await fetchHtml('/news/');
  const meta = new Map();

  for (const m of html.matchAll(
    /<a href="\/article\/([^"]+)">[\s\S]*?<h3>[\s\S]*?<\/i>([^<]+)<\/h3>[\s\S]*?<h2>([^<]+)<\/h2>[\s\S]*?<h5><span>([^<]+)<\/span>\s*<span>([^<]+)<\/span>/gi,
  )) {
    const [, slug, category, title, month, dayYear] = m;
    const publishDate = parseNewsDate(month, dayYear);
    meta.set(slug, { category: category.trim(), title: title.trim(), publishDate });
  }

  return meta;
}

function parseNewsDate(month, dayYear) {
  const months = {
    january: 0,
    february: 1,
    march: 2,
    april: 3,
    may: 4,
    june: 5,
    july: 6,
    august: 7,
    september: 8,
    october: 9,
    november: 10,
    december: 11,
  };
  const m = months[month.toLowerCase()];
  const [day, year] = dayYear.split(',').map((s) => s.trim());
  if (m == null || !day || !year) return '2016-01-01';
  const d = new Date(Number(year), m, Number(day));
  return d.toISOString().slice(0, 10);
}

export const STATIC_PAGE_PATHS = [
  { key: '/', path: '/' },
  { key: '/contact/', path: '/contact/' },
  { key: '/news/', path: '/news/' },
  { key: '/endorsements/', path: '/endorsements/' },
  { key: '/our-lawyers/amy-hilton/', path: '/our-lawyers/amy-hilton/' },
  { key: '/our-lawyers/hemma-gill/', path: '/our-lawyers/hemma-gill/' },
  { key: '/services/child-custody/', path: '/services/child-custody/' },
  { key: '/services/child-and-spousal-support/', path: '/services/child-and-spousal-support/' },
  { key: '/services/domestic-violence/', path: '/services/domestic-violence/' },
  { key: '/services/property-division/', path: '/services/property-division/' },
  { key: '/services/retirement/', path: '/services/retirement/' },
  { key: '/services/modifications/', path: '/services/modifications/' },
  { key: '/services/enforcement/', path: '/services/enforcement/' },
  { key: '/services/set-asides/', path: '/services/set-asides/' },
];
