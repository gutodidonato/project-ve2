# Portfolio v3 (F0 + F1) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the Vite portfolio with a Next.js site whose server-rendered one-pager ("pit stop") carries the full CV (F0), then mount a drivable open-world hub on top of it (F1).

**Architecture:** Next.js App Router renders `/pt` and `/en` statically from `content/{pt,en}/profile.ts`. A client-only `GameMount` lazy-loads an R3F `WorldCanvas`; all game rules live in pure functions under `lib/game/` driven once per frame by `tickGame`, with a zustand store holding only discrete state (zone, mode, pit stop, tier).

**Tech Stack:** Node 22 · Next.js 16.4 · React 19.3 · TypeScript (strict) · Tailwind CSS 4.3 · next-intl 4.14 · three 0.186 · @react-three/fiber 9.8 · @react-three/drei 10.7 · @react-three/postprocessing 3.2 · zustand 5 · zod 4 · resend 6 · detect-gpu 5 · Vitest 5 · Playwright 1.64 · @gltf-transform/cli 4.5

**Spec:** `docs/superpowers/specs/2026-10-14-portfolio-v3-design.md` · visual reference: https://claude.ai/artifact/5fEei1UrT5LbaA3ubYTCZF (prototype B)

## Global Constraints

- Work on branch `v3`. Tag `v2-legacy` already marks the old site; do not touch `main`.
- Locales are exactly `pt` (default) and `en`. `<html lang>` is `pt-BR` / `en`.
- Section/zone anchor ids are fixed in both locales: `experiencia`, `cases`, `oficina`, `servicos`, `contato`.
- The phone number never appears in site source, HTML or JSON (it exists only inside the PDF).
- `useFrame` callbacks never call React `setState` or zustand setters except inside `GameDirector` when applying `GameEvent`s.
- three/R3F code is only imported from modules loaded through `next/dynamic(..., { ssr: false })`; the initial route JS must not include three.
- Never read `window.innerWidth` during render; use `matchMedia`/resize hooks.
- Every `localStorage` access goes through `lib/storage.ts` (try/catch).
- Colors are CSS tokens from the artifact: `--night #0c0717`, `--panel #140c23`, `--line #2e2148`, `--ink #efe8ff`, `--muted #a597c6`, `--magenta #ff3ea5`, `--cyan #3ee8ff`, `--sun #ffb347`, `--bad #ff5a5a`. Single dark theme.
- Fonts via `next/font/google`: Michroma (display), IBM Plex Sans (body), IBM Plex Mono (mono/HUD).
- Model credit (exact text, both locales may translate the sentence around it): `"DeLorean DMC12 || Retro wave art" by dark_igorek (https://sketchfab.com/3d-models/delorean-dmc12-retro-wave-art-6b18d3a8859749379987380bf2ac34ab), CC BY 4.0, modified (optimized).`
- Physics constants (from prototype): `ACCEL = 28`, drag factor `0.3 ** dt`, speed range `[-10, 22]`, `STEER_RATE = 2.3`, `BOUND = 76`, `MAX_DT = 0.05`.
- Zones (tour order) and positions: experiencia (-34,-26) `#3ee8ff`, cases (32,-32) `#ff3ea5`, oficina (-36,26) `#ffb347`, servicos (34,26) `#3ee8ff`, contato (0,54) `#ff3ea5`. Detection radius 7.5, arrive radius 3.5.
- Timings: demo dwell 3.5 s, idle-to-demo 20 s, wheel-to-distance factor 0.12, max tour budget 120.
- Camera: perspective fov 48, offset from car `(0, 24, 20)`, follow lerp `1 - 0.04 ** dt`, lookAt `(car.x, 0, car.z - 2)`.
- Commit messages: conventional (`feat:`, `test:`, `chore:`, `docs:`) ending with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

## Review Focus

1. Typing inside a form field (contact form in a panel) must not drive the car or toggle pit stop with `P` → covered in Task 8 (`isTypingTarget`) and Task 13 e2e.
2. Mouse wheel while in pit stop mode must scroll the page normally, never be swallowed by the game → Task 13 e2e.
3. Returning to a background tab yields a huge `dt`; the car must not tunnel past the map bounds or jump between zones → Task 8 test `stepCar clamps dt`.
4. Unknown or foreign hash (`#foo`, `#Cases`, `#contato?x`) must spawn at the default point without throwing → Task 8 test for `parseZoneHash`.
5. `localStorage` throwing (Safari private mode, blocked storage) must not break first paint or the pit stop toggle → Task 9 test for `lib/storage.ts`.

---

## File Map

```
app/layout.tsx                         root passthrough (no <html>; locale layout owns it)
app/[locale]/layout.tsx                <html>, fonts, NextIntlClientProvider, metadata
app/[locale]/page.tsx                  PitStop + JSON-LD + <GameMount/>
app/api/contact/route.ts               POST handler
app/sitemap.ts · app/robots.ts
app/globals.css                        tokens, base, sr-only game-mode rule
proxy.ts                               next-intl locale routing (Next 16 name for middleware)
i18n/routing.ts · i18n/request.ts
messages/pt.json · messages/en.json    UI strings only
content/types.ts · content/index.ts · content/pt/profile.ts · content/en/profile.ts
components/pitstop/*.tsx               RSC sections + ContactForm (client) + EmailLink (client)
components/game/*.tsx                  client game components
lib/contact.ts                         validation + rate limiter
lib/storage.ts                         safe localStorage
lib/pitstop.ts                         initial mode decision
lib/store.ts                           zustand discrete state
lib/game/{types,physics,zones,autopilot,input,tick,runtime,rng,tier}.ts
scripts/optimize-assets.mjs
assets-src/delorean.source.glb         moved original
public/models/delorean.glb · public/cv/luis-didonato-pt.pdf · public/fonts/ibm-plex-mono-500.woff
tests/**/*.test.ts(x)                  Vitest
e2e/*.spec.ts                          Playwright
```

