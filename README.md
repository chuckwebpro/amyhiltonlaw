# Hilton Family Law (amyhiltonlaw.com)

Marketing site for **Hilton Family Law** — family law practice in Antioch and the East Bay. Static HTML from [Astro](https://astro.build) 7, styled with Tailwind CSS v4 and design tokens, deployed to cPanel over FTP.

**Production:** [https://amyhiltonlaw.com](https://amyhiltonlaw.com)

---

## Stack

| Layer     | Choice                                                 |
| --------- | ------------------------------------------------------ |
| Framework | Astro 7 (static output, trailing-slash URLs)           |
| Styling   | Tailwind v4, token-generated `theme.css`               |
| Content   | Markdown collections (articles, services, lawyers)     |
| Forms     | PHP handler in `public/api/` (PHPMailer on the server) |
| Hosting   | Apache/cPanel; rules in `public/.htaccess`             |

Node **22+** (see `.nvmrc`).

---

## Local development

```bash
npm ci
npm run dev
```

Dev runs on [http://localhost:4321](http://localhost:4321). `predev` / `prebuild` regenerate the theme from `tokens/*.json` and optimize images under `public/images/`.

To exercise contact forms against a local build:

```bash
npm run php:dev
```

Requires PHP and Composer on your machine; see `docs/FORMS-AND-EMAIL.md`. Local mail config:
`public/api/config.local.php` (copy from `config.example.php`).

**Production:** copy `public/api/config.example.php` to `~/private/amyhiltonlaw-mail.php` on
cPanel (see `private/README.md`). reCAPTCHA keys can be added later in that file and in
`src/config/site.ts`.

---

## Commands

| Command                       | Purpose                                                                  |
| ----------------------------- | ------------------------------------------------------------------------ |
| `npm run dev`                 | Theme + image prep, then Astro dev server                                |
| `npm run build`               | Production build to `dist/`                                              |
| `npm run preview`             | Serve `dist/` locally                                                    |
| `npm run verify`              | `astro check` + Prettier check (same gate as CI/deploy)                  |
| `npm run format`              | Apply Prettier                                                           |
| `npm run images:optimize`     | Regenerate responsive WebP variants from source images                   |
| `npm run audit`               | Lighthouse CI + pa11y (local only; not run in GitHub Actions)            |
| `npm run migrate:all`         | Re-run legacy migration pipeline (content, articles, interior, htaccess) |
| `npm run migrate:news-images` | Pull article images into `public/images/news/`                           |

Optional style guide bundle: `STYLEGUIDE=1 npm run build`.

---

## Where to change things

| What                                            | Location                                                           |
| ----------------------------------------------- | ------------------------------------------------------------------ |
| Business name, NAP, SEO defaults, form endpoint | `src/config/site.ts`                                               |
| Header, footer, practice links                  | `src/config/navigation.ts`                                         |
| News / blog posts                               | `src/content/articles/*.md` → `/article/[slug]/`                   |
| Practice area pages                             | `src/content/services/*.md` → `/services/[slug]/`                  |
| Attorney bios                                   | `src/content/lawyers/*.md` → `/our-lawyers/[slug]/`                |
| Home, contact, news index, endorsements         | `src/pages/`                                                       |
| Brand colors, type scale                        | `tokens/*.json` (do not edit generated `src/styles/theme.css`)     |
| Logos, heroes, article art                      | `public/images/`                                                   |
| Apache redirects, caching, HTTPS                | `public/.htaccess` (+ generated legacy rules from migrate scripts) |
| Canonical origin                                | `astro.config.mjs` → `site` (must match `site.ts` → `url`)         |

Article bodies may reference legacy `/News/…` image paths; build plugins rewrite those to local `/images/news/…`. Every asset the site loads must exist in this repo, not on the old host.

---

## Layout and theming

Pages are built from a block library using **Section → Container → content**. Responsive behavior is desktop-first (`max-*` breakpoints). Details: `docs/RESPONSIVE-RULES.md`, `docs/THEMING.md`.

---

## GitHub Actions

| Workflow                                    | Trigger                       | What it does                                                            |
| ------------------------------------------- | ----------------------------- | ----------------------------------------------------------------------- |
| **CI** (`.github/workflows/ci.yml`)         | Push to `main`, pull requests | `npm run verify`, `npm run build`                                       |
| **Deploy** (`.github/workflows/deploy.yml`) | Push to `main`, manual        | `verify` → PHPMailer in `public/api` → `build` → FTPS upload of `dist/` |

Deploy secrets: `FTP_SERVER`, `FTP_USERNAME`, `FTP_PASSWORD`, `FTP_SERVER_DIR`. Server setup: `docs/HOSTING.md`.

`trailingSlash: 'always'` and `build.format: 'directory'` are paired on purpose — change one only if you understand the Apache URL implications (`docs/HOSTING.md`).

---

## Documentation

| Doc                           | Topics                                                                  |
| ----------------------------- | ----------------------------------------------------------------------- |
| `docs/HOSTING.md`             | cPanel, FTP deploy, SSL, analytics logs                                 |
| `docs/FORMS-AND-EMAIL.md`     | PHP submit handler, mail config, reCAPTCHA                              |
| `docs/THEMING.md`             | Design tokens and rebranding                                            |
| `docs/RESPONSIVE-RULES.md`    | Breakpoints and layout conventions                                      |
| `docs/NEW-PROJECT.md`         | Starter checklist (useful when cloning the template for another client) |
| `docs/ADDING-A-COLLECTION.md` | Adding new content types                                                |

---

## Starter lineage

The repo began from **astro-business-starter** (same `package.json` name). This project is fully configured for Hilton Family Law; use `docs/NEW-PROJECT.md` only when spinning up a new client from the same base.
