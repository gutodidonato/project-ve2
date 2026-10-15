import { afterEach, describe, expect, it } from 'vitest';
import { registerDebug, snapshotOf } from '@/lib/game/debug';
import { createRuntime } from '@/lib/game/tick';

describe('snapshotOf', () => {
  it('copies car, mode and zone', () => {
    const rt = createRuntime('cases');
    expect(snapshotOf(rt)).toEqual({ car: rt.car, mode: 'idle', zone: 'cases' });
  });

  it('never hands out the live car object', () => {
    const rt = createRuntime();
    const snap = snapshotOf(rt);
    snap.car.x = 999;
    expect(rt.car.x).toBe(0);
    expect(snapshotOf(rt).car).not.toBe(rt.car);
  });
});

describe('registerDebug', () => {
  const g = globalThis as { window?: Window };
  afterEach(() => {
    delete g.window;
  });

  it('publishes window.__rodovia and removes it on cleanup', () => {
    g.window = {} as Window;
    const rt = createRuntime();
    const unregister = registerDebug(rt);
    expect(g.window.__rodovia?.snapshot().mode).toBe('demo');
    rt.car.x = 3;
    expect(g.window.__rodovia?.snapshot().car.x).toBe(3);
    unregister();
    expect(g.window.__rodovia).toBeUndefined();
  });
});
