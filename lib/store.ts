import { create } from 'zustand';
import { INITIAL_DESKTOP, type DesktopState } from '@/lib/garage/desktop';
import type { Tier } from '@/lib/game/tier';
import { PITSTOP_KEY } from '@/lib/pitstop';
import { writePref } from '@/lib/storage';

/** Why pit stop cannot be left: the browser has no WebGL, or the game failed to load / crashed. */
export type ForcedReason = 'webgl' | 'error';

/**
 * Discrete state (low frequency, drives React): pit stop mode, quality tier and
 * the LuisOS desktop. Per-frame values live in `lib/garage/runtime.ts`; setters here
 * are only called from UI handlers and the garage controls, never from `useFrame`.
 */
export interface GameStore {
  pitstop: boolean;
  /** True when pit stop cannot be left (no WebGL, or the game failed). */
  pitstopForced: boolean;
  /** Why it is forced, for the visible explanation; null while it is not. */
  pitstopReason: ForcedReason | null;
  /** False until the client has made the initial pit stop decision (the server HTML is the pit stop). */
  pitstopReady: boolean;
  tier: Tier;
  /** The LuisOS 88 desktop: view, windows, focus (lib/garage/desktop.ts). */
  desktop: DesktopState;
  /** False until GameMount has built the first desktop of this page (a locale switch keeps the open windows). */
  desktopReady: boolean;
  setDesktop(s: DesktopState): void;
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
  pitstop: false,
  pitstopForced: false,
  pitstopReason: null,
  pitstopReady: false,
  tier: 'B',
  desktop: INITIAL_DESKTOP,
  desktopReady: false,
  setDesktop: (desktop) => set({ desktop, desktopReady: true }),
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
