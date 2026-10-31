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
| D13 | "Our Policy" page is titled "Human Resource Policy" | **"HR Policy"**, linked from the footer and Careers |
| D14 | Name capitalisation (Satyam pushkar, Sumit kumar, Shishir kumar) | **Keep exactly as crawled** until the client confirms. Asked in `docs/client-review-1.md`, items 4–5. |
| D15 | Stats: 1200+ / 150+ / 98% | **Use as on the live site** |
| D16 | Testimonials are real, with consent | **Use as on the live site**; flagged for confirmation before launch |
| — | WhatsApp on the same number? | **Not shown** until confirmed |
| — | Office days | **Not shown** until confirmed |
| D17 | The live loan pages already publish some key facts (loan amount for all 4; tenure for Women Empowerment and Micro Business; eligibility and documents for Livestock). | ✅ **Approved:** show the published facts verbatim. They will be replaced when the client sends the full key facts (item C). Charges and repayment stay hidden until then. The values are in `src/data/loans.ts`. |

## 🔁 Applied — reversible (approved defaults, awaiting client confirmation)
These fixes are already in `messages/en`. Each one is also listed in `APPLIED` in `scripts/verify-content.ts`, which checks that the fixed text is present. **To revert one:** restore the crawled text in `messages/en` and delete its `APPLIED` entry. The client confirms these in `docs/client-review-1.md`.

| # | Change | Where (message key) | Was on the live site | Now |
|---|---|---|---|---|
| A4 | ⚠️ **URGENT, needs client confirmation: these are policy pages.** Organisation name standardised (P1, P2) | `mission.intro`; `hrPolicy.sections.policyAmendments.p1`; `hrPolicy.contact.organisation` | "Shree Shyam MicroFinance"; "Shree Shyam-Baba Micro Growth Foundation" | "Shree Shyam Small Growth Foundation" |
| A1 | FAQ numbering removed (P7) | `home.faq.items.*.question` | "Q1. What services…" … "Q6. How can I…" | "What services…" … "How can I…" |
| A2 | "!!" removed from headings (part of P8) | `register.heading`; `careers.heading` | "Register Now !!"; "Apply For Jobs !!" | "Register Now"; "Apply For Jobs" |
| A3 | Old form labels not used (P11) | `common.form.fields.email`; `common.form.fields.mobile` | "EmailId"; "Mobile No" | "Email"; "Mobile number" |

## ✏️ Proposed content fixes — status
Phase 1 found these issues while mapping the crawl into `messages/en`. Per content rule 1, anything not marked "applied" stays verbatim until the client answers `docs/client-review-1.md`.

| # | Where (message key) | As on the live site | Issue | Status |
|---|---|---|---|---|
| P1 | `mission.intro` | "Shree Shyam MicroFinance is committed to…" | The organisation's name differs from "Shree Shyam Small Growth Foundation" | 🔁 Applied as A4 (URGENT confirmation) |
| P2 | `hrPolicy.sections.policyAmendments.p1`, `hrPolicy.contact.organisation` | "Shree Shyam-Baba Micro Growth Foundation" | A third name for the organisation | 🔁 Applied as A4 (URGENT confirmation) |
| P3 | `hrPolicy.contact.directors` vs `team.members` | "Vikram Kumar Sinha", "Sumit Kumar", "Pravin Kumar Singh" | Team lists "Vikram Sinha" and "Sumit kumar"; Pravin Kumar Singh is not on the team list | ❓ Verbatim; asking the client |
| P4 | `privacy.sections.contactUs.l3` | "Office Address: Near Chini Mill Road, In Front of Pani Tanki, Shambu Sah Building…" | A longer address than the confirmed display address | ❓ Verbatim; asking the client |
| P5 | `hrPolicy.sections.workingHours.list1` | "Monday – Saturday: 10:00 AM – 6:00 PM" | These are staff working hours in the policy. They differ from the confirmed office hours (9 AM – 9 PM); confirm both are correct | ❓ Verbatim; asking the client |
| P6 | `loans.products.microBusiness.facts.tenure.value`; `hrPolicy.sections.probation.p1` | "0 to 12 Months"; "0-3 months" | A range starting at 0 reads oddly. Check the intended minimum | ❓ Verbatim; asking the client |
| P7 | `home.faq.items.*.question` | "Q1. What services…" … "Q6. …" | The numbering is part of the text; an accordion doesn't need it | 🔁 Applied as A1 |
| P8 | `contact.intro`; `about.whyChoose.heading`; `register.heading`; `careers.heading` | "…opportunities.."; "…Foundation ?"; "Register Now !!"; "Apply For Jobs !!" | Double full stop, space before "?", double "!!" | 🔁 "!!" applied as A2. ❓ ".." and " ?" verbatim; asking the client |
| P9 | `common.footer.copyright` | "Copyright © 2026 Shree Shyam Small Growth Foundation ." | Space before the full stop; the year is fixed at 2026 | ❓ Verbatim; asking the client |
| P10 | `mission.coreValues.items.integrity` | "Integrity- Honest, …" | The other values use " – " | ❓ Verbatim; asking the client |
| P11 | `common.form.fields.email`, `common.form.fields.mobile` | "EmailId", "Mobile No" | Old form labels; "Email" and "Mobile number" read better | 🔁 Applied as A3 |
| P12 | `contact.title` vs `common.nav.contactUs` | "Contact us" / "Contact Us" | Inconsistent capitalisation | ❓ Verbatim; asking the client |
| P13 | `common.nav.loanProducts.agricultureLivelihood` vs `loans.products.agricultureLivelihood.name` | "Agriculture Livelihood Loan" / "Agriculture & Rural Livelihood Loan" | The menu name differs from the page name | ❓ Verbatim; asking the client |

## 📝 New interface wording — needs approval before launch
These strings don't exist on the live site. They are new UI text the rebuild needs, kept to plain, minimal wording, and are all in `messages/en/common.json`.
- **Form fields:** `form.fields.ageConfirm` ("I am 18 years of age or above", adapted from the crawled membership eligibility); `form.fields.consentPhone`; `form.fields.districtVillage`, `loanProduct`, `notSure`, `subject`, `message`, `position`.
- **Form messages:** `form.errors.*`; `form.status.success` ("Our team will get back to you as soon as possible", adapted from the crawled contact-form intro); `form.careersCv`.
- **Navigation and buttons from site-plan.md:** "Loans", "All loans", "How to Join", "Careers", "Contact", "HR Policy", "Legal", "Explore Loans", "More about us", "Meet the team", "Learn more".
- **Alt text for all 19 images:** `alt.*`.
- **Accessibility labels:** `a11y.*`.
