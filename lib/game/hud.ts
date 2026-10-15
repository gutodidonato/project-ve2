import type { GameRuntime, ZoneId } from './types';
import { ARRIVE_RADIUS, ZONES } from './zones';

/** World units per second to the HUD's km/h. Arcade scale: top speed 22 reads as 154 km/h. */
export const KMH_PER_UNIT = 7;

/** Reversing reads as a positive speed too. */
export function speedKmh(speed: number): number {
  return Math.round(Math.abs(speed) * KMH_PER_UNIT);
}

/**
 * The stop the car is heading for, as the HUD names it: the goto destination
 * while travelling there, otherwise the tour stop that the next scroll or Space
 * leads to. Parked on the current tour stop (demo dwell), that is the one after
 * it, by the same "close enough" rule tickGame uses before spending a scroll.
 */
export function nextStopOf(rt: Pick<GameRuntime, 'car' | 'mode' | 'tourIndex' | 'gotoIndex'>): ZoneId {
  if (rt.mode === 'goto') {
    const target = ZONES[rt.gotoIndex];
    if (target) return target.id;
  }
  const index = ((rt.tourIndex % ZONES.length) + ZONES.length) % ZONES.length;
  const target = ZONES[index];
  if (Math.hypot(rt.car.x - target.x, rt.car.z - target.z) < 2 * ARRIVE_RADIUS) {
    return ZONES[(index + 1) % ZONES.length].id;
  }
  return target.id;
}
