# Design System — CR-01 "Compact"

CR-01 (client change request, 1 Nov 2026; `docs/cr-01-compact-redesign.md`) replaced the earlier "Marigold Thread" direction. The visual source is `docs/reference/cr-01-home.png`. The reference is **not** a content source: its statistics, logo and AI-style photos are never used (CR-01, section 0).

## Concept
- **Compact:** visitors reach what matters with less scrolling. The hero, the three cards and About sit in the first two screens (NN/g: about 57% of viewing time is above the fold, 74% within two screenfuls).
- **Magenta and yellow:** the client's pink and yellow, as in the reference. Magenta (`rani-500`) carries the brand: top bar, active nav pill, icons, footer, headings. Yellow (`marigold-400`) is a **fill only**: CTA buttons, the curved photo bands, the stats panel, tree connectors.
- **Signature shape:** the **curved yellow frame**: a photo panel whose leading edge is an organic curve, hugged by a marigold band that draws in. It replaces the arch on home and the page-long Golden Thread. The thread's motif lives on as the yellow frames, the Team tree's connectors and the Membership stepper line.
- **Warm, dignified, calm:** soft pink surfaces (`blush`), white cards with a soft pink shadow, few decorations.

## Colour tokens (`tailwind.config.ts` → `theme.extend.colors`)
Token names were kept, so components didn't change; the values follow the reference.
```ts
rani: {
  50:'#FFF1F7',   // light pink surfaces
  100:'#FFD9E8',200:'#FFB3D0',300:'#FF80B1',400:'#F2489A',
  500:'#D71978',  // primary magenta: top bar, active nav pill, icons, footer, h1
  600:'#C21869',  // pink text, h2, card titles, hover
  700:'#9C1149',800:'#740D37',900:'#4A0823',
},
marigold: {
  50:'#FFFBEB',100:'#FFF2C2',200:'#FFE88A',300:'#FFDF5C',
  400:'#FFD52E',  // CTA buttons, yellow frames, stats panel (fill only)
  500:'#F9C900',  // hover and borders on yellow
  600:'#C98500',700:'#9A6300',
},
blush: '#FCEAF2',  // soft pink section backgrounds (hero, About, testimonials)
cocoa: '#683B20',  // second line of the header name
plum:  { 700:'#5A2140', 800:'#3E1530', 900:'#2B0E21' }, // TEXT ONLY (e.g. on yellow buttons)
ivory: { DEFAULT:'#FFFCF6', 100:'#FFF8EC' },
ink:   { DEFAULT:'#29232B', muted:'#6B5560', faint:'#A8949E' },
success:'#1F8A5B', danger:'#C62828',
```

### Contrast (WCAG 2.2 AA): `pnpm exec tsx scripts/contrast.ts`
The script reads the tokens and checks every pair the design uses; axe checks the rendered pages.

| Use | Pair | Ratio |
|---|---|---|
| h1, large pink text | `rani-500` on white / ivory / blush | 4.9 / 4.8 / 4.2 (large text only) |
| Pink text < 24px | `rani-600` on white / blush | 5.8 / 5.0 |
| Body | `ink` on white / blush | 15.3 / 13.3 |
| Top bar, footer, active pill | white on `rani-500` | 4.9 |
| Yellow buttons, stats panel | `plum-900` on `marigold-400` | 12.5 |
| Stat labels on yellow | `rani-700` on `marigold-400` | 5.7 (`rani-600` only for the ≥ 32px bold numbers: 4.1) |
| Header name, line 2 | `cocoa` on the bar gradient | ≥ 8.4 |
| ❌ Never | yellow text on light backgrounds; white text on yellow | fails |

### Surfaces
- Page: `ivory`. Hero, About band, testimonials, checklists: `blush`. Feature-card band, milestone band, form band: `rani-50`.
- Top bar, CTA band, footer: `rani-500`. The plum bands are gone (plum is a text colour only).
- Impact band: a diagonal split, magenta | yellow (`.impact-split`).
- Cards: white, `rounded-2xl`, `shadow-soft`, no border.

