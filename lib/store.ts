import { create } from 'zustand';
import type { Tier } from '@/lib/game/tier';
import type { Mode, ZoneId } from '@/lib/game/types';
import { PITSTOP_KEY } from '@/lib/pitstop';
import { writePref } from '@/lib/storage';

/** Why pit stop cannot be left: the browser has no WebGL, or the game failed to load / crashed. */
export type ForcedReason = 'webgl' | 'error';

/**
 * Discrete game state (low frequency, drives React). Per-frame state lives in
 * `lib/game/runtime.ts`; setters here are only called from GameDirector (applying
 * GameEvents) and from UI handlers, never from inside `useFrame`.
 */
export interface GameStore {
  zone: ZoneId | null;
  mode: Mode;
  pitstop: boolean;
  /** True when pit stop cannot be left (no WebGL, or the game failed). */
  pitstopForced: boolean;
  /** Why it is forced, for the visible explanation; null while it is not. */
  pitstopReason: ForcedReason | null;
  /** False until the client has made the initial pit stop decision (the server HTML is the pit stop). */
  pitstopReady: boolean;
  tier: Tier;
  setZone(z: ZoneId | null): void;
  setMode(m: Mode): void;
  /**
   * A user choice: persisted, except while forced. While forced, turning it off
   * is ignored and nothing is written (a forced fallback is not a preference).
   */
  setPitstop(on: boolean): void;
  /**
   * The initial decision on mount. Not a user choice, so it is never persisted.
   * A forced decision without a `reason` is the WebGL probe failing.
   */
  applyInitialPitstop(decision: { pitstop: boolean; forced: boolean; reason?: ForcedReason }): void;
  /** The game failed after the initial decision (chunk, render error, lost context): show the pit stop for good. */
  forcePitstop(reason: ForcedReason): void;
  setPitstopForced(forced: boolean): void;
  setTier(t: Tier): void;
}

export const useGameStore = create<GameStore>()((set, get) => ({
  zone: null,
  mode: 'demo',
  pitstop: false,
  pitstopForced: false,
  pitstopReason: null,
  pitstopReady: false,
  tier: 'B',
  setZone: (zone) => set({ zone }),
  setMode: (mode) => set({ mode }),
  setPitstop: (on) => {
    if (get().pitstopForced) {
      if (on) set({ pitstop: true });
      return;
    }
    writePref(PITSTOP_KEY, on ? 'on' : 'off');
    set({ pitstop: on });
  },
  applyInitialPitstop: ({ pitstop, forced, reason }) =>
    set({ pitstop, pitstopForced: forced, pitstopReason: forced ? (reason ?? 'webgl') : null, pitstopReady: true }),
  forcePitstop: (reason) =>
    set({ pitstop: true, pitstopForced: true, pitstopReason: reason, pitstopReady: true }),
  setPitstopForced: (pitstopForced) =>
    set({ pitstopForced, pitstopReason: pitstopForced ? (get().pitstopReason ?? 'webgl') : null }),
  setTier: (tier) => set({ tier }),
}));
