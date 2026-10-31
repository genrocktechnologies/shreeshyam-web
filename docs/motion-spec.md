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
- **`SmoothScroll` provider (client):**
  - Create Lenis on desktop only (`(min-width:1024px) and (pointer:fine)` and not reduced-motion), with `lerp: 0.1`.
  - Run `lenis.raf` from `gsap.ticker`, set `gsap.ticker.lagSmoothing(0)`, and call `ScrollTrigger.update` on Lenis scroll.
  - Anchor links use `lenis.scrollTo` with header offset.
- **`html.js-motion`:** an inline script in `<head>` adds this class immediately. Initial hidden states (e.g. `.js-motion [data-reveal]{opacity:0}`) live only under it, so content stays visible without JS.
- **Initialisation:**
  - Register plugins once in `src/lib/gsap.ts`: ScrollTrigger, SplitText, DrawSVGPlugin, CustomEase.
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
| `MagneticButton` | Primary CTAs pull up to 6px toward the cursor (`motion` spring, stiffness 300, damping 20). Fine pointer only. |
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
Route changes use a short curtain: a `rani-600` panel slides up and away (0.5s total). Use the Next 14 `template.tsx` + `motion` `AnimatePresence`.
- Skip it under reduced motion.
- Never block the first paint of the first page load.

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
- **Gallery:** masonry Reveal; lightbox opens from the thumbnail position (FLIP via `motion` layoutId).

## Micro-interactions (`motion`)
- Buttons: hover lift 2px, press scale 0.98, arrow slide.
- Cards: hover lift with `shadow-lift`, 0.25s.
- Links: underline draws left→right, 0.3s.
- LanguageSwitch: the pill indicator slides between EN and हिं (layoutId).

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
