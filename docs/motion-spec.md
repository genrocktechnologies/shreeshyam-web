# Motion Spec

## Philosophy
Finance motion should feel like **growth, not spectacle**. Each animation either:
- guides attention to the next thing to read,
- shows progress (a process, a number growing), or
- builds trust through steadiness.

If an animation doesn't do one of those, cut it. Nothing bounces, flashes or loops endlessly.

## Tokens (`src/lib/motion.ts`)
```ts
export const ease = {
  growth: 'cubic-bezier(0.22, 1, 0.36, 1)', // default: confident, soft landing
  inOut:  'cubic-bezier(0.65, 0, 0.35, 1)', // scrubbed / pinned sequences
};
export const dur = { fast: 0.35, base: 0.7, slow: 1.1, thread: 1.6 };
export const stagger = { tight: 0.06, base: 0.1, loose: 0.16 };
export const distance = { reveal: 28, parallax: 60 }; // px
```
- GSAP: register the `growth` curve with `CustomEase` (free plugin), or approximate it with `power3.out`.
- Reveals trigger at `start: 'top 82%'`, once. Don't reverse on scroll-up; replaying animations feels nervous.

## Engine setup
- **Libraries:** GSAP (with `@gsap/react`), Lenis, and CSS. The `motion` (framer-motion) library is not used; it was removed to protect the 180 KB first-load JS budget. Anything below that once relied on it now uses a CSS transition or GSAP, as noted.
- **`SmoothScroll` provider (client):**
  - Create Lenis on desktop only (`(min-width:1024px) and (pointer:fine)` and not reduced-motion), with `lerp: 0.1`.
  - Run `lenis.raf` from `gsap.ticker`, set `gsap.ticker.lagSmoothing(0)`, and call `ScrollTrigger.update` on Lenis scroll.
  - Anchor links use `lenis.scrollTo` with header offset.
- **`html.js-motion`:** an inline script in `<head>` adds this class immediately. Initial hidden states (e.g. `.js-motion [data-reveal]{opacity:0}`) live only under it, so content stays visible without JS.
- **Initialisation:**
  - Register plugins once in `src/lib/gsap.ts`: ScrollTrigger, SplitText, DrawSVGPlugin, CustomEase.
  - The Flip plugin is **not** registered globally. It is imported and registered inside the gallery route only, so no other page pays for it.
  - Call `ScrollTrigger.refresh()` after `document.fonts.ready` and after each lazy image loads inside pinned sections.
- **`gsap.matchMedia()` contexts:** `isDesktop` (≥1024), `isTablet` (768–1023), `isMobile` (<768), `reduce`.

## Motion primitives (`src/components/motion`)
| Primitive | Behaviour |
|---|---|
| `Reveal` | Children fade up `distance.reveal` px, `dur.base`, `growth`. `stagger` prop for lists. |
| `SplitHeading` | SplitText by **lines** (EN) or **words** (HI). Each line is masked (overflow hidden) and slides up from 100%, stagger `tight`. Reverts the split after animating, to keep the DOM clean and a11y intact. |
| `CountUp` | Counts from 0 to the target over 1.8s with `power2.out` when in view. Keeps suffixes (`+`, `%`). Uses `tabular-nums`. Under reduced motion it shows the final value. Renders the final value in SSR HTML, for SEO and no-JS. |
| `GoldenThread` | An SVG path per section. DrawSVG goes 0% → 100%, scrubbed to that section's scroll (`start:'top 70%'`, `end:'bottom 60%'`, `scrub: 0.6`). |
| `Parallax` | Image moves ±`distance.parallax` px inside its arch mask (the image is scaled 1.12 so edges never show). Desktop only. |
| `MagneticButton` | Primary CTAs pull up to 6px toward the cursor, using a hand-written spring (stiffness 300, damping 20, mass 1) in `MagneticButton.tsx`, with no library. Fine pointer only; static under reduced motion. |
| `ImageReveal` | Arch mask opens with `clip-path: inset(100% 0 0 0 round 999px 999px 28px 28px)` → `inset(0 ...)` and the image scales 1.15 → 1, `dur.slow`. |

