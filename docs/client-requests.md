# Client Requests — Shree Shyam Small Growth Foundation website

## ✅ Confirmed by client (use these; they override crawled values)
| Item | Value | How to use |
|---|---|---|
| Phone | **+91 92290 88829** (`tel:+919229088829`); confirmed 19 Nov 2026, replacing +91 87509 71329 | Utility bar, footer, contact page, MobileActionBar "Call", JSON-LD `telephone` |
| WhatsApp | *not confirmed* | Keep `whatsapp: null` until confirmed. Switching it on is a one-line change in `site.ts`. |
| Office hours | **9:00 AM – 9:00 PM** (days not specified) | Contact page and footer. Show the time only, with no days, until days are confirmed. JSON-LD `openingHours` is omitted until the days are known. |
| Display address | Shambu Sah Building Near Transformer, Bariyarpur, Motihari, Bihar – 845401 | Unchanged from the live site; this is the source of truth for the displayed text. |
| Map pin | **Motihari Chini Mill — JWP7+H82, Maharshi Nagar, Chhota Bariyarpur, Motihari, Lauthaha, Bihar 845401** | Embed and "Open in Maps" link use this pin. Keep the existing short link `https://maps.app.goo.gl/CE8evf9puHXMrTCe7`. |
| Email | shreeshyamfoundation2026@gmail.com | Display address and Web3Forms recipient. Recipient still needs formal confirmation (G24). |
| Social links | **Keep placeholders for now** (client will send) | `placeholder: true` in `site.ts`; excluded from JSON-LD; the launch check blocks while any remain |
| Team LinkedIn | Placeholders for now | Same rule as social links |

## ⏳ Pending — client will share later (build must work without them)
- **B. Trust & compliance:**
  - legal registration details
  - regulatory status / disclosures
  - grievance redressal officer
  - fair practices code
  - fraud-awareness notice wording

  → Footer "Legal" area and any compliance page are built as hidden slots in `site.ts` (`legal: null`, `grievance: null`, `fraudNotice: null`).
- **C. Loan key facts** for all 4 products (amount, tenure, charges, repayment, eligibility, documents).

  → `KeyFacts` renders only the fields present. Until the client sends these, the facts already published on the live loan pages are shown verbatim (D17); charges and repayment stay hidden.
- **E. Media:** gallery photos, logo source file, high-res photos.

  → The Gallery is built but hidden from nav and sitemap. The team page is rebuilt from homepage data.
- **F. Hindi reviewer.** Needed for launch. Phase 7 (1 Nov 2026): every key has a Hindi draft (`_status: draft-needs-review`); the reviewer works in `docs/hindi-review.xlsx` (or `.csv`), with instructions on its second sheet. Choices to confirm there: names of people and the organisation kept in Latin script (Devanagari spelling is an option), common words such as लोन / आधार / पैन kept, Latin digits.
- **G. Vercel plan owner (Pro), domain DNS access, email recipient confirmation.** Needed for launch.

## ❓ Not yet answered — proceeding with these defaults (easy to reverse)
| # | Question | Default we're building with |
|---|---|---|
| D12 | Hero "About Us" button opens Contact | **Fixed:** points to About |
| D15 | Stats: 1200+ / 150+ / 98% | **Use as on the live site** |
| D16 | Testimonials are real, with consent | **Use as on the live site**; flagged for confirmation before launch |
| — | WhatsApp on the same number? | **Not shown** until confirmed |
| — | Office days | **Not shown** until confirmed |
| D17 | The live loan pages already publish some key facts (loan amount for all 4; tenure for Women Empowerment and Micro Business; eligibility and documents for Livestock). | ✅ **Approved:** show the published facts verbatim. They will be replaced when the client sends the full key facts (item C). Charges and repayment stay hidden until then. The values are in `src/data/loans.ts`. |

## ✅ Confirmed by client (31 Oct 2026) — review sheet 1
The client answered **Yes** to all 54 items in `docs/client-review-1.md`. Every content fix below is applied in `messages/en` and listed in `APPLIED` in `scripts/verify-content.ts`. That check maps each crawled string to its new text and confirms the named message key holds it. **To revert one:** restore the crawled text in `messages/en` and delete its `APPLIED` entry.

