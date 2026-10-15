import { describe, expect, it } from 'vitest';
import { CONE_COUNT, TOWER_COUNT, buildDecor } from '@/lib/game/decor';
import { BOUND } from '@/lib/game/physics';
import { ZONES } from '@/lib/game/zones';

const zone = (id: string) => ZONES.find((z) => z.id === id)!;

describe('buildDecor', () => {
  it('is deterministic for the same seed', () => {
    expect(buildDecor()).toEqual(buildDecor());
    expect(buildDecor(6)).not.toEqual(buildDecor());
  });

  it('places 22 towers in a ring of radius 10..19 around the cases district', () => {
    const { towers } = buildDecor();
    const cases = zone('cases');
    expect(TOWER_COUNT).toBe(22);
    expect(towers).toHaveLength(22);
    for (const t of towers) {
      const r = Math.hypot(t.x - cases.x, t.z - cases.z);
      expect(r).toBeGreaterThanOrEqual(10);
      expect(r).toBeLessThan(19);
      expect(t.h).toBeGreaterThanOrEqual(2);
      expect(t.h).toBeLessThan(12);
      expect(t.w).toBeGreaterThanOrEqual(1.4);
      expect(t.d).toBeGreaterThanOrEqual(1.4);
    }
  });

  it('places 46 cones inside the map, away from the spawn point and every zone', () => {
    const { cones } = buildDecor();
    expect(CONE_COUNT).toBe(46);
    expect(cones).toHaveLength(46);
    for (const c of cones) {
      expect(Math.abs(c.x)).toBeLessThan(BOUND);
      expect(Math.abs(c.z)).toBeLessThan(BOUND);
      expect(Math.hypot(c.x, c.z)).toBeGreaterThanOrEqual(14);
      for (const z of ZONES) expect(Math.hypot(c.x - z.x, c.z - z.z)).toBeGreaterThanOrEqual(20);
    }
  });

  it('puts four signposts on an arc of radius 11 around the experiencia zone', () => {
    const { signposts } = buildDecor();
    const exp = zone('experiencia');
    expect(signposts).toHaveLength(4);
    for (const s of signposts) expect(Math.hypot(s.x - exp.x, s.z - exp.z)).toBeCloseTo(11, 6);
  });

  it('keeps the garage, pylons and half-sun next to their zones but outside the rings', () => {
    const { garage, pylons, sun } = buildDecor();
    const near = (p: { x: number; z: number }, id: string) => {
      const z = zone(id);
      return Math.hypot(p.x - z.x, p.z - z.z);
    };
    expect(near(garage, 'oficina')).toBeGreaterThan(7.1);
    expect(near(garage, 'oficina')).toBeLessThan(16);
    expect(pylons).toHaveLength(3);
    for (const p of pylons) {
      expect(near(p, 'servicos')).toBeGreaterThan(7.1);
      expect(near(p, 'servicos')).toBeLessThan(16);
    }
    expect(near(sun, 'contato')).toBeGreaterThan(7.1 + sun.radius);
    expect(near(sun, 'contato')).toBeLessThan(20);
  });

  it('stands the zone props north of their zones, where the follow camera never looks through them', () => {
    const { garage, pylons, sun } = buildDecor();
    expect(garage.z + garage.d / 2).toBeLessThan(zone('oficina').z);
    for (const p of pylons) expect(p.z + p.d / 2).toBeLessThan(zone('servicos').z);
    expect(sun.z).toBeLessThan(zone('contato').z);
  });
});
