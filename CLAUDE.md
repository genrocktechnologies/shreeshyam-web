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
- `pnpm exec tsx scripts/images.ts`: optimise `assets/original` into `public/images`
- `pnpm exec playwright test`: tests

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
- Server components by default. Use `"use client"` only for animation, forms and interactive widgets.
- Motion primitives live in `src/components/motion/`: `Reveal`, `SplitHeading`, `CountUp`, `GoldenThread`, `Parallax`, `MagneticButton`, `SmoothScroll`. Sections compose these; they don't write raw GSAP unless the choreography is unique.
- Before saying a phase is done, run `pnpm build` and `pnpm exec tsc --noEmit`. Both must pass.
- Commit at the end of each phase with a clear message.