---

## F0 — Foundation and pit stop

### Task 1: Replace Vite app with Next.js skeleton

**Files:**
- Delete: `src/`, `index.html`, `vite.config.js`, `eslint.config.js`, `eu.svg`, `public/video/`, `public/imgs/sites/`, `public/imgs/stacks/`, `public/models/pitstop.glb`, `public/models/pitstop2.glb`, `public/models/delorean_modified.glb`, `package-lock.json`
- Move: `public/models/delorean_dmc12__retro_wave_art.glb` → `assets-src/delorean.source.glb`
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `postcss.config.mjs`, `eslint.config.mjs`, `vitest.config.ts`, `playwright.config.ts`, `app/layout.tsx`, `app/[locale]/layout.tsx` (temporary, no i18n yet), `app/[locale]/page.tsx` (placeholder), `app/globals.css`, `tests/smoke.test.ts`
- Modify: `.gitignore` (add `.next/`, `test-results/`, `playwright-report/`, `.env*.local`), `README.md`

**Interfaces:**
- Produces: npm scripts `dev`, `build`, `start`, `lint` (`eslint .`), `typecheck` (`tsc --noEmit`), `test` (`vitest run`), `test:e2e` (`playwright test`), `assets` (`node scripts/optimize-assets.mjs`). Path alias `@/*` → repo root. Vitest default environment `node`, `tests/**/*.test.{ts,tsx}`, alias `@` resolved in `vitest.config.ts`. Playwright `baseURL http://localhost:3100`, `webServer: { command: 'npm run build && npm run start -- -p 3100', port: 3100, reuseExistingServer: !process.env.CI, timeout: 240_000 }`, projects `chromium` and `mobile` (`devices['Pixel 7']`).

- [ ] **Step 1:** Delete/move the files listed above (`git rm -r` / `git mv`). Keep `public/imgs/eu.jpg`, `public/imgs/fiap.svg`, `public/logo/`.
- [ ] **Step 2:** Write `package.json` (name `rodovia-2026`, `"private": true`, `"type": "module"`, engines node `>=22`) with the stack versions from the header as `^` ranges plus dev deps `typescript`, `@types/react`, `@types/react-dom`, `@types/node`, `@types/three`, `eslint`, `eslint-config-next`, `vitest`, `jsdom`, `@testing-library/react`, `@playwright/test`, `@gltf-transform/cli`, `@gltf-transform/core`, `@gltf-transform/functions`, `meshoptimizer`, `sharp`, `@fontsource/ibm-plex-mono`. Run `npm install` and `npx playwright install chromium`.
- [ ] **Step 3:** Write the config files. `globals.css` holds `@import "tailwindcss";`, the token block from Global Constraints under `@theme` (as `--color-night` etc.) and `:root`, `body { background: var(--night); color: var(--ink) }`, and the rule `html[data-mode="game"] .pitstop { position:absolute; width:1px; height:1px; overflow:hidden; clip:rect(0 0 0 0); white-space:nowrap }` plus `html[data-mode="game"], html[data-mode="game"] body { overflow:hidden; height:100% }`.
- [ ] **Step 4:** Write `tests/smoke.test.ts`: `expect(1 + 1).toBe(2)` (proves the runner). Placeholder page renders `<main className="pitstop">Rodovia 2026</main>`.
- [ ] **Step 5:** Verify: `npm run typecheck && npm run lint && npm test && npm run build` all exit 0.
- [ ] **Step 6:** README: one paragraph on the project, scripts list, and the model credit line from Global Constraints.
- [ ] **Step 7:** Commit `chore: replace vite app with next.js skeleton`.

### Task 2: Content model (CV as data)

**Files:**
- Create: `content/types.ts`, `content/pt/profile.ts`, `content/en/profile.ts`, `content/index.ts`
- Test: `tests/content/profile.test.ts`

**Interfaces:**
- Produces:

```ts
// content/types.ts
export type Locale = 'pt' | 'en';
export type CaseSlug = 'arquitetura-llm-first' | 'migracao-gcp-aws' | 'whatsapp-tech-provider' | 'oceans-20' | 'vistoria-porto-seguro';
export interface Metric { value: string; label: string; context: string }
export interface Experience { company: string; role: string; start: string; end: string | null; bullets: string[] } // start/end 'YYYY-MM', newest first
export interface CaseSummary { slug: CaseSlug; title: string; summary: string; stack: string[] }
export interface SkillGroup { name: string; items: string[] }
export interface Service { title: string; description: string }
export interface Education { institution: string; course: string; period: string }
export interface Profile {
  name: string; fullName: string; title: string; headline: string; summary: string; location: string;
  links: { email: string; linkedin: string; github: string; calcom: string | null; cv: { pt: string; en: string | null } };
  metrics: Metric[]; experience: Experience[]; cases: CaseSummary[]; skills: SkillGroup[];
  services: Service[]; education: Education[]; languages: string[];
}
// content/index.ts
export function getProfile(locale: Locale): Profile;
export const locales: readonly Locale[]; // ['pt', 'en']
```

