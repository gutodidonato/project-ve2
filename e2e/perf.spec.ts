import { expect, test, type CDPSession, type Page } from '@playwright/test';

// Performance budgets (spec), enforced against the production build:
//   - LCP (the pit stop text) < 2.5 s on localhost with the CPU slowed 4x, and
//     < 2.0 s with a 4G network profile on top;
//   - the 3D payload (the GLB plus every script the page loaded, tier A with
//     post-processing) <= 4 MB.
// The first-load JS budget is `npm run check:bundle` (scripts/check-bundle.mjs).
//
// Own `perf` project, serial, chromium only (playwright.config.ts): a throttled,
// timing-sensitive test must not share the machine with the parallel functional
// specs, and SwiftShader is slow enough already. Run alone with `npm run test:perf`.
test.describe.configure({ mode: 'serial', timeout: 120_000 });

const LCP_BUDGET_CPU_MS = 2500;
const LCP_BUDGET_4G_MS = 2000;
const PAYLOAD_BUDGET_BYTES = 2.5 * 1024 * 1024;

/**
 * "4G" network profile: what Lighthouse's mobile preset simulates (150 ms round
 * trip, 1.6 Mbps down, 750 Kbps up), the profile behind its mobile score.
 * CDP wants bytes per second.
 */
const NETWORK_4G = {
  offline: false,
  latency: 150,
  downloadThroughput: (1.6 * 1024 * 1024) / 8,
  uploadThroughput: (750 * 1024) / 8,
} as const;

interface LcpEntry {
  time: number;
  size: number;
  tag: string;
  inPitstop: boolean;
  text: string;
}

declare global {
  interface Window {
    __lcp?: LcpEntry[];
  }
}

/** Record every largest-contentful-paint candidate; the last one is the page's LCP. */
async function watchLcp(page: Page) {
  await page.addInitScript(() => {
    window.__lcp = [];
    new PerformanceObserver((list) => {
      for (const e of list.getEntries() as unknown as (PerformanceEntry & { size: number; element: Element | null })[]) {
        window.__lcp!.push({
          time: e.startTime,
          size: e.size,
          tag: e.element?.tagName ?? '?',
          inPitstop: e.element?.closest('#pitstop') != null,
          text: (e.element?.textContent ?? '').trim().slice(0, 40),
        });
      }
    }).observe({ type: 'largest-contentful-paint', buffered: true });
  });
}

/** SwiftShader reads as a blocklisted GPU to detect-gpu (tier B): pose as a desktop GeForce for tier A. */
async function posingAsDesktopGpu(page: Page) {
  await page.addInitScript(() => {
    const UNMASKED_RENDERER_WEBGL = 0x9246;
    for (const Context of [WebGLRenderingContext, WebGL2RenderingContext]) {
      const getParameter = Context.prototype.getParameter;
      Context.prototype.getParameter = function (this: WebGLRenderingContext, pname: number) {
        if (pname === UNMASKED_RENDERER_WEBGL) {
          return 'ANGLE (NVIDIA, NVIDIA GeForce RTX 3080 Direct3D11 vs_5_0 ps_5_0, D3D11)';
        }
        return getParameter.call(this, pname);
      } as typeof getParameter;
    }
  });
}

/** LCP of `/pt` after ten quiet seconds: later overlays (HUD, panels) could still replace the candidate. */
async function lcpOfPt(page: Page, throttle: (cdp: CDPSession) => Promise<unknown>): Promise<LcpEntry> {
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
  await throttle(cdp);
  await watchLcp(page);
  await page.goto('/pt');
  await page.waitForTimeout(10_000);
  const entries = await page.evaluate(() => window.__lcp!);
  console.log(`LCP candidates: ${JSON.stringify(entries)}`);
  expect(entries.length, 'the browser reported a largest-contentful-paint').toBeGreaterThan(0);
  return entries.at(-1)!;
}

