import { describe, expect, it } from 'vitest';
import { ARRIVAL_DECEL, SPEED_GAIN, brake, steerToward } from '@/lib/game/autopilot';
import type { CarState } from '@/lib/game/types';

const ORIGIN: CarState = { x: 0, z: 0, heading: 0, speed: 0 };

describe('steerToward', () => {
  it('drives straight and flat out at a distant target dead ahead (-z)', () => {
    const { controls, distance } = steerToward(ORIGIN, 0, -20);
    expect(controls.steer).toBeCloseTo(0, 6);
    expect(controls.throttle).toBe(1);
    expect(distance).toBeCloseTo(20, 10);
  });

  it('turns right (steer < 0) for a target on the +x side', () => {
    const { controls } = steerToward(ORIGIN, 20, 0);
    expect(controls.steer).toBeLessThan(0);
  });

  it('turns left (steer > 0) for a target on the -x side', () => {
    const { controls } = steerToward(ORIGIN, -20, -20);
    expect(controls.steer).toBeGreaterThan(0);
  });

  it('eases to 0.4 throttle when the target is behind the car', () => {
    const { controls } = steerToward(ORIGIN, 0, 20);
    expect(controls.throttle).toBe(0.4);
    expect(Math.abs(controls.steer)).toBe(1);
  });

  it('clamps steer to [-1, 1]', () => {
    expect(steerToward(ORIGIN, -5, -5).controls.steer).toBe(1);
    expect(steerToward(ORIGIN, 5, -5).controls.steer).toBe(-1);
  });

  it('exposes the braking-profile constants', () => {
    expect(ARRIVAL_DECEL).toBe(18);
    expect(SPEED_GAIN).toBe(4);
  });

  it('wants no throttle at rest once it is within 1 unit of the target', () => {
    expect(steerToward(ORIGIN, 0, -1).controls.throttle).toBe(0);
  });

  it('holds throttle near zero while following the braking curve', () => {
    const distance = 10;
    const vTarget = Math.sqrt(2 * ARRIVAL_DECEL * (distance - 1));
    const { controls } = steerToward({ ...ORIGIN, speed: vTarget }, 0, -distance);
    expect(controls.throttle).toBeCloseTo(0, 10);
  });

  it('brakes hard when closing too fast on the target', () => {
    const { controls } = steerToward({ ...ORIGIN, speed: 20 }, 0, -5);
    expect(controls.throttle).toBe(-1);
  });

  it('accelerates proportionally to the speed error when slow and far', () => {
    const { controls } = steerToward({ ...ORIGIN, speed: 20 }, 0, -100);
    expect(controls.throttle).toBeCloseTo((22 - 20) / SPEED_GAIN, 10);
  });

  it('caps throttle at 0.4 when the target is off to the side or behind, but keeps braking', () => {
    expect(steerToward(ORIGIN, 0, 100).controls.throttle).toBe(0.4);
    expect(steerToward({ ...ORIGIN, speed: 20 }, 0, 3).controls.throttle).toBe(-1);
  });

  it('takes the shortest way around the heading wrap', () => {
    const car: CarState = { x: 0, z: 0, heading: 2 * Math.PI - 0.1, speed: 5 };
    const { controls } = steerToward(car, 0, -20); // already nearly aligned modulo 2pi
    expect(Math.abs(controls.steer)).toBeLessThan(0.3);
  });
});

describe('brake', () => {
  it('pushes against forward speed, proportionally below 3 units/s, never steering', () => {
    expect(brake({ ...ORIGIN, speed: 9 })).toEqual({ throttle: -1, steer: 0 });
    expect(brake({ ...ORIGIN, speed: 1.5 })).toEqual({ throttle: -0.5, steer: 0 });
    expect(brake({ ...ORIGIN, speed: 0 }).throttle).toBeCloseTo(0, 12);
  });

  it('pulls a reversing car back toward rest', () => {
    expect(brake({ ...ORIGIN, speed: -6 })).toEqual({ throttle: 1, steer: 0 });
    expect(brake({ ...ORIGIN, speed: -1.5 })).toEqual({ throttle: 0.5, steer: 0 });
  });
});
