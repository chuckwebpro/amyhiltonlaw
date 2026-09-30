/** Width breakpoints for interior / home hero photography (see PageHero). */
export const HERO_IMAGE_WIDTHS = [550, 800, 1000, 1200, 1500] as const;

export const HERO_IMAGE_SIZES =
  '(min-width: 1570px) 1500px, (min-width: 1270px) 1200px, (min-width: 1070px) 1000px, (min-width: 800px) 800px, (min-width: 550px) 550px, calc(100vw - 20px)';

/** Normalizes legacy `/images/foo.jpg` paths to the WebP stem path used in markup. */
export function publicWebpPath(src: string): string {
  return src.replace(/\.(jpe?g|png)$/i, '.webp');
}