test.describe('LCP', () => {
  test(`is under ${LCP_BUDGET_CPU_MS} ms with the CPU slowed 4x`, async ({ page }) => {
    const lcp = await lcpOfPt(page, async () => {});
    console.log(`LCP (CPU x4): ${Math.round(lcp.time)} ms, <${lcp.tag}> "${lcp.text}"`);
    expect(lcp.inPitstop, `LCP element <${lcp.tag}> "${lcp.text}" is pit stop text`).toBe(true);
    expect(lcp.time, `LCP element <${lcp.tag}> "${lcp.text}"`).toBeLessThan(LCP_BUDGET_CPU_MS);
  });

  test(`is under ${LCP_BUDGET_4G_MS} ms on a 4G network with the CPU slowed 4x`, async ({ page }) => {
    const lcp = await lcpOfPt(page, (cdp) => cdp.send('Network.emulateNetworkConditions', NETWORK_4G));
    console.log(`LCP (4G, CPU x4): ${Math.round(lcp.time)} ms, <${lcp.tag}> "${lcp.text}"`);
    expect(lcp.inPitstop, `LCP element <${lcp.tag}> "${lcp.text}" is pit stop text`).toBe(true);
    expect(lcp.time, `LCP element <${lcp.tag}> "${lcp.text}"`).toBeLessThan(LCP_BUDGET_4G_MS);
  });
});

test.describe('3D payload', () => {
  test('GLB plus every script the page loads is at most 2.5 MB (tier A, with post-processing)', async ({ page }) => {
    await posingAsDesktopGpu(page);
    await page.goto('/pt');
    await expect(page.locator('html')).toHaveAttribute('data-mode', 'game');
    await expect(page.locator('.game-layer canvas')).toBeVisible({ timeout: 30_000 });
    // The model is requested once the scene mounts; wait for it, then give the lazy chunks time to land.
    await expect
      .poll(() => page.evaluate(() => performance.getEntriesByType('resource').some((e) => e.name.endsWith('.glb'))), {
        timeout: 60_000,
      })
      .toBe(true);
    await page.waitForTimeout(10_000);

    // antialias is only on in tier A (GarageCanvas): proves the spoof reached the tier A path.
    const tierA = await page.evaluate(
      () => document.querySelector('canvas')?.getContext('webgl2')?.getContextAttributes()?.antialias ?? false,
    );
    expect(tierA, 'the scene runs in tier A').toBe(true);

    // The garage budget counts every pass of a tier A frame: shadows and post-processing included.
    await page.waitForFunction(() => window.__garage?.snapshot().arrived === true, null, { timeout: 60_000 });
    const drawCalls = await page.evaluate(() => window.__garage!.snapshot().drawCalls);
    console.log(`tier A draw calls: ${drawCalls}`);
    expect(drawCalls).toBeGreaterThan(0);
    expect(drawCalls).toBeLessThanOrEqual(60);

    const resources = await page.evaluate(() =>
      performance.getEntriesByType('resource').map((e) => ({
        name: new URL(e.name).pathname,
        size: (e as PerformanceResourceTiming).transferSize,
      })),
    );
    const glb = resources.filter((r) => r.name.endsWith('.glb'));
    const scripts = resources.filter((r) => r.name.endsWith('.js'));
    const sum = (list: { size: number }[]) => list.reduce((total, r) => total + r.size, 0);
    const total = sum(glb) + sum(scripts);
    console.log(
      `3D payload: ${(total / 1024).toFixed(0)} KiB = glb ${(sum(glb) / 1024).toFixed(0)} KiB + ` +
        `${scripts.length} scripts ${(sum(scripts) / 1024).toFixed(0)} KiB (budget ${PAYLOAD_BUDGET_BYTES / 1024} KiB)`,
    );

    // A cached or cross-origin response reports 0: that would make the budget pass for nothing.
    expect(glb.length, 'one GLB').toBe(1);
    expect(glb[0].size, 'the GLB transferSize is real').toBeGreaterThan(100_000);
    expect(scripts.every((r) => r.size > 0), 'every script has a real transferSize').toBe(true);
    expect(total).toBeLessThanOrEqual(PAYLOAD_BUDGET_BYTES);
  });
});
