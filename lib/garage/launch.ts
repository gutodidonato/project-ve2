/** From Salto88.exe (or J) to the page change. */
export const LAUNCH_MS = 4900;

/** Everything the launch animates, each in [0, 1], at one instant. */
export interface LaunchFrame {
  /** The "Starting Salto88.exe…" dialog fading in. */
  dialog: number;
  /** Blend of the camera from the desk to the whole garage (the pull-back). */
  zoom: number;
  /** Workbench lamp brightness (two blinks). */
  lamp: number;
  /** How far the roll-up door is open. */
  door: number;
  /** DeLorean headlights; 0.35 is the light leaking under the door at rest. */
  headlights: number;
  /** Cold light coming through the opening door into the garage: door × the headlights' rise. */
  spill: number;
  /** Blend of the camera from the whole garage to the car. */
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
 * The launch timeline as a pure function of the time since Salto88.exe: the
 * dialog opens, the camera pulls back from the monitor to the whole garage,
 * the lamp blinks twice, the door rolls up while the headlights rise and their
 * cold light floods the warm garage, the camera turns to the car and the frame
 * goes white.
 */
export function launchFrame(ms: number): LaunchFrame {
  const t = Math.max(0, ms);
  const blinking = (t >= 1500 && t < 1650) || (t >= 1750 && t < 1900);
  const door = smoothstep(1900, 3500, t);
  const rise = smoothstep(2000, 3300, t);
  return {
    dialog: smoothstep(0, 200, t),
    zoom: smoothstep(600, 1800, t),
    lamp: blinking ? LAMP_BLINK : 1,
    door,
    headlights: HEADLIGHTS_REST + (1 - HEADLIGHTS_REST) * rise,
    spill: door * rise,
    camera: smoothstep(3300, 4300, t),
    whiteout: smoothstep(4400, LAUNCH_MS, t),
    done: t >= LAUNCH_MS,
  };
}
