# Shree Shyam Small Growth Foundation — Website Rebuild

Rules for every Claude Code session on this project. Read this file fully before any work.
Detailed specs live in `docs/`:
- `docs/site-plan.md`: pages, URLs and sections
- `docs/design-system.md`: tokens, type and components
- `docs/motion-spec.md`: animation rules and per-section choreography
- `docs/build-plan.md`: phases and acceptance criteria
- `docs/client-requests.md`: content we are waiting on
- `docs/cr-01-compact-redesign.md`: client change request CR-01 (compact redesign). It overrides the specs above where they conflict; they have been updated to match.
- `docs/client-review-2.md`: items awaiting client confirmation (CR-01 proposed copy, the logo lockup, photos)

## What this is
A static, bilingual (English + Hindi) marketing site for a microfinance / financial-inclusion foundation in Motihari, Bihar.

**Audience**
- **Primary:** rural women, small entrepreneurs, farmers and low-income households, mostly on mid-range Android phones over patchy 4G.
- **Secondary:** partners, donors, job seekers and regulators.

**Brand feel:** warm, trustworthy, dignified, hopeful. Premium, but never flashy. Finance demands calm confidence. Since CR-01 the site is **compact** (magenta and yellow, after `docs/reference/cr-01-home.png`): visitors reach what matters with little scrolling.

## Stack (locked — do not upgrade or add frameworks without asking)
| Area | Choice |
|---|---|
| Runtime / package manager | Node 22, **pnpm 11** |
| Framework | Next.js **14.2.35**, App Router, `output: 'export'`, `trailingSlash: true`, `images.unoptimized: true` |
| UI / language | React 18.3, TypeScript ~5.7 (strict) |
| Styling | Tailwind CSS 3.4 (tokens in `tailwind.config.ts`, see design-system.md), `clsx` + `tailwind-merge` via `cn()`, `class-variance-authority` for variants |
| Animation | GSAP 3.15 (ScrollTrigger, SplitText, DrawSVGPlugin, CustomEase; Flip on the gallery route only) via `@gsap/react` `useGSAP`; Lenis 1.3 for smooth scroll |
| Micro-interaction library | none: CSS + GSAP only (bundle budget). `motion` / framer-motion was removed and must not be re-added. |
| i18n | next-intl 4, routes `/en/...` and `/hi/...` |
| Forms | react-hook-form + zod; submission via Web3Forms (fetch, no SDK) to the foundation's email |
| Icons | lucide-react |
| Testing | Playwright + @axe-core/playwright |
| Hosting | Vercel, with redirects in `vercel.json` (next.config redirects do NOT work with static export) |

## Commands
- `pnpm dev`: dev server
- `pnpm build`: static export to `out/`
- `pnpm exec tsx scripts/crawl.ts [pages]`: re-crawl the old site
- `pnpm exec tsx scripts/audit.ts`: regenerate `docs/content-audit.md`
- `pnpm exec tsx scripts/images.ts`: optimise `assets/original` into `public/images` and regenerate `src/data/images.generated.json`
- `pnpm exec tsx scripts/brand.ts`: export logos to `public/brand/` and app icons to `src/app/`
- `pnpm exec tsx scripts/verify-content.ts`: check every crawled string is in `messages/en`, all messages parse, and all adapter keys resolve. It writes `docs/content-verification.md`. Run it after any edit to `messages/en`.
- `pnpm exec tsx scripts/content-to-messages.ts`: one-off generator, already run. `messages/` is now the content source; don't regenerate (`--force`) unless the crawl changes.
- `pnpm exec tsx scripts/dev-smoke.ts`: with `pnpm dev` running (`DEV_URL`, default `http://localhost:3000`), loads every route in both locales and fails on non-200, a Next error overlay, or console errors
- `pnpm exec playwright test`: tests against the static export (run `pnpm build` first; `playwright.config.ts` serves `out/` with `scripts/serve-static.mjs`)
- `node scripts/bundle-size.mjs`: gzipped first-load JS of every exported page (budget 180 KB)
- `pnpm exec tsx scripts/icons.ts`: regenerate `src/components/ui/icons.tsx` from lucide icon data
- `pnpm exec tsx scripts/contrast.ts`: WCAG AA check of the colour-token pairs the design uses
- `pnpm exec tsx scripts/hindi-keys.ts`: the en and hi message trees must match (0 missing / extra keys), placeholders and tags must agree, every Hindi message must parse, no Devanagari digits. Run it after any edit to `messages/en` or `messages/hi`.
- `pnpm exec tsx scripts/hindi-review.ts`: regenerate `docs/hindi-review.csv` and `docs/hindi-review.xlsx` for the client's Hindi reviewer

