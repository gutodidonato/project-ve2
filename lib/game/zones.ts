import type { Zone, ZoneId } from './types';

/** Tour order. Positions and colors come from the prototype. */
export const ZONES: readonly Zone[] = [
  { id: 'experiencia', x: -34, z: -26, color: '#3ee8ff' },
  { id: 'cases', x: 32, z: -32, color: '#ff3ea5' },
  { id: 'oficina', x: -36, z: 26, color: '#ffb347' },
  { id: 'servicos', x: 34, z: 26, color: '#3ee8ff' },
  { id: 'contato', x: 0, z: 54, color: '#ff3ea5' },
];

/** Presence radius: the car counts as "in" a zone within this distance of its center. */
export const ZONE_RADIUS = 7.5;
/** Arrival radius: the autopilot considers a stop reached within this distance. */
export const ARRIVE_RADIUS = 3.5;

export function nearestZone(x: number, z: number, maxDist: number = ZONE_RADIUS): Zone | null {
  let best: Zone | null = null;
  let bestDist = maxDist;
  for (const zone of ZONES) {
    const d = Math.hypot(x - zone.x, z - zone.z);
    if (d < bestDist) {
      best = zone;
      bestDist = d;
    }
  }
  return best;
}

export function zoneIndex(id: ZoneId): number {
  return ZONES.findIndex((zone) => zone.id === id);
}

/** Accepts exactly `#<id>` for the five zone ids (case-sensitive); anything else is null. */
export function parseZoneHash(hash: string): ZoneId | null {
  if (!hash.startsWith('#')) return null;
  const id = hash.slice(1);
  const zone = ZONES.find((z) => z.id === id);
  return zone ? zone.id : null;
}
