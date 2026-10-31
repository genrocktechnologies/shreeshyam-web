# Build Plan

- Each phase is one or more Claude Code sessions.
- Start each session with: **"Read CLAUDE.md and docs/build-plan.md, then do Phase N."**
- A phase is done only when its acceptance checks pass, `pnpm build` and `pnpm exec tsc --noEmit` succeed, the dev-server smoke check passes, and it's committed.
- **Dev-server smoke check (every phase):** start `pnpm dev`, then run `pnpm exec tsx scripts/dev-smoke.ts` (set `DEV_URL` if not on port 3000). Every route under `src/app/[locale]` in both locales must return HTTP 200 with no Next.js error overlay. `pnpm build` alone misses dev-only failures.
- Review in the browser between phases. Don't chain phases blindly.

## Phase 0 — Foundation
**Install (the user runs these; pnpm 11 may need `pnpm approve-builds`):**
```
pnpm add @gsap/react
pnpm add -D sharp
```

**Build:**
- `next.config.mjs`: `output:'export'`, `trailingSlash:true`, `images.unoptimized:true`, next-intl plugin.
- next-intl static setup:
  - `src/i18n/routing.ts` (locales `en`, `hi`; default `en`)
  - `src/i18n/request.ts`
  - `app/[locale]/layout.tsx` with `generateStaticParams` + `setRequestLocale`
  - No middleware, since static export doesn't run it.
- `tailwind.config.ts` with all tokens from design-system.md; `globals.css` with base styles, `:lang(hi)` overrides, focus styles and the grain utility.
- Fonts via `next/font/google` (Fraunces, Tiro Devanagari Hindi, Mukta [latin + devanagari subsets], Kalam).
- `src/lib/{cn,gsap,motion}.ts`; the `html.js-motion` inline script; the `SmoothScroll` provider.
- All motion primitives from motion-spec.md, plus a hidden `/en/dev/motion` playground page that demos each one. Exclude it from the sitemap and delete it before launch.
- **Logo:**
  - Use the files in `client-inputs/logo/` if present, otherwise the crawled logo in `assets/original`.
  - Export optimised versions to `public/brand/`: full colour, white/reversed, and mark-only if provided.
  - Generate favicons (`icon.png` 512, `apple-icon.png` 180, `favicon.ico`) from the mark, or from a tight crop of the emblem if no mark exists. Show the crop to the user before committing.