## Typography (`src/app/fonts.ts`, `next/font/google`)
| Role | English | Hindi | Sizes (mobile → desktop) |
|---|---|---|---|
| Display (h1) | **Merriweather** 700, `rani-500` | Tiro Devanagari Hindi 400 | 34 → 56px (`text-display`), leading 1.15 (HI 1.25) |
| h2 | Merriweather 700, `rani-600` | Tiro Devanagari Hindi | 26 → 38px, leading 1.2 (HI 1.3) |
| Card title / h3 | Merriweather 700, `rani-600` | Tiro (via `.font-display`) | 18 → 21px |
| Header name | Merriweather 900 ("SHREE SHYAM") / 700 (line 2) | Tiro | see Logo lockup |
| Body, nav, buttons | **Poppins** 400/500/600/700 | Poppins (Devanagari subset) | 16 → 17px, leading 1.7 (HI 1.85) |
| Eyebrow | Poppins 600, `rani-600`, sentence case, with a 24px yellow dash | same | 15px |
| Script accent | **Dancing Script** 600/700 | **Kalam** 700 (Dancing Script has no Devanagari) | 24 → 38px (`text-accent`) |
| Numbers (stats) | Merriweather 700, `tabular-nums` | same | 32 → 44px |

- CSS variables on `<html>`: `--font-display`, `--font-display-hi`, `--font-body`, `--font-script`, `--font-script-hi`. `:lang(hi)` swaps the display and script faces and raises line-heights.
- **Preloads:** only Latin files are preloaded (Merriweather, Poppins, Dancing Script). Tiro, Kalam and Poppins' Devanagari files are never preloaded, so English pages don't download Hindi fonts.
- **Hindi pages (Phase 7):** body text uses a second Poppins instance with `display: optional` (`poppinsHi`, via `:root:lang(hi)`), and Tiro and Kalam are `optional` too: when Poppins' Devanagari file swapped in late, Hindi text re-flowed and the headline re-wrapped (CLS up to 0.084 on a throttled phone; now 0). The trade-off: on a cold first visit over a slow connection, Hindi text can show in the phone's own Devanagari font for that page; the next page uses the cached faces. Dancing Script (English only) is `swap`.
- **Latin inside Hindi pages:** names and the organisation's name stay in Latin script; where they use the display face they carry `lang="en"` (`latinLang()`), so they keep Merriweather rather than Tiro.
- Body copy is never below 16px (form helper and meta text: 14–15px). Line length ≤ 68ch.

## Spacing, radius, elevation
- Container: `max-w-[1240px] px-5 md:px-8`. Header rows: `.container-header` (`max-w-[1400px] px-4 md:px-8`), so the lockup and full nav fit on one line.
- **Section padding (CR-01):** `py-12 md:py-16 lg:py-20` (`.section-pad`; was `py-20 md:py-28 lg:py-32`). Card padding about 25% less than before (`p-5 md:p-6`).
- **Compactness targets** (tested in `tests/compact.spec.ts`): home ≤ 2.7 viewports at 1440×900 and ≤ 6 at 390×844 (footer excluded); hero + cards within 1.3 viewports on desktop; inner page heroes ≤ 420px below the header on desktop and ≤ 60vh on phones; no photo taller than about 70% of the viewport.
- Radius: `rounded-2xl` (20px) for cards and panels, `rounded-full` for pills, buttons and icon discs.
- Shadows: `shadow-soft` `0 10px 30px -14px rgb(215 25 120 / .2)`; `shadow-lift` (hover) `0 18px 40px -16px rgb(215 25 120 / .3)`.

## Header (`src/components/layout/Header.tsx`)
- **Top bar** (lg+, 40px): magenta, white text, marigold icons. Email left, phone centre, address right (opens Maps). Hidden below lg to keep the header compact.
- **Main bar** (108px desktop, 64px phones): cream-to-light-yellow gradient (`.header-bar`). Logo lockup, then the nav, then `EN | हिं`.
- **Nav:** Home · About Us · Vision & Mission · Loan Products ▾ (dropdown: the 4 loans + All loans) · Membership · Gallery (only when `gallery.enabled`) · Contact Us. The active item is a magenta pill with white text. Careers is in the footer. No desktop Register button (Membership is the conversion path).
- **Breakpoint (measured):** the full nav shows from 1280px (`xl`); below, the hamburger and full-height sheet, so the nav never wraps. The tagline shows from lg, except 1280–1399px, where it would collide with the nav.
- Sticky behaviour as before: shrinks 108 → 88px on scroll, hides on scroll down, returns on scroll up.

