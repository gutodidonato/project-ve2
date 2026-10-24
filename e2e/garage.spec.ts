import { expect, test, type Page } from '@playwright/test';
import type { GarageSnapshot } from '@/lib/garage/debug';
import { LAUNCH_MS } from '@/lib/garage/launch';

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

  test('a short laptop window keeps the seven icons in one column, clear of the windows', async ({ page, isMobile }) => {
    test.skip(isMobile, 'a laptop with a mouse: a touch screen gets the compact desktop');
    await page.setViewportSize({ width: 1366, height: 657 });
    await openGarage(page, '/pt', { firstVisit: true });
    const d = (await desktop(page).boundingBox())!;
    const readme = (await windowNamed(page, 'Leia-me.txt').boundingBox())!;
    for (const box of await desktop(page).getByTestId('os-icon').evaluateAll((els) => els.map((e) => e.getBoundingClientRect().toJSON()))) {
      expect(box.x + box.width).toBeLessThanOrEqual(readme.x);
      expect(box.y + box.height).toBeLessThanOrEqual(d.y + d.height);
    }
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
    // The visit counts: coming back without the anchor does not open the readme either.
    await page.goto('/pt');
    await page.waitForFunction(() => window.__garage?.snapshot().view === 'desk' && window.__garage.snapshot().arrived, null, {
      timeout: 60_000,
    });
    await expect(desktop(page).getByTestId('os-icon')).toHaveCount(7);
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
    // Shows PT | EN, named by the language it switches to.
    await windowNamed(page, 'Painel de controle').getByRole('button', { name: 'English' }).click();
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

/**
 * Waiting for the game page: `commit` is enough (the URL changed), its load would only wait on the
 * game's own assets.
 */
const GAME_COMMIT = { timeout: 60_000, waitUntil: 'commit' } as const;

/** Never fire the departure: for tests that watch the launch, not the navigation. */
async function holdDeparture(page: Page) {
  await page.addInitScript((ms) => {
    const start = window.setTimeout;
    window.setTimeout = ((fn: TimerHandler, delay?: number, ...rest: unknown[]) =>
      delay === ms ? 0 : start(fn, delay, ...rest)) as typeof window.setTimeout;
  }, LAUNCH_MS);
}

/** Freeze the launch at `ms` after it starts (set before J, it holds from the first frame). */
async function holdLaunch(page: Page, ms: number) {
  await page.evaluate((t) => window.__garage!.holdLaunch(t), ms);
}

test.describe('launch', () => {
  test('Salto88.exe opens the launch dialog and the camera pulls back', async ({ page }) => {
    await holdDeparture(page);
    await openGarage(page);
    const desk = (await snapshot(page)).glassRect.height;
    await holdLaunch(page, 1200);
    await iconNamed(page, 'Salto88.exe').dblclick();
    await expect(windowNamed(page, 'Salto88.exe')).toContainText('Destino: fev 2019');
    await expect.poll(async () => (await snapshot(page)).zoom, { timeout: 30_000 }).toBeGreaterThan(0.3);
    expect((await snapshot(page)).zoom).toBeLessThan(0.7);
    await holdLaunch(page, 1800);
    await expect.poll(async () => (await snapshot(page)).glassRect.height, { timeout: 30_000 }).toBeLessThan(desk / 2);
  });

  test('J reaches the game once', async ({ page }) => {
    await openGarage(page);
    const urls: string[] = [];
    page.on('framenavigated', (f) => {
      if (f === page.mainFrame()) urls.push(f.url());
    });
    await page.keyboard.press('j');
    await page.keyboard.press('j');
    await page.keyboard.press('c');
    await page.keyboard.press('k');
    expect((await snapshot(page)).windows).toEqual(['salto88']);
    await page.waitForURL('**/salto88/index.html', GAME_COMMIT);
    await page.waitForTimeout(1_000);
    expect(urls.filter((u) => u.includes('/salto88/'))).toHaveLength(1);
    expect(urls.some((u) => /#(curriculo|contato)$/.test(u))).toBe(false);
  });

  test("the dialog's close box cancels during the pull-back", async ({ page }) => {
    await openGarage(page);
    await holdLaunch(page, 1200);
    await iconNamed(page, 'Salto88.exe').dblclick();
    await expect.poll(async () => (await snapshot(page)).view).toBe('launch');
    await windowNamed(page, 'Salto88.exe').getByRole('button', { name: 'Fechar (Esc)' }).click();
    await expect.poll(async () => (await snapshot(page)).view).toBe('desk');
    await page.waitForTimeout(LAUNCH_MS + 600);
    await expect(page).toHaveURL(/\/pt$/);
  });

  test('Esc during the pull-back cancels and the desktop comes back as it was', async ({ page }) => {
    await openGarage(page);
    await page.keyboard.press('c');
    await expect(windowNamed(page, 'Currículo.txt')).toBeVisible();
    await holdLaunch(page, 1200);
    await page.keyboard.press('j');
    await expect.poll(async () => (await snapshot(page)).view).toBe('launch');
    await page.keyboard.press('Escape');
    await expect.poll(async () => (await snapshot(page)).view).toBe('desk');
    expect((await snapshot(page)).windows).toEqual(['cv']);
    await expect(windowNamed(page, 'Salto88.exe')).toHaveCount(0);
    await page.waitForTimeout(LAUNCH_MS + 600);
    await expect(page).toHaveURL(/\/pt#curriculo$/);
  });

  test('Esc after the flash starts does not cancel', async ({ page }) => {
    await holdDeparture(page);
    await openGarage(page);
    await holdLaunch(page, 4500);
    await page.keyboard.press('j');
    await expect.poll(async () => (await snapshot(page)).whiteout, { timeout: 30_000 }).toBeGreaterThan(0);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
    expect((await snapshot(page)).view).toBe('launch');
  });

  test('/en launches with lang=en', async ({ page }) => {
    await openGarage(page, '/en');
    await page.keyboard.press('j');
    await page.waitForURL('**/salto88/index.html?lang=en', GAME_COMMIT);
  });

  test('back from the game shows the desktop', async ({ page }) => {
    await openGarage(page);
    await page.keyboard.press('j');
    await page.waitForURL('**/salto88/index.html', GAME_COMMIT);
    await page.goBack();
    await expect(desktop(page).getByTestId('os-icon')).toHaveCount(7, { timeout: 60_000 });
    await expect.poll(async () => (await snapshot(page)).view, { timeout: 30_000 }).toBe('desk');
    const s = await snapshot(page);
    expect(s.door).toBeLessThan(0.05);
    expect(s.windows).toEqual([]);
  });

  test('a page restored from the cache after the launch shows the desk', async ({ page }) => {
    // Playwright's Chromium runs without the back-forward cache, so the restore is the event itself.
    await holdDeparture(page);
    await openGarage(page);
    await page.keyboard.press('j');
    await expect.poll(async () => (await snapshot(page)).door, { timeout: 30_000 }).toBeGreaterThan(0.2);
    await page.evaluate(() => window.dispatchEvent(new PageTransitionEvent('pageshow', { persisted: true })));
    await expect.poll(async () => (await snapshot(page)).view, { timeout: 10_000 }).toBe('desk');
    await expect.poll(async () => (await snapshot(page)).door, { timeout: 10_000 }).toBeLessThan(0.05);
    await expect(windowNamed(page, 'Salto88.exe')).toHaveCount(0);
  });

  test('P during the launch leaves a working desktop', async ({ page }) => {
    await holdDeparture(page);
    await openGarage(page);
    await page.keyboard.press('j');
    await page.waitForTimeout(500);
    await page.keyboard.press('p');
    await expect(page.locator('html')).toHaveAttribute('data-mode', 'pitstop');
    await page.keyboard.press('p');
    await expect(desktop(page).getByTestId('os-icon')).toHaveCount(7, { timeout: 60_000 });
    await page.waitForFunction(() => window.__garage?.snapshot().view === 'desk', null, { timeout: 60_000 });
    await page.keyboard.press('c');
    await expect(windowNamed(page, 'Currículo.txt')).toBeVisible();
  });

  test('reduced motion navigates without the pull-back', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.addInitScript(() => window.localStorage.setItem('rodovia:pitstop', 'off'));
    await openGarage(page);
    const t0 = Date.now();
    await page.keyboard.press('j');
    await page.waitForURL('**/salto88/index.html', GAME_COMMIT);
    expect(Date.now() - t0).toBeLessThan(LAUNCH_MS);
  });
});