- [ ] **Step 1: Write the failing test** `tests/content/profile.test.ts`:
  - `getProfile('pt').fullName === 'Luis Augusto de Petta Didonato'`, `name === 'Luis Didonato'`.
  - `experience.map(e => e.company)` equals `['EVIG', 'Colmeia', 'ValiantGroup', 'RedBit']` in both locales; `experience[0].end === null`; `experience[0].start === '2026-01'`.
  - `cases.map(c => c.slug)` equal in both locales and equal to the five `CaseSlug`s in spec order (LLM-first, migração, WhatsApp, Oceans-20, Vistoria).
  - `metrics.map(m => m.value)` equals `['−80%', '2 s → 0,5 s', '85,4%', 'Tech Provider']` in PT and `['−80%', '2 s → 0.5 s', '85.4%', 'Tech Provider']` in EN.
  - `skills.length === 5` and `services.length === 3` in both.
  - `links.github === 'https://github.com/gutodidonato'`, `links.linkedin === 'https://www.linkedin.com/in/luis-didonato-66746a250/'`, `links.email === 'gutodidonato@gmail.com'`, `links.cv.pt === '/cv/luis-didonato-pt.pdf'`, `links.cv.en === null`, `links.calcom === null`.
  - `JSON.stringify(profile)` does not match `/tel:|\+55|\(11\)\s?9/` for both locales.
- [ ] **Step 2:** Run `npx vitest run tests/content` → FAIL (module not found).
- [ ] **Step 3:** Implement. PT text is a faithful transcription of the CV (spec §5); `title` = `Engenheiro de Software · Backend, IA e Cloud`, `headline` = `CTO / Tech Lead na EVIG`. EN is the translation (`Software Engineer · Backend, AI & Cloud`, `CTO / Tech Lead at EVIG`). Services are the three from the artifact (Produtos com LLM / Cloud e custo / Integrações). Education: FIAP pós Arquitetura de Software (em andamento, conclusão 2026); FIAP ADS 2023–2024. Languages: Inglês avançado C1 (EF SET), Espanhol intermediário.
- [ ] **Step 4:** Run `npx vitest run tests/content` → PASS.
- [ ] **Step 5:** Commit `feat: add cv content model in pt and en`.

### Task 3: Locale routing

**Files:**
- Create: `i18n/routing.ts`, `i18n/request.ts`, `proxy.ts`, `messages/pt.json`, `messages/en.json`
- Modify: `next.config.ts` (wrap with `createNextIntlPlugin('./i18n/request.ts')`), `app/[locale]/layout.tsx`
- Test: `e2e/routing.spec.ts`

**Interfaces:**
- Produces: `routing` (`defineRouting({ locales: ['pt','en'], defaultLocale: 'pt', localePrefix: 'always' })`). Layout exports `generateStaticParams()` returning both locales, calls `setRequestLocale(locale)`, `notFound()` for unknown locale, sets `<html lang={locale === 'pt' ? 'pt-BR' : 'en'}>`. Message namespaces (later tasks add keys inside them): `Meta`, `PitStop`, `Contact`, `Game`.

- [ ] **Step 1: Write the failing e2e** `e2e/routing.spec.ts`:
  - request `/` with header `Accept-Language: en-US` → final URL ends with `/en`; with `pt-BR` → `/pt`.
  - `/pt` html has `lang="pt-BR"`; `/en` has `lang="en"`.
  - `/de` responds 404.
- [ ] **Step 2:** Run `npx playwright test e2e/routing.spec.ts --project=chromium` → FAIL.
- [ ] **Step 3:** Implement routing; `proxy.ts` exports `createMiddleware(routing)` as default and `config.matcher = '/((?!api|_next|_vercel|.*\\..*).*)'`.
- [ ] **Step 4:** Re-run → PASS.
- [ ] **Step 5:** Commit `feat: add pt/en locale routing`.

### Task 4: Pit stop one-pager

**Files:**
- Create: `components/pitstop/{Hero,Impact,ExperienceList,CaseGrid,SkillGroups,ServiceList,Contact,Footer,EmailLink}.tsx`, `components/pitstop/PitStop.tsx`
- Modify: `app/[locale]/page.tsx`, `messages/*.json` (`PitStop` keys)
- Test: `e2e/pitstop.spec.ts`

**Interfaces:**
- Consumes: `getProfile(locale)` (Task 2).
- Produces: `<PitStop profile={Profile} locale={Locale} />` (RSC) rendering a root `<main className="pitstop" id="pitstop">` with sections `#experiencia`, `#cases`, `#oficina` (skills), `#servicos`, `#contato`. `Contact` renders a slot `{children}` where Task 5 places the form. `<EmailLink email={string} />` is a client component that renders the address from split parts after mount (server HTML contains `gutodidonato [at] gmail [dot] com` text, no `mailto:`).

- [ ] **Step 1: Write the failing e2e** `e2e/pitstop.spec.ts` using a context with `javaScriptEnabled: false`:
  - `/pt` body text contains `Luis Didonato`, `CTO / Tech Lead`, `EVIG`, `Colmeia`, `ValiantGroup`, `RedBit`, `−80%`, `Oceans-20`, `dark_igorek`.
  - `/en` contains `Software Engineer` and `CTO / Tech Lead at EVIG`.
  - Each of `#experiencia #cases #oficina #servicos #contato` exists on `/pt` and `/en`.
  - Page HTML does not match `/tel:|\+55|\(11\)\s?9/`.
  - With JS enabled, `/pt` contains a link with `href="mailto:gutodidonato@gmail.com"` after load.
  - `mobile` project: `document.documentElement.scrollWidth <= window.innerWidth`.
- [ ] **Step 2:** Run → FAIL.
- [ ] **Step 3:** Build the sections. Visual direction: the artifact's tokens; hero name in Michroma with sun→magenta gradient; metrics as a mono strip; experience as a vertical timeline; cases as cards with stack chips; footer with model credit and FIAP. Mobile gutter 16 px, single column under 700 px.
- [ ] **Step 4:** Run → PASS (both projects).
- [ ] **Step 5:** Commit `feat: add server-rendered pit stop one-pager`.