## Logo lockup (`src/components/ui/BrandLockup.tsx`)
- The client's real **emblem** (`public/brand/logo-mark-160.webp`), never cropped or recoloured, then a typeset two-line name: "SHREE SHYAM" (Merriweather 900, `rani-500`) over "SMALL GROWTH FOUNDATION" (Merriweather 700, `cocoa`), then the tagline "Financial Inclusion • Women Empowerment • Community Growth" (Poppins 12px, `ink`, marigold bullets).
- A **new lockup, pending client approval** (client-review-2). `site.logoLockup = 'image'` in `src/data/site.ts` switches back to the client's full logo file.
- Sizes come from CSS variables (`--lockup-mark`, `--lockup-line1`, `--lockup-line2`), set on `.site-header` (scaled with the viewport on phones so it fits 360px beside the language switch and menu button) and on the footer link.
- The typeset text is `aria-hidden`; the link's accessible name is "Shree Shyam Small Growth Foundation, home".

## Footer (`src/components/layout/Footer.tsx`)
- Magenta (`.footer-surface`). The emblem as a faint watermark (12%), always **whole**: it sits in the page margin beside the container from 1400px, where the margin fits it, so no text or icon crosses it; hidden below that.
- **Row 1:** lockup (white) · one line of quick links (About Us · Vision & Mission · Loan Products · Membership · Careers · Contact Us) over phone and email · social placeholders. Phones: links in 2 columns, phone/email as icon buttons beside the socials.
- **Bottom bar:** "© {build year} Shree Shyam Small Growth Foundation. All Rights Reserved." left; Privacy Policy · HR Policy · Contact Us right. **Terms & Conditions** is added only when the client supplies its text.
- Height: 225px at 1440 (target ≤ 260), 511px at 360–390 including the action-bar clearance (target ≤ 520).

