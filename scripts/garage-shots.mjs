// The fixed garage shot list for the score loop: three windows x six moments, 18 PNG.
//
//   node scripts/garage-shots.mjs <baseUrl> <outDir> [only]   e.g. http://localhost:3000 .superpowers/garagem/r1 launch
//
// `only` keeps the shots whose `<window>-<moment>` name contains it (several joined with |).
//
// Waits for the camera to settle (window.__garage) before each shot. SwiftShader, as in playwright.config.ts.
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { chromium } from '@playwright/test';

const [base = 'http://localhost:3000', out = '.superpowers/garagem/r1', only = ''] = process.argv.slice(2);
const wanted = (name) => only === '' || only.split('|').some((part) => name.includes(part));
mkdirSync(out, { recursive: true });

const VIEWPORTS = [
  { name: 'desk', width: 1440, height: 900 },
  { name: 'phone', width: 390, height: 844 },
  { name: 'small', width: 375, height: 568 },
];

const snap = (page) => page.evaluate(() => window.__garage?.snapshot() ?? null);
async function until(page, test, timeout = 30_000) {
  const end = Date.now() + timeout;
  while (Date.now() < end) {
    const s = await snap(page);
    if (s && test(s)) return s;
    await page.waitForTimeout(40);
  }
  throw new Error('timed out waiting for the garage');
}

async function open(page, path) {
  await page.goto(base + path);
  await until(page, (s) => s.arrived);
  await page.waitForTimeout(700); // the tube warm-up and fonts
}

/** Press J and freeze the launch `ms` after it (the departure timer is held by the init script). */
async function launchAt(page, ms) {
  await open(page, '/pt');
  await page.keyboard.press('j');
  await page.evaluate((t) => window.__garage.holdLaunch(t), ms);
  await until(page, (s) => s.view === 'launch');
  await page.waitForTimeout(1200); // the camera eases to the held pose
}

const SHOTS = [
  { name: 'bench-pt', run: (p) => open(p, '/pt') },
  { name: 'bench-en', run: (p) => open(p, '/en') },
  { name: 'cv', run: async (p) => { await open(p, '/pt'); await p.keyboard.press('c'); await until(p, (s) => s.view === 'screen' && s.arrived); await p.waitForTimeout(300); } },
  { name: 'contact', run: async (p) => { await open(p, '/pt'); await p.keyboard.press('k'); await until(p, (s) => s.view === 'screen' && s.arrived); await p.waitForTimeout(300); } },
  { name: 'launch-mid', run: (p) => launchAt(p, 1600) },
  { name: 'launch-late', run: (p) => launchAt(p, 3150) },
];

const browser = await chromium.launch({ args: ['--enable-unsafe-swiftshader', '--use-angle=swiftshader', '--ignore-gpu-blocklist'] });
let n = 0;
for (const vp of VIEWPORTS) {
  for (const shot of SHOTS) {
    if (!wanted(`${vp.name}-${shot.name}`)) {
      n++;
      continue;
    }
    const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height }, deviceScaleFactor: 1 });
    // Hold the 3.5 s departure: the garage stays on screen (leaving a WebGL page stalls SwiftShader).
    await context.addInitScript(() => {
      const start = window.setTimeout;
      window.setTimeout = (fn, ms, ...rest) => (ms === 3500 ? 0 : start(fn, ms, ...rest));
    });
    const page = await context.newPage();
    // The game page is not part of the shots: its request never answers, so the garage stays on screen.
    await page.route('**/salto88/**', (r) => r.abort());
    try {
      await shot.run(page);
      const file = join(out, `${String(n).padStart(2, '0')}-${vp.name}-${shot.name}.png`);
      await page.screenshot({ path: file, timeout: 90_000 });
      console.log('ok  ', file);
    } catch (e) {
      console.log('FAIL', vp.name, shot.name, e.message.split('\n')[0]);
    }
    n++;
    await context.close();
  }
}
await browser.close();