### Task 5: Contact endpoint and form

**Files:**
- Create: `lib/contact.ts`, `app/api/contact/route.ts`, `components/pitstop/ContactForm.tsx`
- Modify: `components/pitstop/Contact.tsx` (render form), `messages/*.json` (`Contact`)
- Test: `tests/contact/validate.test.ts`, `tests/contact/route.test.ts`

**Interfaces:**
- Produces:

```ts
// lib/contact.ts
export const contactSchema: z.ZodType<ContactInput>; // name 2..80, email valid ≤120, message 10..2000, website (honeypot) optional
export interface ContactInput { name: string; email: string; message: string; website?: string }
export function createRateLimiter(opts: { limit: number; windowMs: number; now?: () => number }): (key: string) => boolean; // true = allowed
// app/api/contact/route.ts
export async function POST(req: Request): Promise<Response>;
```
Route behavior: body > 10 000 bytes → 413; invalid JSON or schema → 400 `{ error: 'invalid', fields: string[] }`; honeypot filled → 200 `{ ok: true }` without sending; rate limit 5 per 10 min per `x-forwarded-for` first IP → 429; missing `RESEND_API_KEY` or `CONTACT_TO_EMAIL` → 503 `{ error: 'unavailable' }`; Resend error → 502; success 200 `{ ok: true }`. Never log message bodies. `<ContactForm locale />` posts JSON, shows field errors, and on 503/502 shows the email address.

- [ ] **Step 1: Write failing tests.** `validate.test.ts`: valid input passes; `name: 'A'` fails with path `name`; `message` of 2001 chars fails; `email: 'x'` fails. Rate limiter with fake `now`: 5 calls allowed, 6th denied, allowed again after `windowMs`. `route.test.ts` (env stubbed with `vi.stubEnv`, Resend mocked with `vi.mock('resend')`): 413 for 10 001-byte body; 400 for `{}` with `fields` containing `name`,`email`,`message`; 200 and no send when `website: 'x'`; 503 with no env; 200 and one `emails.send` call with `replyTo` = sender email when env set.
- [ ] **Step 2:** Run `npx vitest run tests/contact` → FAIL.
- [ ] **Step 3:** Implement.
- [ ] **Step 4:** Run → PASS.
- [ ] **Step 5:** Commit `feat: add contact endpoint and form`.

### Task 6: SEO, CV PDF, structured data

**Files:**
- Create: `app/sitemap.ts`, `app/robots.ts`, `public/cv/luis-didonato-pt.pdf` (copy of `D:\Downloads\Curriculo_Luis_Augusto_Didonato_corrigido.pdf`), `components/pitstop/PersonJsonLd.tsx`
- Modify: `app/[locale]/layout.tsx` (`generateMetadata`), `app/[locale]/page.tsx`, `messages/*.json` (`Meta`)
- Test: `e2e/seo.spec.ts`

**Interfaces:**
- Consumes: `getProfile`.
- Produces: site URL from `process.env.NEXT_PUBLIC_SITE_URL ?? 'https://project-ve2-dtbe.vercel.app'` exported as `SITE_URL` from `lib/site.ts`. Metadata per locale: title `Luis Didonato · CTO / Tech Lead` (EN same), description from `profile.summary`, `alternates.languages` `{ 'pt-BR': '/pt', en: '/en' }`, Open Graph `type: 'profile'`.

- [ ] **Step 1: Write failing e2e:** `/sitemap.xml` contains `/pt` and `/en`; `/robots.txt` contains `Sitemap:`; `/pt` has `<link rel="alternate" hreflang="en">`; `script[type="application/ld+json"]` parses to `@type: 'Person'` with `jobTitle: 'CTO / Tech Lead'` and `sameAs` including the GitHub URL; GET `/cv/luis-didonato-pt.pdf` → 200, `content-type` contains `application/pdf`.
- [ ] **Step 2:** Run → FAIL.
- [ ] **Step 3:** Implement (JSON-LD must not include telephone).
- [ ] **Step 4:** Run → PASS.
- [ ] **Step 5:** Commit `feat: add metadata, sitemap, json-ld and cv pdf`.

### Task 7: Car asset pipeline

**Files:**
- Create: `scripts/optimize-assets.mjs`, `public/models/delorean.glb`, `public/fonts/ibm-plex-mono-500.woff` (copied from `node_modules/@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-500-normal.woff`)
- Test: `tests/assets/delorean.test.ts`

**Interfaces:**
- Produces: `public/models/delorean.glb` (meshopt + WebP, ≤ 1 572 864 bytes) whose root contains only car geometry. Constant `CAR_GLB = '/models/delorean.glb'` used by Task 11.

- [ ] **Step 1: Write failing test** `tests/assets/delorean.test.ts` (node env): file exists; size ≤ 1 572 864; parsing the GLB JSON chunk (bytes 20..20+len) gives `extensionsUsed` containing `EXT_meshopt_compression` and `EXT_texture_webp`; `asset.extras.license` contains `CC-BY-4.0` (credit preserved).
- [ ] **Step 2:** Run → FAIL.
- [ ] **Step 3:** Inspect the source: in the script, log each top-level node name with its world bounding box (`@gltf-transform/core` `getBounds`). If any node is scenery rather than car (bbox far larger than ~5 m or far from the car cluster), add its name to a `PRUNE_NODES` array in the script and dispose it.
- [ ] **Step 4:** Script pipeline (`NodeIO` registered with `ALL_EXTENSIONS` and meshopt encoder): prune listed nodes → `dedup()` → `weld()` → `join()` → `prune()` → `resample()` → `textureCompress({ encoder: sharp, targetFormat: 'webp', resize: [1024, 1024] })` → `meshopt({ encoder: MeshoptEncoder })`; copy `asset.extras` from the source; write to `public/models/delorean.glb`; print final size. If > 1.5 MB, drop resize to `[512, 512]`.
- [ ] **Step 5:** `npm run assets` then `npx vitest run tests/assets` → PASS.
- [ ] **Step 6:** Commit `feat: add optimized delorean asset pipeline`.