### The Golden Thread (signature)
- **One path per section, not one page-long path.** A single path breaks on responsive reflow. Segments enter and exit at the same x (a fixed grid column: `left: 8%` desktop, `left: 20px` mobile), so they read as one continuous thread.
- **Story of the thread, from top to bottom of the Home page:**
  1. A seed dot under the hero CTA
  2. A stem descending through About
  3. It splits into 4 branches over the Loans section
  4. It becomes the connector line through the 3 Process steps
  5. It wraps the award photo frame
  6. It blooms into a marigold flower in the final CTA
- On inner pages the thread is a simpler single descending line, ending in the page CTA.
- Stroke: 2.5px `marigold-400` with a 6px `marigold-200` glow (a duplicated path at 40% opacity, blurred via SVG filter, desktop only).
- On mobile the thread is drawn per section with a lighter stroke and no glow.

## Page transitions
Route changes use a short curtain: a `rani-600` panel slides up and away (0.5s total). Use the Next 14 `template.tsx` with a GSAP timeline (`yPercent` on the panel, inside `useGSAP` so it reverts on unmount).
- Skip it under reduced motion: no panel, no timeline.
- Never block the first paint of the first page load.

## Implementation notes (Phase 3)
All values below live in `src/lib/motion.ts` (durations, distances, eases, delays, scroll thresholds). CSS gets them through `tailwind.config.ts`, so tuning the motion is a one-file change. Deviations from the spec text, and why:
- **Hero h1:** it rises as one block via CSS keyframes from first paint, not line by line with SplitHeading. On mobile the h1 is the LCP element, and waiting for JS + SplitText pushed LCP to about 5.3s (4× CPU throttle). Below-the-fold headings keep the line split. The eyebrow, CTAs and arch photo also animate via CSS, so nothing above the fold waits for hydration.
- **Hero LCP (checkpoint adjustments):** the LCP element is the arch photo at 1280–1440px and the h1 at 390px. Both are painted at full opacity with no clip on the first frame and animate `transform` only: the h1 rises (`animate-hero-title`, `distance.reveal`) and the photo settles from `scale.imageFrom` (`animate-hero-settle`). The hero photo has **no** clip-path mask reveal. The hero AVIF is preloaded with `fetchpriority="high"` (`Picture` with `priority`), and the header/footer logos use small 240/320px files at normal priority. Throttled phone profile (4× CPU, 1.6 Mbps, 150ms RTT, 390×844): median LCP 2016 ms over 5 runs.
- **Hero layout:** text column 7/12, photo 5/12. On mobile the arch photo is capped at 34svh so the headline and Register fit above the fold at 390×844. The stem block below the CTAs is only as tall as the thread needs (64/96px) and joins the stats band's segment.
- **There is no hero "lead":** the live site has no lead text for the hero, and copy is never invented.
- **Hero text drift:** the text moves up as the hero scrolls away, but doesn't fade (`opacity.driftTo` = 1). Any fade put the eyebrow and CTA labels below AA contrast while still visible.
- **About reading highlight:** words start at 62% opacity (`opacity.highlightFrom`), not ink-faint. That is the lowest value that keeps WCAG AA 4.5:1 while words are mid-scrub; lower values fail axe color-contrast.
- **Thread column:** `--thread-x` is measured inside `.container-site` (20px mobile, 24px from md), not 8% of the viewport. It works out to about 8% at 1440px, and it keeps the thread clear of the text at every width.
- **Lazy motion setup (`whenNear` in `lib/gsap.ts`):** every scroll primitive (Reveal, SplitHeading, ImageReveal, CountUp, DrawLine, GoldenThread, Parallax, ReadingHighlight, ThreadBloom, Shine, the footer watermark) builds its tweens and ScrollTriggers only when it comes within half a screen of the viewport (`trigger.nearMargin`), each in its own task. Set up eagerly, they ran inside React's hydration commit as one ~0.5s long task on a 4×-throttled phone. Pins (Loans, Process) stay eager, because they change the page height.
- **Thread stroke:** `vector-effect: non-scaling-stroke` applies only to the unmeasured no-JS fallback. Once measured, the thread draws 1:1 in pixels; leaving it on made DrawSVG call `getScreenCTM` and `getTotalLength` on every scroll frame (about 30% of main-thread time while scrolling).
- **Height changes re-measure the triggers:** `SmoothScroll` refreshes ScrollTrigger once the page height settles at a new value (`scroll.refreshSettleMs`). Without it, everything below the FAQ fired about 600px late after the accordion collapsed on hydration.
- **Horizontal clip on `<main>`:** `overflow-x: clip` lives on `<main>`, not on the pinned Loans section. An overflow clip on a pinned element made Chrome report each pin start and end as a full-viewport layout shift (CLS 1.9 while scrolling).
- **Language switch is a full page load:** a client-side locale change remounts the root layout and drops `html.js-motion`, which left motion off afterwards (content stayed visible, but the pins and reveals were gone).
- **Loans (§6):** there are no loan photos, so the panels' image counter-parallax is skipped; each panel has its icon instead. Thread story step 3 is a rail leaving the thread with 4 branches; on phones each stacked card gets its own branch.
- **Process (§7):** the rail badges sit beside the steps; their positions are measured, so the fill reaches badge k exactly as step k arrives.
- **Award (§8):** the wrap path is computed from the photo frame's box (`GoldenThread wrap`); without JS it isn't drawn.
- **Testimonials (§9):** one native scroll-snap track at every width. Desktop adds peek scaling (transform only, from scroll position), mouse drag, and a 7s auto-advance with a pause button (WCAG 2.2.2). The track is focusable for keyboard scrolling.
- **Team (§10):** grayscale uses a `backdrop-filter` overlay faded with opacity (no grey colour token is needed), and only on hover-capable devices. Touch devices always show colour.
- **FAQ (§11):** without JS every answer is open; after hydration only the first stays open.

