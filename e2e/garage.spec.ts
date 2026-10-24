import { expect, test, type Page } from '@playwright/test';
import type { GarageSnapshot } from '@/lib/garage/debug';

// Each test drives a live WebGL scene under SwiftShader: run them one after another (several scenes
// at once starve the CPU and every wait times out), with room for the slow software renderer.
test.describe.configure({ mode: 'serial', timeout: 120_000 });

/** Read-only copy of the garage, published by the scene once it runs. */
async function snapshot(page: Page): Promise<GarageSnapshot> {
  await page.waitForFunction(() => window.__garage !== undefined, null, { timeout: 60_000 });
  return page.evaluate(() => window.__garage!.snapshot());
}

/**
 * Open the garage and wait until the camera rests on the desk. Unless the test is about the first
 * visit, the readme counts as already seen, so it does not open over everything.
 */
async function openGarage(page: Page, path = '/pt', { firstVisit = false } = {}) {
  if (!firstVisit) await page.addInitScript(() => window.localStorage.setItem('rodovia:readme', 'seen'));
  await page.goto(path);
  await expect(page.locator('html')).toHaveAttribute('data-mode', 'game');
  await page.waitForFunction(() => window.__garage?.snapshot().view === 'desk' && window.__garage.snapshot().arrived, null, {
    timeout: 60_000,
  });
}

const desktop = (page: Page) => page.locator('.os-desktop');
const iconNamed = (page: Page, name: string) => desktop(page).getByRole('button', { name, exact: true });
const windowNamed = (page: Page, name: string) => desktop(page).getByRole('dialog', { name, exact: true });

test.describe('desk', () => {
  test('/pt opens on the desktop with the seven icons', async ({ page }) => {
    await openGarage(page);
    await expect(desktop(page)).toBeVisible();
    await expect(desktop(page).getByTestId('os-icon')).toHaveCount(7);
  });

  test('the glass takes about three quarters of a wide window', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await openGarage(page);
    const { glassRect: r } = await snapshot(page);
    expect(r.height / 900).toBeGreaterThan(0.68);
    expect(r.height / 900).toBeLessThan(0.82);
  });

  test('the glass covers a phone', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await openGarage(page);
    const { glassRect: r } = await snapshot(page);
    expect(r.height / 844).toBeGreaterThanOrEqual(0.95);
  });

  test('the desktop is crisp and flat when the camera rests', async ({ page }) => {
    await openGarage(page);
    await expect(page.locator('.crt-screen')).toHaveAttribute('data-full', 'true');
    expect(await page.locator('.crt-screen').evaluate((e) => (e as HTMLElement).style.transform)).toBe('');
  });

  test('stays under 60 draw calls', async ({ page }) => {
    await openGarage(page);
    const s = await snapshot(page);
    expect(s.drawCalls).toBeGreaterThan(0);
    expect(s.drawCalls).toBeLessThanOrEqual(60);
  });
});

