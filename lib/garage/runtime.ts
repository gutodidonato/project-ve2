import type { Quad } from './homography';

/** A screen rectangle in CSS pixels, top-left origin. */
export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface GarageRuntime {
  /** performance.now() of the J press; null outside the launch. */
  launchStart: number | null;
  /** How far the roll-up door is open beyond its resting gap, 0..1. */
  door: number;
  camera: [number, number, number];
  /** The camera has reached the pose of the current view. */
  arrived: boolean;
  /** The CRT glass projected on the window: its bounding box... */
  glassRect: Rect;
  /** ...its four corners (top-left, top-right, bottom-right, bottom-left)... */
  glassQuad: Quad;
  /** ...and whether all four are in front of the camera. */
  glassInFront: boolean;
  /** The DOM screen (ScreenSurface), placed on the glass every rendered frame. */
  surface: HTMLElement | null;
  /** Each 3D key projected on the window (keyboard event `code`). */
  keyRects: { code: string; rect: Rect }[];
  /** Key `code` → performance.now() of its last press, for the press animation. */
  pressed: Map<string, number>;
  /** Draw calls of the last rendered frame. */
  drawCalls: number;
}

/**
 * Per-frame garage values, mutated inside `useFrame` and read by DOM overlays
 * and the e2e debug hook. Never React state: nothing here triggers a render.
 */
export const garageRuntime: GarageRuntime = {
  launchStart: null,
  door: 0,
  camera: [0, 0, 0],
  arrived: false,
  glassRect: { x: 0, y: 0, width: 0, height: 0 },
  glassQuad: [
    [0, 0],
    [0, 0],
    [0, 0],
    [0, 0],
  ],
  glassInFront: false,
  surface: null,
  keyRects: [],
  pressed: new Map(),
  drawCalls: 0,
};