## Home page choreography
| # | Section | Desktop | Mobile |
|---|---|---|---|
| 1 | **Header** | Transparent over the hero. On scroll > 40px it becomes ivory with blur and shadow, and shrinks from 88 to 68px. Hides on scroll down, returns on scroll up. Mega-menus fade and slide 8px with stagger. | Same sticky behaviour. Menu is a full-height sheet sliding from the right; links stagger in. |
| 2 | **Hero** | On load: eyebrow fades, h1 `SplitHeading` lines rise, lead fades, CTAs scale from 0.96. The arch `ImageReveal` runs in parallel (delay 0.2), the thread seed dot pops in, and a Kalam accent word underline draws. Total < 1.4s. On scroll the image parallaxes and the text drifts up slowly with a slight fade (scrub). | Same load sequence without parallax. The image appears above the text. |
| 3 | **Trust strip / stats** (plum band) | 3 `CountUp` stats stagger in. Thin marigold dividers draw vertically. | Stacked; same CountUp. |
| 4 | **About** | Scroll-linked **reading highlight**: the 2 paragraphs' words go from `ink-faint` to `ink` as the section scrolls (word split, scrub). Arch image parallax. Thread stem draws. | Simple Reveal, with no word scrub (too heavy on low-end phones). |
| 5 | **Services** (6) | Bento grid; cards Reveal with `stagger.base` from a 0.98 scale. Hover: lift and icon rotate. | 1-column list cards; Reveal. |
| 6 | **Loans** (4) | **Pinned horizontal scroll:** the section pins, 4 large loan panels slide horizontally (scrub), and a progress bar fills along the thread branch. Each panel's image does a slight counter-parallax. | No pin. Horizontal snap carousel (CSS `scroll-snap`) with dot indicators, or stacked cards. |
| 7 | **Process** (3 steps) | **Pinned storytelling:** left column has sticky step text that cross-fades 01→02→03, right column swaps images with a clip reveal, and the thread fills a vertical progress line between the numerals. Pin length about 250vh. | Vertical Stepper; each step Reveals and its thread segment draws. |
| 8 | **Award / milestone** | The image frame is wrapped by the thread drawing around it, then one gentle shine sweep (a gradient mask moving across the frame, once). Text Reveals. | Same, without the shine. |
| 9 | **Testimonials** (4) | Card deck: the active card is centred, others peek and are scaled to 0.92. Drag or arrow to change; auto-advance every 7s, paused on hover or focus or when off-screen. No infinite marquee. | Swipeable cards with snap, dots, and no auto-advance. |
| 10 | **Team** (7) | Grid Reveal with stagger. Hover: photo goes grayscale → colour and a name underline draws. | 2-column grid. |
| 11 | **FAQ** (6) | Accordion height animation (0.35s). The first item is open by default. | Same. |
| 12 | **Final CTA** (rani band) | The thread arrives and **blooms**: marigold petals scale in radially with stagger. The heading `SplitHeading` follows, and the CTA becomes magnetic. | The bloom is smaller; no magnetic. |
| 13 | **Footer** | Columns Reveal. | Same. |