---

## F1 — Drivable hub

### Task 8: Pure game rules

**Files:**
- Create: `lib/game/types.ts`, `lib/game/physics.ts`, `lib/game/zones.ts`, `lib/game/autopilot.ts`, `lib/game/input.ts`, `lib/game/tick.ts`, `lib/game/rng.ts`
- Test: `tests/game/physics.test.ts`, `tests/game/zones.test.ts`, `tests/game/autopilot.test.ts`, `tests/game/input.test.ts`, `tests/game/tick.test.ts`

**Interfaces:**
- Produces:

```ts
// types.ts
export type ZoneId = 'experiencia' | 'cases' | 'oficina' | 'servicos' | 'contato';
export interface Zone { id: ZoneId; x: number; z: number; color: string }
export interface CarState { x: number; z: number; heading: number; speed: number } // forward = (-sin h, 0, -cos h)
export interface Controls { throttle: number; steer: number } // each in [-1, 1]; steer +1 = left
export type Mode = 'demo' | 'manual' | 'tour' | 'goto' | 'idle';
export interface GameRuntime { car: CarState; mode: Mode; tourIndex: number; gotoIndex: number; budget: number; dwell: number; idleTime: number; zone: ZoneId | null }
export interface FrameInput { controls: Controls; drag: { x: number; z: number } | null; wheel: number; nextStop: boolean; gotoZone: ZoneId | null; userActive: boolean }
export type GameEvent = { type: 'zone'; zone: ZoneId | null } | { type: 'mode'; mode: Mode };
// physics.ts
export const ACCEL = 28, MIN_SPEED = -10, MAX_SPEED = 22, STEER_RATE = 2.3, BOUND = 76, MAX_DT = 0.05;
export function stepCar(car: CarState, c: Controls, dt: number): CarState; // pure; clamps dt to MAX_DT, x/z to ±BOUND
// zones.ts
export const ZONES: readonly Zone[]; export const ZONE_RADIUS = 7.5, ARRIVE_RADIUS = 3.5;
export function nearestZone(x: number, z: number, maxDist?: number): Zone | null;
export function zoneIndex(id: ZoneId): number;
export function parseZoneHash(hash: string): ZoneId | null;
// autopilot.ts
export function steerToward(car: CarState, tx: number, tz: number): { controls: Controls; distance: number };
// input.ts
export function keysToControls(keys: ReadonlySet<string>): Controls; // KeyW/ArrowUp +throttle, KeyS/ArrowDown −, KeyA/ArrowLeft +steer, KeyD/ArrowRight −
export function isTypingTarget(target: EventTarget | null): boolean; // input, textarea, select, [contenteditable]
// tick.ts
export const DEMO_DWELL = 3.5, IDLE_TO_DEMO = 20, WHEEL_TO_DISTANCE = 0.12, MAX_BUDGET = 120;
export function createRuntime(spawn?: ZoneId | null): GameRuntime; // spawn → car at zone center, mode 'idle', zone set; default → (0, 6), heading 0, mode 'demo'
export function tickGame(rt: GameRuntime, input: FrameInput, dt: number): GameEvent[]; // mutates rt
// rng.ts
export function mulberry32(seed: number): () => number;
```

Autopilot steering (copied from the prototype, not derivable from tests alone):

```ts
const dx = tx - car.x, dz = tz - car.z, distance = Math.hypot(dx, dz);
let diff = Math.atan2(-dx, -dz) - car.heading; diff = Math.atan2(Math.sin(diff), Math.cos(diff));
let throttle = clamp(distance / 10, 0.25, 1); if (Math.abs(diff) > 1.4) throttle = 0.4;
return { controls: { throttle, steer: clamp(diff * 2.2, -1, 1) }, distance };
```

`tickGame` rules (in this order): (1) `userActive` → `idleTime = 0`, else `idleTime += dt`; idle ≥ `IDLE_TO_DEMO` and mode ≠ demo → mode `demo`. (2) `gotoZone` → mode `goto`, `gotoIndex`, budget 0. (3) `wheel > 0` or `nextStop` → if car within `2 * ARRIVE_RADIUS` of `ZONES[tourIndex]` advance `tourIndex` (mod 5); budget = `nextStop ? MAX_BUDGET : min(budget + wheel * WHEEL_TO_DISTANCE, MAX_BUDGET)`; mode `tour`. (4) non-zero `controls` or `drag` with length > 2 → mode `manual`, budget 0, `gotoIndex = -1`; drive with controls, or with `steerToward(car, car.x + drag.x, car.z + drag.z)` when dragging. (5) Otherwise by mode: `demo` — steer to tour zone, on arrive set `dwell = DEMO_DWELL`, coast while dwell > 0, then advance `tourIndex`; `tour` — steer, `budget -= |speed| * dt`, on arrive budget 0, advance `tourIndex`, mode `idle`, budget ≤ 0 → `idle`; `goto` — steer, on arrive `tourIndex = gotoIndex + 1` (mod 5), `gotoIndex = -1`, mode `idle`; `idle`/`manual` — coast with zero controls. (6) `nearestZone(car)` id ≠ `rt.zone` → set and emit `{type:'zone'}`. Emit `{type:'mode'}` whenever mode changed during the tick.

