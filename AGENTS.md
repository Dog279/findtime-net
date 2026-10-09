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

## Verification

- Run `npm run check` after code changes. If routing changes, run the production preview and `node scripts/verify.mjs http://127.0.0.1:4173`.
- For visual changes, inspect the affected sections at desktop and mobile widths; check for clipping, horizontal overflow, heading wraps, and keyboard usability.
- The preview serves `dist/`: rebuild and reload it after editing. Do not mistake a stale preview for the current implementation.
- Prefer focused edits to existing components and selectors. Preserve the approved composition unless the user requests a redesign.
