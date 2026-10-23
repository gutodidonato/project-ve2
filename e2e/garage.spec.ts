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

/** Centre of a 3D key on the window, from the scene's projection. */
async function keyCentre(page: Page, code: string) {
  const s = await snapshot(page);
  const key = s.keyRects.find((k) => k.code === code);
  expect(key, `key ${code} is projected`).toBeTruthy();
  return { x: key!.rect.x + key!.rect.width / 2, y: key!.rect.y + key!.rect.height / 2 };
}

const fullScreen = (page: Page) => page.locator('.crt-screen[data-full="true"]');

test.describe('garage: screen', () => {
  test('C opens the resume and Esc comes back', async ({ page }) => {
    await openGarage(page);
    await page.keyboard.press('c');
    await expect(fullScreen(page)).toBeVisible({ timeout: 10_000 });
    await expect(fullScreen(page).getByRole('heading', { name: 'Experiência' })).toBeVisible();
    await expect(page).toHaveURL(/#curriculo$/);
    await page.keyboard.press('Escape');
    await expect(layer(page).getByRole('button', { name: /Currículo/ })).toBeVisible();
    await expect(page).toHaveURL(/\/pt$/);
  });

  test('clicking the 3D K key opens the contact', async ({ page }) => {
    await openGarage(page);
    const { x, y } = await keyCentre(page, 'KeyK');
    await page.mouse.click(x, y);
    await expect(fullScreen(page).getByRole('heading', { name: 'Contato' })).toBeVisible({ timeout: 10_000 });
  });

  test('typing in the contact form does not change the view', async ({ page }) => {
    await openGarage(page);
    await page.keyboard.press('k');
    const name = fullScreen(page).getByRole('textbox').first();
    await name.click();
    await page.keyboard.type('cjke');
    await page.keyboard.press('Escape');
    await expect(name).toHaveValue('cjke');
    await expect(name).not.toBeFocused();
    expect((await snapshot(page)).view).toBe('screen');
    await expect(page).toHaveURL(/\/pt#contato$/);
  });

  test('#contato opens straight on the contact', async ({ page }) => {
    await openGarage(page, '/pt#contato');
    await expect(fullScreen(page).getByRole('heading', { name: 'Contato' })).toBeVisible({ timeout: 10_000 });
  });

  test('E keeps the resume open in English', async ({ page }) => {
    await openGarage(page, '/pt#curriculo');
    await expect(fullScreen(page)).toBeVisible({ timeout: 10_000 });
    await page.keyboard.press('e');
    await expect(page).toHaveURL(/\/en#resume$/, { timeout: 20_000 });
    await expect(page.locator('.crt-screen[data-full="true"]').getByRole('heading', { name: 'Experience' })).toBeVisible({
      timeout: 20_000,
    });
  });

  test('the screen follows the glass on resize', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await openGarage(page);
    await page.keyboard.press('c');
    await expect(fullScreen(page)).toBeVisible({ timeout: 10_000 });
    await page.setViewportSize({ width: 390, height: 844 });
    await expect
      .poll(
        async () => {
          // On a phone the glass covers the window and spills past it: the page is the part inside the window.
          const { glassRect: g } = await snapshot(page);
          const x = Math.max(0, g.x);
          const y = Math.max(0, g.y);
          const width = Math.min(390, g.x + g.width) - x;
          const box = await page.locator('.crt-screen').boundingBox();
          return box ? Math.max(Math.abs(box.x - x), Math.abs(box.y - y), Math.abs(box.width - width)) : 999;
        },
        { timeout: 3_000 },
      )
      .toBeLessThan(2);
  });

  test('phone keys are at least 44 px', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await openGarage(page);
    const s = await snapshot(page);
    for (const code of ['KeyC', 'KeyJ', 'KeyK', 'KeyE']) {
      const key = s.keyRects.find((k) => k.code === code);
      expect(key, code).toBeTruthy();
      expect(key!.rect.width, code).toBeGreaterThanOrEqual(44);
      expect(key!.rect.height, code).toBeGreaterThanOrEqual(44);
    }
  });
});

/**
 * Leaving a page with a live WebGL scene takes ~11 s under SwiftShader (38 ms without the scene,
 * under 1.5 s on a real GPU), so the launch tests wait up to 30 s for the game page to commit.
 */
const GAME_COMMIT = { timeout: 30_000, waitUntil: 'commit' } as const;

test.describe('garage: launch', () => {
  test('J opens the door and lands on the game', async ({ page }) => {
    await openGarage(page);
    await page.keyboard.press('j');
    await expect
      .poll(async () => (await snapshot(page)).door, { timeout: 3_000, intervals: [50] })
      .toBeGreaterThan(0.2);
    expect((await snapshot(page)).door).toBeLessThan(0.95);
    await page.waitForURL('**/salto88/index.html', GAME_COMMIT);
  });

  test('J twice navigates once', async ({ page }) => {
    await openGarage(page);
    const urls: string[] = [];
    page.on('framenavigated', (f) => {
      if (f === page.mainFrame()) urls.push(f.url());
    });
    await page.keyboard.press('j');
    await page.keyboard.press('j');
    await page.keyboard.press('c');
    await page.keyboard.press('e');
    await page.waitForURL('**/salto88/index.html', GAME_COMMIT);
    await page.waitForTimeout(1_000);
    expect(urls.filter((u) => u.includes('/salto88/'))).toHaveLength(1);
    expect(urls.some((u) => u.includes('/en'))).toBe(false);
  });

  test('Esc during the launch cancels it', async ({ page }) => {
    await openGarage(page);
    await page.keyboard.press('j');
    await page.waitForTimeout(600);
    await page.keyboard.press('Escape');
    await expect(layer(page).getByRole('button', { name: /Currículo/ })).toBeVisible();
    await page.waitForTimeout(4_000);
    await expect(page).toHaveURL(/\/pt$/);
  });

  test('/en launches with lang=en', async ({ page }) => {
    await openGarage(page, '/en');
    await page.keyboard.press('j');
    await page.waitForURL('**/salto88/index.html?lang=en', GAME_COMMIT);
  });

  test('back from the game shows the bench again', async ({ page }) => {
    await openGarage(page);
    await page.keyboard.press('j');
    await page.waitForURL('**/salto88/index.html', GAME_COMMIT);
    await page.goBack();
    await expect(layer(page).getByRole('button', { name: /Currículo/ })).toBeVisible({ timeout: 30_000 });
    const s = await snapshot(page);
    expect(s.view).toBe('bench');
    expect(s.door).toBeLessThan(0.05);
  });

  test('reduced motion cuts the camera', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.addInitScript(() => window.localStorage.setItem('rodovia:pitstop', 'off'));
    await openGarage(page);
    await page.keyboard.press('c');
    await page.waitForTimeout(150);
    const s = await snapshot(page);
    expect(s.view).toBe('screen');
    expect(s.arrived).toBe(true);
  });

  test('the credits name the car model', async ({ page }) => {
    await openGarage(page);
    await page.getByRole('button', { name: 'Créditos' }).click();
    await expect(page.getByRole('dialog')).toContainText('dark_igorek');
  });
});
