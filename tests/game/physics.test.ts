import { describe, expect, it } from 'vitest';
import { ACCEL, BOUND, MAX_DT, MAX_SPEED, MIN_SPEED, STEER_RATE, stepCar } from '@/lib/game/physics';
import type { CarState, Controls } from '@/lib/game/types';

const DT = 1 / 60;
const START: CarState = { x: 0, z: 6, heading: 0, speed: 0 };
const GAS: Controls = { throttle: 1, steer: 0 };
const IDLE: Controls = { throttle: 0, steer: 0 };

describe('stepCar', () => {
  it('exposes the prototype constants', () => {
    expect(ACCEL).toBe(28);
    expect(STEER_RATE).toBe(2.3);
    expect(MAX_SPEED).toBe(22);
    expect(MIN_SPEED).toBe(-10);
    expect(BOUND).toBe(76);
    expect(MAX_DT).toBe(0.05);
  });

  it('accelerates forward (-z) under full throttle and stays within the speed range', () => {
    let car = START;
    for (let i = 0; i < 60; i += 1) car = stepCar(car, GAS, DT);
    expect(car.speed).toBeGreaterThan(0);
    expect(car.speed).toBeLessThanOrEqual(MAX_SPEED);
    expect(car.z).toBeLessThan(START.z);
    expect(car.x).toBeCloseTo(0, 10);
  });

  it('pins ACCEL and the 0.3 ** dt drag: one step from rest at full throttle', () => {
    const car = stepCar(START, GAS, DT);
    expect(car.speed).toBeCloseTo(28 * DT * 0.3 ** DT, 12);
  });

  it('pins STEER_RATE: full steer at speed >= 5 turns 2.3 rad/s', () => {
    const car = stepCar({ ...START, speed: 10 }, { throttle: 0, steer: 1 }, DT);
    expect(car.heading).toBeCloseTo(2.3 * DT, 12);
  });

  it('reverses with negative throttle but never below MIN_SPEED', () => {
    let car = START;
    for (let i = 0; i < 600; i += 1) car = stepCar(car, { throttle: -1, steer: 0 }, DT);
    expect(car.speed).toBeLessThan(0);
    expect(car.speed).toBeGreaterThanOrEqual(MIN_SPEED);
  });

  it('applies drag when coasting', () => {
    const car = stepCar({ ...START, speed: 10 }, IDLE, DT);
    expect(car.speed).toBeLessThan(10);
    expect(car.speed).toBeGreaterThan(0);
  });

  it('clamps dt: a background-tab dt of 5 s moves at most MAX_SPEED * MAX_DT', () => {
    const fast: CarState = { x: 0, z: 0, heading: 0, speed: MAX_SPEED };
    const next = stepCar(fast, GAS, 5);
    const moved = Math.hypot(next.x - fast.x, next.z - fast.z);
    expect(moved).toBeLessThanOrEqual(MAX_SPEED * MAX_DT + 1e-9);
    expect(next.speed).toBeLessThanOrEqual(MAX_SPEED);
  });

  it('never leaves the +-76 bounds while pushing into a wall', () => {
    let car: CarState = { x: 0, z: 0, heading: 0, speed: 0 };
    for (let i = 0; i < 2000; i += 1) {
      car = stepCar(car, GAS, DT);
      expect(Math.abs(car.x)).toBeLessThanOrEqual(BOUND);
      expect(Math.abs(car.z)).toBeLessThanOrEqual(BOUND);
    }
    expect(car.z).toBe(-BOUND);
  });

  it('clamps x against the side walls too', () => {
    let car: CarState = { x: 0, z: 0, heading: Math.PI / 2, speed: 0 }; // forward = (-1, 0)
    for (let i = 0; i < 2000; i += 1) car = stepCar(car, GAS, DT);
    expect(car.x).toBe(-BOUND);
  });

  it('does not steer while standing still', () => {
    const car = stepCar(START, { throttle: 0, steer: 1 }, DT);
    expect(car.heading).toBe(0);
  });

  it('steers left (heading grows) when moving with steer +1', () => {
    const left = stepCar({ ...START, speed: 10 }, { throttle: 0, steer: 1 }, DT);
    expect(left.heading).toBeGreaterThan(0);
    const right = stepCar({ ...START, speed: 10 }, { throttle: 0, steer: -1 }, DT);
    expect(right.heading).toBeLessThan(0);
  });

  it('is pure: returns a new object and leaves the input untouched', () => {
    const input: CarState = { x: 1, z: 2, heading: 0.3, speed: 5 };
    const copy = { ...input };
    const out = stepCar(input, GAS, DT);
    expect(out).not.toBe(input);
    expect(input).toEqual(copy);
  });
});
