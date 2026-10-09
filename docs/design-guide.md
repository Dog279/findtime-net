# FindTime design guide

This is a project-specific guide to the design the owner approved, not a recovered tutorial document. The starting project had a tutorial README and component examples, but no separate style guide. These instructions capture the useful design approach in terms of FindTime's current implementation.

## Design intent

Use the restraint and product focus of Apple's design as inspiration: generous space, large confident typography, precise alignment, believable product depth, and quiet motion. The result should feel like a carefully made app studio, with FindTime's identity and app content at the center.

The owner specifically likes the two phones showing BiteMatch and Ashfall. Preserve the complete presentation: angled devices, metallic edges, side buttons, camera cutouts, home indicators, warm BiteMatch artwork, and dark Ashfall artwork. Removing the Apple logo does not mean removing the phone details or the visual style.

Use the FindTime clock mark in navigation and the favicon. Keep Apple logos and copied product marketing assets out of the site. App illustrations are authored locally in CSS and SVG; they are promotional artwork, not actual app screenshots. Replace screen content with approved FindTime screenshots when available while retaining the device presentation. Describing this as Apple-inspired design is fine; do not imply affiliation or treat this guide as a legal clearance.

## Page composition

Keep the existing sequence and visual rhythm:

1. A slim global navigation bar, centered app label and headline, overlapping phones, then the primary action and a short studio introduction. The headline stays on one line on desktop and splits into two on mobile.
2. An elevated dark section with two app showcases, clear availability labels, and expandable details.
3. Privacy and operating principles on the base background.
4. The two founders in a quieter elevated section.
5. Centered contact information and a compact footer.

Give each section one dominant idea. Use space and type scale to establish importance before adding borders, color, or animation. Avoid turning every paragraph into a card. The phones are the hero's visual focus; supporting decoration should remain subtle.

## Existing visual values

Use `src/index.css` as the source of truth. Extend its selectors and variables rather than building a second visual system.

| Role | Current value or treatment |
| --- | --- |
| Base background | `#080808` |
| Elevated section | `#141415` |
| Primary text | `#f5f5f7` |
| Muted text | `--muted: #a1a1a6` |
| Dividers | `--line: #2b2b2e` |
| Text links | `--accent: #a4c5ff` |
| Main content width | Maximum `1120px` |
| Horizontal page insets | `48px` desktop, `32px` intermediate, `20px` mobile |
| Section spacing | `112px` desktop, `90px` intermediate, `72px` mobile |
| App card layout | Two columns, `24px` gap; one column below `700px` |
| App card corners | `24px` |
| Document callout corners | `16px` |
| Hero primary action | Blue `#0071e3` pill with white text, at least `46px` high |
| Global navigation | `52px` tall, translucent `#161617` surface, centered desktop links |
| Mobile menu control | `44 × 44px` |

Keep BiteMatch's coral, peach, and brown tones inside its product artwork and card. Use charcoal, slate, and restrained ember gold for Ashfall. The surrounding site stays neutral. Gradients should suggest lighting or material, not become broad decorative color washes.

## Navigation and hero refinement

The owner supplied a separate reference project and requested a stronger iPhone product-page feel. Keep the top bar slim: FindTime mark and name at the left, balanced navigation links in the center, and a functional email icon at the right. Use a menu button on mobile. Avoid a prominent contact pill, nonfunctional search or shopping icons, or a large header that competes with the product.

The hero uses a small “FindTime apps” label, one headline, and the detailed phones as its focal point. Place the blue primary action and the quieter studio link beneath the phones. Keep supporting copy short. Reserve sufficient vertical space for the rotated device bounds so they never overlap the controls. Desktop artwork is `520px` tall; mobile artwork is `363px` tall.

## Typography

