# Motion Spec

## Philosophy
Finance motion should feel like **growth, not spectacle**. Each animation either:
- guides attention to the next thing to read,
- shows progress (a process, a number growing), or
- builds trust through steadiness.

If an animation doesn't do one of those, cut it. Nothing bounces, flashes or loops endlessly.

**CR-01 (1 Nov 2026): lighter motion, "avoid excessive animations".** The client asked for a compact site. Everything that added scroll length or JS for little value was removed:
- **Removed:** all pinned sections and horizontal-scroll pins (Loans, Process), the About word-by-word reading scrub, the page-long Golden Thread on home (seed, stem, branches, wrap, bloom), the hero text drift, the stats dividers, the footer watermark drift, and the magnetic button.
- **Kept:** the hero load sequence (CSS, LCP painted on the first frame), the yellow-frame **draw-in** on the hero and About photos, card reveal fades with stagger, CountUp, hover lifts, the Team tree connectors drawing in, the page curtain, the accordion.
- **Lenis stays** for now; that decision waits for the Vercel PageSpeed measurement.

## Tokens (`src/lib/motion.ts`)
Every duration, distance, ease, scale and delay lives in `src/lib/motion.ts`; CSS gets them through `tailwind.config.ts`, so tuning the motion is a one-file change.
```ts
export const ease = { growth: 'cubic-bezier(0.22, 1, 0.36, 1)', inOut: 'cubic-bezier(0.65, 0, 0.35, 1)' };
export const dur = { fast: 0.35, base: 0.7, slow: 1.1, frame: 1.1, connector: 0.6, /* … */ };
export const stagger = { tight: 0.06, base: 0.1, loose: 0.16 };
export const distance = { reveal: 28, parallax: 60 }; // px
```
- The `growth` curve is registered with `CustomEase`.
- Reveals trigger at `start: 'top 82%'`, once. They don't reverse on scroll-up.

## Engine setup
- **Libraries:** GSAP (with `@gsap/react`), Lenis, and CSS. No `motion` (framer-motion).
- **`SmoothScroll`:** Lenis on desktop only (`(min-width:1024px) and (pointer:fine)`, not reduced motion), driven by `gsap.ticker`, synced with ScrollTrigger. It refreshes ScrollTrigger once the page height settles.
- **`html.js-motion`:** an inline `<head>` script adds it; every hide-before-reveal state lives under it, so content shows without JS.
- **Plugins:** ScrollTrigger, SplitText, DrawSVGPlugin, CustomEase, registered once in `src/lib/gsap.ts`. Flip is imported only by the gallery lightbox, on demand.
- **`gsap.matchMedia()`** everywhere: `isDesktop` (≥1024), `isTablet`, `isMobile` (<768), `reduce`.
- **Lazy setup:** every scroll primitive builds its tweens inside `whenNear(el, ctx, setup)` (within half a screen of the viewport), so nothing below the fold does GSAP work during hydration.

## Motion primitives (`src/components/motion`)
| Primitive | Behaviour |
|---|---|
| `Reveal` | Fade up `distance.reveal` px, `dur.base`; `stagger` for lists. |
| `SplitHeading` | SplitText by lines (EN) or words (HI, never characters); masked lines rise. Reverts after. |
| `CountUp` | 0 → target over `dur.count` when in view; keeps `+`/`%`; SSR renders the final value. |
| `DrawFrame` | **CR-01.** The marigold band of a curved photo frame draws along the curve (DrawSVG): after load for the hero (`hero.frame` delay), on scroll (once) elsewhere. The photo itself is never masked. |
| `TreeConnectors` | **CR-01.** Team tree (md+): measures the cards and draws tier-to-tier lines (drops, one bar, drops); each tier's lines draw in after the previous (`dur.connector`), once. Re-measures on resize. |
| `GoldenThread` | Inner pages only: one descending line per section (PageHero, some sections), scrubbed. Not on home. |
| `ImageReveal`, `Parallax` | Arch photos on inner pages (mask opens; gentle desktop parallax). |
| `DrawTicks` | TickList ticks draw in one after another (loan pages, Membership checklists). |
| `Shine` | One gradient sweep across the award photo (desktop). |
| ~~`MagneticButton`, `ScrollDrift`, `ReadingHighlight`, `ThreadSeed`, `ThreadBloom`, `DrawLine`, pins~~ | Removed by CR-01. |

## Page transitions
A short curtain (`template.tsx`, GSAP, 0.5s): a `rani-600` panel slides up and away. Skipped under reduced motion and never on the first page load.

