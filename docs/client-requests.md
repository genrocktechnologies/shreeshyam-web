# Client Requests — Shree Shyam Small Growth Foundation website

## ✅ Confirmed by client (use these; they override crawled values)
| Item | Value | How to use |
|---|---|---|
| Phone | **+91 87509 71329** (`tel:+918750971329`) | Utility bar, footer, contact page, MobileActionBar "Call", JSON-LD `telephone` |
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
- **F. Hindi reviewer.** Needed for launch.
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
- **Search-engine description** (Phase 3): the old site has no meta description, so every page's default description is the footer blurb ("Shree Shyam Small Growth Foundation is a socially driven organization committed to promoting financial inclusion, economic empowerment, and sustainable livelihoods for underserved communities."). The client may prefer a dedicated sentence.
- **More field photos (E. Media):** the home page has only two full-frame community photos, so the hero, About and Process images are different crops of the same two. More real photos from the client would remove the repetition.
