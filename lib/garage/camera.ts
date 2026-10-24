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

/** From inside the garage, in line with the opening (the jamb out of frame), the whole DeLorean in the door (end of the launch). */
export const CAR_POSE: Pose = { position: [2.6, 1.3, 1.5], target: [3.1, 0.55, -2.7], fov: 46 };

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

/** The LuisOS desk: how much of the binding side (the height on wide windows) the glass fills. */
export const DESK_SHARE = 0.74;
/** Metres the desk camera and its target drop together: the glass rides high and the beige case shows below. */
export const DESK_DROP = 0.05;
const DESK_FOV = 40;

/** Straight in front of the monitor, the glass on three quarters of a wide window (raised by DESK_DROP), or covering a phone. */
export function deskPose(framing: Framing, aspect: number): Pose {
  const [x, y, z] = GLASS.center;
  if (framing === 'portrait') {
    return { position: [x, y, z + glassDistance(DESK_FOV, aspect, 'cover')], target: [x, y, z], fov: DESK_FOV };
  }
  const d = glassDistance(DESK_FOV, aspect, 'contain') / DESK_SHARE;
  return { position: [x, y - DESK_DROP, z + d], target: [x, y - DESK_DROP, z], fov: DESK_FOV };
}

/** Where the glass lands on the window at the desk pose (`glass`), and the part inside the window (`page`): the desktop's size. */
export function deskRect(width: number, height: number): { glass: Rect; page: Rect } {
  const framing = framingFor(width, height);
  const pose = deskPose(framing, width / height);
  const visible = 2 * (pose.position[2] - GLASS.center[2]) * Math.tan((pose.fov * Math.PI) / 360);
  const px = height / visible;
  const gw = GLASS.width * px;
  const gh = GLASS.height * px;
  const raise = (GLASS.center[1] - pose.target[1]) * px;
  const glass = { x: (width - gw) / 2, y: height / 2 - raise - gh / 2, width: gw, height: gh };
  if (glass.x >= 0 && glass.y >= 0 && glass.x + gw <= width && glass.y + gh <= height) return { glass, page: glass };
  const x0 = Math.max(0, glass.x);
  const y0 = Math.max(0, glass.y);
  const page = { x: x0, y: y0, width: Math.min(width, glass.x + gw) - x0, height: Math.min(height, glass.y + gh) - y0 };
  return { glass, page };
}

/** The pull-back before the jump: the whole garage, the bench on the left, the door on the right, the car behind it. */
export const WIDE_POSE: Pose = { position: [-0.2, 1.75, 3.4], target: [1.4, 1.0, -1.2], fov: 50 };

/**
 * A phone held upright sees little across: the pull-back goes farther back and wider, centred
 * nearer the bench (the computer stays in frame), and the car gets a wider lens.
 */
const WIDE_PORTRAIT: Pose = { position: [0.25, 1.6, 4.2], target: [0.25, 1.0, -0.8], fov: 66 };
const CAR_PORTRAIT: Pose = { ...CAR_POSE, fov: 66 };

export function widePose(framing: Framing): Pose {
  return framing === 'portrait' ? WIDE_PORTRAIT : WIDE_POSE;
}

export function carPose(framing: Framing): Pose {
  return framing === 'portrait' ? CAR_PORTRAIT : CAR_POSE;
}
