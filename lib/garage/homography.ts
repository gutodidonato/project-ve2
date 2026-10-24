/** Four screen points: top-left, top-right, bottom-right, bottom-left of the source rectangle. */
export type Quad = [[number, number], [number, number], [number, number], [number, number]];

/** A 2D projective transform: X = (a x + b y + c) / (g x + h y + 1), Y = (d x + e y + f) / (same). */
export interface Homography {
  a: number;
  b: number;
  c: number;
  d: number;
  e: number;
  f: number;
  g: number;
  h: number;
}

/**
 * The projective map that takes the `width × height` rectangle at the origin
 * onto `quad`: the unit-square-to-quad solution (Heckbert), then the source
 * scaled to the unit square.
 */
export function quadHomography(width: number, height: number, quad: Quad): Homography {
  const [[x0, y0], [x1, y1], [x2, y2], [x3, y3]] = quad;
  const dx1 = x1 - x2;
  const dx2 = x3 - x2;
  const dx3 = x0 - x1 + x2 - x3;
  const dy1 = y1 - y2;
  const dy2 = y3 - y2;
  const dy3 = y0 - y1 + y2 - y3;

  let g = 0;
  let h = 0;
  if (dx3 !== 0 || dy3 !== 0) {
    const det = dx1 * dy2 - dx2 * dy1;
    g = (dx3 * dy2 - dx2 * dy3) / det;
    h = (dx1 * dy3 - dx3 * dy1) / det;
  }
  return {
    a: (x1 - x0 + g * x1) / width,
    b: (x3 - x0 + h * x3) / height,
    c: x0,
    d: (y1 - y0 + g * y1) / width,
    e: (y3 - y0 + h * y3) / height,
    f: y0,
    g: g / width,
    h: h / height,
  };
}

export function applyHomography(m: Homography, x: number, y: number): [number, number] {
  const w = m.g * x + m.h * y + 1;
  return [(m.a * x + m.b * y + m.c) / w, (m.d * x + m.e * y + m.f) / w];
}

/** The CSS transform (with `transform-origin: 0 0`) for `m`. */
export function toMatrix3d(m: Homography): string {
  return `matrix3d(${[m.a, m.d, 0, m.g, m.b, m.e, 0, m.h, 0, 0, 1, 0, m.c, m.f, 0, 1].join(',')})`;
}
