import { getCollection, type CollectionEntry } from 'astro:content';

export type ArticleEntry = CollectionEntry<'articles'>;

/** Drafts render in `dev` and disappear from production builds. */
export async function getPublished(): Promise<ArticleEntry[]> {
  const entries = await getCollection('articles', ({ data }) => {
    return import.meta.env.DEV || data.draft !== true;
  });

  return entries.sort((a, b) => b.data.publishDate.valueOf() - a.data.publishDate.valueOf());
}

export function readingTime(body: string | undefined): string {
  const words = (body ?? '').trim().split(/\s+/).length;
  return `${Math.max(1, Math.round(words / 200))} min read`;
}

/** Same category first, then most recent. */
export function related(all: ArticleEntry[], current: ArticleEntry, limit = 3): ArticleEntry[] {
  return all
    .filter((entry) => entry.id !== current.id)
    .sort((a, b) => {
      const aMatch = a.data.category === current.data.category ? 1 : 0;
      const bMatch = b.data.category === current.data.category ? 1 : 0;
      return bMatch - aMatch;
    })
    .slice(0, limit);
}

/** All published posts for the article sidebar (newest first). */
export function sidebarPosts(all: ArticleEntry[]): ArticleEntry[] {
  return [...all].sort((a, b) => b.data.publishDate.valueOf() - a.data.publishDate.valueOf());
}
