# Site Plan

All English copy comes from `content/<slug>.json`. Section lists below say **where** the content goes, not what it says. "(new)" marks a structural element that reorganises existing content. It never introduces new claims. "(client)" means the content is pending, see client-requests.md.

## URL map (both locales: `/en/...`, `/hi/...`)
| New path | Old URL | Notes |
|---|---|---|
| `/` | index.php | |
| `/about/` | about-us.php | |
| `/about/mission/` | our-mission.php | |
| `/about/vision/` | our-vision.php | |
| `/about/team/` | team.php | Old page returns 500 → build from the homepage team data |
| `/about/gallery/` | gallery.php | Old page returns 500 → (client) photos; hidden from nav until it has content |
| `/about/milestones/` | milestone.php | |
| `/loans/` | — (new hub) | Overview of the 4 products |
| `/loans/women-empowerment/` | women-empowerment-loan.php | |
| `/loans/micro-business/` | micro-business-loan.php | |
| `/loans/agriculture-livelihood/` | agriculture-rural-livelihood-loan.php | |
| `/loans/livestock/` | livestock-loan.php | |
| `/how-to-join/` | registration-process.php | |
| `/register/` | registration.php | |
| `/careers/` | career.php | |
| `/hr-policy/` | our-policy.php | The page title is "Human Resource Policy", so it's labelled "HR Policy" and moves to the footer and Careers page |
| `/contact/` | contact-us.php | |
| `/privacy-policy/` | privacy-policy.php | |

- Reconcile `docs/redirect-map.md` to this table.
- `vercel.json`:
  - 301 every old `.php` URL to `/en/<new>/`.
  - Send `/` to `/hi/` when `accept-language` starts with `hi`, otherwise to `/en/` (redirect with a `has` header condition).
  - Set `cleanUrls: true` and `trailingSlash: true`.

## Navigation
**Desktop header:**
- Logo
- About ▾ (mega: About, Mission, Vision, Team, Milestones, plus a feature card with the award photo)
- Loans ▾ (mega: 4 product cards with icon and one-liner, plus "All loans")
- How to Join
- Careers
- Contact
- `EN | हिं`
- **Register** button (primary)

**Top utility bar** (desktop, slim, plum-900): address (links to Maps) · email · phone and WhatsApp, which appear only when they exist.

**Mobile:** logo + language + menu button. A bottom `MobileActionBar` holds Register, plus Call and WhatsApp when available.

**Footer:**
- Logo (white) + foundation blurb
- Quick links: About, Mission, Loans, How to Join, Register, Careers
- Legal: Privacy Policy, HR Policy, plus (client) registration details and a grievance officer line
- Contact
- Socials: only if real URLs exist
- Copyright

## Home (`index.json`)
1. **Hero:** the eyebrow "Building Better Futures Together" with the h1 from slide 1.
   - CTAs: Register (primary) and Explore Loans (ghost).
   - Arch image: the hero field photo.
   - Fixes the double-h1 issue: slide 2 is no longer a slide; its heading is reused in section 3.
2. **Trust stats band:** 1200+ Women Entrepreneurs Supported · 150+ Financial Literacy Programs · 98% Community Trust & Satisfaction.
3. **About:** eyebrow "Empowering Communities With Confidence", h2 from slide 2, the "About the Foundation" paragraphs, `about_me.jpg`, and a "More about us" link to `/about/`. This also fixes the wrong hero button link.
4. **Services:** "Our Services for Financial Inclusion and Community Empowerment", 6 cards.
5. **Loans (new):** the 4 products, with a one-line purpose each taken from the product page's first paragraph. Links go to product pages.
6. **Process:** "Our Process for Empowering Communities…", 3 steps with their images. CTA: How to Join.
7. **Milestone:** "A Proud Milestone, A Greater Responsibility", the award photo, both paragraphs, attributed to Saurav Prakash, MD, CEO & Founder.
8. **Testimonials:** "What Our Members Say" + subtitle, 4 quotes.
9. **Team:** "Our Team Members", 7 people in the crawled order, with a "Meet the team" link.
10. **FAQ:** 6 Q&As, plus FAQPage JSON-LD.
11. **Final CTA band (new):** heading taken from existing copy (e.g. "Building Better Futures Together"), with Register and Contact buttons.

## Inner pages
- **Shared page shell:** compact hero (breadcrumb, h1, optional eyebrow and arch image), body sections, and a closing CTA band (Register / Contact).
- **Sections repeated across old pages** ("About the Foundation", milestone, team) become shared components fed from one data source. They are used only where they add value, not duplicated wholesale.

| Page | Sections |
|---|---|
| About | Intro → foundation story (all crawled sections in order) → stats → Mission & Vision teaser cards → Milestone → CTA |
| Mission / Vision | Long-form reading layout with a pull-quote treatment for the key statement and a link to the sibling page |
| Team | Leadership grid of 7 (Chairman and MD/CEO featured larger, in crawled order) |
| Milestones | Crawled content laid out as a vertical timeline if it contains dates; otherwise an editorial layout |
| Gallery | Masonry + lightbox. Hidden until (client) photos arrive. |
| Loans hub | Intro → 4 large LoanCards → "Who can apply" (from FAQ Q2/Q6 text) → How to Join CTA |
| Loan product (×4) | Hero (name, purpose) → all crawled sections → **KeyFacts** (amount, tenure, charges, eligibility, documents: (client), renders only the fields present) → "Documents usually needed" (FAQ Q4 text) → related loans → Register CTA |
| How to Join | Crawled steps as a vertical Stepper → documents checklist → Register CTA |
| Register | Short 3-step form (see Forms) + a reassurance panel: "documents are verified at our office" (client to approve wording) |
| Careers | Crawled content → application form → link to HR Policy |
| HR Policy / Privacy | Long-form layout with sticky TOC and reading progress |
| Contact | Address card (Maps link), email, phone (client) → contact form → click-to-load map with the corrected pin (client confirms) |
| 404 | On-brand, with a seed-to-sprout illustration and links home and to Loans |

## Forms (Web3Forms → shreeshyamfoundation2026@gmail.com)
- **Register:**
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
  - `FAQPage` on Home
- `sitemap.xml` and `robots.txt` via the App Router metadata routes (supported in static export).
- All 32 images missing alt text get alt text in `messages/*`.
