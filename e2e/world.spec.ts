import { expect, test, type Page } from '@playwright/test';
import type { RodoviaSnapshot } from '@/lib/game/debug';

/** Read-only copy of the game runtime, published by GameDirector once the scene runs. */
async function snapshot(page: Page): Promise<RodoviaSnapshot> {
  await page.waitForFunction(() => window.__rodovia !== undefined);
  return page.evaluate(() => window.__rodovia!.snapshot());
}

const manhattan = (s: RodoviaSnapshot) => Math.abs(s.car.x) + Math.abs(s.car.z);

test.describe('world scene', () => {
  test('/pt renders the world canvas inside the game layer', async ({ page }) => {
    await page.goto('/pt');
    await expect(page.locator('.game-layer canvas')).toBeVisible({ timeout: 20_000 });
  });

  test('the demo tours the hub on its own', async ({ page }) => {
    await page.goto('/pt');
    await expect(page.locator('.game-layer canvas')).toBeVisible({ timeout: 20_000 });
    const start = await snapshot(page);
    expect(start.mode).toBe('demo');

    // No input at all for 6 s: the autopilot drives toward the first stop.
    await page.waitForTimeout(6_000);
    const later = await snapshot(page);
    expect(Math.abs(manhattan(later) - manhattan(start))).toBeGreaterThan(5);
  });

  test('the snapshot is a copy, not the live runtime', async ({ page }) => {
    await page.goto('/pt');
    await snapshot(page);
    const unchanged = await page.evaluate(() => {
      const api = window.__rodovia!;
      const a = api.snapshot();
      a.car.x = 9999;
      return api.snapshot().car.x !== 9999;
    });
    expect(unchanged).toBe(true);
  });

  test('the scene never fetches from another origin', async ({ page, baseURL }) => {
    const foreign: string[] = [];
    const origin = new URL(baseURL!).origin;
    page.on('request', (req) => {
      const url = req.url();
      if (/^https?:/.test(url) && new URL(url).origin !== origin) foreign.push(url);
    });
    await page.goto('/pt');
    await expect(page.locator('.game-layer canvas')).toBeVisible({ timeout: 20_000 });
    await snapshot(page);
    // Give the GLB, the label font and the GPU benchmark lookup time to load.
    await page.waitForTimeout(3_000);
    expect(foreign).toEqual([]);
  });

  test('a canvas that cannot get a WebGL context falls back to a forced pit stop', async ({ page }) => {
    // The mount-time probe succeeds; every later WebGL context (GPU tier, renderer) fails.
    await page.addInitScript(() => {
      const real = HTMLCanvasElement.prototype.getContext;
      let webglCalls = 0;
      HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, ...args: Parameters<typeof real>) {
        if (String(args[0]).includes('webgl') && ++webglCalls > 1) return null;
        return real.apply(this, args);
      } as typeof real;
    });
    await page.goto('/pt');
    await expect(page.locator('html')).toHaveAttribute('data-mode', 'pitstop', { timeout: 20_000 });
    await expect(page.getByRole('button', { name: 'Entrar no jogo' })).toHaveAttribute('aria-disabled', 'true');
    // A context lost after the probe says the game failed, not that WebGL is missing.
    await expect(page.getByText('O jogo não pôde carregar.')).toBeVisible();
    await expect(page.locator('.game-layer')).toHaveCount(0);
    await expect(page.locator('main#pitstop')).toBeVisible();
  });

  test('leaving for the pit stop unmounts the world and its debug hook', async ({ page }) => {
    await page.goto('/pt');
    await snapshot(page);
    await page.keyboard.press('p');
    await expect(page.locator('html')).toHaveAttribute('data-mode', 'pitstop');
    await expect(page.locator('.game-layer')).toHaveCount(0);
    expect(await page.evaluate(() => window.__rodovia === undefined)).toBe(true);
  });
});
