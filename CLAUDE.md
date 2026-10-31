# Shree Shyam Small Growth Foundation — Website Rebuild

Rules for every Claude Code session on this project. Read this file fully before any work.
Detailed specs live in `docs/`:
- `docs/site-plan.md`: pages, URLs and sections
- `docs/design-system.md`: tokens, type and components
- `docs/motion-spec.md`: animation rules and per-section choreography
- `docs/build-plan.md`: phases and acceptance criteria
- `docs/client-requests.md`: content we are waiting on

## What this is
A static, bilingual (English + Hindi) marketing site for a microfinance / financial-inclusion foundation in Motihari, Bihar.

**Audience**
- **Primary:** rural women, small entrepreneurs, farmers and low-income households, mostly on mid-range Android phones over patchy 4G.
- **Secondary:** partners, donors, job seekers and regulators.

**Brand feel:** warm, trustworthy, dignified, hopeful. Premium, but never flashy. Finance demands calm confidence.

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

pnpm 11 blocks dependency build scripts. If an install ends with `ERR_PNPM_IGNORED_BUILDS`, stop and tell the user to run `pnpm approve-builds`. Do not work around it.

## Content rules (most important)
1. **`content/*.json` (crawled from the live site) is the single source of truth for English text.** Never invent, embellish or "improve" copy, statistics, names, roles, loan terms or claims. Whitespace and the fixes listed in `docs/client-requests.md` (once approved) are the only allowed changes.
2. All user-facing strings live in `messages/en/*.json` and `messages/hi/*.json`. No hard-coded strings in components.
3. **Hindi** is drafted by Claude.
   - Every Hindi file carries `"_status": "draft-needs-review"` until the client approves it.
   - Keep financial and legal terms precise and simple, at roughly a Class 8 reading level.
4. **Client-confirmed facts** are listed at the top of `docs/client-requests.md` under "Confirmed". They override crawled values (e.g. the phone number, office hours and map pin). Put them in `src/data/site.ts`.
5. **Missing content** (loan key facts, legal details, grievance contact, gallery, WhatsApp):
   - Render nothing for it, and hide the UI that depends on it behind a `null` check in `src/data/site.ts`.
   - Never show `+91 xxxxxxxxxx` or `#` links.
6. **Social links are temporary placeholders, at the client's request.**
   - Keep them in `site.ts` with `placeholder: true`; they render as icons that open the network home page in a new tab.
   - Exclude placeholders from JSON-LD `sameAs`.
   - The Phase 8 launch check must fail while any `placeholder: true` remains.
7. **Forms never collect** Aadhaar, PAN, bank account numbers or document uploads. Documents are verified offline at the office.
8. **Logo files** are in `client-inputs/logo/`. Use them, not the crawled logo, when present (see Phase 0). Never redraw or restyle the logo.
9. Testimonials, team names and the award story are used exactly as crawled.

## Design rules
- Colours come only from Tailwind tokens (`rani`, `marigold`, `plum`, `ivory`, `ink`). No raw hex in components.
- **Yellow (`marigold`) is never used for text on light backgrounds.** Use it as a fill, with `plum-900` text on top.
- **Light theme only.**
- Fonts are loaded with `next/font/google`:
  - Fraunces: English display
  - Tiro Devanagari Hindi: Hindi display
  - Mukta: body, both scripts
  - Kalam: handwritten accents, both scripts
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
  - MagneticButton: the hand-written spring in `src/components/motion/MagneticButton.tsx`.
- All text must be server-rendered and visible without JS.
  - Hide-before-reveal states apply only under `html.js-motion`, which a tiny inline script adds.
  - If JS fails, content shows.
- Use `gsap.matchMedia()` everywhere. Under `(prefers-reduced-motion: reduce)`, use no scroll animations, no pinning and no smooth scroll; simple fades only.
- Pinning and horizontal scroll apply on `md` (≥768px) and up only. On mobile, use plain reveals.
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
- **Golden thread rail:** sections with a thread use `container-site thread-gutter` (content clears the thread). The `<GoldenThread>` goes *inside* that container with `thread-col` (straight) or `thread-col-wide` (sway), plus `inset-y-0 h-full`. An absolutely positioned SVG needs an explicit height; `h-auto` doesn't stretch it. Paths use a 0–100 space with x = 50 at both ends, so segments join across sections.
- **Data adapters** (`src/data/*.ts`) hold order, links, images and facts. They reference message keys (`…Key` fields) rather than copying text; `verify-content.ts` checks every key exists.
- **Images:** use `<Picture image="…" alt={t(altKeyFor(image))} />` from `src/components/ui/Picture.tsx`. Mark the hero `priority`. Never use a raw `<img>` for content images.
- **Icons:** import from `@/components/ui/icons` (generated by `scripts/icons.ts`; add names there and re-run), **never from `lucide-react`**. In lucide-react 1.x every icon is a `"use client"` module, so even a server-rendered icon adds ~12 KB of JS to every page.
- **Client components that load on every page** (anything in the header, footer or layout) must not call `useTranslations`. Translate on the server and pass strings as props. That keeps next-intl's message formatter (~12 KB) out of the shared bundle; route-specific client components such as forms may use it.
- **Bundle budget:** after `pnpm build`, run `node scripts/bundle-size.mjs`. Every exported page must stay under 180 KB gzip of JS.
- Motion primitives live in `src/components/motion/`: `Reveal`, `SplitHeading`, `CountUp`, `GoldenThread`, `Parallax`, `MagneticButton`, `SmoothScroll`. Sections compose these; they don't write raw GSAP unless the choreography is unique.
- Before saying a phase is done, run `pnpm build`, `pnpm exec tsc --noEmit`, and the dev-server smoke check (`pnpm dev` + `scripts/dev-smoke.ts`). All three must pass. `pnpm build` alone does not catch dev-only errors.
- Commit at the end of each phase with a clear message.
