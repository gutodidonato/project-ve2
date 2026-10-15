import { expect, test, type Page } from '@playwright/test';
import type { RodoviaSnapshot } from '@/lib/game/debug';

// Software WebGL shares the machine with every parallel worker: a frame can take
// 100+ ms and the game clamps each step to 50 ms, so game time can run at a
// fraction of wall time. Wait for outcomes instead of sleeping, and with room.
test.describe.configure({ timeout: 90_000 });
const SLOW = { timeout: 20_000 };

/** Read-only copy of the game runtime, published by GameDirector once the scene runs. */
async function snapshot(page: Page): Promise<RodoviaSnapshot> {
  await page.waitForFunction(() => window.__rodovia !== undefined);
  return page.evaluate(() => window.__rodovia!.snapshot());
}

const modeOf = (page: Page) => snapshot(page).then((s) => s.mode);
const speedOf = (page: Page) => snapshot(page).then((s) => s.car.speed);
const zOf = (page: Page) => snapshot(page).then((s) => s.car.z);
const xOf = (page: Page) => snapshot(page).then((s) => s.car.x);

/** Open the game and wait until the scene is running. `#cases` spawns the car parked and idle at that stop. */
async function openGame(page: Page, path = '/pt'): Promise<RodoviaSnapshot> {
  await page.goto(path);
  await expect(page.locator('html')).toHaveAttribute('data-mode', 'game');
  await expect(page.locator('.game-layer canvas')).toBeVisible({ timeout: 20_000 });
  return snapshot(page);
}

/**
 * A point over open canvas: the HUD, zone panel and minimap overlays (Task 13)
 * cover the corners and the bottom, so pointer and wheel input aimed at the
 * world goes here. Asserts it really hits the canvas.
 */
async function openCanvasPoint(page: Page): Promise<{ x: number; y: number }> {
  const { width, height } = page.viewportSize()!;
  const point = { x: Math.round(width * 0.6), y: Math.round(height * 0.4) };
  const hit = await page.evaluate(({ x, y }) => document.elementFromPoint(x, y)?.tagName, point);
  expect(hit, 'the point is over the canvas').toBe('CANVAS');
  return point;
}

type SyntheticInput = { type: 'keydown'; code: string } | { type: 'wheel'; deltaY: number };

/** Dispatch a synthetic event at `selector` and report whether the game called preventDefault on it. */
function isPrevented(page: Page, selector: string, input: SyntheticInput) {
  return page.evaluate(
    ([sel, spec]) => {
      const el = document.querySelector(sel) ?? document.body;
      const event =
        spec.type === 'keydown'
          ? new KeyboardEvent('keydown', { code: spec.code, key: spec.code, bubbles: true, cancelable: true })
          : new WheelEvent('wheel', { deltaY: spec.deltaY, bubbles: true, cancelable: true });
      el.dispatchEvent(event);
      return event.defaultPrevented;
    },
    [selector, input] as const,
  );
}

