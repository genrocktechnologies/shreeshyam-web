# Site Plan

> **CR-01 (1 Nov 2026)** overrides this plan where they conflict: a compact site following `docs/reference/cr-01-home.png`, a tree-style team page, merged Vision & Mission and Membership pages. See `docs/cr-01-compact-redesign.md`. Proposed copy that CR-01 introduced is listed in `docs/client-review-2.md` for confirmation.

All English copy comes from `content/<slug>.json`. Section lists below say **where** the content goes, not what it says. "(new)" marks a structural element that reorganises existing content. It never introduces new claims. "(client)" means the content is pending, see client-requests.md.

## URL map (both locales: `/en/...`, `/hi/...`)
| New path | Old URL | Notes |
|---|---|---|
| `/` | index.php | |
| `/about/` | about-us.php | |
| `/about/vision-mission/` | our-mission.php, our-vision.php | CR-01: one page, Vision then Mission (`#vision`, `#mission`). Replaces `/about/mission/` and `/about/vision/`, which 301 here. |
| `/about/team/` | team.php | Old page returns 500 → built from the homepage team data, as a leadership tree (CR-01) |
| `/about/gallery/` | gallery.php | Old page returns 500 → (client) photos. Hidden (no nav item, noindex, not in the sitemap) until `gallery.enabled` in `src/data/gallery.ts`, after the client sends ≥ 12 real photos |
| `/about/milestones/` | milestone.php | |
| `/loans/` | — (new hub) | Overview of the 4 products |
| `/loans/women-empowerment/` | women-empowerment-loan.php | |
| `/loans/micro-business/` | micro-business-loan.php | |
| `/loans/agriculture-livelihood/` | agriculture-rural-livelihood-loan.php | |
| `/loans/livestock/` | livestock-loan.php | |
| `/membership/` | registration-process.php, registration.php | CR-01: process stepper, checklists, the registration form (`#register`), FAQ. Replaces `/how-to-join/` and `/register/`, which 301 here (register → `#register`). |
| `/careers/` | career.php | |
| `/hr-policy/` | our-policy.php | The page title is "Human Resource Policy", so it's labelled "HR Policy" and moves to the footer and Careers page |
| `/contact/` | contact-us.php | |
| `/privacy-policy/` | privacy-policy.php | |

- Reconcile `docs/redirect-map.md` to this table.
- `vercel.json`:
  - 301 every old `.php` URL to `/en/<new>/`.
  - Send `/` to `/hi/` when `accept-language` starts with `hi`, otherwise to `/en/` (redirect with a `has` header condition).
  - Set `cleanUrls: true` and `trailingSlash: true`.

## Navigation (CR-01)
**Top bar** (lg+, magenta): email · phone (+91 92290 88829) · address (opens Maps). WhatsApp only when confirmed.

**Main bar:** logo lockup (real emblem + typeset name + tagline; `site.logoLockup` falls back to the full logo file), then:
- Home · About Us · Vision & Mission · Loan Products ▾ (the 4 loans + All loans) · Membership · Gallery (only when `gallery.enabled`) · Contact Us
- `EN | हिं`
- The active item is a magenta pill. No desktop Register button. Full nav from 1280px; hamburger below (never wraps).

**Mobile:** lockup + language + menu. The sheet adds Our Team and Our Milestone under About Us, and Careers. The bottom `MobileActionBar` holds Register (→ `/membership/#register`) and Call (+ WhatsApp when available).

**Footer (compact, magenta):**
- Row 1: lockup · quick links (About Us · Vision & Mission · Loan Products · Membership · Careers · Contact Us) · phone and email · socials (placeholders until real URLs exist).
- Bottom bar: "© {build year} Shree Shyam Small Growth Foundation. All Rights Reserved." · Privacy Policy · HR Policy · Contact Us. Terms & Conditions only when the client supplies its text.
- The legal-details and grievance slots stay hidden in `site.ts` until supplied.

