import { describe, expect, it } from 'vitest';
import { LAUNCH_MS, launchFrame } from '@/lib/garage/launch';

describe('launchFrame', () => {
  it('starts lit, closed and with the headlights leaking under the door', () => {
    expect(launchFrame(0)).toEqual({ lamp: 1, door: 0, headlights: 0.35, camera: 0, whiteout: 0, done: false });
  });

  it('blinks the lamp twice before the door moves', () => {
    expect(launchFrame(450).lamp).toBe(0.15);
    expect(launchFrame(600).lamp).toBe(1);
    expect(launchFrame(700).lamp).toBe(0.15);
    expect(launchFrame(800).lamp).toBe(1);
    expect(launchFrame(700).door).toBe(0);
  });

  it('rolls the door up in 1.6 s', () => {
    expect(launchFrame(1600).door).toBeCloseTo(0.5, 9);
    expect(launchFrame(2400).door).toBe(1);
  });

  it('ends in white after 3.5 s', () => {
    expect(LAUNCH_MS).toBe(3500);
    const end = launchFrame(3500);
    expect(end.whiteout).toBe(1);
    expect(end.headlights).toBe(1);
    expect(end.camera).toBe(1);
    expect(end.done).toBe(true);
    expect(launchFrame(3499).done).toBe(false);
  });

  it('clamps times before the start', () => {
    expect(launchFrame(-10)).toEqual(launchFrame(0));
  });
});
