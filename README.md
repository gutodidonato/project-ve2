# Rodovia 2026

Personal portfolio of Luis Didonato, built as an interactive "road" scene: a retro-wave DeLorean you drive between zones (experience, cases, workshop, services, contact), with a classic scrollable "pit stop" version of the same content for accessibility and SEO. Next.js 16 (App Router) with React Three Fiber, bilingual (pt / en).

Requires Node 22.

## Scripts

- `npm run dev` - start the dev server (Turbopack)
- `npm run build` - production build
- `npm run start` - serve the production build
- `npm run lint` - ESLint (`eslint .`)
- `npm run typecheck` - TypeScript check (`tsc --noEmit`)
- `npm test` - unit tests (Vitest)
- `npm run test:e2e` - functional end-to-end tests (Playwright, chromium + mobile, port 3100; builds and starts the site)
- `npm run test:perf` - timing and payload budgets (Playwright `perf` project, opt-in: run it alone, on a quiet machine)
- `npm run check:bundle` - first-load JS budget, after a build
- `npm run assets` - optimize 3D assets (`scripts/optimize-assets.mjs`); regenerates the GLB served from `public/models/` out of `assets-src/`

## Deploy (Vercel)

Import the repository into Vercel (framework preset: Next.js, Node 22.x) and set these environment variables for the Production environment. `.env.example` lists them with comments.

| Variable | What it does |
|----------|--------------|
| `NEXT_PUBLIC_SITE_URL` | Public origin of the site, **without a trailing slash** (`https://example.com`). Used for canonical / hreflang / Open Graph URLs, the sitemap and `robots.txt`. Blank or unset falls back to the default Vercel URL, so set it as soon as the real domain is attached. |
| `RESEND_API_KEY` | Resend API key for the contact form. |
| `CONTACT_TO_EMAIL` | Inbox that receives the messages. |
| `CONTACT_FROM_EMAIL` | Sender address, e.g. `Rodovia 2026 <contato@your-domain>`. |

Until `RESEND_API_KEY` and `CONTACT_TO_EMAIL` are both set, the contact API answers 503 and the form tells visitors to use the email address instead.

**Sender domain.** When `CONTACT_FROM_EMAIL` is blank the form sends from `onboarding@resend.dev`, Resend's shared test sender, which only delivers to the email address of the Resend account owner. That is enough for a smoke test, but production needs a domain verified in Resend (DNS records) and a sender on that domain in `CONTACT_FROM_EMAIL`.

**3D model.** The car served to visitors is `public/models/delorean.glb`, generated from the source export in `assets-src/` by `npm run assets`. Run it again after changing the pipeline or the source model, and commit the result.

Before promoting a build: `npm run typecheck && npm run lint && npm test && npm run build && npm run check:bundle && npm run test:e2e`.

## Credits

"DeLorean DMC12 || Retro wave art" by dark_igorek (https://sketchfab.com/3d-models/delorean-dmc12-retro-wave-art-6b18d3a8859749379987380bf2ac34ab), CC BY 4.0, modified (optimized).
