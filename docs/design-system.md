# Design System — "Marigold Thread"

## Concept
The client gave us two colours, pink and yellow. We give them meaning.

- **Rani pink** is the confident, celebratory pink of Indian textiles. It is the brand voice: headings, primary surfaces and key moments.
- **Marigold** is the genda flower of every auspicious occasion. It stands for growth, prosperity and action, and is used for CTAs, highlights and numbers.
- **The Golden Thread** is the signature motif. It's a single marigold line, inspired by the sacred *kalava/mauli* thread, that runs through each page, connecting sections the way the foundation connects families to opportunity. It starts as a seed and ends in a bloom (see motion-spec.md).

The direction is **warm editorial finance**: generous whitespace, a large serif display face, calm and precise layouts, with rich colour reserved for meaningful moments rather than painted everywhere. Roughly 70% ivory/blush surfaces, 20% rani, 10% marigold.

## Colour tokens (`tailwind.config.ts` → `theme.extend.colors`)
```ts
rani: {
  50:'#FFF0F6',100:'#FFD9E8',200:'#FFB3D0',300:'#FF80B1',400:'#F2489A',
  500:'#E0237A', // brand primary
  600:'#C2185F',700:'#9C1149',800:'#740D37',900:'#4A0823',
},
marigold: {
  50:'#FFFBEB',100:'#FFF2C2',200:'#FFE485',300:'#FFD447',
  400:'#FFC21A', // brand accent
  500:'#F5A800',600:'#C98500',700:'#9A6300',
},
plum:   { 700:'#5A2140', 800:'#3E1530', 900:'#2B0E21' }, // headings on yellow, deep sections
ivory:  { DEFAULT:'#FFFCF6', 100:'#FFF8EC' },             // page background
ink:    { DEFAULT:'#2B1A22', muted:'#6B5560', faint:'#A8949E' }, // body text (plum-tinted)
success:'#1F8A5B', danger:'#C62828',
```

### Contrast rules (WCAG 2.2 AA; verify with an a11y contrast script)
| Use | Pair | Approx. ratio |
|---|---|---|
| Body text | `ink` on `ivory` | ~15:1 ✅ |
| Pink text (links, headings) | `rani-600` or darker on `ivory` | ≥ 5:1 ✅ (`rani-500` only for ≥ 24px headings) |
| White text on pink | `white` on `rani-600`+ | ✅ (`rani-500` fill only with ≥ 18px bold text) |
| Yellow buttons | `plum-900` text on `marigold-400` | ~12:1 ✅ |
| ❌ Never | marigold text on ivory or white; white text on marigold | fails |

### Surfaces
- Page: `ivory`
- Alternating sections: `rani-50` or `marigold-50`
- Hero-moment / CTA bands: `rani-600` → `rani-800` gradient with a subtle grain texture (CSS noise, ≤ 4% opacity)
- Deep "trust" band (stats, award): `plum-900` with marigold numbers
- Cards: white, 1px `rani-100` border, soft shadow

## Typography
| Role | EN | HI | Sizes (mobile → desktop) |
|---|---|---|---|
| Display (h1) | Fraunces 600, opsz high, `-0.02em` | Tiro Devanagari Hindi 400 | 40 → 76px, leading 1.05 (HI 1.25) |
| h2 | Fraunces 600 | Tiro Devanagari Hindi | 30 → 48px, leading 1.1 (HI 1.3) |
| h3 / card title | Mukta 700 | Mukta 700 | 20 → 24px |
| Body | Mukta 400 | Mukta 400 | 17 → 18px, leading 1.65 (HI 1.85) |
| Small / meta | Mukta 500 | Mukta 500 | 14px |
| Eyebrow | Mukta 700, uppercase, `0.14em` tracking, `rani-600` | Mukta 700 (no uppercase) | 13px |
| Accent script | Kalam 700, `marigold-600` on dark or `rani-600` on light | Kalam | 22 → 32px, max one per section |
| Numbers (stats) | Fraunces 600, `tabular-nums` | same, with Latin digits | 48 → 88px |

- Set the font CSS variables on `<html>`: `--font-display`, `--font-display-hi`, `--font-body`, `--font-script`. A `:lang(hi)` rule swaps the display font and line-heights.
- Body copy is never below 16px. Line length is at most 68ch.

## Spacing, radius, elevation
- Container: `max-w-[1240px] px-5 md:px-8`
- Section padding: `py-20 md:py-28 lg:py-32`
- Radius: `rounded-2xl` (20px) for cards, `rounded-full` for pills and buttons
- **Arch mask**, the signature image shape: `border-radius: 999px 999px 28px 28px`. It echoes the *jharokha* window, and is used on hero and feature photos.
- Shadows:
  - `shadow-soft`: `0 12px 32px -14px rgb(224 35 122 / .22)`
  - `shadow-lift` (hover): `0 20px 44px -16px rgb(224 35 122 / .32)`
- Borders: `rani-100`. Dividers: `rani-200` at 60% opacity.

## Components (build in `src/components/ui`)
| Component | Spec |
|---|---|
| **Button** | Variants: `primary` (marigold-400 fill, plum-900 text), `secondary` (rani-600 fill, white), `ghost` (rani-600 text, 1.5px border), `link`. Sizes: md 48px, lg 56px. Arrow icon slides 4px on hover. Focus ring: 3px `marigold-300` + 2px offset. |
| **Eyebrow** | Small marigold thread dash (24px) + eyebrow text |
| **SectionHeading** | Eyebrow + h2 + optional lead paragraph; `align` prop |
| **StatCard** | Large number (CountUp) + label; used on the plum band |
| **ServiceCard** | Duotone icon in a rani-50 circle, title, text; hover lift + icon rotates 8° |
| **LoanCard** | Product name, one-line purpose (from crawled text), "Learn more"; top edge has a marigold thread that draws on hover |
| **ProcessStep** | Large outlined numeral (01–03), title, text, image |
| **TestimonialCard** | Kalam quote mark, quote, name; initials avatar (rani-100 circle). No photos, since none exist. |
| **TeamCard** | Photo (arch mask, grayscale → colour on hover), name, role. Social icons render only if real URLs exist. |
| **Accordion** | Accessible (button + region, `aria-expanded`); height animated with `motion`; plus icon rotates into a cross |
| **KeyFacts** | Definition-list card for loan facts; renders only the fields present |
| **Stepper** | Vertical numbered steps joined by the thread line |
| **Form fields** | Visible labels (never placeholder-only), 52px inputs, inline bilingual errors, `inputMode` set (`tel`, `numeric`) |
| **LanguageSwitch** | `EN \| हिं` pill toggle; keeps the current path |
| **MobileActionBar** | Fixed bottom bar on < md: Register (primary) + Call/WhatsApp, which appear only when the numbers exist. Hides on scroll down, shows on scroll up. |

## Iconography & imagery
- **Icons:** Lucide at 1.75 stroke, sized 24/28. Service icons are duotone: lucide stroke in rani-600 over a marigold-200 blob.
- **Photos:** use only the real photos from `assets/original` (field, award, team). Never use stock or AI-generated people.
  - Grade them consistently: slight warm lift, no heavy filters.
- **Decorative SVGs** (drawn in code, kept light):
  - The Golden Thread
  - A marigold bloom (5-petal radial)
  - A seed/sprout mark
  - A faint *alpana* dot pattern at 6% opacity for section backgrounds
- **Logo:** the client's existing logo, used unchanged. Use the white version on rani or plum backgrounds.
