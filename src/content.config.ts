import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

const articles = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/articles' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    publishDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    draft: z.boolean().default(false),
    author: z.string().optional(),
    category: z.string().optional(),
    tags: z.array(z.string()).default([]),
    /** Original amyhiltonlaw.com slug (for legacy-seo.json lookup). */
    legacySlug: z.string().optional(),
    heroImageAlt: z.string().optional(),
  }),
});

const interiorPageSchema = z.object({
  /** Canonical site path with trailing slash, for legacy-seo.json lookup. */
  sitePath: z.string(),
  /** Site-relative hero image under public/. */
  heroImage: z.string(),
  heroImageAlt: z.string().optional(),
});

const services = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/services' }),
  schema: interiorPageSchema,
});

const lawyers = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/lawyers' }),
  schema: interiorPageSchema,
});

export const collections = { articles, services, lawyers };
