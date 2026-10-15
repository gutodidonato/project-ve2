import { describe, expect, it } from 'vitest';
import {
  DEMO_DWELL,
  IDLE_TO_DEMO,
  MAX_BUDGET,
  WHEEL_TO_DISTANCE,
  createRuntime,
  tickGame,
} from '@/lib/game/tick';
import { MAX_DT, MAX_SPEED } from '@/lib/game/physics';
import { ARRIVE_RADIUS, ZONES, zoneIndex } from '@/lib/game/zones';
import type { FrameInput, GameEvent, GameRuntime, ZoneId } from '@/lib/game/types';

const DT = 1 / 60;

function frame(over: Partial<FrameInput> = {}): FrameInput {
  return {
    controls: { throttle: 0, steer: 0 },
    drag: null,
    wheel: 0,
    nextStop: false,
    gotoZone: null,
    userActive: false,
    ...over,
  };
}

/** Tick with empty input until `done()` or `maxSeconds` of simulated time passes. */
function runUntil(rt: GameRuntime, done: () => boolean, maxSeconds = 30) {
  const events: GameEvent[] = [];
  const maxTicks = Math.round(maxSeconds / DT);
  for (let i = 1; i <= maxTicks; i += 1) {
    events.push(...tickGame(rt, frame(), DT));
    if (done()) return { events, ticks: i, hit: true };
  }
  return { events, ticks: maxTicks, hit: false };
}

function run(rt: GameRuntime, seconds: number, input: FrameInput = frame()): GameEvent[] {
  const events: GameEvent[] = [];
  for (let i = 0; i < Math.round(seconds / DT); i += 1) events.push(...tickGame(rt, input, DT));
  return events;
}

describe('constants', () => {
  it('match the prototype timings', () => {
    expect(DEMO_DWELL).toBe(3.5);
    expect(IDLE_TO_DEMO).toBe(20);
    expect(WHEEL_TO_DISTANCE).toBe(0.12);
    expect(MAX_BUDGET).toBe(120);
  });
});

describe('createRuntime', () => {
  it('defaults to the demo spawn at (0, 6)', () => {
    expect(createRuntime()).toEqual({
      car: { x: 0, z: 6, heading: 0, speed: 0 },
      mode: 'demo',
      tourIndex: 0,
      gotoIndex: -1,
      budget: 0,
      dwell: 0,
      idleTime: 0,
      zone: null,
    });
    expect(createRuntime(null)).toEqual(createRuntime());
  });

  it('spawns at a zone center, idle, with the next tour stop queued', () => {
    const rt = createRuntime('cases');
    expect(rt.zone).toBe('cases');
    expect(rt.mode).toBe('idle');
    expect(rt.car).toMatchObject({ x: 32, z: -32, speed: 0 });
    expect(rt.tourIndex).toBe(zoneIndex('oficina'));
  });

  it('wraps the queued stop after the last zone', () => {
    expect(createRuntime('contato').tourIndex).toBe(0);
  });

  it('does not emit a zone event for the spawn zone on the first tick', () => {
    const rt = createRuntime('cases');
    expect(tickGame(rt, frame(), DT).filter((e) => e.type === 'zone')).toEqual([]);
  });
});

describe('demo mode', () => {
  it('drives to the first zone on its own and emits a zone event', () => {
    const rt = createRuntime();
    const events = run(rt, 10);
    expect(events).toContainEqual({ type: 'zone', zone: 'experiencia' });
    expect(events.filter((e) => e.type === 'mode')).toEqual([]);
  });

  it('dwells at a stop for DEMO_DWELL seconds, then queues the next stop', () => {
    const rt = createRuntime();
    expect(runUntil(rt, () => rt.dwell > 0).hit).toBe(true);
    expect(rt.dwell).toBeCloseTo(DEMO_DWELL, 6);
    expect(rt.tourIndex).toBe(0);
    const { ticks, hit } = runUntil(rt, () => rt.tourIndex === 1, 6);
    expect(hit).toBe(true);
    expect(Math.abs(ticks * DT - DEMO_DWELL)).toBeLessThan(0.1);
    expect(rt.dwell).toBe(0);
    expect(rt.mode).toBe('demo');
  });

  it('keeps touring: reaches the second stop after the first', () => {
    const rt = createRuntime();
    const { events, hit } = runUntil(rt, () => rt.zone === 'cases', 30);
    expect(hit).toBe(true);
    expect(events).toContainEqual({ type: 'zone', zone: 'experiencia' });
  });
});

