import { expect, test, type Page } from '@playwright/test';
import type { GarageSnapshot } from '@/lib/garage/debug';

/** Read-only copy of the garage, published by the scene once it runs. */
async function snapshot(page: Page): Promise<GarageSnapshot> {
  await page.waitForFunction(() => window.__garage !== undefined, null, { timeout: 30_000 });
  return page.evaluate(() => window.__garage!.snapshot());
}

/** Open the garage and wait until the camera has settled on the bench. */
async function openGarage(page: Page, path = '/pt') {
  await page.goto(path);
  await expect(page.locator('html')).toHaveAttribute('data-mode', 'game');
  await page.waitForFunction(() => window.__garage?.snapshot().arrived === true, null, { timeout: 30_000 });
}

const layer = (page: Page) => page.locator('.game-layer');

test.describe('garage: bench', () => {
  test('/pt shows the menu on the screen', async ({ page }) => {
    await openGarage(page);
    await expect(page.locator('.game-layer canvas')).toBeVisible();
    await expect(layer(page).getByRole('button', { name: /Currículo/ })).toBeVisible({ timeout: 30_000 });
  });

  test('/en shows the English menu', async ({ page }) => {
    await openGarage(page, '/en');
    await expect(layer(page).getByRole('button', { name: /Resume/ })).toBeVisible({ timeout: 30_000 });
    await expect(layer(page).getByRole('button', { name: /Português/ })).toBeVisible();
  });

  test('the bench stays under 60 draw calls', async ({ page }) => {
    await openGarage(page);
    const s = await snapshot(page);
    expect(s.drawCalls).toBeGreaterThan(0);
    expect(s.drawCalls).toBeLessThanOrEqual(60);
  });

  for (const size of [
    { width: 1440, height: 900, minShare: 0 },
    { width: 390, height: 844, minShare: 0.3 },
  ]) {
    test(`the glass is on screen at ${size.width}x${size.height}`, async ({ page }) => {
      await page.setViewportSize({ width: size.width, height: size.height });
      await openGarage(page);
      const { glassRect: r } = await snapshot(page);
      expect(r.width * r.height).toBeGreaterThan(0);
      expect(r.x).toBeGreaterThanOrEqual(0);
      expect(r.y).toBeGreaterThanOrEqual(0);
      expect(r.x + r.width).toBeLessThanOrEqual(size.width);
      expect(r.y + r.height).toBeLessThanOrEqual(size.height);
      expect(r.height / size.height).toBeGreaterThanOrEqual(size.minShare);
    });
  }

  test('the menu sits on the glass', async ({ page }) => {
    await openGarage(page);
    const { glassRect: r } = await snapshot(page);
    const menu = await layer(page).locator('.crt-screen').boundingBox();
    expect(menu).not.toBeNull();
    expect(Math.abs(menu!.x - r.x)).toBeLessThan(6);
    expect(Math.abs(menu!.y - r.y)).toBeLessThan(6);
    expect(Math.abs(menu!.width - r.width)).toBeLessThan(12);
  });
});