- [ ] **Step 1: Write failing tests.**
  - physics: full throttle from rest for 60 × 1/60 s gives `0 < speed ≤ 22` and `z < 6` start; `stepCar` with `dt = 5` moves at most `MAX_SPEED * MAX_DT` (Review Focus 3); position never exceeds ±76 after 2000 steps pushing toward a wall; steering at speed 0 leaves heading unchanged.
  - zones: `nearestZone(-34,-26)?.id === 'experiencia'`; `nearestZone(0,0) === null`; `parseZoneHash('#cases') === 'cases'`; `parseZoneHash('#foo')`, `('#Cases')`, `('#contato?x')`, `('')` all `null` (Review Focus 4).
  - autopilot: car at origin heading 0, target (0,-20) → steer ≈ 0, throttle 1; target (20,0) → steer < 0 (right turn); target behind → throttle 0.4.
  - input: `keysToControls(new Set(['KeyW','KeyA']))` → `{throttle:1, steer:1}`; `isTypingTarget` true for `<input>`, `<textarea>`, `<div contenteditable>`; false for `<canvas>` and `null` (jsdom: `// @vitest-environment jsdom`) (Review Focus 1).
  - tick: from `createRuntime()`, 600 ticks of empty input at 1/60 → `rt.zone === 'experiencia'` at some point and a `zone` event emitted; `wheel: 1000` once (budget capped at 120) then empty input → mode `tour`, ends `idle` with `rt.zone === 'experiencia'`; `gotoZone: 'contato'` → eventually `rt.zone === 'contato'`, mode `idle`, `tourIndex === 0`; `controls` non-zero → mode `manual`; after manual, 20.1 s of `userActive:false` → mode `demo`; `createRuntime('cases').zone === 'cases'`.
- [ ] **Step 2:** `npx vitest run tests/game` → FAIL.
- [ ] **Step 3:** Implement.
- [ ] **Step 4:** `npx vitest run tests/game` → PASS.
- [ ] **Step 5:** Commit `feat: add pure game rules for the hub`.

### Task 9: Store, storage, pit stop decision, tier

**Files:**
- Create: `lib/storage.ts`, `lib/pitstop.ts`, `lib/store.ts`, `lib/game/tier.ts`, `lib/game/runtime.ts`
- Test: `tests/storage.test.ts`, `tests/pitstop.test.ts`, `tests/game/tier.test.ts`, `tests/game/runtime.test.ts`

**Interfaces:**
- Consumes: Task 8 types, `keysToControls`.
- Produces:

```ts
// storage.ts
export function readPref(key: string): string | null;            // null on throw
export function writePref(key: string, value: string): boolean;  // false on throw
// pitstop.ts
export const PITSTOP_KEY = 'rodovia:pitstop';
export function initialPitstop(o: { webgl: boolean; reducedMotion: boolean; saveData: boolean; stored: 'on' | 'off' | null }): { pitstop: boolean; forced: boolean };
// !webgl → {true, forced:true}; stored 'on'/'off' wins next; else reducedMotion || saveData
// tier.ts
export type Tier = 'A' | 'B';
export function tierFrom(gpuTier: number | undefined, isMobile: boolean): Tier; // 'A' iff gpuTier >= 2 && !isMobile
// store.ts (zustand)
export interface GameStore { zone: ZoneId | null; mode: Mode; pitstop: boolean; pitstopForced: boolean; tier: Tier;
  setZone(z: ZoneId | null): void; setMode(m: Mode): void; setPitstop(on: boolean): void; setTier(t: Tier): void }
export const useGameStore: UseBoundStore<StoreApi<GameStore>>;   // setPitstop persists via writePref unless forced
// runtime.ts — module singletons for the frame loop
export const runtime: GameRuntime;                 // createRuntime() at import; replaced by resetRuntime
export function resetRuntime(spawn: ZoneId | null): void;
export const inputQueue: { press(code: string): void; release(code: string): void; wheel(dy: number): void;
  drag(dx: number, dz: number): void; endDrag(): void; nextStop(): void; goto(z: ZoneId): void; consume(): FrameInput };
```
`consume()` returns accumulated wheel/nextStop/gotoZone and current held keys mapped by `keysToControls`, `userActive` true if anything happened since last consume or keys are held, then clears the one-shot fields.

- [ ] **Step 1: Write failing tests:** storage with `localStorage.getItem`/`setItem` stubbed to throw → `readPref` returns `null`, `writePref` returns `false` (Review Focus 5); `initialPitstop` table: no webgl → forced on; stored 'off' + reducedMotion → off; nothing stored + saveData → on; all false → off; `tierFrom(3,false)==='A'`, `tierFrom(3,true)==='B'`, `tierFrom(undefined,false)==='B'`; `inputQueue`: press KeyW + wheel(100) → consume gives throttle 1, wheel 100, userActive true; second consume gives wheel 0 and still throttle 1; after release, userActive false.
- [ ] **Step 2:** Run → FAIL. **Step 3:** Implement. **Step 4:** Run → PASS.
- [ ] **Step 5:** Commit `feat: add game store, input queue and pit stop decision`.

### Task 10: GameMount shell and pit stop toggle

**Files:**
- Create: `components/game/GameMount.tsx`, `components/game/PitstopToggle.tsx`, `components/game/useWebglSupport.ts`
- Modify: `app/[locale]/page.tsx` (render `<GameMount profile locale />` after `<PitStop/>`), `messages/*.json` (`Game`)
- Test: `e2e/mode.spec.ts`