describe('tour mode (scroll / next stop)', () => {
  it('a big wheel caps the budget at MAX_BUDGET and starts a tour', () => {
    const rt = createRuntime();
    const events = tickGame(rt, frame({ wheel: 1000, userActive: true }), DT);
    expect(rt.mode).toBe('tour');
    expect(rt.budget).toBeCloseTo(MAX_BUDGET, 0);
    expect(rt.budget).toBeLessThanOrEqual(MAX_BUDGET);
    expect(events).toContainEqual({ type: 'mode', mode: 'tour' });
  });

  it('drives to the queued stop and ends idle inside its zone', () => {
    const rt = createRuntime();
    tickGame(rt, frame({ wheel: 1000, userActive: true }), DT);
    const { events, hit } = runUntil(rt, () => rt.mode === 'idle');
    expect(hit).toBe(true);
    expect(rt.zone).toBe('experiencia');
    expect(rt.budget).toBe(0);
    expect(rt.tourIndex).toBe(1);
    expect(events).toContainEqual({ type: 'zone', zone: 'experiencia' });
    expect(events.filter((e) => e.type === 'mode')).toEqual([{ type: 'mode', mode: 'idle' }]);
    // The car parks on arrival: the zone persists, it does not roll out of it.
    const after = run(rt, 3);
    expect(rt.zone).toBe('experiencia');
    expect(rt.mode).toBe('idle');
    expect(Math.abs(rt.car.speed)).toBeLessThan(0.5);
    expect(after.filter((e) => e.type === 'zone')).toEqual([]);
  });

  it('accumulates wheel distance into the budget', () => {
    const rt = createRuntime();
    tickGame(rt, frame({ wheel: 50, userActive: true }), DT);
    expect(rt.budget).toBeCloseTo(50 * WHEEL_TO_DISTANCE, 0);
    const before = rt.budget;
    tickGame(rt, frame({ wheel: 50, userActive: true }), DT);
    expect(rt.budget).toBeGreaterThan(before);
  });

  it('ignores a wheel that is not scrolling forward', () => {
    const rt = createRuntime();
    tickGame(rt, frame({ wheel: -300, userActive: true }), DT);
    expect(rt.mode).toBe('demo');
    expect(rt.budget).toBe(0);
  });

  it('nextStop jumps straight to a full budget', () => {
    const rt = createRuntime();
    tickGame(rt, frame({ nextStop: true, userActive: true }), DT);
    expect(rt.mode).toBe('tour');
    expect(rt.budget).toBeCloseTo(MAX_BUDGET, 0);
  });

  it('stops idle (not at the zone) when the budget runs out first', () => {
    const rt = createRuntime();
    tickGame(rt, frame({ wheel: 50, userActive: true }), DT); // 6 units of budget, ~47 to go
    const { hit } = runUntil(rt, () => rt.mode === 'idle');
    expect(hit).toBe(true);
    expect(rt.budget).toBeLessThanOrEqual(0);
    expect(rt.tourIndex).toBe(0);
    expect(rt.zone).toBeNull();
  });

  it('advances past the current stop first when the car is already parked on it', () => {
    const rt = createRuntime();
    rt.car = { x: ZONES[0].x, z: ZONES[0].z, heading: 0, speed: 0 };
    tickGame(rt, frame({ wheel: 100, userActive: true }), DT);
    expect(rt.tourIndex).toBe(1);
    expect(rt.mode).toBe('tour');
  });

  it('does not advance when the car is merely near but outside twice the arrive radius', () => {
    const rt = createRuntime();
    rt.car = { x: ZONES[0].x + 2 * ARRIVE_RADIUS + 0.5, z: ZONES[0].z, heading: 0, speed: 0 };
    tickGame(rt, frame({ wheel: 100, userActive: true }), DT);
    expect(rt.tourIndex).toBe(0);
  });

  it('wraps the tour index after the last stop', () => {
    const rt = createRuntime();
    rt.tourIndex = 4;
    rt.car = { x: ZONES[4].x, z: ZONES[4].z, heading: 0, speed: 0 };
    tickGame(rt, frame({ wheel: 100, userActive: true }), DT);
    expect(rt.tourIndex).toBe(0);
  });
});