- Use the existing platform font stack. It uses fonts installed on the visitor's device; do not download or bundle proprietary fonts.
- Hero: `clamp(48px, 6.2vw, 80px)`, `600` weight, `1.06` line height, `-.05em` tracking. Mobile uses `clamp(44px, 9.6vw, 64px)`, with the second phrase on its own line.
- Section headings: `clamp(36px, 4.5vw, 56px)`, `600` weight, `1.07` line height, `-.045em` tracking.
- Tight tracking belongs to large headings. Body copy needs natural tracking and comfortable line height, generally `1.6–1.85`.
- Small uppercase eyebrows use increased tracking and muted color. They introduce a section; they do not compete with its headline.
- Highlight a secondary headline line with muted text or the existing subtle silver gradient. Do not apply gradients to normal body text.
- Match type size to purpose. Tiny labels inside the decorative phone artwork are not a model for real navigation, body copy, or interactive controls.

## Phone artwork: preserve this composition

The artwork is in `Home.jsx`; the device geometry lives in `.hero-art`, `.device*`, and `.screen-*` CSS selectors.

| Detail | Desktop | Mobile |
| --- | --- | --- |
| Device base size | `218 × 402px`, composition scaled by `1.14` | `174 × 323px`, no extra scale |
| Outer radius | `37px` | `31px` |
| Screen radius | `30px` | `25px` |
| BiteMatch rotation | `-10deg`, in front | `-9deg`, in front |
| Ashfall rotation | `10deg`, offset down | `9deg`, offset down |
| Camera cutout | `64 × 18px` | `54 × 15px` |

Keep the screen artwork clipped inside the device. Position the two phones around the same center so the composition scales predictably. Keep the home indicator and camera cutout clear of screen text. The metallic edge uses several narrow light/dark stops; the shadow and faint halo provide depth without overpowering the artwork.

Do not restore the old product videos or 3D model to reproduce this effect. The approved phones already render from local HTML, CSS, and SVG.

## Motion and interaction

- Reuse GSAP for section reveals. The current reveal moves `24px`, fades in over `.7s`, uses `power2.out`, and runs once when the section enters view.
- Keep text present in the static HTML and readable if JavaScript fails. Avoid CSS that permanently hides content until animation runs.
- Respect `prefers-reduced-motion`. Disable spatial motion and smooth scrolling for that preference.
- Small hover and press changes should feel immediate. Existing controls use roughly `160–180ms` transitions and a subtle `.97` press scale.
- Animate transform and opacity where possible. Avoid animating layout properties, indefinite bobbing, surprise zooms, or continuous background movement.
- Keep input usable during transitions. Do not introduce scroll hijacking or require watching an animation before using a control.
- Use real links, buttons, and native details disclosures. Product availability is a status label until an actual store link exists.

## Responsive and accessible behavior

- Preserve content and functionality on mobile; reorganize rather than hiding essential information.
- Maintain a single column for app cards and principles on narrow screens. Keep the mobile menu, Escape dismissal, and visible focus indication working.
- Preserve the skip link, semantic heading order, selectable text, and the descriptive label on the decorative phone composition.
- Legal content needs readable measure and stable hierarchy. Keep wide tables inside their own keyboard-accessible scroll regions; never make the whole page scroll sideways.
- Preserve reduced-transparency and increased-contrast styles. Muted copy must remain readable against its surface.

## Editing and review workflow

1. Read this guide and inspect the affected component and CSS together.
2. Make the smallest coherent change. Reuse existing surfaces, spacing, typography, and interaction patterns.
3. Run `npm run check`. For routing changes, also run the HTTP checks described in the README.
4. Rebuild and reload the production preview. Inspect affected sections at approximately `1280px`, `390px`, and `320px` CSS viewport widths when relevant.
5. Check text wrapping, device framing, card alignment, page overflow, keyboard focus, and reduced-motion behavior. Confirm the original support and legal routes still work when touched.

Keep this guide aligned with deliberate, owner-approved visual changes. Do not silently recast a small content or branding request as a redesign.
