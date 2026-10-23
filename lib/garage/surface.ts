import { quadHomography, toMatrix3d } from './homography';
import type { GarageRuntime } from './runtime';

/** The DOM screen is laid out at 800 × 600 CSS px (80 columns of Plex Mono) and mapped onto the glass. */
export const SCREEN_PX = { width: 800, height: 600 };

/**
 * Put the DOM screen on the glass for this frame. On the bench (and while the
 * camera flies in) the 800 × 600 layout is mapped onto the four projected
 * corners with a matrix3d; once the camera is inside (`full`) it is a plain
 * rectangle over the glass, untransformed, so the text is crisp and scrolls.
 * Writes the DOM only when something changed.
 */
export function placeSurface(el: HTMLElement | null, full: boolean, rt: GarageRuntime): void {
  if (el === null) return;
  let css: string;
  if (!rt.glassInFront) {
    css = `visibility:hidden;width:${SCREEN_PX.width}px;height:${SCREEN_PX.height}px`;
  } else if (full) {
    const r = rt.glassRect;
    css = `left:${r.x}px;top:${r.y}px;width:${r.width}px;height:${r.height}px`;
  } else {
    const m = toMatrix3d(quadHomography(SCREEN_PX.width, SCREEN_PX.height, rt.glassQuad));
    css = `width:${SCREEN_PX.width}px;height:${SCREEN_PX.height}px;transform:${m}`;
  }
  if (el.dataset.placed === css) return;
  el.dataset.placed = css;
  el.dataset.full = String(full && rt.glassInFront);
  el.style.cssText = `position:absolute;left:0;top:0;transform-origin:0 0;${css}`;
}
