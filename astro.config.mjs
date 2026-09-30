import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import icon from 'astro-icon';
import tailwindcss from '@tailwindcss/vite';
import { rehypeLegacyNewsImages } from './src/lib/rehypeLegacyNewsImages.ts';
import { remarkNewsArticleImages } from './src/lib/remarkNewsArticleImages.ts';

const EXCLUDED_FROM_SITEMAP = ['/thank-you/', '/styleguide/'];

// https://astro.build/config
export default defineConfig({
  site: 'https://amyhiltonlaw.com',
  output: 'static',
  trailingSlash: 'always',
  build: {
    format: 'directory',
    /** Inlines site CSS in HTML so LCP is not blocked on a separate stylesheet request. */
    inlineStylesheets: 'always',
  },
  integrations: [
    mdx(),
    icon(),
    sitemap({
      filter: (page) => {
        const path = new URL(page).pathname;
        return !EXCLUDED_FROM_SITEMAP.some((excluded) => path.startsWith(excluded));
      },
    }),
  ],
  markdown: {
    remarkPlugins: [remarkNewsArticleImages],
    rehypePlugins: [rehypeLegacyNewsImages],
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