describe('goto mode (pit stop link / hash)', () => {
  it('drives to the requested zone, then idles with the following stop queued', () => {
    const rt = createRuntime();
    const first = tickGame(rt, frame({ gotoZone: 'contato', userActive: true }), DT);
    expect(rt.mode).toBe('goto');
    expect(rt.gotoIndex).toBe(zoneIndex('contato'));
    expect(first).toContainEqual({ type: 'mode', mode: 'goto' });

    const { events, hit } = runUntil(rt, () => rt.mode === 'idle');
    expect(hit).toBe(true);
    expect(rt.zone).toBe('contato');
    expect(rt.tourIndex).toBe(0);
    expect(rt.gotoIndex).toBe(-1);
    expect(events).toContainEqual({ type: 'zone', zone: 'contato' });
    expect(events.filter((e) => e.type === 'mode')).toEqual([{ type: 'mode', mode: 'idle' }]);
  });

  it('cancels a pending tour budget', () => {
    const rt = createRuntime();
    rt.budget = 80;
    tickGame(rt, frame({ gotoZone: 'servicos', userActive: true }), DT);
    expect(rt.budget).toBeCloseTo(0, 1);
    expect(rt.gotoIndex).toBe(zoneIndex('servicos'));
  });
});

describe('manual mode', () => {
  it('non-zero controls switch to manual, drive the car and cancel autopilot state', () => {
    const rt = createRuntime();
    rt.budget = 50;
    rt.gotoIndex = 2;
    const events = tickGame(rt, frame({ controls: { throttle: 1, steer: 0 }, userActive: true }), DT);
    expect(rt.mode).toBe('manual');
    expect(rt.budget).toBe(0);
    expect(rt.gotoIndex).toBe(-1);
    expect(rt.car.speed).toBeGreaterThan(0);
    expect(rt.car.z).toBeLessThan(6);
    expect(events).toContainEqual({ type: 'mode', mode: 'manual' });
  });

  it('a drag longer than 2 steers the car toward the dragged direction', () => {
    const rt = createRuntime();
    run(rt, 1, frame({ drag: { x: 30, z: 0 }, userActive: true })); // drag to the right (+x)
    expect(rt.mode).toBe('manual');
    expect(rt.car.x).toBeGreaterThan(0);
    expect(rt.car.heading).toBeLessThan(0);
  });

  it('a drag of 2 or less is ignored', () => {
    const rt = createRuntime();
    const events = tickGame(rt, frame({ drag: { x: 1, z: 1 }, userActive: true }), DT);
    expect(rt.mode).toBe('demo');
    expect(events.filter((e) => e.type === 'mode')).toEqual([]);
  });

  it('keyboard controls win over a simultaneous drag', () => {
    const rt = createRuntime();
    tickGame(rt, frame({ controls: { throttle: -1, steer: 0 }, drag: { x: 0, z: -40 }, userActive: true }), DT);
    expect(rt.car.speed).toBeLessThan(0);
  });

  it('coasts to a stop when input stops, staying manual', () => {
    const rt = createRuntime();
    run(rt, 1, frame({ controls: { throttle: 1, steer: 0 }, userActive: true }));
    const fast = rt.car.speed;
    run(rt, 3, frame({ userActive: true }));
    expect(rt.mode).toBe('manual');
    expect(rt.car.speed).toBeLessThan(fast / 10);
  });

  it('returns to demo after IDLE_TO_DEMO seconds without activity', () => {
    const rt = createRuntime();
    tickGame(rt, frame({ controls: { throttle: 1, steer: 0 }, userActive: true }), DT);
    expect(rt.mode).toBe('manual');

    const early = run(rt, IDLE_TO_DEMO - 1);
    expect(rt.mode).toBe('manual');
    expect(early.filter((e) => e.type === 'mode')).toEqual([]);

    const late = run(rt, 1.2);
    expect(rt.mode).toBe('demo');
    expect(late.filter((e) => e.type === 'mode')).toEqual([{ type: 'mode', mode: 'demo' }]);
  });

  it('user activity keeps resetting the idle timer', () => {
    const rt = createRuntime();
    tickGame(rt, frame({ controls: { throttle: 1, steer: 0 }, userActive: true }), DT);
    run(rt, 19);
    expect(rt.idleTime).toBeGreaterThan(18.9);
    tickGame(rt, frame({ userActive: true }), DT);
    expect(rt.idleTime).toBe(0);
    run(rt, 19);
    expect(rt.mode).toBe('manual');
  });

  it('also falls back to demo from idle outside every zone after the idle window', () => {
    const rt = createRuntime();
    rt.mode = 'idle'; // e.g. a tour whose budget ran out between stops
    expect(rt.zone).toBeNull();
    run(rt, IDLE_TO_DEMO - 0.5);
    expect(rt.mode).toBe('idle');
    run(rt, 1);
    expect(rt.mode).toBe('demo');
  });

  it('falls back to demo after a manual drive that stopped outside every zone', () => {
    const rt = createRuntime();
    run(rt, 0.5, frame({ controls: { throttle: 1, steer: 0 }, userActive: true }));
    expect(rt.mode).toBe('manual');
    expect(rt.zone).toBeNull();
    run(rt, IDLE_TO_DEMO + 0.5);
    expect(rt.mode).toBe('demo');
  });

  it('never falls back to demo while parked at a stop', () => {
    const rt = createRuntime('cases');
    expect(rt.mode).toBe('idle');
    const events = run(rt, 60);
    expect(rt.mode).toBe('idle');
    expect(rt.zone).toBe('cases');
    expect(rt.idleTime).toBeGreaterThan(IDLE_TO_DEMO);
    expect(events).toEqual([]);
  });

  it('keeps a visitor who drove into a zone by hand and stopped there', () => {
    const rt = createRuntime();
    const cases = ZONES[zoneIndex('cases')];
    // Just south of the cases ring, facing it (forward is -z at heading 0).
    rt.car = { x: cases.x, z: cases.z + 10, heading: 0, speed: 0 };
    const drive = frame({ controls: { throttle: 1, steer: 0 }, userActive: true });
    let ticks = 0;
    while (rt.zone !== 'cases' && ticks < 600) {
      tickGame(rt, drive, DT);
      ticks += 1;
    }
    expect(rt.zone).toBe('cases');
    expect(rt.mode).toBe('manual');

    const events = run(rt, 60);
    expect(Math.abs(rt.car.speed)).toBeLessThan(0.1);
    expect(rt.zone).toBe('cases');
    expect(rt.mode).toBe('manual');
    expect(events.filter((e) => e.type === 'mode')).toEqual([]);
  });

  it('keeps a visitor at the stop a goto parked them at', () => {
    const rt = createRuntime();
    tickGame(rt, frame({ gotoZone: 'oficina', userActive: true }), DT);
    expect(runUntil(rt, () => rt.mode === 'idle').hit).toBe(true);
    expect(rt.zone).toBe('oficina');
    run(rt, 60);
    expect(rt.mode).toBe('idle');
    expect(rt.zone).toBe('oficina');
  });

  it('resets a stale demo dwell when the user takes over', () => {
    const rt = createRuntime();
    expect(runUntil(rt, () => rt.dwell > 0).hit).toBe(true);
    tickGame(rt, frame({ controls: { throttle: 1, steer: 0 }, userActive: true }), DT);
    expect(rt.mode).toBe('manual');
    expect(rt.dwell).toBe(0);
  });
});

