#!/usr/bin/env node
/**
 * Sync Apache 301 rules in public/.htaccess from src/data/article-redirects.ts
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const redirectsPath = join(root, 'src/data/article-redirects.ts');
const htaccessPath = join(root, 'public/.htaccess');

const source = readFileSync(redirectsPath, 'utf8');
const redirects = [...source.matchAll(/from:\s*'([^']+)',\s*\n\s*to:\s*'([^']+)'/g)].map(
  ([, from, to]) => ({ from, to }),
);

if (redirects.length === 0) {
  console.error('No redirects parsed from article-redirects.ts');
  process.exit(1);
}

const begin =
  '  # ----- BEGIN ARTICLE CANONICAL SLUG 301 REDIRECTS (from src/data/article-redirects.ts) -----';
const end = '  # ----- END ARTICLE CANONICAL SLUG 301 REDIRECTS -----';

const rules = redirects
  .map(({ from, to }) => `  RewriteRule ^article/${escapeRegex(from)}/?$ /article/${to}/ [R=301,L]`)
  .join('\n');

const block = `${begin}\n${rules}\n${end}`;

let htaccess = readFileSync(htaccessPath, 'utf8');
const blockRe = new RegExp(
  `  # ----- BEGIN ARTICLE CANONICAL SLUG 301 REDIRECTS[\\s\\S]*?  # ----- END ARTICLE CANONICAL SLUG 301 REDIRECTS -----`,
);

if (blockRe.test(htaccess)) {
  htaccess = htaccess.replace(blockRe, block);
} else {
  const anchor = /(  RewriteRule \^\(\.\*\)\$ \/\$1\/ \[R=301,L\]\r?\n)(<\/IfModule>)/;
  if (!anchor.test(htaccess)) {
    console.error('Could not find mod_rewrite anchor in .htaccess');
    process.exit(1);
  }
  htaccess = htaccess.replace(anchor, `$1\n${block}\n$2`);
}

writeFileSync(htaccessPath, htaccess, 'utf8');
console.log(`Updated ${htaccessPath} with ${redirects.length} article redirect rules.`);

function escapeRegex(slug) {
  return slug.replace(/[.*+?^${}()|[\]\\-]/g, '\\$&');
}
