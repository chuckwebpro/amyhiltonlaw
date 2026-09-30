/**
 * Emit Apache 301 rules for legacy *.aspx URLs from legacy-seo.json canonical fields.
 * Run: node scripts/generate-legacy-path-htaccess.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const manifest = JSON.parse(readFileSync(join(root, 'src/data/legacy-seo.json'), 'utf8'));
const htaccessPath = join(root, 'public/.htaccess');

const rules = new Set();

for (const entry of Object.values(manifest)) {
  const canonical = entry.canonical;
  if (!canonical || !canonical.includes('default.aspx')) continue;
  const url = new URL(canonical);
  const legacyPath = url.pathname.replace(/^\//, '').replace(/\/$/, '');
  const cleanPath = url.pathname.replace(/\/default\.aspx\/?$/i, '/').replace(/^\//, '');
  if (!legacyPath.toLowerCase().includes('default.aspx')) continue;
  const from = legacyPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const to = `/${cleanPath.endsWith('/') ? cleanPath : `${cleanPath}/`}`;
  rules.add(`  RewriteRule ^${from}/?$ ${to} [R=301,L]`);
}

const block = [
  '',
  '  # ----- BEGIN LEGACY default.aspx 301 REDIRECTS (from legacy-seo.json) -----',
  '  # Regenerate: node scripts/generate-legacy-path-htaccess.mjs',
  ...[...rules].sort(),
  '  # ----- END LEGACY default.aspx 301 REDIRECTS -----',
  '',
].join('\n');

let htaccess = readFileSync(htaccessPath, 'utf8');
const begin = '# ----- BEGIN LEGACY default.aspx 301 REDIRECTS';

if (htaccess.includes(begin)) {
  htaccess = htaccess.replace(
    /# ----- BEGIN LEGACY default.aspx 301 REDIRECTS[\s\S]*?# ----- END LEGACY default\.aspx 301 REDIRECTS -----\n?/,
    block.trimStart(),
  );
} else {
  htaccess = htaccess.replace(
    '  # ----- END ARTICLE CANONICAL SLUG 301 REDIRECTS -----',
    `  # ----- END ARTICLE CANONICAL SLUG 301 REDIRECTS -----\n${block}`,
  );
}

writeFileSync(htaccessPath, htaccess);
console.log(`Wrote ${rules.size} legacy path redirect(s) to public/.htaccess`);