describe('events', () => {
  it('emits a zone event with null when the car leaves a zone', () => {
    const rt = createRuntime('cases');
    const events = run(rt, 3, frame({ controls: { throttle: 1, steer: 0 }, userActive: true }));
    expect(rt.zone).toBeNull();
    expect(events).toContainEqual({ type: 'zone', zone: null });
  });

  it('emits no zone event while the zone stays unchanged', () => {
    const rt = createRuntime('cases');
    expect(run(rt, 0.5).filter((e) => e.type === 'zone')).toEqual([]);
  });

  it('emits no mode event when the mode round-trips within one tick', () => {
    const rt = createRuntime(); // on the road: inside a zone the demo never takes over
    rt.mode = 'manual';
    rt.idleTime = IDLE_TO_DEMO + 5; // rule 1 flips to demo, held controls flip back to manual
    const events = tickGame(rt, frame({ controls: { throttle: 1, steer: 0 } }), DT);
    expect(events.filter((e) => e.type === 'mode')).toEqual([]);
    expect(rt.mode).toBe('manual');
  });

  it('emits only the final mode when it changes more than once in a tick', () => {
    const rt = createRuntime(); // on the road: inside a zone the demo never takes over
    rt.mode = 'manual';
    rt.idleTime = IDLE_TO_DEMO + 5; // rule 1 -> demo, then the goto request -> goto
    const events = tickGame(rt, frame({ gotoZone: 'servicos' }), DT);
    expect(events.filter((e) => e.type === 'mode')).toEqual([{ type: 'mode', mode: 'goto' }]);
    expect(rt.mode).toBe('goto');
  });

  it('does not mutate the input frame', () => {
    const rt = createRuntime();
    const input = frame({ controls: { throttle: 1, steer: -1 }, drag: { x: 5, z: 5 }, wheel: 10, userActive: true });
    const snapshot = JSON.parse(JSON.stringify(input)) as FrameInput;
    tickGame(rt, input, DT);
    expect(input).toEqual(snapshot);
  });
});