### Content fixes (applied)
| Review item | Fix id | Where (message key) | Was on the live site | Now |
|---|---|---|---|---|
| 1–2 (P1, P2) | A4 | `mission.intro`; `hrPolicy.sections.policyAmendments.p1`; `hrPolicy.contact.organisation` | "Shree Shyam MicroFinance"; "Shree Shyam-Baba Micro Growth Foundation" | "Shree Shyam Small Growth Foundation" |
| 3 (P3) | CR1-3 | `team.members.vikramSinha.name` | "Vikram Sinha" | "Vikram Kumar Sinha" (as in the HR Policy) |
| 4 (P3, D14) | CR1-4/5 | `team.members.sumitKumar.name` | "Sumit kumar" | "Sumit Kumar" (as in the HR Policy) |
| 5 (D14) | CR1-4/5 | `team.members.satyamPushkar.name`; `team.members.shishirKumar.name` | "Satyam pushkar"; "Shishir kumar" | "Satyam Pushkar"; "Shishir Kumar" |
| 7 (P4) | CR1-7 | `privacy.sections.contactUs.l3` | "Office Address: Near Chini Mill Road, In Front of Pani Tanki, Shambu Sah Building…" | "Office Address: Shambu Sah Building Near Transformer, Bariyarpur, Motihari, Bihar – 845401" |
| 8 (P6) | CR1-8 | `loans.products.microBusiness.facts.tenure.value` | "0 to 12 Months" | "Up to 12 Months" |
| 9 (P6) | CR1-9 | `hrPolicy.sections.probation.p1` | "…probation for 0-3 months, …" | "…probation for up to 3 months, …" |
| 11 (P8) | CR1-11 | `contact.intro` | "…growth opportunities.." | "…growth opportunities." |
| 12 (P8) | CR1-12 | `about.whyChoose.heading` | "Why Choose Shree Shyam Small Growth Foundation ?" | "Why Choose Shree Shyam Small Growth Foundation?" |
| 13 (P9) | CR1-13 | `common.footer.copyright` | "Copyright © 2026 Shree Shyam Small Growth Foundation ." | "Copyright © {year} Shree Shyam Small Growth Foundation." The footer fills `{year}` from the build date. |
| 14 (P10) | CR1-14 | `mission.coreValues.items.integrity` | "Integrity- Honest, …" | "Integrity – Honest, …" |
| 15 (P12) | CR1-15 | `contact.title` | "Contact us" | "Contact Us" |
| 16 (P13) | CR1-16 | `common.nav.loanProducts.agricultureLivelihood` | "Agriculture Livelihood Loan" | "Agriculture & Rural Livelihood Loan" (the page name) |
| 17 (P7) | A1 | `home.faq.items.*.question` | "Q1. What services…" … "Q6. How can I…" | "What services…" … "How can I…" |
| 18–19 (P8) | A2 | `register.heading`; `careers.heading` | "Register Now !!"; "Apply For Jobs !!" | "Register Now"; "Apply For Jobs" |
| 20–21 (P11) | A3 | `common.form.fields.email`; `common.form.fields.mobile` | "EmailId"; "Mobile No" | "Email"; "Mobile number" |

### Facts confirmed (text unchanged)
| Review item | Fact | Result |
|---|---|---|
| 6 (P3) | Pravin Kumar Singh is listed as a Director in the HR Policy only | Kept in the HR Policy. See the open follow-up below about the team section. |
| 10 (P5) | Staff working hours (Mon–Sat 10 AM – 6 PM, in the HR Policy) vs office hours (9 AM – 9 PM) | Both correct; no change. |
| — (D13) | "Our Policy" page is the Human Resource Policy | Labelled **"HR Policy"**, linked from the footer and Careers (review item 27). |