pnpm 11 blocks dependency build scripts. If an install ends with `ERR_PNPM_IGNORED_BUILDS`, stop and tell the user to run `pnpm approve-builds`. Do not work around it.

## Content rules (most important)
1. **`content/*.json` (crawled from the live site) is the single source of truth for English text.** Never invent, embellish or "improve" copy, statistics, names, roles, loan terms or claims. Whitespace and the fixes listed in `docs/client-requests.md` (once approved) are the only allowed changes.
2. All user-facing strings live in `messages/en/*.json` and `messages/hi/*.json`. No hard-coded strings in components.
3. **Hindi** is drafted by Claude.
   - Every Hindi file carries `"_status": "draft-needs-review"` until the client approves it.
   - Keep financial and legal terms precise and simple, at roughly a Class 8 reading level.
   - Words people in Bihar already use stay as they are, in Devanagari (लोन, EMI, आधार, पैन, बैंक, फ़ॉर्म).
   - Names of people and the organisation stay exactly as in English (Latin script); mark Latin-only strings with `lang={latinLang(text)}` (`src/lib/lang.ts`) where they use the display face, so they keep Merriweather on Hindi pages.
   - Numbers stay in Latin digits.
4. **Client-confirmed facts** are listed at the top of `docs/client-requests.md` under "Confirmed". They override crawled values (e.g. the phone number, office hours and map pin). Put them in `src/data/site.ts`.
5. **Missing content** (loan key facts, legal details, grievance contact, gallery, WhatsApp, Terms & Conditions):
   - Render nothing for it, and hide the UI that depends on it behind a `null` check in `src/data/site.ts`.
   - Never show `+91 xxxxxxxxxx` or `#` links.
6. **Social links are temporary placeholders, at the client's request.**
   - Keep them in `site.ts` with `placeholder: true`; they render as icons that open the network home page in a new tab.
   - Exclude placeholders from JSON-LD `sameAs`.
   - The Phase 8 launch check must fail while any `placeholder: true` remains.
7. **Forms never collect** Aadhaar, PAN, bank account numbers or document uploads. Documents are verified offline at the office.
8. **Logo files** are in `client-inputs/logo/`. Use them, not the crawled logo, when present (see Phase 0). Never redraw or restyle the logo.
9. Testimonials, team names and the award story are used exactly as crawled.
10. **The CR-01 reference image** (`docs/reference/cr-01-home.png`) is a visual source only, never a content source.
    - Never use its statistics (keep 1200+ / 150+ / 98%), its logo, or its AI-style photos.
    - Its new wording is proposed copy, logged in `docs/client-requests.md` and `docs/client-review-2.md`, each with a one-line revert.
    - Never generate, buy or download photos of people.

## Design rules
- Colours come only from Tailwind tokens (`rani`, `marigold`, `blush`, `cocoa`, `plum`, `ivory`, `ink`). No raw hex in components. Check new colour pairs with `scripts/contrast.ts`.
- **Yellow (`marigold`) is never used for text on light backgrounds.** Use it as a fill, with `plum-900` text on top. Plum is a text colour only (no plum bands).
- **Compactness (CR-01):**
  - `.section-pad` is `py-12 md:py-16 lg:py-20`.
  - Home ≤ 2.7 viewports at 1440×900 and ≤ 6 at 390×844 (footer excluded).
  - Inner-page heroes ≤ 420px on desktop and ≤ 60vh on phones.
  - `tests/compact.spec.ts` checks these.
- **Light theme only.**
- Fonts are loaded with `next/font/google` (`src/app/fonts.ts`):
  - Merriweather 700/900: English display
  - Tiro Devanagari Hindi: Hindi display
  - Poppins 400/500/600/700: body, nav and buttons, both scripts
  - Dancing Script 600/700: English script accents
  - Kalam: Hindi script accents (`:lang(hi)`)
  - Only Latin files are preloaded; Hindi-only faces never are.
  - Hindi pages use a second, `display: 'optional'` Poppins instance for body text (`poppinsHi`, switched in by `:root:lang(hi)`); the shared `swap` instance made Hindi text re-flow (CLS). Tiro and Kalam stay `optional` for the same reason.
