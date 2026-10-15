import { MAX_SPEED, clamp } from './physics';
import type { CarState, Controls } from './types';

/** Deceleration (units/s^2) the autopilot plans its approach with: v_target = sqrt(2 * decel * remaining). */
export const ARRIVAL_DECEL = 18;
/** Proportional gain turning a speed error (units/s) into throttle. */
export const SPEED_GAIN = 4;

/**
 * Proportional steering toward a point, with a braking-curve speed profile so
 * the car arrives slowly instead of overshooting. Also reports the distance.
 */
export function steerToward(car: CarState, tx: number, tz: number): { controls: Controls; distance: number } {
  const dx = tx - car.x;
  const dz = tz - car.z;
  const distance = Math.hypot(dx, dz);
  let diff = Math.atan2(-dx, -dz) - car.heading;
  diff = Math.atan2(Math.sin(diff), Math.cos(diff));
  const vTarget = Math.min(MAX_SPEED, Math.sqrt(2 * ARRIVAL_DECEL * Math.max(0, distance - 1)));
  let throttle = clamp((vTarget - car.speed) / SPEED_GAIN, -1, 1);
  if (Math.abs(diff) > 1.4) throttle = Math.min(throttle, 0.4);
  return { controls: { throttle, steer: clamp(diff * 2.2, -1, 1) }, distance };
}

/** Straight-line braking to a stop (also pulls a reversing car back to rest). */
export function brake(car: CarState): Controls {
  return { throttle: -clamp(car.speed / 3, -1, 1), steer: 0 };
}
