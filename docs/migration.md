# FindTime migration

Source: https://findtime.net/, retrieved September 16, 2026.

## Preserved content and functionality

| Existing URL or action | New implementation |
| --- | --- |
| `/` | FindTime studio introduction, app portfolio, operating principles, team, and contact |
| `/#apps` | BiteMatch and Ashfall with their existing descriptions and release statuses |
| `/#about` | How we work and privacy principles |
| `/#founders` | Dylan Taylor and Ben Coffman, roles and biographies |
| `/#contact` | Email, support, privacy, and company details |
| `/support` | Full original support content, contact instructions, billing, refunds, FAQs, and privacy requests |
| `/legal/privacy` | Full original privacy policy, including both data tables |
| `/legal/privacy#advertising` | Existing Your Privacy Choices destination |
| `/legal/privacy#do-not-sell` | Existing sale/sharing policy anchor |
| `/legal/terms` | Full original terms and effective date |
| Contact/email links | `mailto:support@findtime.net`, without the old Cloudflare email-decoding dependency |
| Store refunds | Original external billing/refund links retained |

Support and legal pages were compared against the live source: all visible text is preserved, with email obfuscation decoded. New section anchors provide document navigation. The homepage reorganizes the original information and introduces display headlines for the new design.

The original public website had no login, checkout, contact submission endpoint, app download links, or other transactional workflow to port. BiteMatch is still labeled “Coming soon to the App Store”; Ashfall is still “In development”. Product disclosures add details already present in the original privacy policy.

## Design and implementation

- Dark surfaces, system typography, restrained GSAP reveals, original SVG app artwork, and owner-approved iPhone-style CSS illustrations present the FindTime portfolio. Preserve the phone hardware details; do not add an Apple logo. See [the design guide](design-guide.md).
- No claims that either app has launched, and no invented App Store links.
- Mobile navigation supports Escape and focus return; details disclosures work with a keyboard and without JavaScript.
- Reduced motion, increased contrast, reduced transparency, selectable text, visible keyboard focus, skip navigation, and printable legal pages are supported.
- Long privacy tables scroll within their own keyboard-focusable containers on small displays.
- Static HTML is generated per route, with canonical URLs, descriptions, Open Graph metadata, sitemap, and a 404 page.
- The site loads no tracking or session replay. Unused dependencies and unrelated media assets have been removed.

## Content to review before launch

1. **Existing privacy-policy placeholder:** the source contains `[AD PROVIDER, e.g. Google AdMob]` in sections 6 and 7. This was intentionally preserved instead of guessing or silently changing legal text. Replace it with the actual provider, or have the policy updated to match the apps' current advertising behavior.
2. **Product artwork:** current visuals are custom promotional illustrations. Replace them with approved app icons or screenshots when those assets are available.
3. **Release links:** add real store links and update the displayed release statuses when the apps ship.

## Hosting handoff

The build is in `dist/`. Preserve directory-index resolution for extensionless routes, keep the existing domain, and configure the host's 404 response. The original server's email protection is no longer needed. No live deployment, DNS changes, or external account changes were made.