## Home (CR-01, compact)
| # | Section | Desktop | Mobile |
|---|---|---|---|
| 1 | **Header** | Top bar + bar; shrinks 108 → 88px past 40px, hides on scroll down, returns on scroll up (transform only). Loan Products dropdown fades and slides 8px. | Sheet from the right; links stagger in. |
| 2 | **Hero** | From first paint, CSS only: the h1 (script line + title) rises (transform), the CTAs scale in from 0.96. The photo is painted at once (LCP on desktop), and its marigold band draws in after `hero.frame`. | Same; the h1 is the LCP. The photo sits below the text. |
| 3 | **Feature cards** | Fade up with stagger; hover lifts the card, turns the icon, slides the arrow (CSS). | Same. |
| 4 | **About** | Text reveals; the photo's band draws in on scroll. No word scrub. | Same. |
| 5 | **Impact band** | Stats fade up with stagger and count up. | Same. |
| 6 | **Loan strip** | Cards fade up; hover lift. | Native horizontal snap row; no pin. |
| 7 | **Footer** | Static. | Static. |

## Inner pages
- **PageHero:** CSS only, from first paint: breadcrumb and eyebrow fade up, the h1 and intro rise (`animate-hero-title`, transform only). An arch photo uses the no-clip `hero` motion (settle only).
- **Nothing in the first screen sits behind a JS `Reveal` or `ImageReveal`** (CR-01 LCP pass). On a 4×-throttled phone at 1.6 Mbps hydration takes about 5s, so hidden-until-JS content in view became the LCP at 5–6s. This applies to: the Membership intro, the Loans hub cards, the Vision & Mission pull-quotes, the Milestones award photo (priority, `motion="none"`), About's foundation section (its illustration has `priority`), the Gallery tiles, and the Chairman's portrait (priority).
- **Vision & Mission, About, Milestones:** reveals only; pull-quotes fade up.
- **Membership:** the process stepper's marigold line is static (the thread motif), steps fade up with stagger; checklist ticks draw in; the FAQ accordion; the form has no decorative motion (focus rings, inline errors, a polite status message).
- **Team tree:** cards fade in; on md+ the connectors draw tier by tier once (`TreeConnectors`); reduced motion shows them drawn; phones use a static CSS spine.
- **Loan pages:** KeyFacts reveal; TickList ticks draw in.
- **Gallery:** masonry reveal; the lightbox FLIPs the image out of its tile (GSAP Flip, loaded on demand); reduced motion fades.

## Micro-interactions (CSS transitions)
Transform/opacity only (plus `box-shadow` on cards), `ease-growth`, reduced to a fade under `prefers-reduced-motion`.
- Buttons: hover lift 2px, press 0.98, arrow slide 4px.
- Cards: hover/focus-within lift with `shadow-lift`, 0.25s.
- Nav pills: the active pill is static; hover changes colour only.
- LanguageSwitch: the marker slides with `transform`.
- Accordion: CSS `grid-template-rows: 0fr → 1fr` over 0.35s (the one approved exception).

## Reduced motion & low-end fallback
- Under `prefers-reduced-motion: reduce`: no Lenis, scrubs, parallax, SplitText or page curtain; opacity fades only (0.2s); the frame bands and tree connectors are shown drawn; CountUp shows final values.
- Low-end devices (≤ 4 cores or Save-Data) get the mobile choreography.

## Implementation notes
- **LCP:** the home hero photo (desktop) and h1 (phones) are fully painted on the first frame; only transforms animate. The hero photo (`heroPanel`, ≤ 94 KB) is preloaded as AVIF with `fetchpriority="high"`. The band draw-in is decorative and never delays it.
- **No pins anywhere**, so page height is what you see; `tests/compact.spec.ts` checks the CR-01 height targets.
- **Bundle:** removing the pins and primitives above cut the shared motion chunk. The Membership form's react-hook-form chunk hydrates on its own (the form is server-rendered and posts natively until then), and zod loads on the form's first focus or submit, so every page stays under 180 KB first-load JS.
- **Header shrink:** transform only; the bar content is nudged by half of `--shrink`.
- **Horizontal clip on `<main>`:** `overflow-x: clip`, so the overlapping feature cards and the snap row never add a horizontal scrollbar.
- **Language switch** is a full page load (keeps `html.js-motion`).

## QA checklist per section
- [ ] No layout shift from reveals; space is reserved.
- [ ] Works with JS disabled (all content visible).
- [ ] Reduced-motion path verified.
- [ ] No long tasks > 50ms from scroll handlers (4× CPU throttle).
- [ ] Triggers are killed on route change.
- [ ] Hindi checked: no broken conjuncts, headings don't overflow.
