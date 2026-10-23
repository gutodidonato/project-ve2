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
