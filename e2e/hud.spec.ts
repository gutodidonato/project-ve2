import { expect, test, type Locator, type Page } from '@playwright/test';
import type { RodoviaSnapshot } from '@/lib/game/debug';

// Software WebGL shares the machine with every parallel worker, so game time can
// run at a fraction of wall time (see input.spec.ts): wait for outcomes, with room.
test.describe.configure({ timeout: 90_000 });
const SLOW = { timeout: 20_000 };

const CV_PT = '/cv/luis-didonato-pt.pdf';

/** Read-only copy of the game runtime, published by GameDirector once the scene runs. */
async function snapshot(page: Page): Promise<RodoviaSnapshot> {
  await page.waitForFunction(() => window.__rodovia !== undefined, null, SLOW);
  return page.evaluate(() => window.__rodovia!.snapshot());
}

const zoneOf = (page: Page) => snapshot(page).then((s) => s.zone);
const modeOf = (page: Page) => snapshot(page).then((s) => s.mode);
const hashOf = (page: Page) => page.evaluate(() => window.location.hash);

async function openGame(page: Page, path = '/pt'): Promise<RodoviaSnapshot> {
  await page.goto(path);
  await expect(page.locator('html')).toHaveAttribute('data-mode', 'game');
  await expect(page.locator('.game-layer canvas')).toBeVisible(SLOW);
  return snapshot(page);
}

const hud = (page: Page) => page.locator('.game-layer [data-hud]');
const panel = (page: Page) => page.locator('.game-layer [data-zone-panel]');
const minimap = (page: Page) => page.locator('.game-layer [data-minimap]');
const toggle = (page: Page) => page.getByRole('button', { name: 'Modo pit stop (P)' });
const nextButton = (page: Page) => hud(page).getByRole('button', { name: 'Próxima parada' });
const identity = (page: Page) => page.locator('.game-layer [data-identity]');

type Box = { x: number; y: number; width: number; height: number };

async function boxOf(locator: Locator): Promise<Box> {
  const box = await locator.boundingBox();
  expect(box, 'element has a layout box').not.toBeNull();
  return box!;
}

function contains(outer: Box, inner: Box): boolean {
  return (
    inner.x >= outer.x &&
    inner.y >= outer.y &&
    inner.x + inner.width <= outer.x + outer.width &&
    inner.y + inner.height <= outer.y + outer.height
  );
}

function overlaps(a: Box, b: Box): boolean {
  return a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height;
}

