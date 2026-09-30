#!/usr/bin/env node
/**
 * Scrape legacy SEO metadata from amyhiltonlaw.com into src/data/legacy-seo.json
 *
 * Usage: node scripts/migrate-content.mjs
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { STATIC_PAGE_PATHS, fetchHtml, extractSeo, loadRedirects } from './migrate-lib.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outPath = join(root, 'src/data/legacy-seo.json');

const { legacySlugs } = loadRedirects();
const manifest = {};

console.log('Fetching static pages…');
for (const { key, path } of STATIC_PAGE_PATHS) {
  try {
    const html = await fetchHtml(path);
    manifest[key] = { path: key, ...extractSeo(html) };
    console.log(`  OK ${key}`);
  } catch (err) {
    console.error(`  FAIL ${key}:`, err.message);
    manifest[key] = { path: key, error: err.message };
  }
}

console.log(`Fetching ${legacySlugs.length} articles (legacy slug keys)…`);
for (const slug of legacySlugs) {
  const path = `/article/${slug}/`;
  try {
    const html = await fetchHtml(path);
    manifest[`/article/${slug}/`] = {
      path: `/article/${slug}/`,
      legacySlug: slug,
      ...extractSeo(html),
    };
    console.log(`  OK ${slug}`);
  } catch (err) {
    console.error(`  FAIL ${slug}:`, err.message);
    manifest[`/article/${slug}/`] = { path, legacySlug: slug, error: err.message };
  }
}

mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
console.log(`Wrote ${Object.keys(manifest).length} entries to ${outPath}`);
