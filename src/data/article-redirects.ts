/**
 * Legacy CMS article slugs → canonical slugs for `/article/{slug}/`.
 *
 * Keys are slug segments only (no `/article/` prefix). Content files and routes
 * use the canonical slug. All other legacy slugs match canonical 1:1 — no redirect
 * entry required (19 articles unchanged at audit).
 *
 * Regenerate Apache rules: `node scripts/generate-article-htaccess.mjs`
 */

export type ArticleRedirect = {
  /** Legacy slug from amyhiltonlaw.com (inbound links, bookmarks). */
  from: string;
  /** Canonical slug used in `src/content/articles/` and sitemap. */
  to: string;
};

/** Nine slug normalizations from migration audit; remaining 19 articles keep legacy slug. */
export const ARTICLE_REDIRECTS: readonly ArticleRedirect[] = [
  {
    from: 'cal-exit---a-move-away-trend-in-california',
    to: 'cal-exit-a-move-away-trend-in-california',
  },
  {
    from: 'covid-19---here-for-the-long-haul',
    to: 'covid-19-here-for-the-long-haul',
  },
  {
    from: 'my-ex-is-a-narcissist--honey-they-all-are',
    to: 'my-ex-is-a-narcissist-honey-they-all-are',
  },
  {
    from: 'co-parenting-covid-19-and-halloween-',
    to: 'co-parenting-covid-19-and-halloween',
  },
  {
    from: 'the-honor-and-responsibility-of-mentoring-female-attorneys-',
    to: 'the-honor-and-responsibility-of-mentoring-female-attorneys',
  },
  {
    from: 'co-parenting-the-journey-you-never-wanted-to-take-and-how-to-make-it-right-for-the-kids',
    to: 'co-parenting-the-journey-you-never-wanted-to-take',
  },
  {
    from: 'helping-your-kids-heal-after-a-divorce',
    to: 'helping-your-kids-heal-after-a-divorce-part-two',
  },
  {
    from: 'high-cost-of-the-unknown-with-divorce',
    to: 'high-cost-of-the-unknown-in-a-divorce',
  },
  {
    from: 'you-marriage-ended-but-your-parenting-job-has-not',
    to: 'your-marriage-ended-but-your-parenting-job-has-not',
  },
] as const;

const legacyToCanonical = new Map<string, string>(
  ARTICLE_REDIRECTS.map(({ from, to }) => [from, to]),
);

/** Resolve a legacy or already-canonical slug to the canonical content slug. */
export function canonicalArticleSlug(slug: string): string {
  return legacyToCanonical.get(slug) ?? slug;
}

/** All legacy article slugs (for scraping and legacy-seo.json keys). */
export const LEGACY_ARTICLE_SLUGS: readonly string[] = [
  'a-divorce-attorney-can-save-you-money',
  'cal-exit---a-move-away-trend-in-california',
  'co-parenting-covid-19-and-halloween-',
  'co-parenting-the-journey-you-never-wanted-to-take-and-how-to-make-it-right-for-the-kids',
  'covid-19---here-for-the-long-haul',
  'divorce-dads-and-child-development',
  'divorce-impact-on-children',
  'divorce-season',
  'domestic-violence-is-so-much-more-than-physical',
  'happy-blended-family-holidays',
  'helping-your-kids-heal-after-a-divorce',
  'helping-your-kids-heal-after-a-divorce-part-one',
  'high-cost-of-the-unknown-with-divorce',
  'high-net-worth-divorce',
  'honesty-is-the-best-policy',
  'how-to-avoid-hiring-a-divorce-attorney-like-me',
  'legally-untangling-comingled-property',
  'make-mothers-day-great-for-your-ex',
  'my-ex-is-a-narcissist--honey-they-all-are',
  'my-favorite-practice-is-the-practice-of-giving',
  'property-division',
  'single-parenting-for-the-holidays',
  'suddenly-single-for-the-holidays',
  'the-formula-for-child-support',
  'the-honor-and-responsibility-of-mentoring-female-attorneys-',
  'tips-for-making-a-blended-family-a-healthy-family',
  'vanishing-military-retirement',
  'you-marriage-ended-but-your-parenting-job-has-not',
] as const;
