import { deskRect } from './camera';
import { quadHomography, toMatrix3d, type Quad } from './homography';
import type { GarageRuntime, Rect } from './runtime';

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
 * Put the LuisOS desktop on the glass for this frame (`width` x `height` is the window).
 *
 * - Desk, camera at rest: a plain rectangle over the glass (inside the window), untransformed, so
 *   the text is crisp and scrolls.
 * - Otherwise (the camera settling, the pull-back of the launch): the desktop, laid out at its desk
 *   size, mapped onto the part of the glass it covers, so it shrinks with the monitor.
 *
 * Writes the DOM only when something changed.
 */
export function placeSurface(el: HTMLElement | null, view: 'desk' | 'launch', rt: GarageRuntime, width: number, height: number): void {
  if (el === null) return;
  const { glass, page } = deskRect(width, height);
  let css: string;
  let full = false;
  if (!rt.glassInFront) {
    css = `visibility:hidden;width:${page.width}px;height:${page.height}px`;
  } else if (view === 'desk' && rt.arrived) {
    const r = rt.glassRect;
    const x0 = Math.max(0, r.x);
    const y0 = Math.max(0, r.y);
    const x1 = Math.min(width, r.x + r.width);
    const y1 = Math.min(height, r.y + r.height);
    css = `left:${x0}px;top:${y0}px;width:${x1 - x0}px;height:${y1 - y0}px`;
    full = true;
  } else {
    const m = toMatrix3d(quadHomography(page.width, page.height, subQuad(rt.glassQuad, glass, page)));
    css = `width:${page.width}px;height:${page.height}px;transform:${m}`;
  }
  if (el.dataset.placed === css) return;
  el.dataset.placed = css;
  el.dataset.full = String(full);
  el.style.cssText = `position:absolute;left:0;top:0;transform-origin:0 0;${css}`;
}
