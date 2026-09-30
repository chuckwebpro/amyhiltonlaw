import type { Element, Root } from 'hast';
import { resolveLegacyNewsImageSrc } from './legacyNewsImages';

function rewriteImg(node: Element): void {
  if (node.tagName === 'img') {
    const src = node.properties?.src;
    if (typeof src === 'string') {
      node.properties.src = resolveLegacyNewsImageSrc(src);
    }
  }
  for (const child of node.children) {
    if (child.type === 'element') rewriteImg(child);
  }
}

/** Rewrites `/News/news-images/...` img src in rendered article markdown to live-site URLs. */
export function rehypeLegacyNewsImages() {
  return (tree: Root) => {
    for (const child of tree.children) {
      if (child.type === 'element') rewriteImg(child);
    }
  };
}