- `vercel.json` with redirects (from site-plan.md) and security headers: `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, and a CSP that allows Web3Forms, Google Maps and Google Fonts.
- `.gitignore`: add `docs/screenshots/`, `out/`.

**Accept:**
- The playground works at desktop and 360px; reduced-motion is verified; build passes.
- Dev-server smoke check: with `pnpm dev` running, `pnpm exec tsx scripts/dev-smoke.ts` requests every route in both locales and reports HTTP 200 with no error overlay and no console errors.

## Phase 1 — Content pipeline
- `scripts/content-to-messages.ts`: transforms `content/*.json` into `messages/en/<page>.json`, with stable, readable keys. This is a one-off generator; after it runs, `messages/` is the content source.
- `src/data/`:
  - Typed adapters: `site.ts` (contact info; null for missing phone, WhatsApp and socials), `team.ts`, `loans.ts`, `faqs.ts`, `testimonials.ts`, `services.ts`, `stats.ts`
  - Image references and alt-text keys
- `scripts/images.ts` (sharp): `assets/original` → `public/images/` as AVIF + WebP at 480/960/1600 widths, with blur placeholders. Plus a `<Picture>` component using `<picture>` srcset (since `next/image` optimisation is off in static export).
- Write `messages/en/common.json` (nav, buttons, form labels, errors, a11y labels, alt texts).

**Accept:**
- A script verifies every crawled text string appears somewhere in `messages/en`, and the report lists 0 missing strings.
- Dev-server smoke check: with `pnpm dev` running, `pnpm exec tsx scripts/dev-smoke.ts` requests every route in both locales and reports HTTP 200 with no error overlay and no console errors.

## Phase 2 — Layout chrome
- Header (utility bar, mega menus, sticky behaviour), mobile menu sheet, `MobileActionBar`, `LanguageSwitch`, footer, page-transition curtain, 404 page.
- Breadcrumbs and the `PageHero` + `CtaBand` shells.

**Accept:**
- Keyboard-only navigation works through the mega menus (Esc closes them; focus is trapped in the mobile sheet).
- axe reports 0 serious issues.
- Dev-server smoke check: with `pnpm dev` running, `pnpm exec tsx scripts/dev-smoke.ts` requests every route in both locales and reports HTTP 200 with no error overlay and no console errors.

## Phase 3 — Home page
- All 11 sections from site-plan.md, with the choreography from motion-spec.md, including the full Golden Thread story.
- Build the sections one at a time and check each in the browser before moving on.

**Accept:**
- Mobile Lighthouse ≥ 90 on Performance, Accessibility, Best Practices and SEO.
- Motion QA checklist passes.
- Content verification passes.
- Dev-server smoke check: with `pnpm dev` running, `pnpm exec tsx scripts/dev-smoke.ts` requests every route in both locales and reports HTTP 200 with no error overlay and no console errors.

## Phase 4 — Loans
- `/loans/` hub plus the 4 product pages from one `LoanPage` template.
- `KeyFacts` renders only the fields that exist.

**Accept:**
- All 4 pages are content-verified, and there's a related-loans nav.
- Dev-server smoke check: with `pnpm dev` running, `pnpm exec tsx scripts/dev-smoke.ts` requests every route in both locales and reports HTTP 200 with no error overlay and no console errors.

## Phase 5 — About cluster
About, Mission, Vision, Team, Milestones, and Gallery (built but hidden from nav and sitemap until photos exist).

**Accept:**
- Dev-server smoke check: with `pnpm dev` running, `pnpm exec tsx scripts/dev-smoke.ts` requests every route in both locales and reports HTTP 200 with no error overlay and no console errors.

## Phase 6 — Conversion & utility pages
How to Join, Register, Contact, Careers, HR Policy, Privacy. Forms are wired to Web3Forms.

**Accept:**
- A real test submission arrives in the inbox for each form.
- Validation messages appear in both languages.
- Forms are fully keyboard- and screen-reader-usable.
- Dev-server smoke check: with `pnpm dev` running, `pnpm exec tsx scripts/dev-smoke.ts` requests every route in both locales and reports HTTP 200 with no error overlay and no console errors.

## Phase 7 — Hindi
- Draft `messages/hi/*` for every key, with `_status: draft-needs-review`.
- Generate `docs/hindi-review.csv` (key, English, Hindi draft, reviewer column) for the client.
- Check every page in `/hi/`: no character-split animations, no overflow, correct fonts, and `lang="hi"`.

**Accept:**
- 0 missing keys (a script compares the en/hi key trees).
- Dev-server smoke check: with `pnpm dev` running, `pnpm exec tsx scripts/dev-smoke.ts` requests every route in both locales and reports HTTP 200 with no error overlay and no console errors.

## Phase 8 — SEO, quality, launch
- Metadata, hreflang, canonicals, OG images, JSON-LD, sitemap, robots.
- Playwright suites:
  - **Smoke:** every route in both locales returns content and has exactly one h1.
  - **a11y:** axe on all routes.
  - **Links:** no internal 404s, no `#` or placeholder links.
  - **Visual:** screenshots at 390 and 1440.
- Lighthouse on Home, a loan page and Register (mobile).
- **Launch checklist: delete the motion playground.** Remove all of these, then rebuild and confirm `/en/dev/motion/` returns 404:
  - [ ] `src/app/[locale]/dev/` (the motion playground and the Phase 2 layout demo)
  - [ ] Point `tests/chrome.spec.ts` (`PAGES` and the `/dev/layout/` tests) at real routes
  - [ ] `messages/en/dev.json` and `messages/hi/dev.json` (also remove `'dev'` from `namespaces` in `src/i18n/routing.ts`)
  - (`public/dev/` was already removed in Phase 1, when the playground switched to `<Picture>` with the real images.)
- Create a GitHub repo, import it into Vercel, add the env var, and set the custom domain.
- Verify all old `.php` URLs 301 correctly on the preview deployment before switching DNS.

**Accept:**
- Every check is green, and the client has signed off on the preview URL.
- Dev-server smoke check: with `pnpm dev` running, `pnpm exec tsx scripts/dev-smoke.ts` requests every route in both locales and reports HTTP 200 with no error overlay and no console errors. (After the playground is deleted, `/en/dev/motion/` must no longer be listed.)