- The `<html lang>` attribute switches per locale. Hindi gets `leading-relaxed+` (see design-system.md).
- Exactly one `<h1>` per page.
- Every image has meaningful alt text from `messages/*`.
- Mobile-first. Tap targets ≥ 48px. Test at 360px width.

## Motion rules (summary — full detail in motion-spec.md)
- Only animate `transform`, `opacity`, `clip-path` and SVG `stroke-dashoffset`. Never animate layout properties.
  - The one approved exception: the Accordion's CSS `grid-template-rows: 0fr → 1fr`.
- **No `motion` (framer-motion) library.** Use these instead:
  - Button, card and link hovers: CSS transitions.
  - Accordion: CSS `grid-template-rows: 0fr → 1fr` over 0.35s, with correct aria attributes (see design-system.md).
  - LanguageSwitch pill: CSS `transform`.
  - Page-transition curtain: GSAP, skipped under reduced motion.
  - Gallery lightbox FLIP: the GSAP Flip plugin, imported only on the gallery route.
  - MagneticButton was removed by CR-01; don't re-add it.
- All text must be server-rendered and visible without JS.
  - Hide-before-reveal states apply only under `html.js-motion`, which a tiny inline script adds.
  - If JS fails, content shows.
- Use `gsap.matchMedia()` everywhere. Under `(prefers-reduced-motion: reduce)`, use no scroll animations and no smooth scroll; simple fades only.
- **No pinned sections and no horizontal-scroll pins anywhere (CR-01).** They add scroll length. Keep motion light: reveals, CountUp, hover lifts, the curved-frame band draw-in, the Team tree connectors, the page curtain and the accordion.
- **SplitText on Hindi splits by words or lines only, never characters.** Character splits break Devanagari conjuncts.
- Lenis runs on desktop only (native scroll on touch), synced with ScrollTrigger through `gsap.ticker`.
- Kill and revert every GSAP context on unmount (`useGSAP` scope). Call `ScrollTrigger.refresh()` after fonts and images load.

## Performance budget (fail the phase if exceeded)
Measured with mobile Lighthouse (Moto G-class throttling):

| Metric | Budget |
|---|---|
| LCP | < 2.5s |
| CLS | < 0.05 |
| TBT | < 200ms |
| First-load JS per route | < 180 KB gzip |
| Hero image | AVIF/WebP, ≤ 120 KB |

- Lazy-load everything below the fold.
- The Google Map is a click-to-load facade.

## Code conventions
- **Folders:**
  - `src/app/[locale]/...`: routes
  - `src/components/{ui,sections,motion,layout}`: components
  - `src/data`: typed content adapters
  - `src/lib`: utilities
- Every page under [locale] must re-export generateStaticParams from @/i18n/static-params:
  `export { generateStaticParams } from '@/i18n/static-params';`
- Never export `dynamicParams = false` (in a layout or page). With `output: 'export'`, Next 14's dev server then fails every route under it with a misleading "missing exported function generateStaticParams()" error. That was the real cause of the Phase 1 dev failure.
- Server components by default. Use `"use client"` only for animation, forms and interactive widgets.
- **Messages:**
  - There is one namespace per file in `messages/<locale>/`, listed in `namespaces` in `src/i18n/routing.ts`.
  - Only `common` is sent to the browser. A client component needing other keys wraps itself in a nested `NextIntlClientProvider` with `pickMessages(await getMessages(), ['ns.path'])`.
  - Some messages keep the old site's emphasis as `<b>…</b>`. Render those with `t.rich(key, richTags)` from `src/lib/rich.tsx`, never with plain `t()`.
  - `<accent>…</accent>` marks a Kalam accent word with the drawn marigold underline (e.g. `home.hero.title`). Render it with `t.rich(key, accentTags)` from `src/components/ui/Accent.tsx`. `b` and `accent` are the only tags `verify-content.ts` allows.
