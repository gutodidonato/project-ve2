// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { screenRect } from '@/lib/garage/camera';
import type { Quad } from '@/lib/garage/homography';
import { garageRuntime, type GarageRuntime, type Rect } from '@/lib/garage/runtime';
import { placeSurface, subQuad } from '@/lib/garage/surface';

const quadOf = (r: Rect): Quad => [
  [r.x, r.y],
  [r.x + r.width, r.y],
  [r.x + r.width, r.y + r.height],
  [r.x, r.y + r.height],
];

function runtimeAt(glass: Rect, arrived: boolean): GarageRuntime {
  return { ...garageRuntime, glassRect: glass, glassQuad: quadOf(glass), glassInFront: true, arrived };
}

describe('subQuad', () => {
  it('cuts the projected glass down to the part the page covers', () => {
    const glass = { x: -100, y: 0, width: 600, height: 450 };
    const page = { x: 0, y: 0, width: 390, height: 450 };
    subQuad(quadOf(glass), glass, page).forEach(([x, y], i) => {
      expect(x).toBeCloseTo(quadOf(page)[i][0], 9);
      expect(y).toBeCloseTo(quadOf(page)[i][1], 9);
    });
  });
});

describe('placeSurface in the screen view', () => {
  it('lays the page out at its final size while the camera flies in', () => {
    const el = document.createElement('div');
    const { glass, page } = screenRect(1440, 900);
    placeSurface(el, 'screen', runtimeAt({ ...glass, width: glass.width / 2, height: glass.height / 2 }, false), 1440, 900);
    expect(el.style.width).toBe(`${page.width}px`);
    expect(el.style.height).toBe(`${page.height}px`);
    expect(el.style.transform).toContain('matrix3d');
    expect(el.dataset.full).toBe('false');
  });

  it('arrives without a jump: same size, now a plain rectangle that scrolls', () => {
    const el = document.createElement('div');
    window.innerWidth = 1440;
    window.innerHeight = 900;
    const { glass, page } = screenRect(1440, 900);
    placeSurface(el, 'screen', runtimeAt(glass, true), 1440, 900);
    expect(parseFloat(el.style.width)).toBeCloseTo(page.width, 3);
    expect(parseFloat(el.style.height)).toBeCloseTo(page.height, 3);
    expect(el.style.transform).toBe('');
    expect(el.dataset.full).toBe('true');
  });

  it('keeps the 800 x 600 menu mapped on the glass on the bench', () => {
    const el = document.createElement('div');
    placeSurface(el, 'bench', runtimeAt({ x: 100, y: 300, width: 300, height: 220 }, true), 1440, 900);
    expect(el.style.width).toBe('800px');
    expect(el.style.height).toBe('600px');
    expect(el.dataset.full).toBe('false');
  });
});
