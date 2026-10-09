# FindTime agent instructions

Read `docs/design-guide.md` before changing the site's visuals. It records the owner's approved design and the implementation details to preserve.

## Owner-approved direction

- Preserve the Apple-inspired presentation and the two detailed, angled phone illustrations showing FindTime's apps. Their camera cutouts, side buttons, metallic frames, and home indicators are intentional. Do not simplify or remove them as part of a branding cleanup.
- Do not add an Apple logo or replace FindTime's app content with another company's marketing copy, wallpaper, product videos, or screenshots.
- Factual references to supported platforms, store billing, and privacy controls are intentional. Do not delete them during a branding cleanup.
- Keep tutorial promotional branding and links out of the site. Practical design guidance belongs in `docs/design-guide.md`.

## Project map and constraints

- `src/components/Home.jsx`: homepage and product illustrations.
- `src/components/Symbols.jsx`: FindTime and app artwork, authored as SVG.
- `src/index.css`: visual system, responsive rules, focus styles, and reduced-motion behavior.
- `src/App.jsx`: shared layout and GSAP reveals.
- `src/content/pages.json`: support and legal content. Do not silently rewrite policy wording, effective dates, or provider details as a visual change.
- `src/content/site.js`, `scripts/build.mjs`, `vite.config.js`: metadata, prerendered documents, and local preview routes.
- Preserve `/support`, `/legal/privacy`, `/legal/terms`, and existing hash links. Keep navigation, contact links, app statuses, and billing links functional.
- Keep the website free of analytics, session replay, external fonts, and tracking embeds. Do not invent app launch dates, store URLs, or app functionality.

## Tenant and its documentation

Tenant (https://github.com/Dog279/TENANT) is listed as the studio's third program: a card on the homepage, the `/tenant` route (`src/components/Tenant.jsx`, metadata in `src/content/site.js`), and the documentation at `/tenant/docs/`.

- The docs are **generated static pages**, not React routes. Sources are Markdown in `tenant-docs/src/<area>/<page>.md` (YAML front matter: `title`, `description`, `area`, `area-url`; quote a value that contains `: `). `sh tenant-docs/build.sh` (pandoc: `brew install pandoc`) renders them through `tenant-docs/template.html` and the shared sidebar `tenant-docs/nav.html` into `public/tenant/docs/<area>/<page>/index.html`, which Vite copies into `dist/` unchanged. Commit the Markdown **and** the generated HTML; the host runs no pandoc.
- Adding a page: create the `.md`, add its link to `tenant-docs/nav.html`, rebuild. Links are absolute and extensionless (`/tenant/docs/setup/install`); `npm run check` verifies every local link in the docs and that the template rendered.
- Styles live in `public/tenant/docs/docs.css`, which repeats the header, footer and tokens of `src/index.css` because the docs do not load the React bundle. Change both when the site's values change.
- **Versions:** `/tenant/docs/` is Latest and documents Tenant's `main`. When a Tenant release is tagged, `sh tenant-docs/build.sh && sh tenant-docs/snapshot.sh vX.Y.Z` freezes a copy under `public/tenant/docs/vX.Y.Z/` and lists it in `public/tenant/docs/versions.js`, which the header's version menu reads. Never edit a frozen copy except to correct a statement about what that version did.
- **Facts come from the TENANT repository**, not from memory: its CLI registry (`cmd/tenant/cliregistry.go`), slash-command registry (`internal/tui/cmd_*.go`), configuration types (`internal/config/*.go`), plugin descriptors (`cmd/tenant/plugin_*.go`) and dashboard routes. A Tenant pull request that changes behavior gets a docs pull request here that references it, merged when the Tenant one merges. The TENANT repository's `CLAUDE.md` maps code areas to pages.

## Verification

- Run `npm run check` after code changes. If routing changes, run the production preview and `node scripts/verify.mjs http://127.0.0.1:4173`.
- For visual changes, inspect the affected sections at desktop and mobile widths; check for clipping, horizontal overflow, heading wraps, and keyboard usability.
- The preview serves `dist/`: rebuild and reload it after editing. Do not mistake a stale preview for the current implementation.
- Prefer focused edits to existing components and selectors. Preserve the approved composition unless the user requests a redesign.
