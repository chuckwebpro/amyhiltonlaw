#!/usr/bin/env node
/**
 * Scrape article bodies from live site → src/content/articles/{canonical-slug}.md
 *
 * Usage: node scripts/migrate-articles.mjs
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  loadRedirects,
  fetchHtml,
  extractSeo,
  extractArticleBodyHtml,
  htmlToMarkdown,
  yamlEscape,
  fetchNewsArticleMeta,
} from './migrate-lib.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const articlesDir = join(root, 'src/content/articles');

const { legacySlugs, toCanonical } = loadRedirects();
const newsMeta = await fetchNewsArticleMeta();

mkdirSync(articlesDir, { recursive: true });

let written = 0;
for (const legacySlug of legacySlugs) {
  const canonicalSlug = toCanonical.get(legacySlug) ?? legacySlug;
  const path = `/article/${legacySlug}/`;

  try {
    const html = await fetchHtml(path);
    const seo = extractSeo(html);
    const bodyHtml = extractArticleBodyHtml(html);
    const body = htmlToMarkdown(bodyHtml);

    const feed = newsMeta.get(legacySlug);
    const title = feed?.title || seo.h1 || seo.title.replace(/^Hilton Family Law - /i, '').trim();
    let description = seo.description || '';
    if (description === title || description.length < 40) {
      const firstPara = body.split('\n\n').find((p) => p.length > 40);
      if (firstPara) {
        description = firstPara.slice(0, 155).trim();
      }
    }

    const publishDate = feed?.publishDate ?? '2016-01-01';
    const category = feed?.category ?? 'Family Law';

    const frontmatter = [
      '---',
      `title: ${yamlEscape(title)}`,
      `description: ${yamlEscape(description)}`,
      `publishDate: ${publishDate}`,
      `category: ${yamlEscape(category)}`,
      `author: ${yamlEscape('Amy Hilton')}`,
      `legacySlug: ${yamlEscape(legacySlug)}`,
      '---',
      '',
    ].join('\n');

    const outFile = join(articlesDir, `${canonicalSlug}.md`);
    writeFileSync(outFile, `${frontmatter}${body}\n`, 'utf8');
    written++;
    console.log(`  OK ${legacySlug} → ${canonicalSlug}.md`);
  } catch (err) {
    console.error(`  FAIL ${legacySlug}:`, err.message);
  }
}

console.log(`Migrated ${written} articles to ${articlesDir}`);