**Interfaces:**
- Consumes: `initialPitstop`, `readPref`, `useGameStore`, `resetRuntime`, `parseZoneHash`.
- Produces: `<GameMount profile={Profile} locale={Locale} />` (client). On mount: computes initial pit stop, sets `document.documentElement.dataset.mode` to `'game'` or `'pitstop'` (and keeps it in sync with the store), calls `resetRuntime(parseZoneHash(location.hash))`, renders `<PitstopToggle/>` always, and when not pit stop: `dynamic(() => import('./GameLayer'), { ssr: false })`. `GameLayer` (Task 11) is the boundary that pulls in three. Key `P` (ignored when `isTypingTarget`) toggles pit stop. Toggle is a fixed button (bottom-right on desktop, top-right on mobile) labelled from messages (`Game.pitstopOn` / `Game.pitstopOff`).

- [ ] **Step 1: Write failing e2e** `e2e/mode.spec.ts`: on `/pt` (chromium) `html[data-mode]` becomes `game`; pressing `p` → `pitstop`, again → `game`; with `page.emulateMedia({ reducedMotion: 'reduce' })` initial mode is `pitstop`; in `pitstop` mode `page.mouse.wheel(0, 800)` increases `window.scrollY` (Review Focus 2); reload after choosing pit stop keeps `pitstop`.
- [ ] **Step 2:** Run → FAIL (GameLayer may be a stub `return null` for this task). **Step 3:** Implement. **Step 4:** Run → PASS.
- [ ] **Step 5:** Commit `feat: add game mount and pit stop toggle`.

### Task 11: World scene (canvas, hub, zones, car, camera, director)

**Files:**
- Create: `components/game/GameLayer.tsx`, `WorldCanvas.tsx`, `Hub.tsx`, `ZoneMarker.tsx`, `Decor.tsx`, `Car.tsx`, `PrimitiveCar.tsx`, `CameraRig.tsx`, `GameDirector.tsx`, `Effects.tsx`
- Test: `e2e/world.spec.ts`

**Interfaces:**
- Consumes: `runtime`, `inputQueue`, `tickGame`, `ZONES`, `useGameStore`, `mulberry32`, `CAR_GLB`.
- Produces: `GameLayer` renders a fixed full-viewport `<div className="game-layer">` containing `<WorldCanvas/>` and the DOM overlays from Tasks 12–13. `window.__rodovia = { snapshot(): { car: CarState; mode: Mode; zone: ZoneId | null } }` registered in `GameDirector` (read-only copy; used by e2e).
  - `GameDirector`: `useFrame((_, dt) => { const events = tickGame(runtime, inputQueue.consume(), dt); apply events → store })`. Only place that calls store setters per frame (event-driven only).
  - `Car`: `useGLTF(CAR_GLB)` (meshopt enabled by drei default) inside `<Suspense fallback={<PrimitiveCar/>}>`; normalizes the clone once with `Box3`: scale so the longest horizontal extent is 3.8, center on origin with wheels on y = 0, then apply constant `CAR_MODEL_YAW` (decided in Step 3) so the nose points to −z; each frame copies `runtime.car` x/z/heading into the group.
  - `PrimitiveCar`: prototype silhouette (body 1.7×0.42×3.8, cabin, magenta tail light, 4 wheels, underglow).
  - `Hub`: background `#0a0716`, fog (40, 115), ground 170×170 `#0d0820`, `gridHelper(160, 80, #ff3ea5, #33205c)` opacity 0.55, neon border at ±78.
  - `ZoneMarker`: ring (6.6–7.1), disc opacity 0.07, beam 14 tall, drei `<Billboard><Text font="/fonts/ibm-plex-mono-500.woff">` label at y 15; ring opacity 1 when `zone === id` else pulsing 0.3–0.8 (mutate material in `useFrame`, no state).
  - `Decor` (seeded `mulberry32(5)`): cases district towers (22 wireframe boxes around (32,-32) radius 10–19), experiência signposts with the 4 company names, oficina garage frame, serviços 3 pylons, contato half-sun, 46 wireframe cones away from zones. Use instancing where count > 10.
  - `CameraRig`: Global Constraints camera values.
  - `WorldCanvas`: `<Canvas dpr={tier === 'A' ? [1, 2] : 1} camera={{ fov: 48, position: [0, 24, 26] }} gl={{ antialias: tier === 'A', powerPreference: 'high-performance' }}>` + drei `<PerformanceMonitor onDecline={() => setTier('B')}/>`; `<Effects/>` (Bloom + Vignette) only in tier A. On mount, `getGPUTier({ benchmarksURL: '/detect-gpu' })` from detect-gpu → `setTier(tierFrom(...))`; copy `node_modules/detect-gpu/dist/benchmarks/*` to `public/detect-gpu/` so no third-party CDN is hit. Lights: ambient `#7a5cff` 0.6, directional magenta 1.4 at (-4,6,-12), directional cyan 0.8 at (6,5,6).
- [ ] **Step 1: Write failing e2e** `e2e/world.spec.ts` (chromium): `/pt` shows a `canvas` inside `.game-layer` within 10 s; `window.__rodovia.snapshot().mode === 'demo'` initially; after 6 s of no input the car has moved (`|x|+|z|` changed by > 5).
- [ ] **Step 2:** Run → FAIL. **Step 3:** Implement; run `npm run dev`, open `/pt`, adjust `CAR_MODEL_YAW` until the headlights lead the motion in demo mode. **Step 4:** Run → PASS.
- [ ] **Step 5:** Commit `feat: render drivable hub world`.

