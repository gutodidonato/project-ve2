// The fixed LuisOS 88 shot list for the score loop: three windows x ten moments, 30 PNG.
//
//   node scripts/garage-shots.mjs <baseUrl> <outDir> [only]   e.g. http://localhost:3000 .superpowers/garagem/r1 launch
//
// `only` keeps the shots whose `<window>-<moment>` name contains it (several joined with |).
//
// Waits for the camera to rest on the desk (window.__garage) before each shot. SwiftShader, as in playwright.config.ts.
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
  await until(page, (s) => s.view === 'desk' && s.arrived);
  await page.waitForTimeout(1000); // the desktop's warm-up and fonts
}

/** Open a desktop icon (or a file inside a window) the keyboard way, the same on a phone and a desk. */
async function openItem(page, selector) {
  await page.locator(selector).first().focus();
  await page.keyboard.press('Enter');
  await page.waitForTimeout(300);
}

/** Freeze the launch `ms` after J (set before J, it holds from the first frame; the departure timer is held). */
async function launchAt(page, ms) {
  await open(page, '/pt');
  await page.evaluate((t) => window.__garage.holdLaunch(t), ms);
  await page.keyboard.press('j');
  await until(page, (s) => s.view === 'launch');
  await page.waitForTimeout(1500); // the camera eases to the held pose
}

const SHOTS = [
  { name: 'desk', run: (p) => open(p, '/pt') },
  { name: 'readme', firstVisit: true, run: (p) => open(p, '/pt') },
  { name: 'cv', run: async (p) => { await open(p, '/pt'); await p.keyboard.press('c'); await p.waitForTimeout(300); } },
  {
    name: 'projects-case',
    run: async (p) => {
      await open(p, '/pt');
      await openItem(p, '[data-icon="projects"]');
      await openItem(p, '.os-window[data-program="projects"] [data-testid="os-file"]');
    },
  },
  { name: 'contact', run: async (p) => { await open(p, '/pt'); await p.keyboard.press('k'); await p.waitForTimeout(300); } },
  { name: 'control', run: async (p) => { await open(p, '/pt'); await openItem(p, '[data-icon="control"]'); } },
  { name: 'dialog', run: (p) => launchAt(p, 300) },
  { name: 'pull-back', run: (p) => launchAt(p, 1200) },
  { name: 'garage', run: (p) => launchAt(p, 2700) },
  { name: 'car', run: (p) => launchAt(p, 4200) },
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
    // Hold the departure: the garage stays on screen (leaving a WebGL page stalls SwiftShader).
    await context.addInitScript(() => {
      const start = window.setTimeout;
      window.setTimeout = (fn, ms, ...rest) => (ms === 4900 ? 0 : start(fn, ms, ...rest));
    });
    // Except on the first-visit shot, the readme counts as seen and stays closed.
    if (!shot.firstVisit) await context.addInitScript(() => window.localStorage.setItem('rodovia:readme', 'seen'));
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