- **Golden thread rail (inner pages only; removed from home by CR-01):** sections with a thread use `container-site thread-gutter` (content clears the thread). The `<GoldenThread>` goes *inside* that container with `thread-col` (straight) or `thread-col-wide` (sway), plus `inset-y-0 h-full`. An absolutely positioned SVG needs an explicit height; `h-auto` doesn't stretch it. Paths use a 0–100 space with x = 50 at both ends, so segments join across sections.
- **Data adapters** (`src/data/*.ts`) hold order, links, images and facts. They reference message keys (`…Key` fields) rather than copying text; `verify-content.ts` checks every key exists.
- **Images:** place content photos with `<PhotoFrame image="…" alt={t(altKeyFor(image))} sizes="…" motion="…" />` from `src/components/ui/PhotoFrame.tsx`. The frame shape and focal point come from `IMAGE_META` in `src/data/images.ts` (see design-system, Photo frames). The CR-01 curved yellow frame is the `panel` frame (rendered by `CurvedFrame`); `shape="circle"` gives the Team tree's round portraits. Never put a cut-out/illustration in a photo frame (the types forbid it). Mark the hero `priority`. Never use a raw `<img>` for content images.
- **Icons:** import from `@/components/ui/icons` (generated by `scripts/icons.ts`; add names there and re-run), **never from `lucide-react`**. In lucide-react 1.x every icon is a `"use client"` module, so even a server-rendered icon adds ~12 KB of JS to every page.
- **Client components that load on every page** (anything in the header, footer or layout) must not call `useTranslations`. Translate on the server and pass strings as props. That keeps next-intl's message formatter (~12 KB) out of the shared bundle; route-specific client components such as forms may use it.
- **Images in client components:** render `PictureSources` with sources resolved on the server (`pictureSources(key)` from `@/data/images`), never `Picture`. `Picture` imports the image manifest and `cn`, which would ship to the browser.
- **Class names in client components:** use `cx()` from `@/lib/cx` (clsx only), never `cn()`. `cn` adds tailwind-merge (~17 KB gzip), which one client import ships to every page. Don't pass conflicting utilities to client components.
- **Lazy motion:** a new scroll-triggered primitive wraps its setup in `whenNear(el, ctx, setup)` from `@/lib/gsap`, so nothing below the fold does GSAP work during hydration.
- **Link prefetch:** `Button` links default to `prefetch={false}`. Visitors are on metered 4G; prefetch only where it clearly pays off.
- **Bundle budget:** after `pnpm build`, run `node scripts/bundle-size.mjs`. Every exported page must stay under 180 KB gzip of JS. Heavy code that is only needed on interaction loads on demand: the gallery's Flip, and the Membership form (its own chunk; zod loads on first focus).
- **Forms:**
  - One engine for all three forms: `src/components/forms/` (`fields.ts` builds the field specs and labels on the server; `WebForm` renders them; `schemas.ts` holds the zod schemas and loads on demand; pages use `LazyWebForm`).
  - Strings are translated on the server and passed as props.
  - Tests always mock Web3Forms (`page.route`); never send real mail from the test suite.
  - Submissions go to Web3Forms with `NEXT_PUBLIC_WEB3FORMS_KEY` (`src/lib/web3forms.ts`). Without the key the form renders, but sending reports "could not be sent".
  - Forms also work without JS (native POST).
- **Routes (CR-01):**
  - `/about/vision-mission/` and `/membership/` replaced `/about/mission/`, `/about/vision/`, `/how-to-join/` and `/register/`.
  - Redirects live in `vercel.json`. `scripts/serve-static.mjs` applies them locally, and `tests/redirects.spec.ts` checks them.
  - The Gallery is switched on by `gallery.enabled` in `src/data/gallery.ts`.
- Motion primitives live in `src/components/motion/`: `Reveal`, `SplitHeading`, `CountUp`, `DrawFrame`, `TreeConnectors`, `DrawTicks`, `GoldenThread`, `ImageReveal`, `Parallax`, `Shine`, `SmoothScroll`. Sections compose these; they don't write raw GSAP unless the choreography is unique.
- Before saying a phase is done, run `pnpm build`, `pnpm exec tsc --noEmit`, and the dev-server smoke check (`pnpm dev` + `scripts/dev-smoke.ts`). All three must pass. `pnpm build` alone does not catch dev-only errors.
- Commit at the end of each phase with a clear message.
