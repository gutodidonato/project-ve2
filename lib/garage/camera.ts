import type { Rect } from './runtime';
import { GLASS } from './scene';

/** `portrait` for tall windows (phones held upright), `wide` for everything else. */
export type Framing = 'wide' | 'portrait';

export interface Pose {
  position: [number, number, number];
  target: [number, number, number];
  /** Vertical field of view, degrees. */
  fov: number;
}

export function framingFor(width: number, height: number): Framing {
  return width / height < 0.8 ? 'portrait' : 'wide';
}

/** The workbench at 3/4 (computer in the left third, door on the right), or straight on for phones. */
export const BENCH_POSE: Record<Framing, Pose> = {
  wide: { position: [-0.95, 1.42, 1.8], target: [0.62, 1.1, -0.7], fov: 42 },
  portrait: { position: [-0.6, 1.2, 1.02], target: [-0.6, 1.08, 0], fov: 50 },
};

/** From inside the garage at 3/4, the whole DeLorean in the open door (end of the launch). */
export const CAR_POSE: Pose = { position: [1.35, 1.3, 1.5], target: [3.1, 0.55, -2.7], fov: 46 };

const SCREEN_FOV = 40;
/** Wide windows keep a thin bezel around the glass. */
const BEZEL = 1.04;

/**
 * Distance from the glass at which it exactly fits the window: `contain` shows
 * all of it (the binding side touches the edges), `cover` fills the window.
 */
export function glassDistance(fov: number, aspect: number, fit: 'contain' | 'cover'): number {
  const h = Math.tan((fov * Math.PI) / 360);
  const byHeight = GLASS.height / 2 / h;
  const byWidth = GLASS.width / 2 / (h * aspect);
  return fit === 'contain' ? Math.max(byHeight, byWidth) : Math.min(byHeight, byWidth);
}

/** Straight in front of the glass: contained with a bezel on wide windows, covering on phones. */
export function screenPose(framing: Framing, aspect: number): Pose {
  const [x, y, z] = GLASS.center;
  const d = framing === 'wide' ? glassDistance(SCREEN_FOV, aspect, 'contain') * BEZEL : glassDistance(SCREEN_FOV, aspect, 'cover');
  return { position: [x, y, z + d], target: [x, y, z], fov: SCREEN_FOV };
}

/**
 * Where the glass lands on the window once the camera is inside the monitor
 * (`glass`, which spills past a phone window), and the part of it inside the
 * window (`page`): the size the resume and contact pages are laid out at, from
 * the start of the fly-in, so arriving never re-flows the text.
 */
export function screenRect(width: number, height: number): { glass: Rect; page: Rect } {
  const pose = screenPose(framingFor(width, height), width / height);
  const visible = 2 * (pose.position[2] - GLASS.center[2]) * Math.tan((pose.fov * Math.PI) / 360);
  const px = height / visible;
  const gw = GLASS.width * px;
  const gh = GLASS.height * px;
  const glass = { x: (width - gw) / 2, y: (height - gh) / 2, width: gw, height: gh };
  if (glass.x >= 0 && glass.y >= 0 && glass.x + gw <= width && glass.y + gh <= height) return { glass, page: glass };
  const x0 = Math.max(0, glass.x);
  const y0 = Math.max(0, glass.y);
  const page = { x: x0, y: y0, width: Math.min(width, glass.x + gw) - x0, height: Math.min(height, glass.y + gh) - y0 };
  return { glass, page };
}
