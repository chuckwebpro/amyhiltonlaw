#!/usr/bin/env node
/**
 * Scrape service and lawyer interior pages into content collections + hero images.
 * Usage: node scripts/migrate-interior-pages.mjs
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { join, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { fetchHtml, htmlToMarkdown, yamlEscape, SITE_ORIGIN } from './migrate-lib.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

function extractInterior(html) {
  const hero = html.match(/hero-image[^>]+style="background-image:url\(([^)]+)\)/i)?.[1] ?? '';
  const match = html.match(
    /<section class="interior-content">\s*<div class="contained">([\s\S]*?)<\/div>\s*<\/section>/i,
  );
  const bodyHtml = match?.[1]?.trim() ?? '';
  return { hero, md: htmlToMarkdown(bodyHtml) };
}

function downloadAsset(remotePath, localPath) {
  const url = remotePath.startsWith('http') ? remotePath : `${SITE_ORIGIN}${remotePath}`;
  mkdirSync(dirname(localPath), { recursive: true });
  const result = spawnSync(
    'curl',
    ['-fsSL', '-A', 'amyhiltonlaw-migration/1.0', '-o', localPath, url],
    {
      stdio: 'inherit',
    },
  );
  if (result.status !== 0) throw new Error(`Failed to download ${url}`);
}

const pages = [
  { collection: 'services', slug: 'child-custody', path: '/services/child-custody/' },
  {
    collection: 'services',
    slug: 'child-and-spousal-support',
    path: '/services/child-and-spousal-support/',
  },
  { collection: 'services', slug: 'property-division', path: '/services/property-division/' },
  { collection: 'services', slug: 'retirement', path: '/services/retirement/' },
  { collection: 'services', slug: 'domestic-violence', path: '/services/domestic-violence/' },
  { collection: 'services', slug: 'modifications', path: '/services/modifications/' },
  { collection: 'services', slug: 'enforcement', path: '/services/enforcement/' },
  { collection: 'services', slug: 'set-asides', path: '/services/set-asides/' },
  { collection: 'lawyers', slug: 'amy-hilton', path: '/our-lawyers/amy-hilton/' },
  { collection: 'lawyers', slug: 'hemma-gill', path: '/our-lawyers/hemma-gill/' },
];

for (const page of pages) {
  console.log(`Fetching ${page.path}…`);
  const html = await fetchHtml(page.path);
  const { hero, md } = extractInterior(html);
  if (!hero || !md) {
    console.warn(`  WARN missing hero or body for ${page.path}`);
  }

  const heroFile = basename(hero.replace(/^\//, ''));
  const localHero = `/images/int-banner/${heroFile}`;
  const heroDisk = join(root, 'public', 'images', 'int-banner', heroFile);
  if (hero) {
    console.log(`  Download ${hero} -> ${localHero}`);
    downloadAsset(hero, heroDisk);
  }

  const outDir = join(root, 'src/content', page.collection);
  mkdirSync(outDir, { recursive: true });
  const frontmatter = [
    '---',
    `sitePath: ${yamlEscape(page.path)}`,
    `heroImage: ${yamlEscape(localHero)}`,
    '---',
    '',
  ].join('\n');
  const outPath = join(outDir, `${page.slug}.md`);
  writeFileSync(outPath, frontmatter + md + '\n', 'utf8');
  console.log(`  Wrote ${outPath}`);
}

console.log('Done.');
