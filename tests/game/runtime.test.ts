import { beforeEach, describe, expect, it } from 'vitest';
import { createRuntime } from '@/lib/game/tick';
import { inputQueue, resetRuntime, runtime } from '@/lib/game/runtime';

describe('runtime singleton', () => {
  it('starts as a fresh default runtime', () => {
    resetRuntime(null);
    expect(runtime).toEqual(createRuntime(null));
  });

  it('resetRuntime mutates the same object in place', () => {
    const ref = runtime;
    runtime.car.x = 12;
    runtime.mode = 'manual';
    resetRuntime('cases');
    expect(runtime).toBe(ref);
    expect(runtime).toEqual(createRuntime('cases'));
    expect(runtime.mode).toBe('idle');
    expect(runtime.zone).toBe('cases');
  });

  it('resetRuntime(null) returns to the default spawn', () => {
    resetRuntime('contato');
    resetRuntime(null);
    expect(runtime).toEqual(createRuntime(null));
  });
});

describe('inputQueue', () => {
  beforeEach(() => {
    inputQueue.releaseAll();
    inputQueue.endDrag();
    inputQueue.consume();
  });

  it('is quiet when nothing happened', () => {
    expect(inputQueue.consume()).toEqual({
      controls: { throttle: 0, steer: 0 },
      drag: null,
      wheel: 0,
      nextStop: false,
      gotoZone: null,
      userActive: false,
    });
  });

  it('reports held keys and accumulated wheel, then clears the one-shots', () => {
    inputQueue.press('KeyW');
    inputQueue.wheel(100);
    const first = inputQueue.consume();
    expect(first.controls.throttle).toBe(1);
    expect(first.wheel).toBe(100);
    expect(first.userActive).toBe(true);

    const second = inputQueue.consume();
    expect(second.wheel).toBe(0);
    expect(second.controls.throttle).toBe(1);
    expect(second.userActive).toBe(true); // key still held

    inputQueue.release('KeyW');
    const third = inputQueue.consume();
    expect(third.controls.throttle).toBe(0);
    expect(third.userActive).toBe(false);
  });

  it('accumulates wheel deltas between consumes', () => {
    inputQueue.wheel(40);
    inputQueue.wheel(-10);
    inputQueue.wheel(25);
    expect(inputQueue.consume().wheel).toBe(55);
    expect(inputQueue.consume().wheel).toBe(0);
  });

  it('maps steering keys', () => {
    inputQueue.press('KeyA');
    inputQueue.press('ArrowUp');
    expect(inputQueue.consume().controls).toEqual({ throttle: 1, steer: 1 });
  });

  it('nextStop is one-shot and counts as activity', () => {
    inputQueue.nextStop();
    const first = inputQueue.consume();
    expect(first.nextStop).toBe(true);
    expect(first.userActive).toBe(true);
    const second = inputQueue.consume();
    expect(second.nextStop).toBe(false);
    expect(second.userActive).toBe(false);
  });

  it('goto is one-shot, last request wins', () => {
    inputQueue.goto('cases');
    inputQueue.goto('oficina');
    const first = inputQueue.consume();
    expect(first.gotoZone).toBe('oficina');
    expect(first.userActive).toBe(true);
    expect(inputQueue.consume().gotoZone).toBeNull();
  });

  it('drag persists while held and clears on endDrag', () => {
    inputQueue.drag(3, -4);
    const held = inputQueue.consume();
    expect(held.drag).toEqual({ x: 3, z: -4 });
    expect(held.userActive).toBe(true);

    inputQueue.drag(5, -6);
    const moved = inputQueue.consume();
    expect(moved.drag).toEqual({ x: 5, z: -6 });
    expect(moved.userActive).toBe(true);

    inputQueue.endDrag();
    const ended = inputQueue.consume();
    expect(ended.drag).toBeNull();
    expect(ended.userActive).toBe(false);
  });

  it('releasing a key that was never pressed is a no-op', () => {
    inputQueue.release('KeyW');
    const out = inputQueue.consume();
    expect(out.controls).toEqual({ throttle: 0, steer: 0 });
    expect(out.userActive).toBe(false);
  });

  it('releaseAll drops every held key', () => {
    inputQueue.press('KeyW');
    inputQueue.press('KeyA');
    expect(inputQueue.consume().userActive).toBe(true);
    inputQueue.releaseAll();
    const out = inputQueue.consume();
    expect(out.controls).toEqual({ throttle: 0, steer: 0 });
    expect(out.userActive).toBe(false);
  });

  it('consume returns a fresh object each call, isolated from internal state', () => {
    inputQueue.drag(1, 1);
    const a = inputQueue.consume();
    const b = inputQueue.consume();
    expect(a).not.toBe(b);
    expect(a.controls).not.toBe(b.controls);
    expect(a.drag).not.toBe(b.drag);
    if (a.drag === null) throw new Error('drag should be held');
    a.drag.x = 999;
    a.controls.throttle = 5;
    const c = inputQueue.consume();
    expect(c.drag).toEqual({ x: 1, z: 1 });
    expect(c.controls.throttle).toBe(0);
  });
});
