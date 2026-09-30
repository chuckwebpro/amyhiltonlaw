# Starting a new project

`README.md` has the authoritative file checklist. This is the order to work in.

## 1. Clone

```bash
npx degit your-org/astro-business-starter client-name
cd client-name
npm install
npm run dev
```

The demo brand builds and renders immediately. If a fresh clone does not build
untouched, something is wrong with the starter, not the project.

## 2. Identity

- `astro.config.mjs` → `site`: the production origin, no trailing slash.
- `public/robots.txt` → the `Sitemap:` line.
- `src/config/site.ts` → name, tagline, description, NAP, hours, socials, and
  `business.schemaType` (pick the most specific match — `Plumber` beats
  `LocalBusiness`).
- `public/favicon.svg` and `src/assets/logo.svg`.

## 3. Theme

Replace the brand ramp in `tokens/color.json`, then the type in
`tokens/typography.json` if the client has a specified typeface. The theme
regenerates on the next `dev` or `build`.

Check `/styleguide` before touching any page — it is faster to fix contrast and
hierarchy there than across a finished site. See `docs/THEMING.md`.

## 4. Navigation

`src/config/navigation.ts` — the primary tree, header CTA, footer groups, and legal
links. One tree drives the mega menu, the mobile drawer, and the footer.

Keep mega panels lean: that markup ships in the HTML of every page.

## 5. Pages

Three ship: `/`, `/404`, `/thank-you/`. Add the rest under `src/pages/`, assembling
from `src/components/blocks/`. Copy the demo `index.astro` as a starting shape and
replace its content.

Blocks are props-only. Pass data in; never query content from inside a block.

## 6. Content (only if needed)

If the site has a blog or similar, follow `docs/ADDING-A-COLLECTION.md`. If it does
not, skip this entirely — no collection ships by default and nothing needs removing.

## Site replacement (migrating an existing live site)

If this project **replaces** a site already on the web (same or new domain):

1. Copy `.cursor/rules/capture-migrated-media.mdc` from `_templates/cursor-rules/` if the
   rule is not already present (it should also live in your user-wide `~/.cursor/rules/`).
2. **Inventory every asset** — article images, OG images from scraped SEO, PDFs, fonts, hero
   photography referenced in HTML or markdown.
3. **Download into `public/`** (or `src/assets/`) and commit the binaries. Add a script such as
   `npm run migrate:news-images` so assets can be refreshed deliberately, not by hand once.
4. **Reference site-relative paths** in content (`/news/...`, `/images/...`). Do not rewrite
   markup to the old production hostname.
5. **Before launch**, confirm built HTML does not load images from the previous host. Missing
   files in git are a release blocker.

A replacement without captured media is not deployable — the old server will not be there forever.

## 7. Forms and tracking

- `site.ts` → `formEndpoint` (`/api/submit.php`) and `recaptchaSiteKey`. Set up the PHP
  mail config on the server — see `docs/FORMS-AND-EMAIL.md`. Submit the form once and
  confirm it lands, including the redirect to `/thank-you/`.
- Analytics IDs are optional and per-platform. **Leave them blank unless the client
  is running paid ads** — server log analytics covers traffic reporting and costs
  the page nothing. See `docs/HOSTING.md`.
- Only set `consent: 'banner'` if the client sells into the EU/UK or is large enough
  to trigger CCPA/CPRA. A privacy policy page is required whenever Meta or Google
  tags are enabled.

## 8. Ship

Server setup, secrets, and the deploy pipeline are in `docs/HOSTING.md`.

Before handover:

```bash
npm run verify   # types + formatting
npm run build
npm run audit    # Lighthouse + pa11y
```

Then check on the real server: `.htaccess` redirects, a bad URL serving the 404,
`robots.txt` resolving, and both `/about` and `/about/` landing without a redirect
chain.
