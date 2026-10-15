import { describe, expect, it } from 'vitest';
import {
  ARRIVE_RADIUS,
  ZONES,
  ZONE_RADIUS,
  nearestZone,
  parseZoneHash,
  zoneIndex,
} from '@/lib/game/zones';

describe('zones', () => {
  it('lists the five zones in tour order with prototype positions and colors', () => {
    expect(ZONES.map((z) => z.id)).toEqual(['experiencia', 'cases', 'oficina', 'servicos', 'contato']);
    expect(ZONES.map((z) => [z.x, z.z, z.color])).toEqual([
      [-34, -26, '#3ee8ff'],
      [32, -32, '#ff3ea5'],
      [-36, 26, '#ffb347'],
      [34, 26, '#3ee8ff'],
      [0, 54, '#ff3ea5'],
    ]);
    expect(ZONE_RADIUS).toBe(7.5);
    expect(ARRIVE_RADIUS).toBe(3.5);
  });

  it('nearestZone finds a zone within the detection radius', () => {
    expect(nearestZone(-34, -26)?.id).toBe('experiencia');
    expect(nearestZone(-34 + 7, -26)?.id).toBe('experiencia');
    expect(nearestZone(32, -32)?.id).toBe('cases');
  });

  it('nearestZone returns null away from every zone (default radius)', () => {
    expect(nearestZone(0, 0)).toBeNull();
    expect(nearestZone(-34 + 8, -26)).toBeNull();
  });

  it('nearestZone honours a custom maxDist', () => {
    expect(nearestZone(-34 + 10, -26, 12)?.id).toBe('experiencia');
    expect(nearestZone(-34 + 10, -26)).toBeNull();
  });

  it('zoneIndex matches tour order', () => {
    expect(zoneIndex('experiencia')).toBe(0);
    expect(zoneIndex('contato')).toBe(4);
  });

  it('parseZoneHash accepts exactly #<id>', () => {
    expect(parseZoneHash('#cases')).toBe('cases');
    for (const id of ['experiencia', 'cases', 'oficina', 'servicos', 'contato']) {
      expect(parseZoneHash(`#${id}`)).toBe(id);
    }
  });

  it('parseZoneHash rejects unknown, foreign or malformed hashes without throwing', () => {
    for (const bad of ['#foo', '#Cases', '#contato?x', '#cases ', ' #cases', 'cases', '#', '', '##cases']) {
      expect(parseZoneHash(bad)).toBeNull();
    }
  });
});
