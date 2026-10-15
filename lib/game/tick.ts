import { brake, steerToward } from './autopilot';
import { clampDt, stepCar } from './physics';
import type { Controls, FrameInput, GameEvent, GameRuntime, Mode, Zone, ZoneId } from './types';
import { ARRIVE_RADIUS, ZONES, nearestZone, zoneIndex } from './zones';

export const DEMO_DWELL = 3.5;
export const IDLE_TO_DEMO = 20;
export const WHEEL_TO_DISTANCE = 0.12;
export const MAX_BUDGET = 120;

export { brake };

/** Drag shorter than this (in world units) is treated as a click, not a steering gesture. */
const DRAG_DEADZONE = 2;
const COAST: Controls = { throttle: 0, steer: 0 };

/**
 * Initial runtime. With a spawn zone the car starts parked at its center, idle,
 * and the next scroll continues to the zone after it. Otherwise it starts at the
 * default point and the autopilot demo takes over.
 */
export function createRuntime(spawn: ZoneId | null = null): GameRuntime {
  if (spawn === null) {
    return {
      car: { x: 0, z: 6, heading: 0, speed: 0 },
      mode: 'demo',
      tourIndex: 0,
      gotoIndex: -1,
      budget: 0,
      dwell: 0,
      idleTime: 0,
      zone: null,
    };
  }
  const index = zoneIndex(spawn);
  const zone = ZONES[index];
  return {
    car: { x: zone.x, z: zone.z, heading: 0, speed: 0 },
    mode: 'idle',
    tourIndex: (index + 1) % ZONES.length,
    gotoIndex: -1,
    budget: 0,
    dwell: 0,
    idleTime: 0,
    zone: spawn,
  };
}

function setMode(rt: GameRuntime, mode: Mode): void {
  // A dwell only makes sense inside demo; drop it so a later demo does not resume a stale one.
  if (rt.mode === 'demo' && mode !== 'demo') rt.dwell = 0;
  rt.mode = mode;
}

function advanceTour(rt: GameRuntime): void {
  rt.tourIndex = (rt.tourIndex + 1) % ZONES.length;
}

/**
 * Advance the game one frame. Mutates `rt` and returns the events the host
 * (GameDirector) should apply to the discrete store.
 *
 * Rule order matters: idle fallback, goto request, scroll/next-stop, manual
 * input, then the per-mode autopilot, then zone detection.
 */
export function tickGame(rt: GameRuntime, input: FrameInput, dt: number): GameEvent[] {
  const events: GameEvent[] = [];
  const startMode = rt.mode;
  // Physics, dwell and the tour budget use a clamped step so a stalled tab's
  // huge dt cannot tunnel the car or skip ahead. The idle timer deliberately
  // uses the raw dt: coming back from a long background tab may drop into demo.
  const step = clampDt(dt);
  const idleDt = Number.isNaN(dt) || dt < 0 ? 0 : dt;

  // 1. Idle tracking: after IDLE_TO_DEMO seconds without activity the demo resumes,
  // but only out on the road. A car the visitor left inside a zone (parked by the
  // autopilot or stopped by hand) stays: they are reading that stop's panel, and
  // the demo would drive it away mid-read.
  if (input.userActive) rt.idleTime = 0;
  else rt.idleTime += idleDt;
  if (rt.idleTime >= IDLE_TO_DEMO && rt.mode !== 'demo' && rt.zone === null) setMode(rt, 'demo');

  // 2. Go-to request (pit stop link, hash).
  if (input.gotoZone !== null) {
    setMode(rt, 'goto');
    rt.gotoIndex = zoneIndex(input.gotoZone);
    rt.budget = 0;
  }

  // 3. Scroll / next stop: spend distance on the tour.
  if (input.wheel > 0 || input.nextStop) {
    const target = ZONES[rt.tourIndex];
    if (Math.hypot(rt.car.x - target.x, rt.car.z - target.z) < 2 * ARRIVE_RADIUS) advanceTour(rt);
    rt.budget = input.nextStop ? MAX_BUDGET : Math.min(rt.budget + input.wheel * WHEEL_TO_DISTANCE, MAX_BUDGET);
    setMode(rt, 'tour');
  }

  // 4. Manual input (keys or drag) takes over; keys win over a drag.
  const { controls, drag } = input;
  const hasControls = controls.throttle !== 0 || controls.steer !== 0;
  const dragging = drag !== null && Math.hypot(drag.x, drag.z) > DRAG_DEADZONE;
  if (hasControls || dragging) {
    setMode(rt, 'manual');
    rt.budget = 0;
    rt.gotoIndex = -1;
    if (hasControls) {
      rt.car = stepCar(rt.car, controls, step);
    } else if (drag !== null) {
      rt.car = stepCar(rt.car, steerToward(rt.car, rt.car.x + drag.x, rt.car.z + drag.z).controls, step);
    }
  } else {
    // 5. Autopilot / coasting, by mode.
    runMode(rt, step);
  }

  // 6. Zone presence, then the final mode if it changed.
  const zone = nearestZone(rt.car.x, rt.car.z)?.id ?? null;
  if (zone !== rt.zone) {
    rt.zone = zone;
    events.push({ type: 'zone', zone });
  }
  if (rt.mode !== startMode) events.push({ type: 'mode', mode: rt.mode });
  return events;
}

function drive(rt: GameRuntime, tx: number, tz: number, step: number): { arrived: boolean } {
  const { controls, distance } = steerToward(rt.car, tx, tz);
  rt.car = stepCar(rt.car, controls, step);
  return { arrived: distance < ARRIVE_RADIUS };
}

function coast(rt: GameRuntime, step: number): void {
  rt.car = stepCar(rt.car, COAST, step);
}

/** Hold position: brake to a stop (used by demo dwell and idle, so the car stays where it arrived). */
function park(rt: GameRuntime, step: number): void {
  rt.car = stepCar(rt.car, brake(rt.car), step);
}

function runMode(rt: GameRuntime, step: number): void {
  switch (rt.mode) {
    case 'demo': {
      if (rt.dwell > 0) {
        park(rt, step);
        rt.dwell -= step;
        if (rt.dwell <= 0) {
          rt.dwell = 0;
          advanceTour(rt);
        }
        return;
      }
      const target = ZONES[rt.tourIndex];
      if (drive(rt, target.x, target.z, step).arrived) rt.dwell = DEMO_DWELL;
      return;
    }
    case 'tour': {
      const target = ZONES[rt.tourIndex];
      const { arrived } = drive(rt, target.x, target.z, step);
      rt.budget -= Math.abs(rt.car.speed) * step;
      if (arrived) {
        rt.budget = 0;
        advanceTour(rt);
        setMode(rt, 'idle');
      } else if (rt.budget <= 0) {
        rt.budget = 0;
        setMode(rt, 'idle');
      }
      return;
    }
    case 'goto': {
      const target: Zone | undefined = ZONES[rt.gotoIndex];
      if (!target) {
        // Defensive: goto without a valid destination just parks.
        park(rt, step);
        setMode(rt, 'idle');
        return;
      }
      if (drive(rt, target.x, target.z, step).arrived) {
        rt.tourIndex = (rt.gotoIndex + 1) % ZONES.length;
        rt.gotoIndex = -1;
        setMode(rt, 'idle');
      }
      return;
    }
    case 'idle':
      park(rt, step);
      return;
    case 'manual':
      // No input while manual: roll out naturally under drag.
      coast(rt, step);
      return;
  }
}