## Components (`src/components/ui`, `src/components/sections`)
| Component | Spec |
|---|---|
| **Button** | `primary` (marigold-400 fill, plum-900 text; the "Join Us →" / "Know More →" style), `secondary`, `ghost`, `onDark`, `link`. Sizes md 48px, lg 56px. Arrow slides 4px on hover. |
| **Eyebrow** | 24px yellow dash + sentence-case Poppins 600 in `rani-600` |
| **SectionHeading** | Optional eyebrow, h2, optional lead and action |
| **Home FeatureCards** | 3 white cards overlapping the hero's bottom: a circular icon disc (pink `rani-100` or yellow `marigold-300`), a Merriweather title, the live-site description, a small round arrow (decorative; the title link covers the card). Phones: compact rows. |
| **ImpactBand** | Diagonal magenta \| yellow band: script slogan with a yellow swash and leaf; the 3 live-site stats with magenta icon discs, CountUp numbers, labels. Home and About. |
| **LoanStrip** | Home: the 4 products in one row from lg (icon, name, amount/tenure chips, arrow); a horizontal snap row on smaller screens. |
| **FeatureCard** | Services ("What we do") and "Why choose": IconBadge beside a Merriweather title and text, compact |
| **IconBadge** | 56px `rani-50` disc, marigold blob, `rani-500` lucide stroke |
| **LoanCard** | Product name, purpose, link; `panel`/`large`/`compact` sizes (Loans hub, Other loans) |
| **ProcessSteps** | Membership: 3 marigold number discs on one marigold stepper line (across from md, down the left on phones), title, text |
| **TestimonialCard / deck** | Compact single-card carousel: script quote mark, quote, initials avatar. Native scroll-snap; desktop auto-advance with pause. |
| **TeamCard** | Team tree: circular **colour** portrait (112px desktop, 88px phones; Chairman and MD/CEO 128/96px) in a 3px marigold ring, name (Merriweather), role (Poppins), LinkedIn placeholder. Hover/focus lifts the card and glows the ring. Phones: a compact row. |
| **Team tree** | `/about/team/`: nested lists by tier (Chairman → Leadership → Executive Directors → Heads & Officers) with tier headings; desktop connectors tier to tier (TreeConnectors); phones a vertical tree with a marigold spine. See site-plan. |
| **Accordion** | As before (button in a heading, `role="region"`, CSS `grid-template-rows` 0fr → 1fr, `inert` when closed), with compact 60px rows |
| **KeyFacts / TickList** | Unchanged |
| **PullQuote** | A key statement beside a marigold rule, with a script quote mark (Vision & Mission) |
| **TeaserCard** | Linked summary card (About's Vision & Mission teasers) |
| **CtaBand** | Slim magenta band for inner pages (≤ 220px desktop): heading beside Register (→ `/membership/#register`) and Contact Us. Not on home. |
| **PageHero** | Compact: blush, breadcrumb, optional eyebrow, h1, optional intro (all CSS-animated from first paint, never behind a JS Reveal); an optional arch photo (15rem desktop; 5.5rem beside the text on phones). ≤ 420px below the header on desktop, ≤ 60vh on phones. |
| **WebForm** (`src/components/forms`) | All three forms (Membership `#register`, Contact, Careers), driven by field specs from the server (`fields.ts`): visible labels, 48px+ inputs, required / optional marks, inline errors tied with `aria-describedby`, an error summary that takes focus, a polite status. Two-column grid from sm; checkboxes below. Never collects ID numbers, bank details or uploads. |
| **MapFacade** | Contact: a white card with the confirmed pin (name, address), a note, "Show map" (loads the Google iframe; no request before) and "Open in Maps" |
| **LongForm** | HR Policy, Privacy: compact PageHero, then a sticky "On this page" contents list (desktop; marks the section being read) beside a 46rem reading column; on phones the contents fold into a `<details>`. A 4px marigold reading-progress bar runs along the top of the viewport (`transform: scaleX`). |
| **Decor** | `Lotus`, `Leaf`, `Swash`, `HeartFlourish`: drawn in code, `aria-hidden`, 10–15% opacity in section corners, used sparingly |
| **LanguageSwitch** | `EN \| हिं` pill (white, magenta marker); 48px options |
| **MobileActionBar** | < md: Register (→ `/membership/#register`) + Call (+ WhatsApp when confirmed) |
| **Illustration / PictureSources** | Unchanged |

## Iconography & imagery
- **Icons:** lucide via the generated `@/components/ui/icons` (never `lucide-react` directly), stroke 1.75.
- **Photos:** only the real photos from `assets/original` (and later the client's). Never generate, buy or download people photos. Consistent slight warm grade. The client shot list for the reference look is in `docs/client-review-2.md`.
- **Decorations:** the curved yellow bands, the tree connectors, the stepper line, a lotus/leaf outline at 10–15% opacity in a few corners.

## Photo frames (data, not CSS)
Every content photo goes through `<PhotoFrame>`; shape, aspect and focal point come from `IMAGE_META` in `src/data/images.ts`.

| Frame | Aspect | Shape | Use for |
|---|---|---|---|
| `panel` | 16:10 | **CR-01 signature**: rounded rectangle, left edge one organic curve (an `objectBoundingBox` clip path), a ≈12px marigold band hugging the curve (an SVG stroke in the same 160×100 viewBox, so it never distorts) | Home hero (`heroPanel`) and About band (`aboutPanel`). Rendered by `CurvedFrame`. |
| `arch` | 4:5 | 999px 999px 28px 28px | Inner-page hero photos, gallery portraits |
| `wide` | 4:3 | 20px | Group and two-person shots (award) |
| `banner` | 16:5 | 20px | Very wide scenes without people |
| `illustration` | natural | none | Cut-outs and drawings; never in a photo frame |

- `shape="circle"` overrides the frame with a 1:1 round crop at the focal point (Team tree portraits).
- No photo is shown taller than about 70% of the viewport.
- To add a photo: process it with `scripts/images.ts` (crop if needed), add its frame and focal point to `IMAGE_META`, screenshot the placement at 390 and 1440.