test.describe('keyboard', () => {
  for (const code of ['ArrowUp', 'KeyW']) {
    test(`holding ${code} drives the car forward in manual mode`, async ({ page }) => {
      const start = await openGame(page, '/pt#cases');
      expect(start.mode).toBe('idle');

      await page.keyboard.down(code);
      await expect.poll(() => zOf(page), SLOW).toBeLessThan(start.car.z - 3);
      const driving = await snapshot(page);
      await page.keyboard.up(code);

      expect(driving.mode).toBe('manual');
      expect(Math.abs(driving.car.x - start.car.x)).toBeLessThan(1);
      expect(driving.car.speed).toBeGreaterThan(2);

      // Released: nothing holds the throttle, so the car rolls out.
      await expect.poll(() => speedOf(page), SLOW).toBeLessThan(driving.car.speed / 2);
    });
  }

  test('Space jumps to the next stop', async ({ page }) => {
    const start = await openGame(page, '/pt#cases');
    expect(start.mode).toBe('idle');
    await page.keyboard.press('Space');
    await expect.poll(() => modeOf(page), SLOW).toBe('tour');
  });

  test('typing in a text field neither drives the car nor toggles the pit stop', async ({ page }) => {
    const start = await openGame(page);
    expect(start.mode).toBe('demo');

    await page.evaluate(() => {
      const area = document.createElement('textarea');
      area.id = 'probe';
      document.querySelector('.game-layer')!.appendChild(area);
      area.focus();
    });
    await page.keyboard.type('wwww p');
    await page.keyboard.press('ArrowUp');
    await page.keyboard.press('Space');

    // ArrowUp only moved the caret to the start, so the Space landed in front.
    await expect(page.locator('#probe')).toHaveValue(' wwww p');
    await expect(page.locator('html')).toHaveAttribute('data-mode', 'game');
    // Typing is not driving: the demo carries on untouched (a key or a next stop would leave it).
    expect(await modeOf(page)).toBe('demo');
  });

  test('modified keys are left to the browser', async ({ page }) => {
    const start = await openGame(page, '/pt#cases');
    expect(start.mode).toBe('idle');
    await page.keyboard.press('Control+ArrowUp');
    await page.keyboard.press('Alt+KeyW');
    await page.keyboard.press('Control+Space');
    await page.waitForTimeout(500);
    expect(await modeOf(page)).toBe('idle');
  });

  test('driving keys and Space are consumed in game mode and left alone in pit stop', async ({ page }) => {
    await openGame(page);
    for (const code of ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'KeyW', 'KeyA', 'KeyS', 'KeyD', 'Space']) {
      expect(await isPrevented(page, 'body', { type: 'keydown', code }), code).toBe(true);
    }
    expect(await isPrevented(page, 'body', { type: 'keydown', code: 'KeyQ' })).toBe(false);

    await page.keyboard.press('p');
    await expect(page.locator('html')).toHaveAttribute('data-mode', 'pitstop');
    for (const code of ['ArrowUp', 'ArrowDown', 'Space', 'KeyW']) {
      expect(await isPrevented(page, 'body', { type: 'keydown', code }), code).toBe(false);
    }
  });

  test('Space on a keyboard-focused button activates the button, not the game', async ({ page }) => {
    await openGame(page, '/pt#cases');
    const toggle = page.getByRole('button', { name: 'Modo pit stop (P)' });
    await toggle.focus();
    await page.keyboard.press('Space');
    await expect(page.locator('html')).toHaveAttribute('data-mode', 'pitstop');
  });

  test('losing window focus releases held keys', async ({ page }) => {
    const start = await openGame(page, '/pt#cases');
    await page.keyboard.down('ArrowUp');
    await expect.poll(() => speedOf(page), SLOW).toBeGreaterThan(8);

    await page.evaluate(() => window.dispatchEvent(new Event('blur')));
    // Without the key the car coasts down (drag factor 0.3 per second) although the key is still physically down.
    await expect.poll(() => speedOf(page), SLOW).toBeLessThan(2);
    await page.keyboard.up('ArrowUp');
    expect(await zOf(page)).toBeLessThan(start.car.z);
  });

  test('hiding the tab releases held keys', async ({ page }) => {
    await openGame(page, '/pt#cases');
    await page.keyboard.down('ArrowUp');
    await expect.poll(() => speedOf(page), SLOW).toBeGreaterThan(8);

    await page.evaluate(() => {
      Object.defineProperty(document, 'hidden', { configurable: true, get: () => true });
      document.dispatchEvent(new Event('visibilitychange'));
    });
    await expect.poll(() => speedOf(page), SLOW).toBeLessThan(2);
    await page.keyboard.up('ArrowUp');
  });
});

