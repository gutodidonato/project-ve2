/** From J to the page change. */
export const LAUNCH_MS = 3500;

/** Everything the launch animates, each in [0, 1], at one instant. */
export interface LaunchFrame {
  /** Workbench lamp brightness (two blinks). */
  lamp: number;
  /** How far the roll-up door is open. */
  door: number;
  /** DeLorean headlights; 0.35 is the light leaking under the door at rest. */
  headlights: number;
  /** Cold light coming through the opening door into the garage: door × the headlights' rise. */
  spill: number;
  /** Blend of the camera from its pose to the car. */
  camera: number;
  /** White flash in front of the camera before the game page. */
  whiteout: number;
  done: boolean;
}

function smoothstep(a: number, b: number, x: number): number {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
}

const HEADLIGHTS_REST = 0.35;
const LAMP_BLINK = 0.15;

/**
 * The launch timeline as a pure function of the time since J: the lamp blinks
 * twice, the door rolls up in 1.6 s while the headlights rise and their cold
 * light floods the warm garage, then the camera turns to the car and the frame
 * goes white.
 */
export function launchFrame(ms: number): LaunchFrame {
  const t = Math.max(0, ms);
  const blinking = (t >= 400 && t < 550) || (t >= 650 && t < 800);
  const door = smoothstep(800, 2400, t);
  const rise = smoothstep(900, 2200, t);
  return {
    lamp: blinking ? LAMP_BLINK : 1,
    door,
    headlights: HEADLIGHTS_REST + (1 - HEADLIGHTS_REST) * rise,
    spill: door * rise,
    camera: smoothstep(2200, 3200, t),
    whiteout: smoothstep(3000, LAUNCH_MS, t),
    done: t >= LAUNCH_MS,
  };
}
