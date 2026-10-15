import type { CarState, Controls } from './types';

export const ACCEL = 28;
export const MIN_SPEED = -10;
export const MAX_SPEED = 22;
export const STEER_RATE = 2.3;
export const BOUND = 76;
export const MAX_DT = 0.05;

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/** Clamp a frame delta to [0, MAX_DT] so a stalled tab can never tunnel the car. */
export function clampDt(dt: number): number {
  return Number.isNaN(dt) ? 0 : clamp(dt, 0, MAX_DT);
}

/** Pure arcade car step. Forward is (-sin heading, -cos heading); steer +1 = left. */
export function stepCar(car: CarState, controls: Controls, dt: number): CarState {
  const step = clampDt(dt);
  let speed = car.speed + clamp(controls.throttle, -1, 1) * ACCEL * step;
  speed *= 0.3 ** step;
  speed = clamp(speed, MIN_SPEED, MAX_SPEED);
  const heading = car.heading + clamp(controls.steer, -1, 1) * STEER_RATE * step * clamp(speed / 5, -1, 1);
  return {
    x: clamp(car.x - Math.sin(heading) * speed * step, -BOUND, BOUND),
    z: clamp(car.z - Math.cos(heading) * speed * step, -BOUND, BOUND),
    heading,
    speed,
  };
}
