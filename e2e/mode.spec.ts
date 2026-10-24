import { expect, test, type Page } from '@playwright/test';

const html = (page: Page) => page.locator('html');
const storedPitstop = (page: Page) =>
  page.evaluate(() => window.localStorage.getItem('rodovia:pitstop'));

/** The decision runs in an effect after hydration, so `data-mode` appearing means the listeners are attached. */
async function openGame(page: Page, path = '/pt') {
  await page.goto(path);
  await expect(html(page)).toHaveAttribute('data-mode', 'game');
}

test.describe('game / pit stop mode', () => {
  test('/pt starts in game mode', async ({ page }) => {
    await openGame(page);
  });

  test('P toggles between game and pit stop', async ({ page }) => {
    await openGame(page);
    await page.keyboard.press('p');
    await expect(html(page)).toHaveAttribute('data-mode', 'pitstop');
    await page.keyboard.press('p');
    await expect(html(page)).toHaveAttribute('data-mode', 'game');
  });

  test('prefers-reduced-motion starts in pit stop', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/pt');
    await expect(html(page)).toHaveAttribute('data-mode', 'pitstop');
  });

  test('the mouse wheel scrolls the page in pit stop mode', async ({ page }) => {
    await openGame(page);
    await page.keyboard.press('p');
    await expect(html(page)).toHaveAttribute('data-mode', 'pitstop');
    expect(await page.evaluate(() => window.scrollY)).toBe(0);
    await page.mouse.move(200, 300);
    await page.mouse.wheel(0, 800);
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(0);
  });

  test('the pit stop choice survives a reload', async ({ page }) => {
    await openGame(page);
    await page.keyboard.press('p');
    await expect(html(page)).toHaveAttribute('data-mode', 'pitstop');
    await page.reload();
    await expect(html(page)).toHaveAttribute('data-mode', 'pitstop');
    expect(await storedPitstop(page)).toBe('on');
  });

  test('P typed into a form field does not toggle the mode', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/pt');
    await expect(html(page)).toHaveAttribute('data-mode', 'pitstop');
    const name = page.getByLabel('Nome');
    await name.click();
    await page.keyboard.type('Pedro Paulo');
    await expect(name).toHaveValue('Pedro Paulo');
    await expect(html(page)).toHaveAttribute('data-mode', 'pitstop');
  });

  test('the toggle button switches mode and relabels itself', async ({ page }) => {
    await openGame(page);
    const toGame = page.getByRole('button', { name: 'Entrar no jogo' });
    const toPitstop = page.getByRole('button', { name: 'Modo pit stop (P)' });
    // The label swaps; there is no pressed state to announce on top of it.
    await expect(toPitstop).not.toHaveAttribute('aria-pressed');
    await toPitstop.click();
    await expect(html(page)).toHaveAttribute('data-mode', 'pitstop');
    await expect(toGame).not.toHaveAttribute('aria-pressed');
    await toGame.click();
    await expect(html(page)).toHaveAttribute('data-mode', 'game');
  });

  test('/en labels the toggle in English', async ({ page }) => {
    await openGame(page, '/en');
    await expect(page.getByRole('button', { name: 'Pit stop mode (P)' })).toBeVisible();
    await page.keyboard.press('p');
    await expect(page.getByRole('button', { name: 'Enter the game' })).toBeVisible();
  });

  test('the toggle sits bottom-right in the garage, leaving the top to the LuisOS menu bar', async ({ page }) => {
    await openGame(page);
    const button = page.getByRole('button', { name: 'Modo pit stop (P)' });

    await page.setViewportSize({ width: 1280, height: 800 });
    let box = await button.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.y + box!.height).toBeGreaterThan(800 - 64);
    expect(box!.x + box!.width).toBeGreaterThan(1280 - 64);

    await page.setViewportSize({ width: 390, height: 800 });
    box = await button.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.y + box!.height).toBeGreaterThan(800 - 64);
    expect(box!.x + box!.width).toBeGreaterThan(390 - 64);

    // The pit stop page keeps it top-right on a phone.
    await button.click();
    const back = page.getByRole('button', { name: 'Entrar no jogo' });
    box = await back.boundingBox();
    expect(box!.y).toBeLessThan(64);
  });
});

