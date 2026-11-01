# Deploying to Vercel

The site is a fully static export (`output: 'export'` in `next.config.mjs`). Vercel serves the files in `out/`, and redirects and security headers come from `vercel.json`. There are no serverless functions and no runtime environment variables.

## Project settings

| Setting | Value |
|---|---|
| Framework Preset | **Next.js** |
| Root Directory | `./` (repo root) |
| Install Command | `pnpm install --frozen-lockfile` (override) |
| Build Command | `pnpm build` (the default `next build` is equivalent) |
| Output Directory | Leave the default. For a static export the Next.js preset publishes `out/`. If you ever switch the preset to **Other**, set it to `out`. |
| Node.js Version | **22.x**. `package.json` declares `"engines": { "node": "22.x" }`, which takes precedence over the dashboard setting. |
| Production branch | `main` (previews build from every other branch) |

### Environment variables

| Name | Value | Environments | Why |
|---|---|---|---|
| `ENABLE_EXPERIMENTAL_COREPACK` | `1` | Production, Preview, Development | Vercel's built-in pnpm is chosen from the lockfile version (`9.0`) and is older than pnpm 11. With this set, Vercel uses Corepack to install the exact version in `package.json` (`"packageManager": "pnpm@11.9.0"`). Without it, an older pnpm would ignore the build approvals in `pnpm-workspace.yaml`. |
| `NEXT_PUBLIC_WEB3FORMS_KEY` | the Web3Forms access key | Production, Preview, Development | Read at **build** time (static export) by `src/lib/web3forms.ts`; it is a public key, designed to be in the page. Locally it lives in `.env.local` (gitignored). Without it the forms render but report "could not be sent". Changing it needs a redeploy. |

No other variables are needed.

## Build approvals (pnpm 11)

pnpm 11 refuses to run dependency build scripts unless they're approved. The approvals are committed in `pnpm-workspace.yaml`:

```yaml
allowBuilds:
  '@parcel/watcher': true
  '@swc/core': true
  esbuild: true
  unrs-resolver: true
```

`sharp` (dev-only, used by `scripts/images.ts`) ships prebuilt binaries and has no install script, so it needs no approval. If a future install ends with `ERR_PNPM_IGNORED_BUILDS`, run `pnpm approve-builds` locally and commit the updated `pnpm-workspace.yaml`.

Verified on 1 Nov 2026: in a fresh clone with no `node_modules`, `corepack pnpm install --frozen-lockfile` finished with no ignored-build errors (pnpm v11.9.0), and `pnpm build` produced `out/`.

## Preview deployments and measurement

- **Turn off the Vercel Toolbar for previews:** Project → Settings → General → Vercel Toolbar → set Preview to off. The Toolbar injects a script from `vercel.live`, which the site's Content-Security-Policy (`script-src 'self'`) blocks. The resulting console errors would lower the Lighthouse Best Practices score and add noise to PageSpeed Insights runs.
- **Deployment Protection:** PageSpeed Insights can't log in, so the preview URL must be publicly reachable while you measure. Either disable Vercel Authentication for previews temporarily, or use a Protection Bypass for Automation link.
- **Measure** with PageSpeed Insights (mobile) on `/en/` and `/hi/`, at least 3 runs each, and record the median. The Phase 3 local numbers to compare against are in the Phase 3 commit message.
- **Check font preloads** on the preview: view the source of `/en/` and confirm there are `<link rel="preload" as="font">` tags for Fraunces, Mukta and Kalam. Local Windows builds emit none (see `docs/build-plan.md`, Phase 8).

## What `vercel.json` does

- `trailingSlash: true` and `cleanUrls: true` match `next.config.mjs`, so `/en/loans/` serves `out/en/loans/index.html`.
- `/` redirects to `/hi/` when `Accept-Language` starts with Hindi, otherwise to `/en/`. These are temporary redirects, so they can change later. `out/index.html` (a meta-refresh to `/en/`) is the fallback for hosts without redirects.
- The old `.php` URLs get 301 redirects to their new pages (see `docs/redirect-map.md`). Targets that aren't built yet return the site's 404 page until their phase ships.
- The security headers include a CSP that allows only self-hosted scripts and fonts, Web3Forms for form posts and Google Maps frames. `/_next/static/*` is cached for a year as immutable, since those filenames are content-hashed.
- It is validated against the official schema (`https://openapi.vercel.sh/vercel.json`).

## Custom domain (at launch, Phase 8)

Add the domain in Project → Domains and point DNS as Vercel instructs. HTTPS is automatic. Keep the old host's `.php` URLs resolving to Vercel so the 301s in `vercel.json` carry their search ranking over.
