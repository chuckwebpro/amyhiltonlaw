import type { Root } from 'mdast';
import { visit } from 'unist-util-visit';
import { resolveLegacyNewsImageSrc } from './legacyNewsImages';
import { newsArticleWebpStemFromPath, publicWebpPath } from './publicImages';

/** Markdown image URLs: legacy paths → existing `-{width}.webp` assets (dev + build). */
export function remarkNewsArticleImages() {
  return (tree: Root) => {
    visit(tree, 'image', (node) => {
      if (typeof node.url !== 'string') return;
      const resolved = resolveLegacyNewsImageSrc(node.url);
      if (/^\/images\/news\/.+\.webp$/i.test(resolved)) {
        node.url = resolved;
        return;
      }
      const stem = newsArticleWebpStemFromPath(publicWebpPath(resolved));
      if (stem) {
        node.url = resolveLegacyNewsImageSrc(stem);
      }
    });
  };
}