test.describe('wheel', () => {
  test('scrolling down starts the tour and reaches the next stop', async ({ page }) => {
    // Spawned parked at servicos, so the next stop is contato (and the demo is not racing the wheel).
    const start = await openGame(page, '/pt#servicos');
    expect(start.mode).toBe('idle');
    const point = await openCanvasPoint(page);
    await page.mouse.move(point.x, point.y);
    // Plenty of wheel: the mobile emulation reports deltaY in CSS pixels (÷ device scale), and ~44 units to the stop need ~370 of them.
    await page.mouse.wheel(0, 1_500);
    await expect.poll(() => modeOf(page), SLOW).toBe('tour');
    await expect.poll(async () => (await snapshot(page)).zone, SLOW).toBe('contato');
  });

  test('scrolling up is not a tour', async ({ page }) => {
    const start = await openGame(page, '/pt#cases');
    expect(start.mode).toBe('idle');
    const point = await openCanvasPoint(page);
    await page.mouse.move(point.x, point.y);
    await page.mouse.wheel(0, -600);
    await page.waitForTimeout(500);
    expect(await modeOf(page)).toBe('idle');
  });

  test('the wheel is consumed over the canvas but not over a scroll panel', async ({ page }) => {
    await openGame(page, '/pt#cases');
    await page.evaluate(() => {
      const panel = document.createElement('div');
      panel.id = 'panel';
      panel.setAttribute('data-scroll-panel', '');
      const inner = document.createElement('p');
      inner.id = 'panel-text';
      panel.appendChild(inner);
      document.querySelector('.game-layer')!.appendChild(panel);
    });

    expect(await isPrevented(page, '#panel-text', { type: 'wheel', deltaY: 300 })).toBe(false);
    await page.waitForTimeout(500);
    expect(await modeOf(page)).toBe('idle');

    expect(await isPrevented(page, '.game-layer canvas', { type: 'wheel', deltaY: 300 })).toBe(true);
    await expect.poll(() => modeOf(page), SLOW).toBe('tour');
  });
});

test.describe('pointer drag', () => {
  test('the canvas opts out of browser touch gestures in game mode', async ({ page }) => {
    await openGame(page);
    const touchAction = await page.locator('.game-layer canvas').evaluate((c) => getComputedStyle(c).touchAction);
    expect(touchAction).toBe('none');
  });

  test('a mouse drag steers toward the pointer and releasing it lets go', async ({ page, isMobile }) => {
    test.skip(isMobile, 'mouse drag is covered on the desktop project');
    const start = await openGame(page, '/pt#cases');

    // Up and to the left of the pointer-down point: the car heads for the top-left of the screen.
    await page.mouse.move(700, 500);
    await page.mouse.down();
    await page.mouse.move(640, 440, { steps: 6 });
    await page.mouse.move(600, 380, { steps: 6 });
    await expect.poll(() => zOf(page), SLOW).toBeLessThan(start.car.z - 3);
    await expect.poll(() => xOf(page), SLOW).toBeLessThan(start.car.x - 1);
    const dragging = await snapshot(page);
    expect(dragging.mode).toBe('manual');
    expect(dragging.car.speed).toBeGreaterThan(2);

    await page.mouse.up();
    await expect.poll(() => speedOf(page), SLOW).toBeLessThan(dragging.car.speed / 2);
  });

  test('a secondary-button drag does nothing', async ({ page, isMobile }) => {
    test.skip(isMobile, 'mouse drag is covered on the desktop project');
    const start = await openGame(page, '/pt#cases');
    await page.mouse.move(700, 500);
    await page.mouse.down({ button: 'right' });
    await page.mouse.move(600, 360, { steps: 8 });
    await page.waitForTimeout(1_000);
    await page.mouse.up({ button: 'right' });
    const after = await snapshot(page);
    expect(after.mode).toBe('idle');
    expect(after.car.x).toBeCloseTo(start.car.x, 3);
    expect(after.car.z).toBeCloseTo(start.car.z, 3);
  });

  test('a touch drag on the canvas steers the car', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'touch input is exercised on the mobile project');
    const start = await openGame(page, '/pt#cases');

    // Playwright has no touch-drag API: drive the real touch pipeline through CDP.
    const cdp = await page.context().newCDPSession(page);
    const touch = (type: 'touchStart' | 'touchMove' | 'touchEnd', x?: number, y?: number) =>
      cdp.send('Input.dispatchTouchEvent', {
        type,
        touchPoints: x === undefined || y === undefined ? [] : [{ x, y }],
      });

    const { x, y } = await openCanvasPoint(page);
    await touch('touchStart', x, y);
    for (let i = 1; i <= 8; i++) await touch('touchMove', x - i * 8, y - i * 15);
    await expect.poll(() => zOf(page), SLOW).toBeLessThan(start.car.z - 3);
    await expect.poll(() => xOf(page), SLOW).toBeLessThan(start.car.x - 1);
    const dragging = await snapshot(page);
    expect(dragging.mode).toBe('manual');

    await touch('touchEnd');
    await expect.poll(() => speedOf(page), SLOW).toBeLessThan(dragging.car.speed / 2);
  });
});