describe('huge dt (returning to a background tab)', () => {
  it('moves the car at most MAX_SPEED * MAX_DT and keeps zones from flipping', () => {
    const rt = createRuntime('cases');
    rt.car = { ...rt.car, heading: 0, speed: MAX_SPEED };
    const start = { x: rt.car.x, z: rt.car.z };
    const events = tickGame(rt, frame({ controls: { throttle: 1, steer: 0 }, userActive: true }), 1000);
    expect(Math.hypot(rt.car.x - start.x, rt.car.z - start.z)).toBeLessThanOrEqual(MAX_SPEED * MAX_DT + 1e-9);
    expect(rt.zone).toBe('cases');
    expect(events.filter((e) => e.type === 'zone')).toEqual([]);
  });

  it('does not burn the tour budget faster than the car actually travels', () => {
    const rt = createRuntime();
    tickGame(rt, frame({ wheel: 1000, userActive: true }), DT);
    rt.car = { ...rt.car, speed: MAX_SPEED };
    const before = rt.budget;
    tickGame(rt, frame({ userActive: true }), 1000);
    expect(before - rt.budget).toBeLessThanOrEqual(MAX_SPEED * MAX_DT + 1e-9);
    expect(rt.mode).toBe('tour');
  });

  it('does not skip a demo dwell', () => {
    const rt = createRuntime();
    expect(runUntil(rt, () => rt.dwell > 0).hit).toBe(true);
    tickGame(rt, frame({ userActive: true }), 1000);
    expect(rt.dwell).toBeGreaterThan(DEMO_DWELL - MAX_DT - 1e-9);
    expect(rt.tourIndex).toBe(0);
  });

  it('the idle timer uses the raw dt: returning from a long background tab drops into demo', () => {
    const rt = createRuntime();
    tickGame(rt, frame({ controls: { throttle: 1, steer: 0 }, userActive: true }), DT);
    expect(rt.mode).toBe('manual');
    const events = tickGame(rt, frame(), 25);
    expect(rt.mode).toBe('demo');
    expect(events).toContainEqual({ type: 'mode', mode: 'demo' });
    expect(rt.idleTime).toBe(25);
  });

  it('survives NaN and negative dt without corrupting state', () => {
    const rt = createRuntime();
    tickGame(rt, frame({ controls: { throttle: 1, steer: 0 }, userActive: true }), Number.NaN);
    tickGame(rt, frame({ controls: { throttle: 1, steer: 0 }, userActive: true }), -1);
    expect(Number.isFinite(rt.car.x + rt.car.z + rt.car.speed + rt.idleTime)).toBe(true);
  });
});