## Home (CR-01, compact)
Targets: ≤ 2.7 viewports at 1440×900 and ≤ 6 at 390×844 (footer excluded); hero and cards within 1.3 viewports on desktop; the headline and CTA above the fold on phones.
1. **Hero** (blush): script line "Together We Build a" + h1 "Stronger & Prosperous Tomorrow", intro, yellow "Join Us →" (→ Membership) and "Explore Loans →"; the real members photo in the curved panel; side slogan (desktop). All CR-01 proposed copy; revert: the old eyebrow + h1 (`home.hero.*`).
2. **Three feature cards**, overlapping the hero: Women Empowerment (→ the Women Empowerment loan), Financial Inclusion (→ Loans), Community Growth (→ About). Proposed titles; descriptions verbatim from the live services.
3. **About** (blush): the About photo in the curved panel, "About Us", the foundation's name, the **first** "About the Foundation" paragraph, "Know More →".
4. **Impact band**: proposed slogan "Small Steps Create Big Changes" | the live stats 1200+ / 150+ / 98% (never the reference's invented numbers).
5. **Loan products strip**: the 4 products with their published amount/tenure.

**Moved off home (nothing lost):** services and testimonials → About; process (3 steps) and FAQ (with FAQPage JSON-LD) → Membership; team → the Team tree; milestone → About and Milestones; the final CTA band → inner pages only (slim).

## Inner pages
- **Shared page shell:** compact hero (breadcrumb, h1, optional eyebrow and arch image), body sections, and a closing CTA band (Register / Contact).
- **Sections repeated across old pages** ("About the Foundation", milestone, team) become shared components fed from one data source. They are used only where they add value, not duplicated wholesale.

| Page | Sections |
|---|---|
| About | Intro → foundation story (both paragraphs) + "Meet the team" → What we do (6 services, 3 × 2) → Why choose → impact band → testimonials (single-card carousel) → Vision & Mission teasers → Milestone → CTA |
| Vision & Mission | One long-form page: Vision (pull-quote, body, picture), then Mission (pull-quote, goals, core values) |
| Team | **Leadership tree** (CR-01, section 5): Chairman → Leadership (MD, CEO, Founder) → Executive Directors → Heads & Officers; crawled order within tiers. Connectors run tier to tier (reporting lines unconfirmed; `reportsTo` in `team.ts` can switch to exact lines). Nested lists with tier headings; vertical tree on phones. |
| Milestones | Crawled content laid out as a vertical timeline if it contains dates; otherwise an editorial layout |
| Gallery | Masonry + lightbox. Hidden until (client) photos arrive. |
| Loans hub | Intro → 4 large LoanCards → "Who can apply" (from FAQ Q2/Q6 text) → How to Join CTA |
| Loan product (×4) | Hero (name, purpose) → all crawled sections → **KeyFacts** (amount, tenure, charges, eligibility, documents: (client), renders only the fields present) → "Documents usually needed" (FAQ Q4 text) → related loans → Register CTA |
| Membership | How to Join intro → process (3-column stepper) → benefits / eligibility / documents checklists → registration form (`#register`) → FAQ (+ FAQPage JSON-LD) |
| Careers | Crawled content → application form → link to HR Policy |
| HR Policy / Privacy | Long-form layout with sticky TOC and reading progress |
| Contact | Address card (Maps link), email, phone (client) → contact form → click-to-load map with the corrected pin (client confirms) |
| 404 | On-brand, with a seed-to-sprout illustration and links home and to Loans |

## Forms (Web3Forms → shreeshyamfoundation2026@gmail.com)
- **Register** (on `/membership/#register`):
  1. Name, mobile (10 digits, 6–9 start), age 18+ confirmation
  2. District/village, preferred loan product (4 options + "Not sure")
  3. Optional message, consent checkbox (contact by phone)
  - **No ID numbers, no uploads.**
- **Contact:** name, mobile, email (optional), subject, message.
- **Careers:** name, mobile, email, position or interest, short message.
  - CVs go by email via a mailto link, unless the client approves a paid upload option.
- **All forms:**
  - zod schemas with bilingual messages
  - Honeypot field; hCaptcha only if spam appears
  - Hidden fields: `form_name`, `locale`, `page_url`
  - Success and error states; the access key comes from `NEXT_PUBLIC_WEB3FORMS_KEY`

## SEO & metadata
- Unique title and description for every page in both locales.
  - The old site has none, so descriptions are drafted from page content and listed for client approval.
- `alternates.languages` (hreflang en/hi/x-default) and a canonical on every page.
- OG image per page, 1200×630, generated at build time by a script from a branded template.
- JSON-LD:
  - `Organization` (name, address, email, logo, `sameAs` only for real socials)
  - `BreadcrumbList` on inner pages
  - `FAQPage` on Membership (moved from Home by CR-01)
- `sitemap.xml` and `robots.txt` via the App Router metadata routes (supported in static export). The sitemap lists `/about/vision-mission/` and `/membership/` (not the retired paths) and leaves out `/about/gallery/` while `gallery.enabled` is false.
- All 32 images missing alt text get alt text in `messages/*`.
