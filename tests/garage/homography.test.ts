import { describe, expect, it } from 'vitest';
import { applyHomography, quadHomography, toMatrix3d, type Quad } from '@/lib/garage/homography';

const W = 800;
const H = 600;
const SOURCE: Quad = [
  [0, 0],
  [W, 0],
  [W, H],
  [0, H],
];

function expectMaps(quad: Quad) {
  const m = quadHomography(W, H, quad);
  SOURCE.forEach(([x, y], i) => {
    const [px, py] = applyHomography(m, x, y);
    expect(px).toBeCloseTo(quad[i][0], 6);
    expect(py).toBeCloseTo(quad[i][1], 6);
  });
}

describe('quadHomography', () => {
  it('maps the rectangle onto itself', () => expectMaps(SOURCE));

  it('maps onto a scaled and moved rectangle', () =>
    expectMaps([
      [100, 50],
      [500, 50],
      [500, 350],
      [100, 350],
    ]));

  it('maps onto a perspective trapezoid', () =>
    expectMaps([
      [120, 300],
      [310, 330],
      [300, 470],
      [110, 455],
    ]));

  it('writes a CSS matrix3d in column-major order', () => {
    const css = toMatrix3d(quadHomography(W, H, SOURCE));
    expect(css.startsWith('matrix3d(')).toBe(true);
    const values = css.slice(9, -1).split(',').map(Number);
    expect(values).toHaveLength(16);
    expect(values.map((v) => Math.round(v * 1e6) / 1e6)).toEqual([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
  });
});
