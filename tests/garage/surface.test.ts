// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { deskRect } from '@/lib/garage/camera';
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

describe('placeSurface', () => {
  it('lays the desktop out at its desk size while the camera settles', () => {
    const el = document.createElement('div');
    const { glass, page } = deskRect(1440, 900);
    placeSurface(el, 'desk', runtimeAt({ ...glass, width: glass.width / 2, height: glass.height / 2 }, false), 1440, 900);
    expect(el.style.width).toBe(`${page.width}px`);
    expect(el.style.height).toBe(`${page.height}px`);
    expect(el.style.transform).toContain('matrix3d');
    expect(el.dataset.full).toBe('false');
  });

  it('rests flat on the glass at the desk: same size, no transform', () => {
    const el = document.createElement('div');
    const { glass, page } = deskRect(1440, 900);
    placeSurface(el, 'desk', runtimeAt(glass, true), 1440, 900);
    expect(parseFloat(el.style.width)).toBeCloseTo(page.width, 3);
    expect(parseFloat(el.style.height)).toBeCloseTo(page.height, 3);
    expect(parseFloat(el.style.left)).toBeCloseTo(page.x, 3);
    expect(parseFloat(el.style.top)).toBeCloseTo(page.y, 3);
    expect(el.style.transform).toBe('');
    expect(el.dataset.full).toBe('true');
  });

  it('keeps a phone desktop inside the window when the glass spills past it', () => {
    const el = document.createElement('div');
    const { glass } = deskRect(390, 844);
    placeSurface(el, 'desk', runtimeAt(glass, true), 390, 844);
    expect(parseFloat(el.style.left)).toBe(0);
    expect(parseFloat(el.style.width)).toBeCloseTo(390, 3);
  });

  it('shrinks with the monitor during the launch, laid out at the desk size', () => {
    const el = document.createElement('div');
    const { glass, page } = deskRect(1440, 900);
    placeSurface(el, 'launch', runtimeAt(glass, true), 1440, 900);
    expect(el.style.width).toBe(`${page.width}px`);
    expect(el.style.transform).toContain('matrix3d');
    expect(el.dataset.full).toBe('false');
  });

  it('hides the desktop when the glass is behind the camera', () => {
    const el = document.createElement('div');
    placeSurface(el, 'desk', { ...runtimeAt(deskRect(1440, 900).glass, true), glassInFront: false }, 1440, 900);
    expect(el.style.visibility).toBe('hidden');
  });
});