### Task 12: Input controller

**Files:**
- Create: `components/game/InputController.tsx`
- Modify: `components/game/GameLayer.tsx`
- Test: `e2e/input.spec.ts`

**Interfaces:**
- Consumes: `inputQueue`, `isTypingTarget`, `useGameStore` (`pitstop`).
- Produces: window listeners active only while not in pit stop: `keydown`/`keyup` (ignore when `isTypingTarget(e.target)`; `preventDefault` for arrows/WASD/Space; Space → `nextStop()`), `wheel` (`passive: false`, `preventDefault`, `wheel(deltaY * (deltaMode === 1 ? 16 : 1))`), pointer drag on the canvas (`drag(dx * 0.15, dy * 0.15)` relative to pointer-down, `endDrag()` on up/cancel), `blur`/`visibilitychange` → release all keys.

- [ ] **Step 1: Write failing e2e:** hold `ArrowUp` 1.5 s → snapshot mode `manual` and car z decreased; `page.mouse.wheel(0, 600)` → mode `tour`, then within 12 s zone `experiencia`; focusing a textarea (create one via `page.evaluate` inside `.game-layer`) and typing `wwww p` leaves mode unchanged and `data-mode` still `game` (Review Focus 1); mobile project: touch drag on canvas changes car x/z.
- [ ] **Step 2:** Run → FAIL. **Step 3:** Implement. **Step 4:** Run → PASS.
- [ ] **Step 5:** Commit `feat: wire keyboard, wheel and touch input`.

### Task 13: HUD, zone panels, minimap, hash sync

**Files:**
- Create: `components/game/Hud.tsx`, `components/game/ZonePanel.tsx`, `components/game/Minimap.tsx`, `components/game/useHashSync.ts`
- Modify: `components/game/GameLayer.tsx`, `messages/*.json` (`Game`)
- Test: `e2e/hud.spec.ts`

**Interfaces:**
- Consumes: `useGameStore` (`zone`, `mode`), `runtime`, `inputQueue.goto`, `ZONES`, `Profile`, `<ContactForm/>` and `<EmailLink/>` from Task 4/5.
- Produces:
  - `Hud`: top-right mono strip with speed (km/h = `round(|speed| * 7)`), mode label, next stop name; values written to DOM refs from one `requestAnimationFrame` loop (no React state per frame). Buttons: CV (`links.cv[locale] ?? links.cv.pt`, label `CV (PT)` when EN missing), credits (opens a small dialog with the model credit).
  - `ZonePanel`: bottom-left panel (`max-height: 60%`, scrollable) rendering the zone's content from `profile` — experiência: companies with role/period/bullets; cases: 5 summaries; oficina: 5 skill groups; serviços: 3 services + Cal.com link when not null; contato: `<ContactForm/>`, `<EmailLink/>`, LinkedIn, GitHub, CV. No zone → short hint (`Game.hint`). `aria-live="polite"` on the panel heading.
  - `Minimap`: SVG `viewBox="-80 -80 160 160"` with one `<button>` per zone (`aria-label` `Game.travelTo` + zone name) calling `inputQueue.goto(id)`; car marker `<polygon>` transformed every frame via ref. Desktop bottom-right 132 px; ≤ 700 px wide: top-left 96 px. Key `M` focuses the first minimap button.
  - `useHashSync`: on `zone` change → `history.replaceState(null, '', zone ? '#' + zone : location.pathname)`.
- [ ] **Step 1: Write failing e2e:** clicking the minimap button for Contato → within 12 s `location.hash === '#contato'` and the panel contains a `textarea`; loading `/pt#cases` → panel shows `Oceans-20` within 3 s and snapshot zone `cases`; loading `/pt#foo` → no error in console and mode `demo`; HUD contains a link to `/cv/luis-didonato-pt.pdf`; mobile project: no horizontal overflow and minimap visible.
- [ ] **Step 2:** Run → FAIL. **Step 3:** Implement. **Step 4:** Run → PASS.
- [ ] **Step 5:** Commit `feat: add hud, zone panels, minimap and hash sync`.

### Task 14: Performance budget check

**Files:**
- Create: `scripts/check-bundle.mjs`, `e2e/perf.spec.ts`
- Modify: `package.json` (script `check:bundle`)

**Interfaces:**
- Consumes: production build output.

- [ ] **Step 1: Write failing check** `scripts/check-bundle.mjs`: after `next build`, read the build manifest for `/[locale]` and sum gzip size of the first-load JS chunks; fail if > 184 320 bytes or if any first-load chunk contains the string `WebGLRenderer`. `e2e/perf.spec.ts` (chromium, prod server): `PerformanceObserver` for `largest-contentful-paint` on `/pt` with CPU throttling ×4 via CDP reports < 2500 ms; `public/models/delorean.glb` + all `.js` loaded by the game layer total ≤ 4 MB (sum `transferSize` from `performance.getEntriesByType('resource')` after 10 s).
- [ ] **Step 2:** Run `npm run build && npm run check:bundle && npx playwright test e2e/perf.spec.ts` → fix whatever exceeds the budget (usual causes: three imported outside `GameLayer`, eager drei imports in `GameMount`).
- [ ] **Step 3:** Run all: `npm run typecheck && npm run lint && npm test && npm run test:e2e` → all green.
- [ ] **Step 4:** Commit `test: enforce first-load and asset budgets`.

---

## Out of scope for this plan

F2 Rodovia phase, F3 cases/mini-games/intercepting routes, F4 blog, F5 sound/gamepad/achievements/`/lab`/analytics/EN CV PDF, Vercel production deploy and custom domain (pending accounts).
