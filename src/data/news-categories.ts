/** Sidebar category list mirrored from amyhiltonlaw.com/news (query slugs + labels). */
export interface NewsCategory {
  slug: string;
  label: string;
  /** Lucide icon id, e.g. `lucide:newspaper`. */
  icon: string;
  /** Legacy menu icon background alpha (blue circle). */
  tint: number;
}

export const NEWS_CATEGORIES: NewsCategory[] = [
  { slug: '', label: 'All Posts', icon: 'lucide:newspaper', tint: 1 },
  { slug: 'divorce', label: 'Divorce', icon: 'lucide:heart-crack', tint: 0.75 },
  { slug: 'child_support', label: 'Child Support', icon: 'lucide:newspaper', tint: 1 },
  { slug: 'family_law_practice', label: 'Family Law Practice', icon: 'lucide:newspaper', tint: 1 },
  { slug: 'covid_and_halloween', label: 'Covid and Halloween', icon: 'lucide:newspaper', tint: 1 },
  { slug: 'happy_holidays', label: 'Happy Holidays', icon: 'lucide:sprout', tint: 0.5 },
  { slug: 'parenting', label: 'Parenting', icon: 'lucide:newspaper', tint: 1 },
  { slug: 'child_custody', label: 'Child Custody', icon: 'lucide:baby', tint: 0.7 },
  { slug: 'family_law', label: 'Family Law', icon: 'lucide:gavel', tint: 0.8 },
  { slug: 'property_division', label: 'Property Division', icon: 'lucide:map', tint: 0.4 },
  { slug: 'retirement', label: 'Retirement', icon: 'lucide:wallet', tint: 0.9 },
  { slug: 'domestic_violence', label: 'Domestic Violence', icon: 'lucide:newspaper', tint: 0.85 },
  { slug: 'family_tips', label: 'Family Tips', icon: 'lucide:book-open', tint: 0.35 },
];

export function newsCategoryForLabel(label: string | undefined): NewsCategory | undefined {
  if (!label) return undefined;
  const normalized = label.trim().toLowerCase();
  return NEWS_CATEGORIES.find((item) => item.label.toLowerCase() === normalized);
}

export function newsCategorySlug(label: string | undefined): string {
  return newsCategoryForLabel(label)?.slug ?? '';
}
