import { createMarkdownProcessor } from '@astrojs/markdown-remark';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
import { rehypeLegacyNewsImages } from './rehypeLegacyNewsImages';
import { remarkNewsArticleImages } from './remarkNewsArticleImages';

/**
 * Glob-loaded articles are pre-rendered in the content layer without
 * `astro.config` remark/rehype plugins. Re-render `entry.body` here so
 * in-article news images get current srcset/sizes.
 */
let processorPromise: ReturnType<typeof createMarkdownProcessor> | undefined;

function getArticleMarkdownProcessor() {
  processorPromise ??= createMarkdownProcessor({
    gfm: true,
    smartypants: true,
    remarkPlugins: [remarkNewsArticleImages],
    rehypePlugins: [rehypeLegacyNewsImages],
  });
  return processorPromise;
}

export async function renderArticleBody(body: string, filePath?: string) {
  const processor = await getArticleMarkdownProcessor();
  const fileURL = filePath ? pathToFileURL(path.resolve(filePath)) : undefined;
  return processor.render(body, fileURL ? { fileURL } : undefined);
}