## Inner pages
- **Page hero:** breadcrumb fades in, h1 `SplitHeading`, compact arch image `ImageReveal`, thread starts.
- **Long-form pages** (Policy, Privacy, Mission, Vision): no fancy motion. Use a reading progress bar (marigold, top), a sticky table of contents that highlights the active heading, and Reveal on images only.
- **Loan product pages:** KeyFacts card values Reveal; a "documents needed" checklist gets ticks drawn in stagger when it scrolls into view.
- **Registration process:** vertical Stepper, with the thread filling as you scroll through the steps.
- **Forms:** field focus shows a label micro-lift and a marigold underline grow. On submit the button morphs into a spinner, then a check. Success is a thread-bloom mini animation plus a message. Errors shake 4px, once, with an `aria-live` announcement.
- **Gallery:** masonry Reveal; lightbox opens from the thumbnail position, as a FLIP animation using the GSAP Flip plugin. Import Flip only on the gallery route. Under reduced motion the lightbox simply fades.

## Micro-interactions (CSS transitions)
No JS library. Each is a CSS transition on `transform` / `opacity` (plus `box-shadow` for cards), using the `growth` easing (`ease-growth` in Tailwind), and disabled or reduced to a fade under `prefers-reduced-motion`.
- Buttons: hover lift 2px, press scale 0.98, arrow slide 4px.
- Cards: hover lift with `shadow-lift`, 0.25s.
- Links: underline draws left→right, 0.3s (`scale-x` on a pseudo-element).
- LanguageSwitch: the pill indicator slides between EN and हिं with a CSS `transform: translateX(…)`, switched by the active locale.
- Accordion: CSS `grid-template-rows: 0fr → 1fr` over 0.35s. This is the one approved exception to the transform/opacity-only rule. See design-system.md for markup and aria.

## Reduced motion & low-end fallback
- Under `prefers-reduced-motion: reduce`:
  - No Lenis, pins, scrubs, parallax, SplitText, thread drawing or page curtain.
  - Opacity fades only (0.2s).
  - The thread is shown fully drawn, and CountUp shows its final values.
- On low-end devices (`navigator.hardwareConcurrency <= 4` or Save-Data), use the mobile choreography even on larger screens.

## QA checklist per section
- [ ] No layout shift from reveals; space is reserved.
- [ ] Works with JS disabled (all content visible).
- [ ] Reduced-motion path verified.
- [ ] 60fps in the Chrome Performance panel with 4× CPU throttle; no long tasks > 50ms caused by scroll handlers.
- [ ] `ScrollTrigger` markers off; triggers are killed on route change (no leaks after navigating 10× back and forth).
- [ ] Hindi version checked: no broken conjuncts, and headings don't overflow.
