// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { INITIAL_DESKTOP } from '@/lib/garage/desktop';
import { PITSTOP_KEY } from '@/lib/pitstop';
import { useGameStore } from '@/lib/store';

describe('useGameStore', () => {
  beforeEach(() => {
    localStorage.clear();
    useGameStore.setState({
      pitstop: false,
      pitstopForced: false,
      pitstopReason: null,
      pitstopReady: false,
      tier: 'B',
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('has the documented initial state', () => {
    const s = useGameStore.getState();
    expect(s.pitstop).toBe(false);
    expect(s.pitstopForced).toBe(false);
    expect(s.pitstopReason).toBeNull();
    expect(s.pitstopReady).toBe(false);
    expect(s.tier).toBe('B');
  });

  it('sets the tier', () => {
    useGameStore.getState().setTier('A');
    expect(useGameStore.getState().tier).toBe('A');
  });

  it('starts with an empty desktop that is not ready yet', () => {
    useGameStore.setState({ desktop: INITIAL_DESKTOP, desktopReady: false });
    expect(useGameStore.getState().desktop).toEqual(INITIAL_DESKTOP);
    expect(useGameStore.getState().desktopReady).toBe(false);
    const open = { view: 'desk' as const, windows: [{ id: 'cv' as const, x: 24, y: 44 }], focus: 'cv' as const, selected: null };
    useGameStore.getState().setDesktop(open);
    expect(useGameStore.getState().desktop).toEqual(open);
    expect(useGameStore.getState().desktopReady).toBe(true);
  });

  it('setPitstop persists the choice', () => {
    useGameStore.getState().setPitstop(true);
    expect(useGameStore.getState().pitstop).toBe(true);
    expect(localStorage.getItem(PITSTOP_KEY)).toBe('on');
    useGameStore.getState().setPitstop(false);
    expect(useGameStore.getState().pitstop).toBe(false);
    expect(localStorage.getItem(PITSTOP_KEY)).toBe('off');
  });

  it('setPitstop never writes storage while forced, and setPitstop(false) is ignored', () => {
    useGameStore.getState().setPitstopForced(true);
    useGameStore.getState().setPitstop(true);
    useGameStore.getState().setPitstop(false);
    expect(useGameStore.getState().pitstop).toBe(true);
    expect(useGameStore.getState().pitstopForced).toBe(true);
    expect(localStorage.getItem(PITSTOP_KEY)).toBeNull(); // a forced fallback is not a user choice
  });

  it('applyInitialPitstop sets the decision and marks it ready without persisting', () => {
    useGameStore.getState().applyInitialPitstop({ pitstop: true, forced: false });
    let s = useGameStore.getState();
    expect(s.pitstop).toBe(true);
    expect(s.pitstopForced).toBe(false);
    expect(s.pitstopReady).toBe(true);
    useGameStore.getState().applyInitialPitstop({ pitstop: true, forced: true });
    s = useGameStore.getState();
    expect(s.pitstopForced).toBe(true);
    expect(localStorage.getItem(PITSTOP_KEY)).toBeNull();
  });

  it('setPitstopForced(true) alone does not change pitstop', () => {
    useGameStore.getState().setPitstopForced(true);
    expect(useGameStore.getState().pitstop).toBe(false);
  });

  it('still toggles when storage throws', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError');
    });
    expect(() => useGameStore.getState().setPitstop(true)).not.toThrow();
    expect(useGameStore.getState().pitstop).toBe(true);
  });

  it('remembers why pit stop is forced: no WebGL by default, or an explicit reason', () => {
    useGameStore.getState().applyInitialPitstop({ pitstop: true, forced: true });
    expect(useGameStore.getState().pitstopReason).toBe('webgl');
    useGameStore.getState().applyInitialPitstop({ pitstop: true, forced: true, reason: 'error' });
    expect(useGameStore.getState().pitstopReason).toBe('error');
    // Not forced: there is no reason, even if one is passed.
    useGameStore.getState().applyInitialPitstop({ pitstop: false, forced: false, reason: 'error' });
    expect(useGameStore.getState().pitstopReason).toBeNull();
    useGameStore.getState().setPitstopForced(true);
    expect(useGameStore.getState().pitstopReason).toBe('webgl');
    useGameStore.getState().setPitstopForced(false);
    expect(useGameStore.getState().pitstopReason).toBeNull();
  });

  it('forcePitstop shows the pit stop for good without persisting anything', () => {
    useGameStore.getState().forcePitstop('error');
    const s = useGameStore.getState();
    expect(s.pitstop).toBe(true);
    expect(s.pitstopForced).toBe(true);
    expect(s.pitstopReason).toBe('error');
    expect(s.pitstopReady).toBe(true);
    expect(localStorage.getItem(PITSTOP_KEY)).toBeNull();
    s.setPitstop(false); // cannot leave
    expect(useGameStore.getState().pitstop).toBe(true);
  });
});