test.describe('zone panel and hash sync', () => {
  test('clicking Contato on the minimap drives there, syncs the hash and shows the form', async ({ page }) => {
    await openGame(page);
    await minimap(page).getByRole('button', { name: 'Ir para Contato' }).click();
    await expect.poll(() => hashOf(page), SLOW).toBe('#contato');
    await expect(panel(page).locator('textarea')).toBeVisible(SLOW);
    expect(await zoneOf(page)).toBe('contato');
  });

  test('/pt#cases spawns parked at cases with the cases panel', async ({ page }) => {
    await page.goto('/pt#cases');
    await expect(panel(page)).toContainText('Oceans-20', SLOW);
    await expect.poll(() => zoneOf(page), SLOW).toBe('cases');
    await expect(panel(page).getByRole('heading', { level: 2 })).toHaveAttribute('aria-live', 'polite');
    expect(await hashOf(page)).toBe('#cases');
  });

  test('an unknown hash starts the demo without console errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (m) => {
      if (m.type() === 'error') errors.push(m.text());
    });
    page.on('pageerror', (e) => errors.push(e.message));

    const start = await openGame(page, '/pt#foo');
    expect(start.mode).toBe('demo');
    await page.waitForTimeout(1_000);
    expect(await modeOf(page)).toBe('demo');
    expect(errors).toEqual([]);
  });

  test('leaving a zone clears the hash and the panel turns into the driving hint', async ({ page }) => {
    await openGame(page, '/pt#cases');
    await page.keyboard.down('ArrowUp');
    await expect.poll(() => zoneOf(page), SLOW).toBeNull();
    await page.keyboard.up('ArrowUp');
    await expect.poll(() => hashOf(page), SLOW).toBe('');
    expect(new URL(page.url()).pathname).toBe('/pt');
    await expect(panel(page)).toContainText('Dirija até um anel de luz', SLOW);
    await expect(panel(page).getByRole('heading', { level: 2 })).toHaveText('Na estrada');
  });

  test('using the panel during the demo takes control and parks at that stop', async ({ page }) => {
    await openGame(page);
    // The demo's first stop is experiência; wait until it is there, then touch its panel.
    await expect.poll(() => zoneOf(page), { timeout: 60_000 }).toBe('experiencia');
    const heading = panel(page).getByRole('heading', { level: 2 });
    // The demo changes zone every few seconds: no announcements until the visitor takes over.
    await expect(heading).toHaveAttribute('aria-live', 'off');
    await heading.click();
    await expect.poll(() => modeOf(page), SLOW).toBe('idle');
    expect(await zoneOf(page)).toBe('experiencia');
    await expect(heading).toHaveAttribute('aria-live', 'polite', SLOW);
  });

  test('typing in the contact panel neither drives the car nor toggles the pit stop', async ({ page }) => {
    await openGame(page, '/pt#contato');
    const message = panel(page).locator('textarea');
    await message.click();
    await page.keyboard.type('wwww p');
    await page.keyboard.press('Space');
    await expect(message).toHaveValue('wwww p ');
    await expect(page.locator('html')).toHaveAttribute('data-mode', 'game');
    expect(await modeOf(page)).toBe('idle');
  });

  test('the wheel over the panel scrolls the panel, not the car', async ({ page }) => {
    await openGame(page, '/pt#experiencia');
    const scroller = panel(page);
    await expect(scroller).toContainText('EVIG', SLOW);
    const box = await boxOf(scroller);
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.wheel(0, 400);
    await expect.poll(() => scroller.evaluate((el) => el.scrollTop), SLOW).toBeGreaterThan(0);
    expect(await modeOf(page)).toBe('idle');
  });

  test('in the focused panel up / down scroll it while WASD keeps driving', async ({ page }) => {
    await openGame(page, '/pt#experiencia');
    const scroller = panel(page);
    await expect(scroller).toContainText('EVIG', SLOW);
    // Clicking the text focuses the panel (tabindex 0): the car must not stop answering to the keys.
    await scroller.getByRole('heading', { level: 3 }).first().click();
    await expect(scroller).toBeFocused();

    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowDown');
    await expect.poll(() => scroller.evaluate((el) => el.scrollTop), SLOW).toBeGreaterThan(0);
    // The scroll keys are the panel's: they never started the car.
    await page.waitForTimeout(500);
    expect(await modeOf(page)).toBe('idle');
    expect(await zoneOf(page)).toBe('experiencia');

    // Held, because a tap shorter than a frame is released before the game reads it.
    await page.keyboard.down('KeyW');
    await expect.poll(() => modeOf(page), SLOW).toBe('manual');
    await page.waitForTimeout(300);
    await page.keyboard.up('KeyW');
    expect(await modeOf(page)).toBe('manual');
  });

  test('Escape hands the scroll keys back to the car', async ({ page }) => {
    await openGame(page, '/pt#experiencia');
    const scroller = panel(page);
    await expect(scroller).toContainText('EVIG', SLOW);
    await scroller.focus();
    await expect(scroller).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(scroller).not.toBeFocused();
    await page.keyboard.down('ArrowUp');
    await expect.poll(() => modeOf(page), SLOW).toBe('manual');
    await page.keyboard.up('ArrowUp');
  });

  test('the focused panel keeps its inset ring: utilities win over the global focus rule', async ({ page }) => {
    await openGame(page, '/pt#experiencia');
    const scroller = panel(page);
    await expect(scroller).toContainText('EVIG', SLOW);
    await scroller.focus();
    await expect(scroller).toBeFocused();
    const ring = await scroller.evaluate((el) => {
      const { outlineStyle, outlineWidth, outlineOffset } = getComputedStyle(el);
      return { outlineStyle, outlineWidth, outlineOffset };
    });
    expect(ring).toEqual({ outlineStyle: 'solid', outlineWidth: '2px', outlineOffset: '-2px' });
  });

  test('/en names the zone in English', async ({ page }) => {
    await page.goto('/en#servicos');
    await expect(panel(page).getByRole('heading', { level: 2 })).toHaveText('Services', SLOW);
  });
});

