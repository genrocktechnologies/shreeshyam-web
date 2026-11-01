# Redirect map — old `.php` URLs → new URLs

Reconciled with the URL map in `docs/site-plan.md`, which is the source of truth for paths. Implemented in **`vercel.json`**; `next.config` redirects don't work with `output: 'export'`.

- Every old page gets a **301** to the English version (`/en/…/`). The old site had no Hindi.
- New URLs end with a trailing slash (`trailingSlash: true`).
- Live status is from the crawl of 2026-10-31 (`content/_crawl.json`).

## Pages

| Old URL | New URL | Live status | Notes |
| --- | --- | --- | --- |
| `/index.php` | `/en/` | 200 | |
| `/about-us.php` | `/en/about/` | 200 | |
| `/our-mission.php` | `/en/about/vision-mission/#mission` | 200 | CR-01: Vision and Mission are one page. |
| `/our-vision.php` | `/en/about/vision-mission/#vision` | 200 | CR-01: Vision and Mission are one page. |
| `/team.php` | `/en/about/team/` | **500** | No content on the old page. The new page is built from the homepage team data. |
| `/gallery.php` | `/en/about/gallery/` | **500** | No content on the old page. The new page is hidden from nav and sitemap until the client sends photos, but the URL still resolves. |
| `/milestone.php` | `/en/about/milestones/` | 200 | |
| `/women-empowerment-loan.php` | `/en/loans/women-empowerment/` | 200 | |
| `/micro-business-loan.php` | `/en/loans/micro-business/` | 200 | |
| `/agriculture-rural-livelihood-loan.php` | `/en/loans/agriculture-livelihood/` | 200 | |
| `/livestock-loan.php` | `/en/loans/livestock/` | 200 | |
| `/registration-process.php` | `/en/membership/` | 200 | CR-01: How to Join and Register are one Membership page. |
| `/registration.php` | `/en/membership/` | 200 | CR-01 (as specified: the page, not `#register`). |
| `/career.php` | `/en/careers/` | 200 | |
| `/our-policy.php` | `/en/hr-policy/` | 200 | The page is titled "Human Resource Policy" (D13). |
| `/contact-us.php` | `/en/contact/` | 200 | |
| `/privacy-policy.php` | `/en/privacy-policy/` | 200 | |

**New page with no old URL:** `/en/loans/` (the loans hub).

## Retired new-site URLs (CR-01)

These paths were planned or built before CR-01. They 301 in both locales (`/:locale(en|hi)/…`, with or without the trailing slash):

| Old path | New path |
| --- | --- |
| `/{en,hi}/about/mission/` | `/{en,hi}/about/vision-mission/#mission` |
| `/{en,hi}/about/vision/` | `/{en,hi}/about/vision-mission/#vision` |
| `/{en,hi}/how-to-join/` | `/{en,hi}/membership/` |
| `/{en,hi}/register/` | `/{en,hi}/membership/#register` |

`tests/redirects.spec.ts` checks every row of this file's tables against `vercel.json` through `scripts/serve-static.mjs`, which applies the `vercel.json` redirects locally.

## Site root

| Request | Redirect |
| --- | --- |
| `/` with `Accept-Language` starting `hi` | `/hi/` (temporary, since it depends on the header) |
| `/` otherwise | `/en/` (temporary) |

`src/app/page.tsx` also redirects `/` to `/en/`, as a fallback for hosts other than Vercel.

## Not redirected

| Old URL | Why |
| --- | --- |
| `/formhandler.php`, `/registerHandler.php`, `/careerHandler.php` | These were POST handlers, not pages. The new forms post to Web3Forms. Nothing links to them, so they return 404. |
| `/blog.php`, `/single-blog.php` | They only appear in commented-out HTML and already return 404. |
| `/assets/**` (old images, CSS, JS) | They aren't linked from outside. They return 404 unless search data shows traffic. |

## Verify before switching DNS (Phase 8)

On the Vercel preview, run `curl -sI <preview>/<old>.php` for each row above. Expect a `301` with the correct `Location`, and no second hop (check that Vercel's `trailingSlash` doesn't add a `/index.php/` redirect first).