describe('parking on arrival', () => {
  const ids: ZoneId[] = ZONES.map((z) => z.id);

  function gotoAndPark(rt: GameRuntime, target: ZoneId) {
    tickGame(rt, frame({ gotoZone: target, userActive: true }), DT);
    const { hit } = runUntil(rt, () => rt.mode === 'idle');
    expect(hit).toBe(true);
    expect(rt.zone).toBe(target);
    // The braking profile makes the car arrive slowly instead of at cruising speed.
    expect(rt.car.speed).toBeLessThan(12);
    run(rt, 3);
    expect(rt.mode).toBe('idle');
    expect(rt.zone).toBe(target);
    expect(Math.abs(rt.car.speed)).toBeLessThan(0.5);
  }

  it.each(ids)('goto %s from the default spawn parks inside the zone', (target) => {
    gotoAndPark(createRuntime(), target);
  });

  const pairs = ids.flatMap((from) => ids.filter((to) => to !== from).map((to) => [from, to] as const));
  it.each(pairs)('goto from %s to %s parks inside the zone', (from, to) => {
    gotoAndPark(createRuntime(from), to);
  });

  it('a wheel-driven tour parks inside each stop in turn', () => {
    const rt = createRuntime();
    for (const stop of ids) {
      tickGame(rt, frame({ wheel: 1000, userActive: true }), DT);
      expect(runUntil(rt, () => rt.mode === 'idle').hit).toBe(true);
      expect(rt.zone).toBe(stop);
      run(rt, 3);
      expect(rt.zone).toBe(stop);
      expect(Math.abs(rt.car.speed)).toBeLessThan(0.5);
    }
    expect(rt.tourIndex).toBe(0);
  });

  it('nextStop parks inside the stop as well', () => {
    const rt = createRuntime('cases');
    tickGame(rt, frame({ nextStop: true, userActive: true }), DT);
    expect(runUntil(rt, () => rt.mode === 'idle').hit).toBe(true);
    run(rt, 3);
    expect(rt.zone).toBe('oficina');
    expect(Math.abs(rt.car.speed)).toBeLessThan(0.5);
  });

  it('stays inside the zone for the whole demo dwell of each of the first three stops', () => {
    const rt = createRuntime();
    for (const stop of ids.slice(0, 3)) {
      expect(runUntil(rt, () => rt.dwell > 0).hit).toBe(true);
      expect(rt.zone).toBe(stop);
      let dwellTicks = 0;
      while (rt.dwell > 0) {
        tickGame(rt, frame(), DT);
        dwellTicks += 1;
        if (rt.dwell > 0) expect(rt.zone).toBe(stop);
        expect(dwellTicks).toBeLessThan(400);
      }
      expect(Math.abs(rt.car.speed)).toBeLessThan(0.5);
      expect(Math.abs(dwellTicks * DT - DEMO_DWELL)).toBeLessThan(0.1);
    }
    expect(rt.mode).toBe('demo');
  });

  it('brakes to a stop in idle mode', () => {
    const rt = createRuntime('cases');
    rt.car = { ...rt.car, speed: 15 };
    run(rt, 2);
    expect(rt.mode).toBe('idle');
    expect(Math.abs(rt.car.speed)).toBeLessThan(0.5);
  });

  it('a manual drive with no input still coasts rather than braking', () => {
    const coasting = createRuntime();
    tickGame(coasting, frame({ controls: { throttle: 1, steer: 0 }, userActive: true }), DT);
    coasting.car = { ...coasting.car, speed: 15 };
    const braking = createRuntime('cases');
    braking.car = { ...braking.car, speed: 15 };
    run(coasting, 0.5, frame({ userActive: true }));
    run(braking, 0.5, frame({ userActive: true }));
    expect(coasting.mode).toBe('manual');
    expect(coasting.car.speed).toBeGreaterThan(braking.car.speed + 3);
  });
});