test.describe('HUD', () => {
  test('links the CV PDF', async ({ page }) => {
    await page.goto('/pt');
    const cv = hud(page).locator(`a[href="${CV_PT}"]`);
    await expect(cv).toBeVisible(SLOW);
    await expect(cv).toHaveText('CV');
  });

  test('/en labels the Portuguese-only CV', async ({ page }) => {
    await page.goto('/en');
    await expect(hud(page).locator(`a[href="${CV_PT}"]`)).toHaveText('CV (PT)', SLOW);
  });

  test('shows speed, mode and next stop', async ({ page }) => {
    await openGame(page, '/pt#cases');
    await expect(hud(page)).toContainText('0 km/h');
    await expect(hud(page)).toContainText('parado');
    // Parked at cases: the next stop on the tour is oficina.
    await expect(hud(page)).toContainText('Oficina');
  });

  test('the credits dialog shows the model credit, owns the keyboard and closes with Escape', async ({ page }) => {
    await openGame(page, '/pt#cases');
    const open = hud(page).getByRole('button', { name: 'Créditos' });
    await open.click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog).toContainText('dark_igorek');
    await expect(dialog).toContainText('CC BY 4.0');

    // Keys pressed inside the modal neither drive nor jump to the next stop behind it.
    await page.keyboard.press('Space');
    await page.keyboard.press('ArrowUp');
    await page.keyboard.press('p');
    await page.keyboard.press('m');
    await page.waitForTimeout(500);
    expect(await modeOf(page)).toBe('idle');
    await expect(page.locator('html')).toHaveAttribute('data-mode', 'game');
    await expect(dialog).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(open).toBeFocused();
  });
});

test.describe('next stop button', () => {
  test('a tap (click on desktop) sends the car to the next stop', async ({ page, isMobile }) => {
    // Parked at cases: the next stop on the tour is oficina.
    const start = await openGame(page, '/pt#cases');
    expect(start.mode).toBe('idle');
    const button = nextButton(page);
    await expect(button).toBeVisible();
    await expect(button).toHaveText(/^Próxima\s›$/);
    if (isMobile) await button.tap();
    else await button.click();
    await expect.poll(() => modeOf(page), SLOW).toBe('tour');
    await expect.poll(() => zoneOf(page), SLOW).toBe('oficina');
    await expect(hud(page)).toContainText('Serviços'); // and the one after that is next
  });

  test('/en labels it in English', async ({ page }) => {
    await openGame(page, '/en#cases');
    const button = hud(page).getByRole('button', { name: 'Next stop' });
    await expect(button).toHaveText(/^Next\s›$/);
  });
});

test.describe('minimap', () => {
  test('has one travel button per zone and M focuses the first', async ({ page }) => {
    await openGame(page, '/pt#cases');
    const buttons = minimap(page).getByRole('button');
    // Numbered in tour order (Cases and Contato would otherwise both read "C" in magenta).
    await expect(buttons).toHaveText(['1', '2', '3', '4', '5']);
    await expect(minimap(page).getByRole('button', { name: 'Ir para Contato' })).toHaveText('5');
    await page.keyboard.press('m');
    await expect(minimap(page).getByRole('button', { name: 'Ir para Experiência' })).toBeFocused();
  });

  test('the car marker follows the car', async ({ page }) => {
    await openGame(page, '/pt#cases');
    await expect(minimap(page).locator('polygon')).toHaveAttribute('transform', /translate\(32(\.0+)? -32(\.0+)?\)/, SLOW);
  });
});

