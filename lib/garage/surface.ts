import { screenRect } from './camera';
import { quadHomography, toMatrix3d, type Quad } from './homography';
import type { GarageRuntime, Rect } from './runtime';
import type { GarageView } from './state';

/** The bench menu is laid out at 800 × 600 CSS px (80 columns of Plex Mono) and mapped onto the glass. */
export const SCREEN_PX = { width: 800, height: 600 };

/**
 * The part of the projected glass `quad` that `page` covers, where `glass` is
 * the whole glass on the window: bilinear between the corners, exact once the
 * camera faces the glass.
 */
export function subQuad(quad: Quad, glass: Rect, page: Rect): Quad {
  const [tl, tr, br, bl] = quad;
  const at = (u: number, v: number): [number, number] => {
    const top = [tl[0] + (tr[0] - tl[0]) * u, tl[1] + (tr[1] - tl[1]) * u];
    const bottom = [bl[0] + (br[0] - bl[0]) * u, bl[1] + (br[1] - bl[1]) * u];
    return [top[0] + (bottom[0] - top[0]) * v, top[1] + (bottom[1] - top[1]) * v];
  };
  const u0 = (page.x - glass.x) / glass.width;
  const u1 = (page.x + page.width - glass.x) / glass.width;
  const v0 = (page.y - glass.y) / glass.height;
  const v1 = (page.y + page.height - glass.y) / glass.height;
  return [at(u0, v0), at(u1, v0), at(u1, v1), at(u0, v1)];
}

/**
 * Put the DOM screen on the glass for this frame (`width` × `height` is the window).
 *
 * - Bench and launch: the 800 × 600 menu mapped onto the four projected corners with a matrix3d.
 * - Screen view, flying in: the page already laid out at its final size, mapped onto the part of
 *   the glass it will cover, so the camera's arrival never re-flows or resizes the text.
 * - Screen view, arrived: a plain rectangle over that part (inside the window), untransformed, so
 *   the text is crisp and scrolls.
 *
 * Writes the DOM only when something changed.
 */
export function placeSurface(el: HTMLElement | null, view: GarageView, rt: GarageRuntime, width: number, height: number): void {
  if (el === null) return;
  let css: string;
  let full = false;
  if (!rt.glassInFront) {
    css = `visibility:hidden;width:${SCREEN_PX.width}px;height:${SCREEN_PX.height}px`;
  } else if (view === 'screen' && rt.arrived) {
    const r = rt.glassRect;
    const x0 = Math.max(0, r.x);
    const y0 = Math.max(0, r.y);
    const x1 = Math.min(width, r.x + r.width);
    const y1 = Math.min(height, r.y + r.height);
    css = `left:${x0}px;top:${y0}px;width:${x1 - x0}px;height:${y1 - y0}px`;
    full = true;
  } else if (view === 'screen') {
    const { glass, page } = screenRect(width, height);
    const m = toMatrix3d(quadHomography(page.width, page.height, subQuad(rt.glassQuad, glass, page)));
    css = `width:${page.width}px;height:${page.height}px;transform:${m}`;
  } else {
    const m = toMatrix3d(quadHomography(SCREEN_PX.width, SCREEN_PX.height, rt.glassQuad));
    css = `width:${SCREEN_PX.width}px;height:${SCREEN_PX.height}px;transform:${m}`;
  }
  if (el.dataset.placed === css) return;
  el.dataset.placed = css;
  el.dataset.full = String(full);
  el.style.cssText = `position:absolute;left:0;top:0;transform-origin:0 0;${css}`;
}
