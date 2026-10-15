#!/usr/bin/env node
/**
 * Initial-JS budget check. Run after `next build`.
 *
 * Budget (spec): the JavaScript a visitor downloads before the 3D game is
 * requested stays under 180 KiB gzip, and none of it may contain three.
 *
 * Method. Next 16 builds with Turbopack and its route table no longer prints
 * "First Load JS", and the manifests (`build-manifest.json`, the client
 * reference manifests) describe the whole route tree, lazy chunks included. The
 * reliable source is what the browser is actually told to fetch: the prerendered
 * HTML of each locale, `.next/server/app/<locale>.html`. For each page this
 * script collects:
 *
 *   - every `<script src>` that browsers execute. `nomodule` scripts (the legacy
 *     polyfill bundle) are skipped: every browser that can run WebGL 2 / ES
 *     modules ignores them, so they never download;
 *   - every `<link rel="preload" as="script">` / `<link rel="modulepreload">`
 *     (Next preloads its low-priority runtime chunk this way; the same file is
 *     usually also a `<script>`, files are de-duplicated).
 *
 * Chunks that the page only imports later (`next/dynamic` GameLayer, the lazy
 * postprocessing chunk, the GLB) are not in the HTML, so they are not counted
 * here: `e2e/perf.spec.ts` budgets those at runtime.
 *
 * Each chunk is gzipped at level 9 (what `gzip-size`, hence Next's own first
 * load figure, uses) and the sum is compared with MAX_GZIP_BYTES. A chunk that
 * contains `WebGLRenderer` is three.js leaking into the first load and fails
 * the check on its own, whatever the total.
 *
 * Exit status: 0 when every page passes, 1 otherwise (or when the build output
 * is missing / unreadable, so a broken setup can never pass silently).
 */
import { readFileSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { gzipSync } from 'node:zlib';

/** 180 KiB, gzip. */
const MAX_GZIP_BYTES = 184_320;
/** Prerendered locale pages (i18n/routing.ts: exactly pt and en). */
const LOCALES = ['pt', 'en'];
/** three.js's renderer: its presence means a 3D dependency is in the initial route. */
const FORBIDDEN = ['WebGLRenderer'];

const root = resolve(import.meta.dirname, '..');
const nextDir = join(root, '.next');

const kb = (bytes) => `${(bytes / 1024).toFixed(1)} KB`;

function fail(message) {
  console.error(`\ncheck:bundle FAILED: ${message}`);
  process.exit(1);
}

/** Attribute map of one HTML tag (`<script src="..." async="">`). */
function attributesOf(tag) {
  const attrs = {};
  for (const m of tag.matchAll(/([a-zA-Z][\w:-]*)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/g)) {
    if (m[1].toLowerCase() === 'script' || m[1].toLowerCase() === 'link') continue;
    attrs[m[1].toLowerCase()] = m[2] ?? m[3] ?? m[4] ?? '';
  }
  return attrs;
}

/** Script URLs (path part) the browser fetches for `html`, in document order. */
function firstLoadScripts(html) {
  const urls = new Set();
  for (const [tag] of html.matchAll(/<script\b[^>]*>/gi)) {
    const a = attributesOf(tag);
    if (a.src === undefined || 'nomodule' in a) continue;
    urls.add(a.src);
  }
  for (const [tag] of html.matchAll(/<link\b[^>]*>/gi)) {
    const a = attributesOf(tag);
    const preloadsScript = a.rel === 'modulepreload' || (a.rel === 'preload' && a.as === 'script');
    if (preloadsScript && a.href !== undefined) urls.add(a.href);
  }
  return [...urls].map((u) => u.split(/[?#]/)[0]);
}

function checkPage(locale) {
  const htmlPath = join(nextDir, 'server', 'app', `${locale}.html`);
  if (!existsSync(htmlPath)) {
    fail(`${htmlPath} not found. Run \`npm run build\` first.`);
  }
  const urls = firstLoadScripts(readFileSync(htmlPath, 'utf8'));
  if (urls.length === 0) fail(`no <script src> found in ${htmlPath}: the HTML format changed, fix this script.`);

  const chunks = urls.map((url) => {
    if (!url.startsWith('/_next/')) fail(`/${locale}: unexpected script URL ${url} (not under /_next/).`);
    const file = join(nextDir, url.slice('/_next/'.length));
    if (!existsSync(file)) fail(`/${locale}: ${url} is referenced by the HTML but ${file} does not exist.`);
    const body = readFileSync(file);
    const text = body.toString('utf8');
    return {
      url,
      raw: body.length,
      gzip: gzipSync(body, { level: 9 }).length,
      forbidden: FORBIDDEN.filter((needle) => text.includes(needle)),
    };
  });

  const total = chunks.reduce((sum, c) => sum + c.gzip, 0);
  const problems = [];
  if (total > MAX_GZIP_BYTES) {
    problems.push(`first-load JS is ${total} B gzip (${kb(total)}), over the budget of ${MAX_GZIP_BYTES} B (${kb(MAX_GZIP_BYTES)}) by ${total - MAX_GZIP_BYTES} B`);
  }
  for (const c of chunks) {
    if (c.forbidden.length > 0) problems.push(`${c.url} contains ${c.forbidden.join(', ')}: three.js is in the first load`);
  }

  console.log(`\n/${locale}  (${htmlPath.replace(`${root}\\`, '').replace(`${root}/`, '')})`);
  const width = Math.max(...chunks.map((c) => c.url.length));
  for (const c of [...chunks].sort((a, b) => b.gzip - a.gzip)) {
    const flag = c.forbidden.length > 0 ? `  <-- contains ${c.forbidden.join(', ')}` : '';
    console.log(`  ${c.url.padEnd(width)}  ${String(c.gzip).padStart(7)} B gzip  ${String(c.raw).padStart(7)} B raw${flag}`);
  }
  console.log(`  ${'TOTAL'.padEnd(width)}  ${String(total).padStart(7)} B gzip  (${kb(total)} of ${kb(MAX_GZIP_BYTES)}, ${((total / MAX_GZIP_BYTES) * 100).toFixed(0)}%)`);
  return problems.map((p) => `/${locale}: ${p}`);
}

console.log(`check:bundle  budget ${MAX_GZIP_BYTES} B (${kb(MAX_GZIP_BYTES)}) gzip, no ${FORBIDDEN.join(' / ')} in first-load chunks`);
const problems = LOCALES.flatMap(checkPage);
if (problems.length > 0) {
  fail(`\n  - ${problems.join('\n  - ')}`);
}
console.log('\ncheck:bundle OK');
