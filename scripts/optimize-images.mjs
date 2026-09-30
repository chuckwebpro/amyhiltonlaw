/**
 * Converts site photography under public/images to WebP with display-appropriate widths.
 * Re-run safe: only processes remaining JPEG/PNG sources; skips when outputs are up to date.
 */
import sharp from 'sharp';
import { readdir, rename, stat, unlink } from 'fs/promises';
import path from 'path';

const IMAGE_ROOT = path.join('public', 'images');

/** @typedef {{ test: RegExp, responsive?: number[], maxWidth?: number, maxHeight?: number, quality?: number, format?: 'webp' | 'jpeg', keepSource?: boolean }} Profile */

/** @type {Profile[]} */
const PROFILES = [
  {
    test: /^int-banner\/[^/]+\.(jpe?g|png)$/i,
    responsive: [550, 800, 1000, 1200, 1500],
    quality: 82,
  },
  {
    test: /^(banner01|umbrella_in_rain)\.jpe?g$/i,
    responsive: [550, 800, 1000, 1200, 1500],
    quality: 82,
  },
  {
    test: /^img_mom_daughter\.jpe?g$/i,
    responsive: [570, 1140],
    quality: 82,
  },
  {
    test: /^logo-main\.png$/i,
    responsive: [306, 612],
    quality: 90,
  },
  {
    test: /^logo_ftr\.png$/i,
    responsive: [150, 246, 300],
    quality: 90,
  },
  {
    test: /^logos01-lg\.jpe?g$/i,
    responsive: [300, 600],
    quality: 82,
  },
  {
    test: /^image_2024_.*\.png$/i,
    responsive: [370, 740],
    quality: 85,
  },
  {
    test: /^icon_umbrella\.png$/i,
    responsive: [73, 146],
    quality: 90,
  },
  {
    test: /^og\.jpe?g$/i,
    maxWidth: 1200,
    maxHeight: 630,
    format: 'jpeg',
    quality: 85,
    keepSource: true,
  },
  {
    test: /^news\/[^/]+\.(jpe?g|png)$/i,
    responsive: [600, 900, 1200, 1440],
    quality: 82,
  },
];

/**
 * @param {string} dir
 * @param {string} [prefix]
 * @returns {Promise<{ rel: string, abs: string }[]>}
 */
async function listRasterImages(dir, prefix = '') {
  const entries = await readdir(dir, { withFileTypes: true });
  /** @type {{ rel: string, abs: string }[]} */
  const files = [];

  for (const entry of entries) {
    const rel = prefix ? `${prefix}/${entry.name}` : entry.name;
    const abs = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await listRasterImages(abs, rel)));
    } else if (/\.(jpe?g|png)$/i.test(entry.name)) {
      files.push({ rel: rel.replace(/\\/g, '/'), abs });
    }
  }

  return files;
}

/**
 * @param {string} rel
 * @returns {Profile | undefined}
 */
function profileFor(rel) {
  return PROFILES.find((profile) => profile.test.test(rel));
}

/**
 * @param {string} abs
 */
async function mtime(abs) {
  return (await stat(abs)).mtimeMs;
}

/**
 * @param {string} abs
 * @param {number} targetWidth
 * @param {number} quality
 */
async function writeWebpAtWidth(abs, targetWidth, quality) {
  const parsed = path.parse(abs);
  const outAbs = path.join(parsed.dir, `${parsed.name}-${targetWidth}.webp`);

  const sourceMtime = await mtime(abs);
  try {
    const outMtime = await mtime(outAbs);
    if (outMtime >= sourceMtime) {
      return outAbs;
    }
  } catch {
    // missing output
  }

  await sharp(abs)
    .rotate()
    .resize({ width: targetWidth, withoutEnlargement: true })
    .webp({ quality, effort: 4 })
    .toFile(outAbs);

  return outAbs;
}

/**
 * @param {string} abs
 * @param {Profile} profile
 */
async function optimizeInPlace(abs, profile) {
  let pipeline = sharp(abs).rotate();
  if (profile.maxWidth || profile.maxHeight) {
    pipeline = pipeline.resize({
      width: profile.maxWidth,
      height: profile.maxHeight,
      fit: 'cover',
      withoutEnlargement: true,
    });
  }

  const tmpAbs = `${abs}.opt.tmp`;
  await pipeline.jpeg({ quality: profile.quality ?? 85, mozjpeg: true }).toFile(tmpAbs);
  await unlink(abs).catch(() => {});
  await rename(tmpAbs, abs);
}

/**
 * @param {{ rel: string, abs: string }} file
 */
async function processFile(file) {
  const profile = profileFor(file.rel);
  if (!profile) {
    console.warn(`optimize-images: no profile for ${file.rel}, skipping`);
    return;
  }

  if (profile.responsive?.length) {
    for (const width of profile.responsive) {
      await writeWebpAtWidth(file.abs, width, profile.quality ?? 82);
    }
    if (!profile.keepSource) {
      await unlink(file.abs);
    }
    console.log(`optimize-images: ${file.rel} → ${profile.responsive.length} WebP sizes`);
    return;
  }

  if (profile.format === 'jpeg' && profile.keepSource) {
    await optimizeInPlace(file.abs, profile);
    console.log(`optimize-images: ${file.rel} (optimized JPEG in place)`);
    return;
  }

  console.warn(`optimize-images: unhandled profile for ${file.rel}`);
}

/** 2× for ~860px article column when sources cap at 1200px. */
async function ensureNews1440From1200() {
  const newsDir = path.join(IMAGE_ROOT, 'news');
  let entries;
  try {
    entries = await readdir(newsDir);
  } catch {
    return;
  }
  for (const name of entries) {
    if (!/-1200\.webp$/i.test(name)) continue;
    const abs = path.join(newsDir, name);
    const outAbs = abs.replace(/-1200\.webp$/i, '-1440.webp');
    const sourceMtime = await mtime(abs);
    try {
      if ((await mtime(outAbs)) >= sourceMtime) continue;
    } catch {
      // missing
    }
    await sharp(abs)
      .resize({ width: 1440, withoutEnlargement: false })
      .webp({ quality: 82, effort: 4 })
      .toFile(outAbs);
    console.log(`optimize-images: news/${name} → -1440.webp (2× column)`);
  }
}

const files = await listRasterImages(IMAGE_ROOT);
if (files.length === 0) {
  console.log('optimize-images: no JPEG/PNG sources to process');
} else {
  for (const file of files.sort((a, b) => a.rel.localeCompare(b.rel))) {
    await processFile(file);
  }
}

await ensureNews1440From1200();