test.describe('windows', () => {
  test('double click opens the resume, Esc closes it', async ({ page }) => {
    await openGarage(page);
    await iconNamed(page, 'Currículo.txt').dblclick();
    await expect(windowNamed(page, 'Currículo.txt')).toBeVisible();
    await expect(windowNamed(page, 'Currículo.txt').getByRole('heading', { name: 'Experiência' })).toBeVisible();
    await expect(page).toHaveURL(/#curriculo$/);
    await page.keyboard.press('Escape');
    await expect(windowNamed(page, 'Currículo.txt')).toHaveCount(0);
    await expect(page).toHaveURL(/\/pt$/);
  });

  test('the projects folder opens a case', async ({ page }) => {
    await openGarage(page);
    await iconNamed(page, 'Projetos').dblclick();
    await windowNamed(page, 'Projetos').getByRole('button', { name: 'migracao-gcp-aws.txt' }).dblclick();
    await expect(windowNamed(page, 'migracao-gcp-aws.txt')).toContainText('Migração GCP → AWS');
  });

  test('Esc in the contact form only leaves the field', async ({ page }) => {
    await openGarage(page);
    await page.keyboard.press('k');
    const name = windowNamed(page, 'Contato').getByRole('textbox').first();
    await name.click();
    await page.keyboard.type('cjke');
    await page.keyboard.press('Escape');
    await expect(name).toHaveValue('cjke');
    await expect(name).not.toBeFocused();
    await expect(windowNamed(page, 'Contato')).toBeVisible();
    await expect(page).toHaveURL(/\/pt#contato$/);
  });

  test('a dragged window stays reachable after the window shrinks', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await openGarage(page);
    await iconNamed(page, 'Currículo.txt').dblclick();
    const title = windowNamed(page, 'Currículo.txt').locator('.os-titlebar');
    const box = (await title.boundingBox())!;
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width / 2 + 700, box.y + box.height / 2 + 400, { steps: 8 });
    await page.mouse.up();
    await page.setViewportSize({ width: 900, height: 700 });
    await expect
      .poll(
        async () => {
          const d = (await desktop(page).boundingBox())!;
          const t = (await title.boundingBox())!;
          return t.x + 60 <= d.x + d.width && t.y + t.height <= d.y + d.height && t.x >= d.x - 1;
        },
        { timeout: 30_000 },
      )
      .toBe(true);
  });

  test('#contato opens straight on the contact, and the readme stays closed', async ({ page }) => {
    await openGarage(page, '/pt#contato', { firstVisit: true });
    await expect(windowNamed(page, 'Contato')).toBeVisible();
    await expect(windowNamed(page, 'Leia-me.txt')).toHaveCount(0);
  });

  test('the readme opens on the first visit only', async ({ page }) => {
    await openGarage(page, '/pt', { firstVisit: true });
    await expect(windowNamed(page, 'Leia-me.txt')).toBeVisible();
    await page.reload();
    await page.waitForFunction(() => window.__garage?.snapshot().view === 'desk' && window.__garage.snapshot().arrived, null, {
      timeout: 60_000,
    });
    await expect(desktop(page).getByTestId('os-icon')).toHaveCount(7);
    await expect(windowNamed(page, 'Leia-me.txt')).toHaveCount(0);
  });

  test('E keeps the open windows in English', async ({ page }) => {
    await openGarage(page);
    // A phone's maximized windows cover the icons: the folder first, the resume last, by its key.
    await iconNamed(page, 'Projetos').dblclick();
    await windowNamed(page, 'Projetos').getByRole('button', { name: 'migracao-gcp-aws.txt' }).dblclick();
    await page.locator('body').click({ position: { x: 2, y: 2 } });
    await page.keyboard.press('c');
    await expect(windowNamed(page, 'Currículo.txt')).toBeVisible();
    await page.keyboard.press('e');
    await expect(page).toHaveURL(/\/en#resume$/, { timeout: 30_000 });
    await expect(windowNamed(page, 'Resume.txt')).toBeVisible({ timeout: 60_000 });
    await expect(windowNamed(page, 'migracao-gcp-aws.txt')).toBeVisible();
    await expect(windowNamed(page, 'Resume.txt').getByRole('heading', { name: 'Experience' })).toBeVisible();
  });

  test('the control panel switches the language and names the car model', async ({ page }) => {
    await openGarage(page);
    await iconNamed(page, 'Painel de controle').dblclick();
    await expect(windowNamed(page, 'Painel de controle')).toContainText('dark_igorek');
    await windowNamed(page, 'Painel de controle').getByRole('button', { name: 'PT | EN' }).click();
    await expect(page).toHaveURL(/\/en$/, { timeout: 30_000 });
  });
});

test.describe('phone', () => {
  test('icons are at least 44 px and windows open maximized', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await openGarage(page);
    for (const box of await desktop(page).getByTestId('os-icon').evaluateAll((els) => els.map((e) => e.getBoundingClientRect().toJSON()))) {
      expect(box.width).toBeGreaterThanOrEqual(44);
      expect(box.height).toBeGreaterThanOrEqual(44);
    }
    await iconNamed(page, 'Currículo.txt').click();
    const d = (await desktop(page).boundingBox())!;
    const w = (await windowNamed(page, 'Currículo.txt').boundingBox())!;
    expect(Math.abs(w.width - d.width)).toBeLessThan(3);
  });
});

test.describe('keys', () => {
  test('typing in the contact form does not open windows', async ({ page }) => {
    await openGarage(page);
    await page.keyboard.press('k');
    await windowNamed(page, 'Contato').getByRole('textbox').first().click();
    await page.keyboard.type('cjk');
    await expect(windowNamed(page, 'Currículo.txt')).toHaveCount(0);
    expect((await snapshot(page)).view).toBe('desk');
  });
});