### New interface wording (approved as written)
All in `messages/en/common.json`.
| Review items | Wording |
|---|---|
| 22–33 | Navigation and buttons: "Loans", "All loans", "How to Join", "Careers", "Contact", "HR Policy", "Legal", "Register", "Explore Loans", "More about us", "Meet the team", "Learn more" |
| 34–42 | Form fields: `form.fields.ageConfirm`, `consentPhone`, `districtVillage`, `loanProduct`, `notSure`, `subject`, `message`, `position`; `form.optional`; `form.careersCv` |
| 43–45 | Form status: `form.status.sending`, `form.status.success`, `form.errors.sendFailed` |
| 46–53 | Form errors: `form.errors.*` |
| 54 | Picture descriptions: `alt.*` (all 19 images) |

### Open follow-up from review sheet 1
- **Item 6, Pravin Kumar Singh:** the "Yes" confirms he stays in the HR Policy. It doesn't say whether he should also appear in the team section, and no photo or role was sent. He is **not** added to the team section. Ask the client: should he be on the team page, and if so, with which photo and role?

## 📝 New interface wording since review sheet 1 — needs approval before launch
Not yet shown to the client. Include in the next review sheet.
- **Accessibility labels** (`common.a11y.*`): read aloud by screen readers, never shown on screen.
- **"Page not found" page** (Phase 2, `common.notFound.*`): "We couldn't find this page" / "The page may have moved when we rebuilt our website. These links will help you find your way." / "हिन्दी में देखें", with the approved "Back to home" and "Explore Loans" buttons.
- **Social network names** (`common.social.*`), read aloud for the footer icons: "Facebook", "LinkedIn", "X (Twitter)", "Instagram", "WhatsApp".
- **Picture descriptions for the new home-page photo crops** (Phase 3, `common.alt.*`; see `docs/photo-candidates.html`): `heroArch` "Smiling women from a village group sitting together, one holding up her membership card"; `aboutArch` "A woman in a green sari reading through documents during an outdoor meeting"; `processStepRegistration` "Women in a group raising their membership cards"; `processStepSupport` "A young man counting cash beside a register"; `processStepMonitoring` "A field worker in glasses reading through papers".
- **Footer redesign** (`common.footer.help`, `common.buttons.backToTop`): the column heading "Help" and the button "Back to top".
- **Testimonial controls** (Phase 3, `common.a11y.pauseSlides`, `common.a11y.playSlides`, read aloud only): "Pause automatic slides" / "Play automatic slides".
- **Reused wording on the home page** (Phase 3, no new text): the Loans section heading is the approved nav label "Loans" with "All loans"; the final call-to-action band reuses "Building Better Futures Together"; the milestone band's eyebrow is "Our Milestone"; the award story is signed with Saurav Prakash's name and role from the team list.
- **Loans pages** — ✅ approved internally (1 Nov 2026); include in client review 2. (Phase 4, `loans.hub.whoCanApply`, `loans.related.heading`) The section heading "Who can apply" on /loans/ (its two answers are FAQ Q2 and Q6, as crawled) and "Other loans" on each product page.
- **Loans hub intro** — ✅ approved internally (1 Nov 2026); include in client review 2. (Phase 4, reused text) there was no hub page on the old site, so /loans/ opens with the published "Financial Inclusion Services" description: "Providing responsible and affordable financial solutions to underserved individuals and communities."
- **Loan page labels, colon removal** (Phase 4, fix `P4-1`) — ✅ applied 1 Nov 2026 as a reversible default; include in client review 2. The old tables end their labels with colons ("Suitable For:", "Uses:", "Benefits:", "Common Features :", "Basic Eligibility :", "Required Documents :"). Now shown without the colon ("Suitable For", "Uses", …). To revert, restore the six `loans.products.*.lists.*.label` values and delete fix `P4-1` in `scripts/verify-content.ts`.
- **About cluster** (Phase 5, for client review 2):
  - **New interface wording:** `common.a11y.closeDialog` "Close" (gallery viewer) and `common.a11y.memberSocial` "{name} on LinkedIn (opens in a new tab)" (team icons), both read aloud only; picture description `common.alt.aboutHeroArch` "A smiling woman in a cream headscarf sitting with other women from a village group, holding up her membership form" (new crop for the About page, so it doesn't repeat the home photo).
  - **Reused wording:** the About page opens with the home page's "Empowering Communities With Confidence" and "Creating Brighter Futures Through Inclusive Finance and Sustainable Community Development". The Team page title is the approved nav label "Our Team" (the crawled heading "Our team Members" stays on the home page).
  - **Team social icons:** each member shows a LinkedIn icon, a placeholder that opens LinkedIn's home page (the old cards also showed X and Instagram placeholders; not carried over). Ask the client for each member's real LinkedIn address, or whether to remove the icons.
  - **Gallery:** built and working, but hidden (not linked, not indexed, kept out of the sitemap) until the client sends photos. For now it shows the photos we already have.
- **"Documents usually needed"** — ✅ approved internally (1 Nov 2026); include in client review 2. (Phase 4) product pages without their own documents list (Women Empowerment, Micro Business, Agriculture) show FAQ Q4 ("What documents are required for membership registration?") as crawled. Livestock shows its own published list instead.
- **Search-engine description** (Phase 3): the old site has no meta description, so every page's default description is the footer blurb ("Shree Shyam Small Growth Foundation is a socially driven organization committed to promoting financial inclusion, economic empowerment, and sustainable livelihoods for underserved communities."). The client may prefer a dedicated sentence.
- **More field photos (E. Media):** the home page has only two full-frame community photos, so the hero, About and Process images are different crops of the same two. More real photos from the client would remove the repetition.

## 🆕 CR-01 compact redesign (1 Nov 2026) — on client review sheet 2
CR-01 (`docs/cr-01-compact-redesign.md`) follows the client's reference picture. Its new wording is **proposed copy supplied by the client via the reference**: used on the site, but every string needs confirming. The client-facing questions are in `docs/client-review-2.md`. Each row's revert is one line.

| Status | Key | Proposed copy | Revert (one line) |
|---|---|---|---|
| CR-01 copy: confirm | `home.compact.heroScript` + `home.compact.heroTitle` | "Together We Build a" / "Stronger & Prosperous Tomorrow" (h1) | In `Hero.tsx`, render `home.hero.eyebrow` + `home.hero.title` (with `accentTags`) instead. |
| CR-01 copy: confirm | `home.compact.heroIntro` | "Shree Shyam Small Growth Foundation is committed to empowering underprivileged communities, especially women, through financial support, skill development and sustainable growth opportunities." | Delete the `<p>` in `Hero.tsx` (the live site had no hero intro). |
| CR-01 copy: confirm | `home.compact.heroSlogan` | "Empowered Women Build Stronger Communities" | Delete the slogan `<p>` in `Hero.tsx`. |
| CR-01 copy: confirm | `home.compact.impactSlogan` | "Small Steps Create Big Changes" | Delete the slogan block in `ImpactBand.tsx`. |
| CR-01 copy: confirm | `home.compact.cards.*` | "Women Empowerment", "Financial Inclusion", "Community Growth" | In `FeatureCards.tsx`, use `home.services.items.{womenEmpowerment,financialInclusion,communityWelfare}.title`. |
| CR-01 copy: confirm | `common.brand.tagline.*` | "Financial Inclusion • Women Empowerment • Community Growth" | Drop the `tagline` prop in `Header.tsx`. |
| CR-01 copy: confirm | `team.tiers.*` | "Chairman", "Leadership", "Executive Directors", "Heads & Officers" | Edit the four labels in `messages/en/team.json`. |
| CR-01 copy: confirm | `common.brand.nameLine1/2` + lockup | Emblem + typeset "SHREE SHYAM / SMALL GROWTH FOUNDATION" (new lockup) | `site.logoLockup = 'image'` in `src/data/site.ts`. |
| CR-01 copy: confirm | `common.buttons.joinUs`, `common.buttons.knowMore` | "Join Us", "Know More" | Use `common.buttons.register` / `common.buttons.moreAboutUs`. |
| CR-01 copy: confirm | `common.nav.visionMission`, `nav.loanProductsMenu`, `nav.membership` | "Vision & Mission", "Loan Products", "Membership" | Edit the three labels in `messages/en/common.json`. |
| CR-01 copy: confirm | `common.footer.rights` | "© {year} Shree Shyam Small Growth Foundation. All Rights Reserved." | In `Footer.tsx`, use `common.footer.copyright` (approved in review 1). |
| CR-01 copy: confirm | fix `CR01-1` | "Membership Benefits", "Membership Eligibility" (colon removed, like P4-1) | Restore the colons in `messages/en/howToJoin.json` and delete fix `CR01-1` in `scripts/verify-content.ts`. |
| New, read aloud only | `common.alt.heroPanel`, `common.alt.aboutPanel` | Picture descriptions for the two new curved-panel crops | Edit in `messages/en/common.json`. |

**Hindi:** `common.brand.*` has Hindi drafts (`_status: draft-needs-review`); the other new keys fall back to English until Phase 7.

### Not taken from the reference (intentional; CR-01 section 0)
- **Statistics:** the reference's 500+ / 300+ / ₹50 Lakh+ / 200+ are invented. The site keeps the live 1200+ / 150+ / 98% (D15). New figures only if the client sends verified ones.
- **Logo:** the reference's women-figures logo isn't the client's. The real emblem is used, never cropped or recoloured.
- **Photos:** the reference's AI-style photos (members in saris, the plant in hands) are never used. Only real photos from `assets/original`; the requested shot list is in client-review-2 item 13.
- **Navigation:** Gallery stays hidden until `gallery.enabled` (≥ 12 real photos). Terms & Conditions is not linked until its text exists. The `EN | हिं` switch and the mobile Register/Call bar are kept.

### ⏳ Pending from CR-01
- **Reporting lines** for the Team tree (who reports to whom). Until then the connectors run tier to tier; `reportsTo` in `src/data/team.ts` is ready for exact lines.
- **Terms & Conditions** text, or confirmation to omit it.
- **Gallery:** at least 12 real photos, with consent.
- **Photos** for the reference look (shot list in client-review-2, item 13).
- ~~Web3Forms access key~~ ✅ received 1 Nov 2026 (`.env.local` locally, and on Vercel). All three forms send; one test submission per form was sent at the end of Phase 6.

## 🆕 Phase 6 (1 Nov 2026) — on client review sheet 2 (Part E)
| Item | Wording / change | Revert |
|---|---|---|
| `contact.map.note` (new) | "The map is provided by Google. It loads only when you press “Show map”." | Edit in `messages/en/contact.json`. |
| `common.buttons.showMap`, `openInMaps` | "Show map", "Open in Maps" (written in Phase 1, first shown now) | Edit in `messages/en/common.json`. |
| `common.a11y.onThisPage` | "On this page" (the long-form contents heading, now visible) | Edit in `messages/en/common.json`. |
| Careers page title | The approved nav label "Careers" (crawled page title: "Career") | Use `careers.title` in `src/app/[locale]/careers/page.tsx`. |
| HR Policy page | h1 "Human Resource Policy" (crawled heading), with the crawled title "Our Policy" as the eyebrow | — |
| Fix `P6-1` | Privacy Policy section headings without the trailing colon (they are also the table of contents) | Restore the colons in `messages/en/privacy.json` and delete fix `P6-1` in `scripts/verify-content.ts`. |
| Email subjects (inbox only) | "Registration", "Contact Us", "Apply For Jobs" (crawled page titles/headings) | The `subject` prop on each page's `LazyWebForm`. |
| Hindi form texts | Drafts of every form label, error and status in `messages/hi/common.json` (`_status: draft-needs-review`) | For the Hindi reviewer (F). |
| Recipient | All forms deliver to shreeshyamfoundation2026@gmail.com (G24: still needs formal confirmation; review 2, item 24). | Change the recipient in the Web3Forms dashboard (the key decides the inbox). |
