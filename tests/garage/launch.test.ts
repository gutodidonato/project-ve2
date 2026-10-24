import { describe, expect, it } from 'vitest';
import { LAUNCH_MS, launchFrame } from '@/lib/garage/launch';

describe('launchFrame', () => {
  it('starts on the desk: nothing moved yet', () => {
    const f = launchFrame(0);
    expect([f.dialog, f.zoom, f.door, f.camera, f.whiteout, f.done]).toEqual([0, 0, 0, 0, 0, false]);
    expect(f.lamp).toBe(1);
    expect(f.headlights).toBe(0.35);
  });

  it('shows the dialog, then pulls the camera back from the monitor', () => {
    expect(launchFrame(200).dialog).toBe(1);
    expect(launchFrame(600).zoom).toBe(0);
    expect(launchFrame(1200).zoom).toBeCloseTo(0.5, 9);
    expect(launchFrame(1800).zoom).toBe(1);
    expect(launchFrame(1800).door).toBe(0);
  });

  it('blinks the lamp, then rolls the door up while the cold light comes in', () => {
    expect(launchFrame(1550).lamp).toBe(0.15);
    expect(launchFrame(1700).lamp).toBe(1);
    expect(launchFrame(1800).lamp).toBe(0.15);
    expect(launchFrame(2700).door).toBeCloseTo(0.5, 9);
    const mid = launchFrame(2700);
    expect(mid.spill).toBeGreaterThan(0.2);
    expect(mid.spill).toBeLessThan(0.6);
    expect(launchFrame(3500).door).toBe(1);
  });

  it('turns to the car, then flashes white and ends at 4.9 s', () => {
    expect(launchFrame(3300).camera).toBe(0);
    expect(launchFrame(4300).camera).toBe(1);
    expect(launchFrame(4399).whiteout).toBe(0);
    expect(LAUNCH_MS).toBe(4900);
    const end = launchFrame(4900);
    expect(end.whiteout).toBe(1);
    expect(end.done).toBe(true);
    expect(launchFrame(4899).done).toBe(false);
  });

  it('clamps times before the start', () => {
    expect(launchFrame(-10)).toEqual(launchFrame(0));
  });
});
