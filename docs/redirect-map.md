# Redirect map — old `.php` URLs → new clean URLs

Every page URL found on https://shreeshyamfoundation.in/ (the 17 pages in the crawl, see `content/_crawl.json`), with a proposed clean URL for the Next.js site. All redirects should be **permanent (308)** so search engines move ranking to the new URL. The structure follows the live site's own navigation: _About_ pages sit under `/about`, the _Products_ menu becomes `/loans`.

The new paths have no locale prefix. If next-intl is set up with a prefixed locale (for example `/en/...`), the targets get that prefix, and the old URLs should redirect straight to the final localised URL in one hop.

## Pages

| Old URL | New URL | Live status (crawl) | Notes |
| --- | --- | --- | --- |
| `/index.php` | `/` | 200 | Also redirect `/index.php?…` (keep the query string). |
| `/about-us.php` | `/about` | 200 | |
| `/our-mission.php` | `/about/mission` | 200 | Footer label "Mission". |
| `/our-vision.php` | `/about/vision` | 200 | |
| `/team.php` | `/about/team` | **500** | The live page errors, so there is no content to migrate. The team members appear on `index.php` and `about-us.php` ("Our team Members") and can be the source for this page. |
| `/gallery.php` | `/about/gallery` | **500** | The live page errors, so there is no content to migrate. The gallery photos must come from the client. |
| `/milestone.php` | `/about/milestones` | 200 | |
| `/women-empowerment-loan.php` | `/loans/women-empowerment` | 200 | Navigation group "Products". |
| `/micro-business-loan.php` | `/loans/micro-business` | 200 | |
| `/agriculture-rural-livelihood-loan.php` | `/loans/agriculture-rural-livelihood` | 200 | The navigation label "Agriculture Livelihood Loan" differs from the page title "Agriculture & Rural Livelihood Loan". |
| `/livestock-loan.php` | `/loans/livestock` | 200 | |
| `/our-policy.php` | `/policies/human-resource` | 200 | The navigation says "Our Policy", but the page content and `<title>` are the "Human Resource Policy". A `/policies` index can hold further policies later. |
| `/career.php` | `/careers` | 200 | |
| `/registration.php` | `/register` | 200 | |
| `/registration-process.php` | `/register/process` | 200 | |
| `/contact-us.php` | `/contact` | 200 | |
| `/privacy-policy.php` | `/privacy-policy` | 200 | |

New URL with no old page: `/loans` (an index for the Products menu; the live menu parent is `href="#"`).

## Not pages: form endpoints

These are POST targets, not pages, so they must not be redirected to a page. Each needs a Next.js route handler or server action. If anything outside the site still posts to the old URLs, use a 308 redirect, which keeps the POST method and body.

| Old endpoint | Used by | Proposed replacement |
| --- | --- | --- |
| `/formhandler.php` | Contact form (`contact-us.php`) | `/api/contact` |
| `/registerHandler.php` | Registration form (`registration.php`) | `/api/register` |
| `/careerHandler.php` | Career application form (`career.php`) | `/api/careers` |

## Referenced only in commented-out HTML

`blog.php` and `single-blog.php` appear only inside a commented-out "Our recent blog & articles" block on `index.php`. Both currently return **404 "File not found."** No redirect is needed unless a blog is added (then `/blog` and `/blog/[slug]`).

## Host-level rules

| From | To |
| --- | --- |
| `http://…` | `https://…` |
| `https://www.shreeshyamfoundation.in/*` | `https://shreeshyamfoundation.in/*` (or the reverse; pick one canonical host) |
| Trailing slash variants (`/about/`) | No trailing slash (`/about`), which is the Next.js default |
| Old asset paths `/assets/images/**` | Only if images are known to be hotlinked or indexed in image search. Otherwise let them 404. |

## `next.config.mjs` sketch

```js
const redirects = [
  ['/index.php', '/'],
  ['/about-us.php', '/about'],
  ['/our-mission.php', '/about/mission'],
  ['/our-vision.php', '/about/vision'],
  ['/team.php', '/about/team'],
  ['/gallery.php', '/about/gallery'],
  ['/milestone.php', '/about/milestones'],
  ['/women-empowerment-loan.php', '/loans/women-empowerment'],
  ['/micro-business-loan.php', '/loans/micro-business'],
  ['/agriculture-rural-livelihood-loan.php', '/loans/agriculture-rural-livelihood'],
  ['/livestock-loan.php', '/loans/livestock'],
  ['/our-policy.php', '/policies/human-resource'],
  ['/career.php', '/careers'],
  ['/registration.php', '/register'],
  ['/registration-process.php', '/register/process'],
  ['/contact-us.php', '/contact'],
  ['/privacy-policy.php', '/privacy-policy'],
].map(([source, destination]) => ({ source, destination, permanent: true }));
```