test.describe('layout', () => {
  test('overlays stay on screen, clear of each other, the pit stop toggle and the car', async ({ page, isMobile }) => {
    // The longest panel (cases fills its max height); the camera keeps the car at the screen center.
    await openGame(page, '/pt#cases');
    await expect(panel(page)).toContainText('Oceans-20', SLOW);
    // 320 is the narrowest phone, where the HUD buttons have to wrap beside the minimap.
    const phones = [
      { width: 320, height: 640 },
      { width: 412, height: 915 },
      { width: 768, height: 1024 },
    ];
    const sizes = isMobile
      ? phones
      : [...phones, { width: 1024, height: 640 }, { width: 1280, height: 720 }, { width: 1440, height: 900 }];
    for (const viewport of sizes) {
      const at = `${viewport.width}x${viewport.height}`;
      await page.setViewportSize(viewport);
      const boxes: Record<string, Box> = {
        hud: await boxOf(hud(page)),
        panel: await boxOf(panel(page)),
        minimap: await boxOf(minimap(page)),
        toggle: await boxOf(toggle(page)),
        next: await boxOf(nextButton(page)),
      };
      // The name and role card only exists from 1024px up.
      if (await identity(page).isVisible()) boxes.identity = await boxOf(identity(page));

      for (const [name, b] of Object.entries(boxes)) {
        expect(b.x, `${name} @ ${at}`).toBeGreaterThanOrEqual(0);
        expect(b.y, `${name} @ ${at}`).toBeGreaterThanOrEqual(0);
        expect(b.x + b.width, `${name} @ ${at}`).toBeLessThanOrEqual(viewport.width);
        expect(b.y + b.height, `${name} @ ${at}`).toBeLessThanOrEqual(viewport.height);
      }
      // The button lives inside the HUD, so it is checked against the HUD's box and against everything else.
      expect(contains(boxes.hud, boxes.next), `next inside hud @ ${at}`).toBe(true);
      expect(boxes.next.height, `next is a 44px touch target @ ${at}`).toBeGreaterThanOrEqual(44);
      const names = Object.keys(boxes);
      for (const [k, a] of names.entries()) {
        for (const b of names.slice(k + 1)) {
          if ((a === 'hud' && b === 'next') || (a === 'next' && b === 'hud')) continue;
          expect(overlaps(boxes[a], boxes[b]), `${a} / ${b} @ ${at}`).toBe(false);
        }
      }
      // The camera frames the car from the screen center down to about 60% of the height.
      for (const [label, fraction] of [['center', 0.5], ['car rear', 0.6]] as const) {
        const point = { x: viewport.width / 2, y: viewport.height * fraction };
        const hit = await page.evaluate(({ x, y }) => document.elementFromPoint(x, y)?.tagName, point);
        expect(hit, `${label} is open canvas @ ${at}`).toBe('CANVAS');
      }
    }
  });

  test('mobile: no horizontal overflow and the minimap is visible', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'mobile viewport only');
    await openGame(page);
    await expect(minimap(page)).toBeVisible();
    const m = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      innerWidth: window.innerWidth,
    }));
    expect(m.scrollWidth).toBeLessThanOrEqual(m.innerWidth);
    // Under 700px the minimap sits top-left, out of the pit stop toggle's top-right corner.
    const box = await boxOf(minimap(page));
    expect(box.x).toBeLessThan(m.innerWidth / 2);
    expect(box.y).toBeLessThan(64);
  });
});

test.describe('text version (pit stop) for keyboard and screen reader users', () => {
  test('in game mode the hidden pit stop is inert and the first Tab offers the text version', async ({ page }) => {
    await openGame(page);
    const pitstop = page.locator('main#pitstop');
    await expect(pitstop).toHaveAttribute('inert', '');

    await page.keyboard.press('Tab');
    const skip = page.getByRole('button', { name: 'Ver versão em texto (P)' });
    await expect(skip).toBeFocused();
    await expect(skip).toBeVisible();
    expect((await boxOf(skip)).width).toBeGreaterThan(40);

    await page.keyboard.press('Enter');
    await expect(page.locator('html')).toHaveAttribute('data-mode', 'pitstop');
    await expect(pitstop).not.toHaveAttribute('inert');
    await expect(pitstop).toBeFocused();
    await expect(skip).toHaveCount(0);
    // Programmatic focus on the page container draws no ring (the global rule must not beat `focus:outline-none`).
    expect(await pitstop.evaluate((el) => getComputedStyle(el).outlineStyle)).toBe('none');
  });

  test('the pit stop is not inert in pit stop mode', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/en');
    await expect(page.locator('html')).toHaveAttribute('data-mode', 'pitstop');
    await expect(page.locator('main#pitstop')).not.toHaveAttribute('inert');
    await expect(page.getByRole('button', { name: 'Text version (P)' })).toHaveCount(0);
  });
});
