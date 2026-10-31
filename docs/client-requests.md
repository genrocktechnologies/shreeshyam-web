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

  → `KeyFacts` renders only the fields present (all hidden for now).
- **E. Media:** gallery photos, logo source file, high-res photos.

  → The Gallery is built but hidden from nav and sitemap. The team page is rebuilt from homepage data.
- **F. Hindi reviewer.** Needed for launch.
- **G. Vercel plan owner (Pro), domain DNS access, email recipient confirmation.** Needed for launch.

## ❓ Not yet answered — proceeding with these defaults (easy to reverse)
| # | Question | Default we're building with |
|---|---|---|
| D12 | Hero "About Us" button opens Contact | **Fixed:** points to About |
| D13 | "Our Policy" page is titled "Human Resource Policy" | **"HR Policy"**, linked from the footer and Careers |
| D14 | Name capitalisation (Satyam pushkar, Sumit kumar, Shishir kumar) | **Keep exactly as crawled** until the client confirms |
| D15 | Stats: 1200+ / 150+ / 98% | **Use as on the live site** |
| D16 | Testimonials are real, with consent | **Use as on the live site**; flagged for confirmation before launch |
| — | WhatsApp on the same number? | **Not shown** until confirmed |
| — | Office days | **Not shown** until confirmed |
