# FindTime v2

The FindTime studio website, built with React, Vite, and GSAP. Dark surfaces, spacious typography, and original product illustrations present our apps, studio, support, and policies.

## Run locally

```sh
npm ci
npm run dev
```

## Build and check

```sh
npm run check
npm run preview -- --host 127.0.0.1 --port 4173
```

`check` runs ESLint, builds the site, and verifies public routes, internal links and anchors, metadata, app release statuses, billing links, and the absence of analytics and session replay. To check the running production preview's HTTP routing as well:

```sh
node scripts/verify.mjs http://127.0.0.1:4173
```

The build generates full HTML for `/`, `/tenant`, `/support`, `/legal/privacy`, and `/legal/terms`, plus a branded `404.html`, sitemap, and robots file. The Tenant documentation under `/tenant/docs/` is a set of static pages generated from Markdown by `sh tenant-docs/build.sh` (pandoc) into `public/`, committed, and copied into `dist/` by the build; see [AGENTS.md](AGENTS.md). Navigation and document contents are available without JavaScript; React enhances the mobile menu and GSAP adds reduced-motion-aware reveal animations.

## Content and design

- `src/components/Home.jsx`: homepage, app showcases, studio, founders, and contact.
- `src/content/pages.json`: complete support, privacy, and terms content imported from the live site on September 16, 2026. Cloudflare-obfuscated email addresses were converted to standard `mailto:` links. Legal wording and effective dates are unchanged.
- `src/content/site.js`: route metadata and URL normalization.
- `src/index.css`: responsive design, accessibility states, and print styles.
- `src/components/Symbols.jsx`: original vector artwork. The phones are promotional illustrations, not screenshots of either app.
- `scripts/build.mjs`: Vite build and React server rendering into static documents.

All product artwork is defined locally in SVG and CSS. The owner-approved iPhone-style frames showcase FindTime apps without an Apple logo. No analytics, session replay, cookies, external fonts, or third-party embeds are loaded by this site.

For future edits, read [AGENTS.md](AGENTS.md) and the [design guide](docs/design-guide.md). They document the approved phone presentation, Apple-inspired design principles, current visual values, and verification workflow.

## Deployment

Publish the contents of `dist/` to your static host. Configure the host to serve directory index files for the existing extensionless URLs, and use `404.html` for missing routes with a 404 response. Do not rewrite every URL to the homepage: each public route has its own rendered document. The local preview includes this routing behavior.

Verify all four routes and `/legal/privacy#advertising` on the target host before switching findtime.net to the new build. No hosting account or DNS changes have been made by this migration.

See [the migration notes](docs/migration.md) for preserved functionality and remaining content decisions.
