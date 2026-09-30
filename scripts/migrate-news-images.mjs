#!/usr/bin/env node
/**
 * Download legacy news article images into public/images/news/.
 *
 * Usage: node scripts/migrate-news-images.mjs
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const publicRoot = join(root, 'public', 'images', 'news');
const ORIGINS = ['https://amyhiltonlaw.com', 'https://www.amyhiltonlaw.com'];

const IMAGE_RE = /!\[[^\]]*\]\(([^)]+)\)/g;
const LEGACY_OG_RE = /"ogImage":\s*"([^"]+)"/g;

function collectPaths() {
  const paths = new Set();
  const articlesDir = join(root, 'src/content/articles');

  for (const name of readdirSync(articlesDir)) {
    if (!name.endsWith('.md')) continue;
    const body = readFileSync(join(articlesDir, name), 'utf8');
    for (const match of body.matchAll(IMAGE_RE)) {
      paths.add(match[1].trim());
    }
  }

  const legacySeo = readFileSync(join(root, 'src/data/legacy-seo.json'), 'utf8');
  for (const match of legacySeo.matchAll(LEGACY_OG_RE)) {
    paths.add(match[1].trim());
  }

  return [...paths];
}

function toLocalFile(raw) {
  const trimmed = raw.trim();
  let pathname = trimmed;
  if (/^https?:\/\//i.test(trimmed)) {
    pathname = new URL(trimmed.replace(/^http:\/\//i, 'https://')).pathname;
  }
  pathname = pathname.replace(/^\/News\//i, '/news/');

  const embedMatch = pathname.match(/^\/news\/news-images\/(?:embeds|xs|thumbnail)\/(.+)$/i);
  if (embedMatch) return embedMatch[1];

  const localMatch = pathname.match(/^\/images\/news\/(.+)$/i);
  if (localMatch) return localMatch[1];

  const rootMatch = pathname.match(/^\/news\/news-images\/(.+)$/i);
  if (rootMatch) return rootMatch[1];

  return null;
}

function remotePathsForFile(file) {
  const stem = file.replace(/\.[^.]+$/, '');
  return [
    `/news/news-images/embeds/${file}`,
    `/news/news-images/${file}`,
    `/images/news/${file}`,
    `/news/news-images/embeds/${stem}.png`,
    `/news/news-images/embeds/${stem}.jpg`,
    `/news/news-images/${stem}.png`,
    `/news/news-images/${stem}.jpg`,
  ];
}

function download(url) {
  const result = spawnSync('curl', ['-fsSL', '-A', 'amyhiltonlaw-migration/1.0', url], {
    encoding: 'buffer',
    maxBuffer: 25 * 1024 * 1024,
  });
  if (result.status !== 0) return null;
  return result.stdout;
}

const paths = collectPaths();
const files = new Set();

for (const raw of paths) {
  const file = toLocalFile(raw);
  if (file) files.add(file);
}

mkdirSync(publicRoot, { recursive: true });

let ok = 0;
let skip = 0;
let fail = 0;

for (const file of files) {
  const dest = join(publicRoot, file);

  if (existsSync(dest) && readFileSync(dest).length > 0) {
    skip++;
    console.log(`  skip ${file}`);
    continue;
  }

  let saved = false;
  for (const remotePath of remotePathsForFile(file)) {
    for (const origin of ORIGINS) {
      const buf = download(`${origin}${remotePath}`);
      if (buf && buf.length > 0) {
        writeFileSync(dest, buf);
        ok++;
        console.log(`  OK   ${file} ← ${origin}${remotePath}`);
        saved = true;
        break;
      }
    }
    if (saved) break;
  }

  if (!saved) {
    fail++;
    console.error(`  FAIL ${file}`);
  }
}

console.log(
  `Done: ${ok} downloaded, ${skip} skipped, ${fail} failed (${files.size} unique files).`,
);