test.describe('without WebGL', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      HTMLCanvasElement.prototype.getContext = () => null;
    });
  });

  test('pit stop is forced, the toggle is disabled, the reason is on screen and nothing is stored', async ({ page }) => {
    await page.goto('/pt');
    await expect(html(page)).toHaveAttribute('data-mode', 'pitstop');
    const button = page.getByRole('button', { name: 'Entrar no jogo' });
    await expect(button).toHaveAttribute('aria-disabled', 'true');
    // Visible text, not a tooltip: it works on touch and is the button's description.
    const note = page.getByText('Seu navegador não tem WebGL, então o modo jogo não está disponível.');
    await expect(note).toBeVisible();
    await expect(button).toHaveAccessibleDescription(await note.innerText());
    await expect(button).not.toHaveAttribute('title');
    const [buttonBox, noteBox] = [await button.boundingBox(), await note.boundingBox()];
    expect(buttonBox && noteBox, 'both have a layout box').toBeTruthy();
    expect(noteBox!.x + noteBox!.width).toBeLessThanOrEqual(page.viewportSize()!.width);
    expect(noteBox!.y + noteBox!.height).toBeLessThanOrEqual(page.viewportSize()!.height);

    await button.click({ force: true });
    await page.keyboard.press('p');
    await expect(html(page)).toHaveAttribute('data-mode', 'pitstop');
    expect(await storedPitstop(page)).toBeNull();
  });

  test('on a phone the explanation leaves the pit stop header and its links readable', async ({ page }) => {
    for (const size of [{ width: 320, height: 640 }, { width: 390, height: 800 }]) {
      await page.setViewportSize(size);
      await page.goto('/pt');
      const note = page.getByText('Seu navegador não tem WebGL, então o modo jogo não está disponível.');
      await expect(note).toBeVisible();
      const noteBox = (await note.boundingBox())!;
      const covered = page.locator('main#pitstop').locator('.eyebrow, nav a, h1').filter({ visible: true });
      const boxes = await Promise.all((await covered.all()).map((el) => el.boundingBox()));
      expect(boxes.length, 'eyebrow, nav links and the name').toBeGreaterThan(5);
      for (const box of boxes) {
        if (box === null) continue;
        const overlaps =
          noteBox.x < box.x + box.width &&
          box.x < noteBox.x + noteBox.width &&
          noteBox.y < box.y + box.height &&
          box.y < noteBox.y + noteBox.height;
        expect(overlaps, `the note covers the first screen's header text @ ${size.width}px`).toBe(false);
      }
    }
  });

  test('a stored "off" does not leave the forced pit stop', async ({ page }) => {
    await page.addInitScript(() => window.localStorage.setItem('rodovia:pitstop', 'off'));
    await page.goto('/pt');
    await expect(html(page)).toHaveAttribute('data-mode', 'pitstop');
  });
});

test.describe('when the game fails to load', () => {
  // A string that only the GameLayer module contains (its root element's classes), so the test
  // finds the dynamic chunk by content and does not depend on bundler file names.
  const GAME_LAYER_MARKER = 'game-layer fixed inset-0';

  /** Make the chunk that holds GameLayer fail the way a dropped connection or a stale deploy would. */
  async function breakGameLayerChunk(page: Page) {
    const failed: string[] = [];
    await page.route('**/_next/static/chunks/**', async (route) => {
      const url = route.request().url();
      if (!url.split('?')[0].endsWith('.js')) return route.continue();
      const response = await route.fetch();
      if ((await response.text()).includes(GAME_LAYER_MARKER)) {
        failed.push(url);
        return route.abort('failed');
      }
      return route.fulfill({ response });
    });
    return failed;
  }

  test('the pit stop stays up, explained and without a Next error page', async ({ page }) => {
    const failed = await breakGameLayerChunk(page);
    await page.goto('/pt');

    await expect(html(page)).toHaveAttribute('data-mode', 'pitstop');
    expect(failed.length, 'the GameLayer chunk was requested and refused').toBeGreaterThan(0);

    const pitstop = page.locator('main#pitstop');
    await expect(pitstop).toBeVisible();
    await expect(pitstop).not.toHaveAttribute('inert');
    await expect(pitstop.getByRole('heading', { level: 1 })).toHaveText('Luis Didonato');
    await expect(page.locator('.game-layer')).toHaveCount(0);

    // The reason is generic: the browser is fine, the game just did not arrive.
    await expect(page.getByText('O jogo não pôde carregar.')).toBeVisible();
    await expect(page.getByText(/WebGL/)).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Entrar no jogo' })).toHaveAttribute('aria-disabled', 'true');
    // Neither Next's "Application error" screen nor the locale error page replaced the document.
    await expect(page.getByText(/Application error|Algo deu errado/)).toHaveCount(0);

    // It stays: P and the toggle cannot enter the broken game, and nothing is remembered.
    await page.keyboard.press('p');
    await page.getByRole('button', { name: 'Entrar no jogo' }).click({ force: true });
    await expect(html(page)).toHaveAttribute('data-mode', 'pitstop');
    expect(await storedPitstop(page)).toBeNull();
  });

  test('/en says so in English', async ({ page }) => {
    await breakGameLayerChunk(page);
    await page.goto('/en');
    await expect(html(page)).toHaveAttribute('data-mode', 'pitstop');
    await expect(page.getByText('The game could not load.')).toBeVisible();
    await expect(page.locator('main#pitstop').getByRole('heading', { level: 1 })).toHaveText('Luis Didonato');
  });
});
