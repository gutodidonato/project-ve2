import { describe, expect, it } from 'vitest';
import { nextStopOf, speedKmh } from '@/lib/game/hud';
import { createRuntime } from '@/lib/game/tick';
import type { GameRuntime } from '@/lib/game/types';
import { ZONES } from '@/lib/game/zones';

const at = (id: string) => ZONES.find((z) => z.id === id)!;

function runtime(patch: Partial<GameRuntime>): GameRuntime {
  return { ...createRuntime(), ...patch };
}

describe('speedKmh', () => {
  it('is round(|speed| * 7)', () => {
    expect(speedKmh(0)).toBe(0);
    expect(speedKmh(22)).toBe(154);
    expect(speedKmh(10.05)).toBe(70);
    expect(speedKmh(-10)).toBe(70);
  });

  it('never reads -0', () => {
    expect(Object.is(speedKmh(-0.01), 0)).toBe(true);
  });
});

describe('nextStopOf', () => {
  it('is the first tour stop from the default spawn', () => {
    expect(nextStopOf(createRuntime())).toBe('experiencia');
  });

  it('is the stop after the spawn zone when spawned parked there', () => {
    expect(nextStopOf(createRuntime('cases'))).toBe('oficina');
    expect(nextStopOf(createRuntime('contato'))).toBe('experiencia');
  });

  it('skips the tour stop the car is parked on (demo dwell)', () => {
    const cases = at('cases');
    const rt = runtime({ mode: 'demo', tourIndex: 1, car: { x: cases.x + 1, z: cases.z, heading: 0, speed: 0 } });
    expect(nextStopOf(rt)).toBe('oficina');
  });

  it('is the goto destination while travelling', () => {
    const rt = runtime({ mode: 'goto', gotoIndex: 4, tourIndex: 1 });
    expect(nextStopOf(rt)).toBe('contato');
  });

  it('falls back to the tour when a goto has no valid destination', () => {
    const rt = runtime({ mode: 'goto', gotoIndex: -1, tourIndex: 2 });
    expect(nextStopOf(rt)).toBe('oficina');
  });

  it('follows the tour in manual mode too (what Space would do)', () => {
    const rt = runtime({ mode: 'manual', tourIndex: 3, car: { x: 0, z: 0, heading: 0, speed: 5 } });
    expect(nextStopOf(rt)).toBe('servicos');
  });
});
