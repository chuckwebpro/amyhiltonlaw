import type { Element, Root } from 'hast';
import { resolveLegacyNewsImageSrc } from './legacyNewsImages';
import {
  NEWS_ARTICLE_SIZES,
  newsArticleResponsiveSrc,
  newsArticleWebpStemFromPath,
} from './publicImages';

function rewriteImg(node: Element): void {
  if (node.tagName === 'img') {
    const src = node.properties?.src;
    if (typeof src === 'string') {
      const resolved = resolveLegacyNewsImageSrc(src);
      const stem = newsArticleWebpStemFromPath(resolved);
      if (stem) {
        const { src: imgSrc, srcset } = newsArticleResponsiveSrc(stem);
        node.properties.src = imgSrc;
        node.properties.srcset = srcset;
        node.properties.sizes = NEWS_ARTICLE_SIZES;
      } else {
        node.properties.src = resolved;
      }
    }
  }
  for (const child of node.children) {
    if (child.type === 'element') rewriteImg(child);
  }
}

/** Responsive WebP srcsets for in-article `/images/news/` images. */
export function rehypeLegacyNewsImages() {
  return (tree: Root) => {
    for (const child of tree.children) {
      if (child.type === 'element') rewriteImg(child);
    }
  };
}
